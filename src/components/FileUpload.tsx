import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, FileIcon} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
  selectedFiles: File[];
  isUploading: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFileTypes?: string;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  onFileRemoved,
  selectedFiles,
  isUploading,
  maxFiles = 5,
  maxSizeMB = 5,
  acceptedFileTypes = "image/*,.pdf,.doc,.docx,.txt",
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFiles = (files: FileList | File[]): File[] => {
    const validFiles: File[] = [];
    const fileArray = Array.from(files);

    // Check if adding these files would exceed the max number
    if (selectedFiles.length + fileArray.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`);
      return validFiles;
    }

    for (const file of fileArray) {
      // Check file size
      if (file.size > maxSizeBytes) {
        alert(
          `File "${file.name}" exceeds the maximum size of ${maxSizeMB}MB.`,
        );
        continue;
      }

      // Check file type if acceptedFileTypes is provided
      if (acceptedFileTypes && !isFileTypeAccepted(file, acceptedFileTypes)) {
        alert(`File "${file.name}" is not an accepted file type.`);
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const isFileTypeAccepted = (file: File, acceptedTypes: string): boolean => {
    const types = acceptedTypes.split(",").map((type) => type.trim());

    // Handle wildcards like "image/*"
    for (const type of types) {
      if (type.endsWith("/*")) {
        const mainType = type.split("/")[0];
        if (file.type.startsWith(`${mainType}/`)) return true;
      } else if (file.type === type || type === "*") {
        return true;
      } else {
        // Check file extension
        const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        if (type === extension) return true;
      }
    }

    return false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(e.target.files);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith("image/");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative flex min-h-[150px] w-full flex-col items-center justify-center rounded-md border-2 border-dashed p-4 transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-[#9f7aea]/50 bg-[#f5f0ff] hover:border-primary/50",
          isUploading && "cursor-not-allowed opacity-50",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          accept={acceptedFileTypes}
          disabled={isUploading || selectedFiles.length >= maxFiles}
        />

        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          {isUploading ? (
            <div className="flex w-full flex-col items-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#7c3aed]" />
              <p className="text-sm text-[#9f7aea]">Uploading your files...</p>
            </div>
          ) : (
            <>
              <div className="text-muted-foreground">
                <p className="font-medium text-[#7c3aed]">
                  Drag & Drop your files
                </p>
                <p className="text-xs text-[#9f7aea]">
                  or click to browse (max {maxFiles} files, {maxSizeMB}MB each)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
                disabled={selectedFiles.length >= maxFiles}
                className="border-[#9f7aea]/50 text-[#9f7aea] hover:bg-[#f5f0ff] hover:text-[#7c3aed]"
              >
                Select Files
              </Button>
            </>
          )}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-md border p-2"
            >
              {isImageFile(file) ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onFileRemoved(index)}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
