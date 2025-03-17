import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ProfileImageUploadProps {
  currentImage: string | null | undefined;
  onImageUploaded: (imageUrl: string) => void;
}

// Define types for API responses
interface UploadErrorResponse {
  error: string;
}

interface UploadSuccessResponse {
  url: string;
}

export function ProfileImageUpload({
  currentImage,
  onImageUploaded,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as UploadErrorResponse;
        throw new Error(errorData.error ?? "Failed to upload image");
      }

      const data = (await response.json()) as UploadSuccessResponse;
      onImageUploaded(data.url);
      toast.success("Profile image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
      // Reset preview on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = previewUrl ?? currentImage;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={displayImage ?? undefined} alt="Profile" />
          <AvatarFallback className="text-lg">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              getInitials(currentImage)
            )}
          </AvatarFallback>
        </Avatar>
        {previewUrl && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Helper function to get initials from name or email
function getInitials(imageUrl: string | null | undefined): string {
  // If there's an image, return a placeholder
  if (imageUrl) return "U";
  return "?";
}
