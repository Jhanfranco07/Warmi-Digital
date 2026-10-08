import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { z } from "zod";
import { getCloudinary } from "@/shared/lib/cloudinary";
import {
  MODULE3_GUIDES,
  MODULE3_NEW_VIDEOS,
  MODULE3_SESSIONS,
  module3GuidePublicId
} from "@/shared/learning/module3-journey";
import { Module3JourneyPublishingRepository } from "@/shared/repositories/module3-journey-publishing.repository";

export type Module3JourneyAsset = {
  lessonId: string;
  title: string;
  position: number;
  kind: "pdf" | "video";
  publicId: string;
  url: string;
  bytes: number;
  assetId: string;
  sha256?: string;
  width?: number;
  height?: number;
  duration?: number;
};
const assetSchema = z.object({
  public_id: z.string(),
  secure_url: z.string().url(),
  bytes: z.number().int().positive(),
  asset_id: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
  format: z.string().optional(),
  resource_type: z.enum(["raw", "video"]),
  type: z.literal("upload")
});
const guideSchema = z.object({
  order: z.number().int(),
  key: z.string(),
  title: z.string(),
  filename: z.string(),
  bytes: z.number().int().positive().max(5_000_000),
  sha256: z.string().regex(/^[a-f0-9]{64}$/)
});
export class Module3JourneyPublishingService {
  constructor(private readonly repository = new Module3JourneyPublishingRepository()) {}
  async prepare(directory: string, apply = false) {
    if (process.env.CLOUDINARY_CLOUD_NAME !== "szhwzy4q")
      throw new Error("Cuenta Cloudinary incorrecta.");
    const cloud = getCloudinary();
    const manifest = z
      .array(guideSchema)
      .parse(JSON.parse(await readFile(join(directory, "manifest.json"), "utf8")));
    if (
      manifest.length !== 3 ||
      manifest.some(
        (g, i) =>
          g.order !== MODULE3_GUIDES[i].order ||
          g.key !== MODULE3_GUIDES[i].key ||
          g.title !== MODULE3_GUIDES[i].title ||
          g.filename !== `${g.key}.pdf`
      )
    )
      throw new Error("Solo se permiten las tres guías S2/S3/S4.");
    const assets: Module3JourneyAsset[] = [];
    const plan: { publicId: string; action: string; bytes: number }[] = [];
    for (const mapping of MODULE3_NEW_VIDEOS) {
      const video = assetSchema.parse(
        await cloud.api.resource(mapping.publicId, {
          resource_type: "video",
          media_metadata: true
        })
      );
      if (
        video.public_id !== mapping.publicId ||
        video.format !== "mp4" ||
        video.resource_type !== "video"
      )
        throw new Error("El video existente no es MP4.");
      assets.push({
        lessonId: MODULE3_SESSIONS[2].id,
        title: mapping.title,
        position: mapping.position,
        kind: "video",
        publicId: video.public_id,
        url: video.secure_url,
        bytes: video.bytes,
        assetId: video.asset_id,
        width: video.width,
        height: video.height,
        duration: video.duration
      });
      plan.push({ publicId: mapping.publicId, action: "reuse", bytes: video.bytes });
    }
    for (const guide of manifest) {
      const data = await readFile(join(directory, guide.filename));
      if (
        data.subarray(0, 5).toString() !== "%PDF-" ||
        data.length !== guide.bytes ||
        createHash("sha256").update(data).digest("hex") !== guide.sha256
      )
        throw new Error("PDF local no coincide con el manifiesto.");
      const publicId = module3GuidePublicId(guide.order, guide.key);
      let remote;
      try {
        remote = await cloud.api.resource(publicId, {
          resource_type: "raw",
          type: "upload"
        });
      } catch (error) {
        const e = error as { http_code?: number; error?: { http_code?: number } };
        if ((e.http_code ?? e.error?.http_code) !== 404)
          throw new Error("No se pudo inspeccionar Cloudinary. No se duplica el asset.");
      }
      plan.push({
        publicId,
        action: remote ? "reuse" : apply ? "create" : "would-create",
        bytes: guide.bytes
      });
      if (!remote && apply)
        remote = await cloud.uploader.upload(join(directory, guide.filename), {
          resource_type: "raw",
          type: "upload",
          public_id: publicId,
          asset_folder: `Warmi/MODULO_3/SESION_${guide.order}/GUIAS`,
          overwrite: false,
          unique_filename: false
        });
      if (!remote) continue;
      const pdf = assetSchema.parse(remote);
      if (
        pdf.public_id !== publicId ||
        pdf.resource_type !== "raw" ||
        pdf.bytes !== guide.bytes
      )
        throw new Error("La guía existente no coincide; no se sobrescribe.");
      const response = await fetch(pdf.secure_url, {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(30000)
      });
      if (
        !response.ok ||
        response.headers.get("content-type")?.split(";")[0] !== "application/pdf"
      )
        throw new Error("El PDF no puede entregarse; publicación cancelada.");
      if (
        createHash("sha256")
          .update(Buffer.from(await response.arrayBuffer()))
          .digest("hex") !== guide.sha256
      )
        throw new Error("PDF remoto distinto del revisado.");
      assets.push({
        lessonId: MODULE3_SESSIONS[guide.order - 1].id,
        title: guide.title,
        position: guide.order === 3 ? 30 : 10,
        kind: "pdf",
        publicId,
        url: pdf.secure_url,
        bytes: guide.bytes,
        assetId: pdf.asset_id,
        sha256: guide.sha256
      });
    }
    for (const asset of assets) {
      const url = new URL(asset.url);
      if (
        url.origin !== "https://res.cloudinary.com" ||
        !url.pathname.startsWith(
          `/szhwzy4q/${asset.kind === "pdf" ? "raw" : "video"}/upload/`
        )
      )
        throw new Error("Origen inesperado.");
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "error",
        signal: AbortSignal.timeout(30000)
      });
      if (
        !response.ok ||
        Number(response.headers.get("content-length")) !== asset.bytes ||
        response.headers.get("content-type")?.split(";")[0] !==
          (asset.kind === "pdf" ? "application/pdf" : "video/mp4")
      )
        throw new Error("No se pudo verificar la entrega del recurso.");
    }
    return { plan, assets, current: await this.repository.inspect() };
  }
  publish(assets: Module3JourneyAsset[]) {
    const expected = [
      ...MODULE3_NEW_VIDEOS.map((v) => v.publicId),
      ...MODULE3_GUIDES.map((g) => module3GuidePublicId(g.order, g.key))
    ];
    if (
      assets.length !== 5 ||
      new Set(assets.map((a) => a.publicId)).size !== 5 ||
      expected.some((id) => !assets.some((a) => a.publicId === id))
    )
      throw new Error("Recursos incompletos o duplicados.");
    return this.repository.publish(assets);
  }
}
