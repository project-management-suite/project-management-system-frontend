import { useState, useCallback } from "react";
import { apiClient } from "../../lib/api";
import {
  Upload,
  File as FileIcon,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface FileUploaderProps {
  projectId: string;
  taskId?: string;
  onUploadSuccess?: (files?: any[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  multiple?: boolean;
  accept?: string;
}

interface UploadingFile {
  file: File;
  id: string;
  status: "uploading" | "success" | "error";
  error?: string;
}

export const FileUploader = ({
  projectId,
  taskId,
  onUploadSuccess,
  onUploadError,
  className = "",
  multiple = true,
  accept = "*/*",
}: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (!files.length) return;

      // Validate file size (50MB limit as per backend)
      const oversizedFiles = Array.from(files).filter(
        (file) => file.size > 50 * 1024 * 1024
      );

      if (oversizedFiles.length > 0) {
        const errorMsg = `Files too large: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}. Max size: 50MB`;
        onUploadError?.(errorMsg);
        return;
      }

      // Validate file count (10 files max as per backend)
      if (files.length > 10) {
        onUploadError?.("Too many files. Maximum 10 files allowed per upload.");
        return;
      }

      const uploadingFilesList: UploadingFile[] = Array.from(files).map(
        (file) => ({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          status: "uploading",
        })
      );

      setUploadingFiles(uploadingFilesList);

      try {
        const result = await apiClient.uploadFiles(projectId, files, taskId);

        if (result.success) {
          // Mark all files as successful
          setUploadingFiles((prev) =>
            prev.map((f) => ({ ...f, status: "success" as const }))
          );

          onUploadSuccess?.(result.files);

          // Clear the list after a delay
          setTimeout(() => {
            setUploadingFiles([]);
          }, 2000);
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";

        // Mark all files as failed
        setUploadingFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: "error" as const,
            error: errorMessage,
          }))
        );

        onUploadError?.(errorMessage);
      }
    },
    [projectId, taskId, onUploadSuccess, onUploadError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFileUpload(e.target.files);
      }
    },
    [handleFileUpload]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${
            isDragOver
              ? "border-[var(--brand)] bg-[var(--brand)]/5"
              : "border-gray-600 hover:border-gray-500"
          }
          ${uploadingFiles.length > 0 ? "opacity-50" : ""}
        `}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload
            className={`w-12 h-12 mx-auto mb-4 ${
              isDragOver ? "text-[var(--brand)]" : "text-gray-400"
            }`}
          />
          <h3 className="text-lg font-semibold mb-2">
            {isDragOver ? "Drop files here" : "Upload Files"}
          </h3>
          <p className="text-sm opacity-70 mb-2">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs opacity-50">
            Max 10 files, 50MB each • Supports all file types
          </p>
        </label>
      </div>

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FileIcon className="w-4 h-4" />
            Uploading Files ({uploadingFiles.length})
          </h4>
          <div className="space-y-2">
            {uploadingFiles.map((uploadingFile) => (
              <div
                key={uploadingFile.id}
                className="flex items-center gap-3 p-3 bg-[var(--tile-dark)] rounded-lg"
              >
                <div className="flex-shrink-0">
                  {uploadingFile.status === "uploading" && (
                    <div className="animate-spin w-4 h-4 border-2 border-[var(--brand)] border-t-transparent rounded-full" />
                  )}
                  {uploadingFile.status === "success" && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {uploadingFile.status === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs opacity-60">
                    {formatFileSize(uploadingFile.file.size)}
                  </p>
                  {uploadingFile.status === "error" && uploadingFile.error && (
                    <p className="text-xs text-red-400 mt-1">
                      {uploadingFile.error}
                    </p>
                  )}
                </div>

                {uploadingFile.status !== "uploading" && (
                  <button
                    onClick={() => removeUploadingFile(uploadingFile.id)}
                    className="flex-shrink-0 neo-icon w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
