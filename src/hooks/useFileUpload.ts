import { useState } from "react";

interface UploadedFile {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
  fileName: string;
}

interface UseFileUploadReturn {
  uploadFiles: (files: File[]) => Promise<UploadedFile[]>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: File[]): Promise<UploadedFile[]> => {
    if (!files.length) return [];

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploadedFiles: UploadedFile[] = [];

      // Upload files one by one to track progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Skip if file is undefined
        if (!file) continue;

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploadtoblob", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error ?? "Failed to upload file");
        }

        const data = (await response.json()) as Omit<UploadedFile, "fileName">;

        uploadedFiles.push({
          ...data,
          fileName: file.name,
        });

        // Update progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      return uploadedFiles;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
    error,
  };
}
