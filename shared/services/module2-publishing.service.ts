import { z } from "zod";
import { getCloudinary } from "@/shared/lib/cloudinary";
import { MODULE2_VIDEOS } from "@/shared/learning/module2";
import { Module2PublishingRepository } from "@/shared/repositories/module2-publishing.repository";

const assetSchema = z.object({
  public_id: z.string(),
  secure_url: z.string().url(),
  asset_id: z.string(),
  asset_folder: z.literal("Warmi/MODULO 2"),
  format: z.literal("mp4"),
  resource_type: z.literal("video"),
  type: z.literal("upload"),
  bytes: z.number().int().positive().max(2147483647),
  duration: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
});
export type Module2Asset = z.infer<typeof assetSchema>;
export class Module2PublishingService {
  constructor(private readonly repository = new Module2PublishingRepository()) {}
  async inspect() {
    if (process.env.CLOUDINARY_CLOUD_NAME !== "szhwzy4q")
      throw new Error("Cuenta Cloudinary incorrecta; no se escribió en BD.");
    const cloud = getCloudinary();
    const assets: Module2Asset[] = [];
    for (const video of MODULE2_VIDEOS) {
      const asset = assetSchema.parse(
        await cloud.api.resource(video.publicId, {
          resource_type: "video",
          media_metadata: true
        })
      );
      const url = new URL(asset.secure_url);
      if (
        asset.public_id !== video.publicId ||
        url.origin !== "https://res.cloudinary.com" ||
        !url.pathname.startsWith("/szhwzy4q/video/upload/")
      )
        throw new Error("Identidad de asset inesperada.");
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "error",
        signal: AbortSignal.timeout(30000)
      });
      if (
        !response.ok ||
        response.headers.get("content-type")?.split(";")[0] !== "video/mp4" ||
        Number(response.headers.get("content-length")) !== asset.bytes
      )
        throw new Error(`El video público no coincide: ${video.key}`);
      assets.push(asset);
    }
    return {
      assets,
      current: await this.repository.inspect(),
      bytes: assets.reduce((sum, asset) => sum + asset.bytes, 0)
    };
  }
  publish(assets: Module2Asset[]) {
    if (
      assets.length !== MODULE2_VIDEOS.length ||
      assets.some((asset, index) => asset.public_id !== MODULE2_VIDEOS[index].publicId)
    )
      throw new Error("Solo se permiten los cuatro MP4 seleccionados del Módulo 2.");
    return this.repository.publish(assets);
  }
}
