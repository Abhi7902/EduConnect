import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  resourceUploader: f({ pdf: { maxFileSize: "16MB" }, image: { maxFileSize: "8MB" }, "application/msword": { maxFileSize: "16MB" }, "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB" }, "application/vnd.ms-powerpoint": { maxFileSize: "16MB" }, "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "16MB" }, "video/mp4": { maxFileSize: "64MB" }, "video/quicktime": { maxFileSize: "64MB" } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        throw new Error("Unauthorized");
      }
 
      return { userId: session.user.id, userRole: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
    
  assignmentUploader: f({ pdf: { maxFileSize: "8MB" }, "application/msword": { maxFileSize: "8MB" }, "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "8MB" } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        throw new Error("Unauthorized");
      }
      
      // Only students can upload assignment submissions
      if (session.user.role !== "STUDENT") {
        throw new Error("Only students can upload assignment submissions");
      }
 
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;