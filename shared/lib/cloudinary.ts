import { v2 as cloudinary } from "cloudinary";

import { env } from "@/shared/config/env";

let configured = false;

export function getCloudinary() {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary no esta configurado.");
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true
    });
    configured = true;
  }

  return cloudinary;
}
