import { z } from "zod";
import { getCloudinary } from "@/shared/lib/cloudinary";
import { parseYouTubeVideoId } from "@/shared/lib/youtube";
import { MODULE1_SUPPORT_VIDEOS, MODULE1_VIDEOS } from "@/shared/learning/module1";
import { Module1PublishingRepository } from "@/shared/repositories/module1-publishing.repository";

const assetSchema = z.object({
  public_id: z.string(),
  secure_url: z.string().url(),
  asset_id: z.string(),
  asset_folder: z.literal("Warmi/MODULO 1"),
  format: z.literal("mp4"),
  resource_type: z.literal("video"),
  type: z.literal("upload"),
  bytes: z.number().int().positive().max(2147483647),
  duration: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
});
export type Module1Asset = z.infer<typeof assetSchema>;

export class Module1PublishingService {
  constructor(private readonly repository = new Module1PublishingRepository()) {}

  async inspect() {
    if (process.env.CLOUDINARY_CLOUD_NAME !== "szhwzy4q")
      throw new Error("Cuenta Cloudinary inesperada. No se escribió en BD.");
    const cloudinary = getCloudinary();
    const assets: Module1Asset[] = [];
    for (const video of MODULE1_VIDEOS) {
      const asset = assetSchema.parse(
        await cloudinary.api.resource(video.publicId, {
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
        throw new Error(`Identidad de video inesperada: ${video.key}`);
      const response = await fetch(asset.secure_url, {
        method: "HEAD",
        redirect: "error",
        signal: AbortSignal.timeout(30000)
      });
      if (
        !response.ok ||
        response.headers.get("content-type")?.split(";")[0] !== "video/mp4" ||
        Number(response.headers.get("content-length")) !== asset.bytes
      )
        throw new Error(`El MP4 público no coincide con Cloudinary: ${video.key}`);
      assets.push(asset);
    }
    const tutorials = [];
    for (const [key, video] of Object.entries(MODULE1_SUPPORT_VIDEOS)) {
      if (!parseYouTubeVideoId(video.url)) throw new Error(`YouTube inválido: ${key}`);
      const response = await fetch(
        `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(video.url)}`,
        { signal: AbortSignal.timeout(30000) }
      );
      if (!response.ok) throw new Error(`Video de apoyo no disponible: ${key}`);
      const metadata = z
        .object({ title: z.string(), author_name: z.string(), html: z.string() })
        .parse(await response.json());
      tutorials.push({
        key,
        url: video.url,
        temporary: true,
        title: metadata.title,
        author: metadata.author_name
      });
    }
    return {
      assets,
      tutorials,
      current: await this.repository.inspect(),
      bytes: assets.reduce((sum, asset) => sum + asset.bytes, 0)
    };
  }

  publish(assets: Module1Asset[]) {
    if (
      assets.length !== MODULE1_VIDEOS.length ||
      assets.some((asset, index) => asset.public_id !== MODULE1_VIDEOS[index].publicId)
    )
      throw new Error("Solo se permiten los siete videos autorizados del Módulo 1.");
    return this.repository.publish(assets);
  }
}
