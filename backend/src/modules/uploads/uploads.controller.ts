import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Roles } from "@/common/roles.decorator";
import { RolesGuard } from "@/common/roles.guard";
import { Role } from "@prisma/client";

function safeFileName(originalName: string) {
  const base = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const id = Date.now().toString(36);
  return `${id}_${base}`;
}

@ApiTags("uploads")
@Controller("uploads")
export class UploadsController {
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADM)
  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "uploads",
        filename: (_req, file, cb) => cb(null, safeFileName(file.originalname)),
      }),
      fileFilter: (_req, file, cb) => {
        const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
        cb(ok ? null : new Error("Formato inválido (use PNG/JPEG/WEBP)."), ok);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    const url = `/uploads/${file.filename}`;
    return { url };
  }
}
