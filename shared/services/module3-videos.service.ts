import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { Module3VideosRepository } from "@/shared/repositories/module3-videos.repository";

export const MODULE3_ID = "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2";
export const MODULE3_VIDEO_MAP = [
  {
    name: "video02",
    title: "WhatsApp o WhatsApp Business",
    lessonId: "8a8e449b-76a6-4a6d-9693-6238f75092bc"
  },
  {
    name: "video03",
    title: "Configura WhatsApp Business",
    lessonId: "8a8e449b-76a6-4a6d-9693-6238f75092bc"
  },
  {
    name: "video04",
    title: "Crea tu catálogo de productos",
    lessonId: "8a8e449b-76a6-4a6d-9693-6238f75092bc"
  },
  {
    name: "video08",
    title: "Estados de WhatsApp",
    lessonId: "8a8e449b-76a6-4a6d-9693-6238f75092bc"
  },
  {
    name: "video07",
    title: "Facebook para tu negocio",
    lessonId: "9bd401d6-5c80-4099-aa7b-e1b90b62d9b7"
  },
  {
    name: "video09",
    title: "Marketplace / tiendas virtuales",
    lessonId: "9bd401d6-5c80-4099-aa7b-e1b90b62d9b7"
  }
] as const;

const assetSchema = z.object({
  public_id: z.string(),
  secure_url: z.string().url(),
  asset_id: z.string(),
  asset_folder: z.literal("WARMI - VIDEOS"),
  format: z.literal("mp4"),
  resource_type: z.literal("video"),
  type: z.literal("upload"),
  bytes: z.number().int().positive().max(2147483647),
  duration: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
});
export type Module3Video = z.infer<typeof assetSchema> & {
  name: string;
  title: string;
  lessonId: string;
};

export class Module3VideosService {
  constructor(private readonly repository = new Module3VideosRepository()) {}

  async inspect() {
    if (process.env.CLOUDINARY_CLOUD_NAME !== "szhwzy4q")
      throw new Error(
        "El entorno local debe usar Cloudinary szhwzy4q. No se escribió en BD."
      );
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    const videos: Module3Video[] = [];
    for (const mapping of MODULE3_VIDEO_MAP) {
      const publicId = `WARMI - VIDEOS/${mapping.name}`;
      const asset = assetSchema.parse(
        await cloudinary.api.resource(publicId, {
          resource_type: "video",
          media_metadata: true
        })
      );
      const url = new URL(asset.secure_url);
      if (
        asset.public_id !== publicId ||
        url.protocol !== "https:" ||
        url.hostname !== "res.cloudinary.com" ||
        !url.pathname.startsWith("/szhwzy4q/video/upload/")
      )
        throw new Error(`Identidad Cloudinary inesperada: ${mapping.name}`);
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
        throw new Error(`El MP4 público no coincide con los metadatos: ${mapping.name}`);
      videos.push({ ...asset, ...mapping });
    }
    const current = await this.repository.inspect();
    return {
      cloudName: "szhwzy4q",
      videos,
      bytes: videos.reduce((total, video) => total + video.bytes, 0),
      current
    };
  }

  async link(videos: Module3Video[]) {
    if (
      videos.length !== MODULE3_VIDEO_MAP.length ||
      videos.some(
        (video, index) =>
          video.public_id !== `WARMI - VIDEOS/${MODULE3_VIDEO_MAP[index].name}` ||
          video.lessonId !== MODULE3_VIDEO_MAP[index].lessonId
      )
    )
      throw new Error(
        "Solo se permiten los seis videos seleccionados, en el orden indicado."
      );
    return this.repository.link(videos);
  }
}
