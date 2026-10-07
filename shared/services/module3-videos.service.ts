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

export const MODULE3_REFERENCE_MAP = [
  {
    fileId: "ec24466c-9be8-4705-b42c-1243b6c75a4e",
    lessonFileId: "af430a8c-97fc-4557-a191-5706b5ebef2d",
    position: 2,
    publicId: "M3-S1-02_-_Diferencias_WhatsApp_y_WhatsApp_Business"
  },
  {
    fileId: "b66accc4-ec68-419e-8a9a-3e86cc1b4ca2",
    lessonFileId: "af15d63f-32b3-449e-92a5-5179e678d487",
    position: 3,
    publicId: "M3-S1-04_-_Configurar_WhatsApp_Business_tutorial_completo"
  },
  {
    fileId: "47979adf-99ef-4f97-adec-47b011ce6250",
    lessonFileId: "0ac3afdd-5a77-4bca-9cb9-425d44b47bd8",
    position: 4,
    publicId: "M3-S1-05_-_Crear_catalogo_en_WhatsApp_Business"
  },
  {
    fileId: "eaddda21-2adc-4169-a452-55f0556a65d5",
    lessonFileId: "dfa3fa09-435f-45f0-9af2-399285e875a8",
    position: 5,
    publicId: "M3-S1-06_-_Publicar_estados_de_WhatsApp"
  },
  {
    fileId: "9882194e-8dad-4b45-b8ba-c6936375e08e",
    lessonFileId: "ecb96475-8fdd-4e3c-9899-c5e2bc0cc0b6",
    position: 2,
    publicId: "M3-S2-01_-_Facebook_Marketplace_y_Facebook_Shops"
  },
  {
    fileId: "bbacb861-cfc6-4c6c-b830-e55b68a747f6",
    lessonFileId: "4171b83c-da65-4d47-8bee-3bd71d48fbe3",
    position: 3,
    publicId: "M3-S2-02_-_Crear_publicacion_de_producto_en_Marketplace"
  }
] as const;

const replacementSchema = assetSchema.extend({
  asset_folder: z.literal("Warmi/MODULO 3")
});
export type Module3ReplacementVideo = z.infer<typeof replacementSchema> &
  (typeof MODULE3_REFERENCE_MAP)[number] &
  (typeof MODULE3_VIDEO_MAP)[number];

export class Module3VideosService {
  constructor(private readonly repository = new Module3VideosRepository()) {}

  async repairReferences(apply = false) {
    if (process.env.CLOUDINARY_CLOUD_NAME !== "szhwzy4q")
      throw new Error("El entorno local debe usar Cloudinary szhwzy4q.");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    const videos: Module3ReplacementVideo[] = [];
    for (const [index, reference] of MODULE3_REFERENCE_MAP.entries()) {
      const asset = replacementSchema.parse(
        await cloudinary.api.resource(reference.publicId, {
          resource_type: "video",
          media_metadata: true
        })
      );
      const url = new URL(asset.secure_url);
      if (
        asset.public_id !== reference.publicId ||
        url.protocol !== "https:" ||
        url.hostname !== "res.cloudinary.com" ||
        !url.pathname.startsWith("/szhwzy4q/video/upload/")
      )
        throw new Error("La referencia Cloudinary no coincide con el asset autorizado.");
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
        throw new Error(`No se pudo validar el MP4 ${reference.publicId}.`);
      videos.push({ ...asset, ...reference, ...MODULE3_VIDEO_MAP[index] });
    }
    return this.repository.repairReferences(videos, apply);
  }

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
