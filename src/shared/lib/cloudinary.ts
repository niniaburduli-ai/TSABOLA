import { v2 as cloudinary } from 'cloudinary';

class CloudinaryManager {
  private configured = false;

  private configure(): void {
    if (this.configured) return;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.configured = true;
  }

  async destroy(publicId: string): Promise<void> {
    this.configure();
    await cloudinary.uploader.destroy(publicId);
  }
}

export const cloudinaryManager = new CloudinaryManager();
export { CloudinaryManager };
