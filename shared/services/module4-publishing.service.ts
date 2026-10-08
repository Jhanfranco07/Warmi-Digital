import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { z } from "zod";
import { getCloudinary } from "@/shared/lib/cloudinary";
import {
  MODULE4_IMAGES,
  module4ImagePublicId,
  type Module4ImageKey
} from "@/shared/learning/module4";
import { Module4PublishingRepository } from "@/shared/repositories/module4-publishing.repository";
export type Module4Asset = {
  key: Module4ImageKey;
  publicId: string;
  url: string;
  bytes: number;
  width: number;
  height: number;
  sha256: string;
  page: number;
  xref: number;
  crop: number[] | null;
};
const schema = z.object({
  key: z.string(),
  filename: z.string(),
  bytes: z.number().int().positive().max(500000),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  page: z.number().int(),
  xref: z.number().int(),
  crop: z.array(z.number()).length(4).nullable()
});
const remoteSchema = z.object({
  public_id: z.string(),
  secure_url: z.string().url(),
  bytes: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  resource_type: z.literal("image"),
  type: z.literal("upload"),
  format: z.literal("webp")
});
export class Module4PublishingService {
  constructor(private readonly repository = new Module4PublishingRepository()) {}
  async prepare(directory: string, apply = false) {
    if (process.env.CLOUDINARY_CLOUD_NAME !== "szhwzy4q")
      throw new Error("Cuenta Cloudinary inesperada.");
    const manifest = z
      .array(schema)
      .parse(JSON.parse(await readFile(join(directory, "manifest.json"), "utf8")));
    if (
      manifest.length !== 9 ||
      manifest.some(
        (m, i) => m.key !== MODULE4_IMAGES[i].key || m.filename !== `${m.key}.webp`
      )
    )
      throw new Error("Manifiesto visual inesperado.");
    const cloud = getCloudinary(),
      assets: Module4Asset[] = [],
      plan = [];
    for (const m of manifest) {
      const data = await readFile(join(directory, m.filename));
      if (
        data.length !== m.bytes ||
        data.toString("ascii", 0, 4) !== "RIFF" ||
        data.toString("ascii", 8, 12) !== "WEBP" ||
        createHash("sha256").update(data).digest("hex") !== m.sha256
      )
        throw new Error("Imagen local distinta del recorte revisado.");
      const key = m.key as Module4ImageKey,
        publicId = module4ImagePublicId(key);
      let existing;
      try {
        existing = await cloud.api.resource(publicId, {
          resource_type: "image",
          type: "upload"
        });
      } catch (error) {
        const e = error as { http_code?: number; error?: { http_code?: number } };
        if ((e.http_code ?? e.error?.http_code) !== 404)
          throw new Error("No se pudo inspeccionar el asset; no se duplica.");
      }
      plan.push({
        key,
        publicId,
        action: existing ? "reuse" : apply ? "create" : "would-create",
        bytes: m.bytes
      });
      if (!existing && apply)
        existing = await cloud.uploader.upload(join(directory, m.filename), {
          resource_type: "image",
          type: "upload",
          public_id: publicId,
          asset_folder: "Warmi/MODULO_4/IMAGENES",
          overwrite: false,
          unique_filename: false
        });
      if (!existing) continue;
      const remote = remoteSchema.parse(existing);
      const url = new URL(remote.secure_url);
      if (
        remote.public_id !== publicId ||
        remote.bytes !== m.bytes ||
        remote.width !== m.width ||
        remote.height !== m.height ||
        url.origin !== "https://res.cloudinary.com" ||
        !url.pathname.startsWith("/szhwzy4q/image/upload/")
      )
        throw new Error("Asset existente incompatible; no se sobrescribe.");
      const response = await fetch(url, {
        redirect: "error",
        signal: AbortSignal.timeout(30000)
      });
      if (
        !response.ok ||
        response.headers.get("content-type")?.split(";")[0] !== "image/webp" ||
        createHash("sha256")
          .update(Buffer.from(await response.arrayBuffer()))
          .digest("hex") !== m.sha256
      )
        throw new Error("La imagen entregada no coincide con la revisada.");
      assets.push({
        key,
        publicId,
        url: remote.secure_url,
        bytes: m.bytes,
        width: m.width,
        height: m.height,
        sha256: m.sha256,
        page: m.page,
        xref: m.xref,
        crop: m.crop
      });
    }
    return { plan, assets };
  }
  publish(assets: Module4Asset[]) {
    if (
      assets.length !== 9 ||
      new Set(assets.map((a) => a.key)).size !== 9 ||
      MODULE4_IMAGES.some(
        (i) =>
          !assets.some(
            (a) => a.key === i.key && a.publicId === module4ImagePublicId(i.key)
          )
      )
    )
      throw new Error("Recursos incompletos o duplicados.");
    return this.repository.publish(assets);
  }
}
