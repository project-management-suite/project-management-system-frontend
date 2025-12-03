import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient, FileShare, File } from "../../lib/api";
import {
  Share2,
  FileIcon,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Calendar,
  Shield,
  FolderOpen,
  AlertCircle,
  Upload,
  Plus,
  UserX,
  Users,
  Trash2,
  Edit3,
} from "lucide-react";
import { FileSharing } from "./FileSharing";

interface SharedFileWithDetails extends FileShare {
  file: File & {
    project?: {
      project_id: string;
      project_name: string;
    };
    shared_by?: {
      user_id: string;
      username: string;
      email: string;
    };
    shared_with?: {
      user_id: string;
      username: string;
      email: string;
    }[];
  };
  // Additional properties for grouped file data in "shared-by-me" tab
  share_count?: number;
  is_shared?: boolean;
}

type TabType = "shared-with-me" | "shared-by-me" | "my-files" | "upload-share";

export const FileSharingHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("my-files");
  const [sharedWithMe, setSharedWithMe] = useState<SharedFileWithDetails[]>([]);
  const [sharedByMe, setSharedByMe] = useState<SharedFileWithDetails[]>([]);
  const [userFiles, setUserFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [permissionFilter, setPermissionFilter] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFileSharing, setShowFileSharing] = useState(false);

  // Upload & Share state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [showUploadPreview, setShowUploadPreview] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [sharedWithResponse, sharedByResponse, userFilesResponse] =
        await Promise.all([
          apiClient.getSharedWithMe(50, 0),
          apiClient.getSharedByMe(50, 0),
          apiClient.getUserStandaloneFiles(),
        ]);

      if (sharedWithResponse.success && sharedWithResponse.shares) {
        const validShares = sharedWithResponse.shares.filter(
          (share: SharedFileWithDetails) =>
            share.file && typeof share.file === "object"
        );
        setSharedWithMe(validShares);
      }

      if (sharedByResponse.success && sharedByResponse.shares) {
        const validShares = sharedByResponse.shares.filter(
          (share: SharedFileWithDetails) =>
            share.file && typeof share.file === "object"
        );
        setSharedByMe(validShares);
      }

      if (userFilesResponse.success && userFilesResponse.files) {
        setUserFiles(userFilesResponse.files);
      }
    } catch (error) {
      console.error("Error fetching shared files:", error);
      setError("Failed to load shared files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    setSelectedFiles(files);
    setShowUploadPreview(true);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFiles) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Create a progress callback
        const progressCallback = (progress: number) => {
          setUploadProgress(
            (i / selectedFiles.length + progress / 100 / selectedFiles.length) *
              100
          );
        };

        const formData = new FormData();
        formData.append("file", file);
        formData.append("uploaded_by_user_id", user!.user_id);

        const response = await apiClient.uploadFileStandalone(
          formData,
          progressCallback
        );

        if (!response.success) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      setUploadProgress(100);

      // Refresh the data after upload
      await fetchAllData();

      // Show success message
      alert(`Successfully uploaded ${selectedFiles.length} file(s)`);

      // Close preview and reset
      setShowUploadPreview(false);
      setSelectedFiles(null);
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Upload failed: ${error}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDownload = async (file: File) => {
    try {
      console.log("Attempting to download file:", file);

      let downloadUrl = file.download_url;
      let fileName = file.original_name || file.file_name || "download";

      if (!downloadUrl) {
        console.log("No download URL available, fetching file metadata...");
        const response = await apiClient.getFileMetadata(file.file_id);
        if (response.success && response.file && response.file.download_url) {
          downloadUrl = response.file.download_url;
          fileName =
            response.file.original_name ||
            response.file.file_name ||
            "download";
        } else {
          alert("Download URL not available for this file");
          return;
        }
      }

      console.log("Downloading from URL:", downloadUrl);

      // Fetch the file as a blob to force download
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Create a blob URL and download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(
        `Failed to download file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleFileClick = (file: File) => {
    setSelectedFile(file);
    setShowFileSharing(true);
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      await apiClient.removeShare(shareId);
      await fetchAllData(); // Refresh data
      alert("Share access revoked successfully");
    } catch (error) {
      console.error("Error revoking share:", error);
      alert("Failed to revoke share access");
    }
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "admin":
        return "text-red-400 bg-red-900/20";
      case "write":
        return "text-yellow-400 bg-yellow-900/20";
      case "read":
      default:
        return "text-green-400 bg-green-900/20";
    }
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "shared-with-me":
        return sharedWithMe;
      case "shared-by-me":
        // Group shares by file to show unique files with sharing info
        const fileMap = new Map();
        sharedByMe.forEach((share) => {
          if (!share.file) return;

          const fileId = share.file.file_id;
          if (!fileMap.has(fileId)) {
            fileMap.set(fileId, {
              share_id: fileId, // Use file_id as share_id for consistency
              file_id: fileId,
              shared_with_user_id: "",
              shared_by_user_id: user?.user_id || "",
              permission_level: share.permission_level,
              shared_at: share.shared_at,
              file: share.file,
              shared_with: [], // Array of users this file is shared with
              share_count: 0,
            });
          }

          // Add the shared_with user to the array
          const fileData = fileMap.get(fileId);
          if (share.shared_with) {
            fileData.shared_with.push(share.shared_with);
            fileData.share_count = fileData.shared_with.length;
          }
        });

        return Array.from(fileMap.values());
      case "my-files":
        // Convert user files to a format that matches SharedFileWithDetails
        return userFiles.map((file) => {
          // Check if this file is shared by looking at sharedByMe
          const shareInfo = sharedByMe.find(
            (share) => share.file_id === file.file_id
          );
          return {
            share_id: file.file_id, // Use file_id as share_id for consistency
            file_id: file.file_id,
            shared_with_user_id: "",
            shared_by_user_id: user?.user_id || "",
            permission_level: "owner" as const,
            shared_at: file.upload_date,
            file: file,
            is_shared: !!shareInfo,
          };
        });
      default:
        return [];
    }
  };

  // Filter shared files based on search and permission filter
  const filteredFiles = getCurrentData().filter((share) => {
    const file = share.file;
    if (!file) return false;

    const matchesSearch =
      !searchQuery ||
      file.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.original_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      share.shared_by?.username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      file.project?.project_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesPermission =
      permissionFilter === "all" || share.permission_level === permissionFilter;

    return matchesSearch && matchesPermission;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <Share2 className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">File Sharing</h1>
              <p className="text-sm opacity-70">Manage your shared files</p>
            </div>
          </div>

          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 glass rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
            <Share2 className="w-6 h-6" style={{ color: "var(--brand)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">File Sharing</h1>
            <p className="text-sm opacity-70">
              Share files with team members and manage permissions
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab("shared-with-me");
              fetchAllData();
            }}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "shared-with-me"
                ? "glass border border-white/20"
                : "hover:glass-soft opacity-70"
            }`}
          >
            <Download className="w-4 h-4 inline mr-2" />
            Shared With Me ({sharedWithMe.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("shared-by-me");
              fetchAllData();
            }}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "shared-by-me"
                ? "glass border border-white/20"
                : "hover:glass-soft opacity-70"
            }`}
          >
            <Share2 className="w-4 h-4 inline mr-2" />
            Shared By Me ({sharedByMe.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("my-files");
              fetchAllData();
            }}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "my-files"
                ? "glass border border-white/20"
                : "hover:glass-soft opacity-70"
            }`}
          >
            <FileIcon className="w-4 h-4 inline mr-2" />
            My Files ({userFiles.length})
          </button>

          <button
            onClick={() => setActiveTab("upload-share")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "upload-share"
                ? "glass border border-white/20"
                : "hover:glass-soft opacity-70"
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload & Share
          </button>
        </div>

        {/* Search and Filters - Only for shared tabs */}
        {activeTab !== "my-files" && activeTab !== "upload-share" && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files, projects, or users..."
                className="neo-input w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 opacity-50" />
              <select
                className="neo-input"
                value={permissionFilter}
                onChange={(e) => setPermissionFilter(e.target.value)}
              >
                <option value="all">All Permissions</option>
                <option value="read">Read Only</option>
                <option value="write">Write Access</option>
                <option value="admin">Admin Access</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Shared Files List */}
      <div className="glass rounded-xl p-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={fetchAllData}
              className="ml-auto btn-ghost px-3 py-1 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Upload & Share Tab */}
        {activeTab === "upload-share" && (
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? "border-[var(--brand)] bg-[var(--brand)]/10"
                  : "border-white/20 hover:border-white/40"
              } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="neo-icon w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl">
                <Upload className="w-10 h-10 opacity-50" />
              </div>

              {isUploading ? (
                <div className="space-y-3">
                  <p className="text-lg">Uploading files...</p>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-[var(--brand)] h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm opacity-70">
                    {Math.round(uploadProgress)}% complete
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">
                    Drag & drop files here
                  </h3>
                  <p className="text-sm opacity-70 mb-4">
                    Or click to select files from your computer
                  </p>
                  <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                    <Plus className="w-4 h-4" />
                    Select Files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && handleFileUpload(e.target.files)
                      }
                    />
                  </label>
                </>
              )}
            </div>

            <div className="glass rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                How file sharing works
              </h4>
              <ul className="text-sm opacity-70 space-y-1">
                <li>• Upload files and they'll be available for sharing</li>
                <li>• Click on any file to manage sharing permissions</li>
                <li>• Share with individual users or entire project teams</li>
                <li>• Set read, write, or admin permissions</li>
                <li>• Monitor and revoke access anytime</li>
              </ul>
            </div>

            {/* Upload Preview Modal */}
            {showUploadPreview && selectedFiles && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="glass rounded-xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium mb-4">Confirm Upload</h3>
                  <div className="space-y-3 mb-6">
                    <p className="text-sm opacity-70">
                      Ready to upload {selectedFiles.length} file(s):
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <FileIcon className="w-4 h-4" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs opacity-50">
                            ({Math.round(file.size / 1024)}KB)
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs opacity-60">
                      After uploading, you can share these files with team
                      members by clicking on them.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowUploadPreview(false);
                        setSelectedFiles(null);
                      }}
                      className="btn-ghost flex-1"
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmUpload}
                      className="btn-primary flex-1"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Files List - For all tabs except upload */}
        {activeTab !== "upload-share" && (
          <div className="divide-y divide-white/5">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="neo-icon w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl">
                  <FolderOpen className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-lg mb-2">
                  {searchQuery || permissionFilter !== "all"
                    ? "No files match your filters"
                    : getCurrentData().length === 0
                    ? activeTab === "shared-with-me"
                      ? "No files shared with you yet"
                      : activeTab === "shared-by-me"
                      ? "You haven't shared any files yet"
                      : "No files uploaded yet"
                    : "No files found"}
                </p>
                <p className="text-sm opacity-70">
                  {searchQuery || permissionFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : activeTab === "shared-with-me"
                    ? "Files shared by team members will appear here"
                    : activeTab === "shared-by-me"
                    ? "Files you share with others will appear here"
                    : "Upload files to get started with sharing"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredFiles.map((share) => {
                  const file = share.file;
                  if (!file) return null;

                  return (
                    <div
                      key={share.share_id}
                      className={`p-4 transition-all group ${
                        activeTab === "shared-by-me"
                          ? "hover:bg-white/5 cursor-pointer"
                          : "hover:bg-white/5"
                      }`}
                      onClick={() => {
                        if (activeTab === "shared-by-me" && file) {
                          handleFileClick(file);
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0">
                          <FileIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">
                                {file.original_name || file.file_name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm opacity-70 mt-1">
                                <span>
                                  {formatFileSize(file.file_size || 0)}
                                </span>
                                <div className="text-xs opacity-50">
                                  {file.mime_type || "Unknown type"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {activeTab === "my-files" ? (
                                // Show sharing status for my files
                                share.is_shared ? (
                                  <span className="px-2 py-1 rounded text-xs font-medium text-blue-400 bg-blue-900/20">
                                    <Share2 className="w-3 h-3 inline mr-1" />
                                    Shared
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded text-xs font-medium text-gray-400 bg-gray-900/20">
                                    <FileIcon className="w-3 h-3 inline mr-1" />
                                    Private
                                  </span>
                                )
                              ) : (
                                // Show permission level for shared files
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${getPermissionColor(
                                    share.permission_level
                                  )}`}
                                >
                                  <Shield className="w-3 h-3 inline mr-1" />
                                  {share.permission_level}
                                </span>
                              )}
                            </div>

                            {/* File Sharing Modal */}
                            {selectedFile && showFileSharing && (
                              <FileSharing
                                file={selectedFile}
                                onClose={() => {
                                  setSelectedFile(null);
                                  setShowFileSharing(false);
                                }}
                                onShareUpdate={() => {
                                  // Refresh shared files when share is updated
                                  fetchAllData();
                                }}
                              />
                            )}
                          </div>{" "}
                          <div className="flex items-center gap-4 text-xs opacity-60">
                            {activeTab === "shared-with-me" &&
                              share.shared_by && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>
                                    Shared by {share.shared_by.username}
                                  </span>
                                </div>
                              )}

                            {activeTab === "shared-by-me" &&
                              share.share_count > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>
                                    Shared with {share.share_count} user(s) •
                                    Click to manage
                                  </span>
                                </div>
                              )}

                            {file.project && (
                              <div className="flex items-center gap-1">
                                <FolderOpen className="w-3 h-3" />
                                <span>{file.project.project_name}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(share.shared_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDownload(file)}
                            className="neo-icon w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Only show manage sharing for files we own (not shared-with-me) */}
                          {activeTab !== "shared-with-me" && (
                            <button
                              onClick={() => handleFileClick(file)}
                              className="neo-icon w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
                              title="Manage Sharing"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {activeTab === "shared-by-me" && (
                            <button
                              onClick={() => handleRevokeShare(share.share_id)}
                              className="neo-icon w-8 h-8 flex items-center justify-center rounded hover:bg-red-500/20 text-red-400"
                              title="Revoke Share"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Detail Modal */}
      {selectedFile && showFileSharing && (
        <FileSharing
          file={selectedFile}
          onClose={() => {
            setSelectedFile(null);
            setShowFileSharing(false);
          }}
          onShareUpdate={() => {
            // Refresh shared files when share is updated
            fetchAllData();
          }}
        />
      )}
    </div>
  );
};
