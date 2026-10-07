import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { z } from "zod";
import { getCloudinary } from "@/shared/lib/cloudinary";
import {
  MODULE3_SESSION1_TOPICS,
  module3GuidePublicId
} from "@/shared/learning/module3-session1";
import { Module3GuidesRepository } from "@/shared/repositories/module3-guides.repository";

const manifestSchema = z.array(
  z.object({
    key: z.string(),
    filename: z.string(),
    pages: z.number().int().positive(),
    bytes: z.number().int().positive().max(5_000_000),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
    sourcePages: z.array(z.number().int().positive()),
    mode: z.string()
  })
);
export type Module3GuideAsset = z.infer<typeof manifestSchema>[number] & {
  publicId: string;
  url: string;
  assetId: string;
};

export class Module3GuidesService {
  constructor(private readonly repository = new Module3GuidesRepository()) {}
  async prepare(directory: string) {
    if (process.env.CLOUDINARY_CLOUD_NAME !== "szhwzy4q")
      throw new Error("La cuenta Cloudinary debe ser szhwzy4q.");
    const manifest = manifestSchema.parse(
      JSON.parse(await readFile(join(directory, "manifest.json"), "utf8"))
    );
    if (
      manifest.length !== MODULE3_SESSION1_TOPICS.length ||
      manifest.some(
        (item, index) =>
          item.key !== MODULE3_SESSION1_TOPICS[index].key ||
          item.filename !== `${item.key}.pdf` ||
          JSON.stringify(item.sourcePages) !==
            JSON.stringify(MODULE3_SESSION1_TOPICS[index].sourcePages) ||
          item.mode !== MODULE3_SESSION1_TOPICS[index].mode
      )
    )
      throw new Error("El manifiesto no coincide con las siete guías aprobadas.");
    const cloud = getCloudinary();
    const assets: Module3GuideAsset[] = [];
    const plan = [];
    for (const guide of manifest) {
      const data = await readFile(join(directory, guide.filename));
      if (
        data.subarray(0, 5).toString() !== "%PDF-" ||
        data.length !== guide.bytes ||
        createHash("sha256").update(data).digest("hex") !== guide.sha256
      )
        throw new Error(`PDF local inválido: ${guide.key}`);
      const publicId = module3GuidePublicId(guide.key);
      let asset;
      try {
        asset = await cloud.api.resource(publicId, {
          resource_type: "raw",
          type: "upload"
        });
      } catch (error) {
        const value = error as { http_code?: number; error?: { http_code?: number } };
        if ((value.http_code ?? value.error?.http_code) !== 404)
          throw new Error(
            "No se pudo inspeccionar Cloudinary; no se reemplazan recursos."
          );
      }
      if (!asset)
        throw new Error(`Falta el asset existente: ${publicId}. No se permiten uploads.`);
      if (asset) {
        const url = new URL(asset.secure_url);
        if (
          asset.public_id !== publicId ||
          asset.resource_type !== "raw" ||
          asset.type !== "upload" ||
          url.origin !== "https://res.cloudinary.com" ||
          !url.pathname.startsWith("/szhwzy4q/raw/upload/") ||
          asset.bytes !== guide.bytes
        )
          throw new Error(`Asset inesperado: ${guide.key}`);
        assets.push({
          ...guide,
          publicId,
          url: asset.secure_url,
          assetId: asset.asset_id
        });
      }
      plan.push({
        key: guide.key,
        publicId,
        bytes: guide.bytes,
        action: "reuse"
      });
    }
    for (const asset of assets) {
      const response = await fetch(asset.url, {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(30000)
      });
      if (!response.ok)
        throw new Error(
          `El PDF no se puede descargar: ${asset.key} (${response.status}). No se escribió en BD ni se modificó Cloudinary.`
        );
      const remote = Buffer.from(await response.arrayBuffer());
      if (
        remote.length !== asset.bytes ||
        createHash("sha256").update(remote).digest("hex") !== asset.sha256
      )
        throw new Error(`El PDF remoto no coincide: ${asset.key}`);
    }
    return {
      plan,
      assets,
      current: await this.repository.inspect(),
      bytes: manifest.reduce((sum, item) => sum + item.bytes, 0)
    };
  }
  publish(assets: Module3GuideAsset[]) {
    if (
      assets.length !== 7 ||
      assets.some(
        (item, index) =>
          item.publicId !== module3GuidePublicId(MODULE3_SESSION1_TOPICS[index].key)
      )
    )
      throw new Error("Solo se permiten las siete guías verificadas.");
    return this.repository.publish(assets);
  }
}
