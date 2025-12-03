import { useState, useEffect } from "react";
import { apiClient, File } from "../../lib/api";
import {
  File as FileIcon,
  Download,
  Trash2,
  Share2,
  Calendar,
  User,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  Eye,
  Search,
  Filter,
} from "lucide-react";

interface FileLibraryProps {
  projectId?: string;
  taskId?: string;
  showSharedFiles?: boolean;
  onFileSelect?: (file: File) => void;
  onShareClick?: (file: File) => void;
  className?: string;
}

type FileFilter =
  | "all"
  | "images"
  | "documents"
  | "videos"
  | "audio"
  | "archives"
  | "code";

export const FileLibrary = ({
  projectId,
  taskId,
  showSharedFiles = false,
  onFileSelect,
  onShareClick,
  className = "",
}: FileLibraryProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FileFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, taskId, showSharedFiles]);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;

      if (showSharedFiles) {
        try {
          result = await apiClient.getSharedWithMe(50, 0);
          // Extract files from shares for shared files and filter out null/undefined files
          const sharedFiles =
            result.files
              ?.map((share) => share.file)
              .filter((file): file is File => Boolean(file)) || [];
          setFiles(sharedFiles);
        } catch (sharedError) {
          console.warn("Failed to fetch shared files:", sharedError);
          // If shared files fail, show empty state instead of crashing
          setFiles([]);
          setError(
            "Unable to load shared files. This feature may not be available yet."
          );
        }
      } else if (taskId) {
        result = await apiClient.getTaskFiles(taskId);
        setFiles(result.files || []);
      } else if (projectId) {
        result = await apiClient.getProjectFiles(projectId);
        setFiles(result.files || []);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      if (showSharedFiles) {
        setError("Unable to load shared files. Please try again later.");
      } else {
        setError(
          error instanceof Error ? error.message : "Failed to fetch files"
        );
      }
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType: string, size: "sm" | "md" | "lg" = "md") => {
    const sizeClass =
      size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";

    if (mimeType.startsWith("image/")) {
      return <Image className={`${sizeClass} text-green-400`} />;
    } else if (mimeType.startsWith("video/")) {
      return <Video className={`${sizeClass} text-red-400`} />;
    } else if (mimeType.startsWith("audio/")) {
      return <Music className={`${sizeClass} text-purple-400`} />;
    } else if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("text")
    ) {
      return <FileText className={`${sizeClass} text-blue-400`} />;
    } else if (
      mimeType.includes("zip") ||
      mimeType.includes("archive") ||
      mimeType.includes("compressed")
    ) {
      return <Archive className={`${sizeClass} text-yellow-400`} />;
    } else if (
      mimeType.includes("javascript") ||
      mimeType.includes("json") ||
      mimeType.includes("xml")
    ) {
      return <Code className={`${sizeClass} text-cyan-400`} />;
    } else {
      return <FileIcon className={`${sizeClass} text-gray-400`} />;
    }
  };

  const getFileCategory = (mimeType: string): FileFilter => {
    if (!mimeType) return "documents";
    if (mimeType.startsWith("image/")) return "images";
    if (mimeType.startsWith("video/")) return "videos";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.includes("zip") || mimeType.includes("archive"))
      return "archives";
    if (
      mimeType.includes("javascript") ||
      mimeType.includes("json") ||
      mimeType.includes("xml")
    )
      return "code";
    return "documents";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownload = (file: File) => {
    if (file.download_url) {
      window.open(file.download_url, "_blank");
    }
  };

  const handleDelete = async (file: File) => {
    if (!confirm(`Are you sure you want to delete "${file.original_name}"?`)) {
      return;
    }

    try {
      await apiClient.deleteFile(file.file_id);
      setFiles((prev) => prev.filter((f) => f.file_id !== file.file_id));
    } catch (error) {
      console.error("Error deleting file:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete file"
      );
    }
  };

  const filteredFiles = files.filter((file) => {
    if (!file) return false;

    const matchesFilter =
      filter === "all" || getFileCategory(file.mime_type || "") === filter;
    const matchesSearch =
      (file.original_name || file.file_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (file.file_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getFilterCount = (filterType: FileFilter): number => {
    if (filterType === "all") return files.length;
    return files.filter(
      (file) => file && getFileCategory(file.mime_type || "") === filterType
    ).length;
  };

  if (loading) {
    return (
      <div className={`glass rounded-xl p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin neo-icon w-8 h-8 flex items-center justify-center rounded-lg">
            <FileIcon className="w-5 h-5" style={{ color: "var(--brand)" }} />
          </div>
          <span className="ml-3 opacity-70">Loading files...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass rounded-xl p-8 text-center ${className}`}>
        <div className="neo-icon w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl">
          <FileIcon className="w-8 h-8 opacity-30 text-red-400" />
        </div>
        <p className="text-red-400 mb-2">Error loading files</p>
        <p className="text-sm opacity-70">{error}</p>
        <button onClick={fetchFiles} className="btn-ghost mt-4">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`glass rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileIcon className="w-5 h-5" style={{ color: "var(--brand)" }} />
            {showSharedFiles ? "Shared Files" : "File Library"} ({files.length})
          </h3>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 opacity-70" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FileFilter)}
              className="select"
            >
              <option value="all">All Files ({getFilterCount("all")})</option>
              <option value="documents">
                Documents ({getFilterCount("documents")})
              </option>
              <option value="images">
                Images ({getFilterCount("images")})
              </option>
              <option value="videos">
                Videos ({getFilterCount("videos")})
              </option>
              <option value="audio">Audio ({getFilterCount("audio")})</option>
              <option value="archives">
                Archives ({getFilterCount("archives")})
              </option>
              <option value="code">Code ({getFilterCount("code")})</option>
            </select>
          </div>
        </div>
      </div>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 text-center">
          <div className="neo-icon w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl">
            <FileIcon className="w-10 h-10 opacity-30" />
          </div>
          <p className="text-lg mb-2">
            {searchQuery || filter !== "all"
              ? "No files match your filters"
              : showSharedFiles
              ? "No files shared with you"
              : "No files uploaded yet"}
          </p>
          <p className="text-sm opacity-70">
            {searchQuery || filter !== "all"
              ? "Try adjusting your search or filters"
              : showSharedFiles
              ? "Files shared by team members will appear here"
              : "Upload files to see them here"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {filteredFiles.map((file) => (
            <div
              key={file.file_id}
              className="p-4 hover:bg-white/5 transition-all group cursor-pointer"
              onClick={() => onFileSelect?.(file)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-1">
                  {getFileIcon(file.mime_type, "md")}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate mb-1">
                    {file.original_name || file.file_name || "Unknown File"}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs opacity-60 mb-2">
                    <span>{formatFileSize(file.file_size || 0)}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(file.upload_date)}
                    </span>
                    {file.uploaded_by && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {file.uploaded_by.username}
                      </span>
                    )}
                    {file.task && (
                      <span className="text-[var(--brand)]">
                        Task: {file.task.title}
                      </span>
                    )}
                  </div>

                  <div className="text-xs opacity-50">
                    {file.mime_type || "Unknown type"}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.download_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      className="neo-icon w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileSelect?.(file);
                    }}
                    className="neo-icon w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {onShareClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareClick(file);
                      }}
                      className="neo-icon w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}

                  {!showSharedFiles && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file);
                      }}
                      className="neo-icon w-8 h-8 flex items-center justify-center rounded hover:bg-red-500/20"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
