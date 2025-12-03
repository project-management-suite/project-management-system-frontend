import { useState, useEffect } from "react";
import { Task, Comment, apiClient } from "../../lib/api";
import {
  X,
  Save,
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskEditModal = ({
  task,
  onClose,
  onSuccess,
}: TaskEditModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Task fields
  const [priority, setPriority] = useState<string>(task.priority || "MEDIUM");
  const [progress, setProgress] = useState<number>(
    task.progress_percentage || 0
  );
  const [status, setStatus] = useState<string>(task.status);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [task.task_id]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await apiClient.getTaskComments(task.task_id);
      setComments(response.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiClient.updateTask(task.task_id, {
        priority: priority as Task["priority"],
        progress_percentage: progress,
        status: status as Task["status"],
      });
      setSuccess("Task updated successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await apiClient.createComment(
        task.task_id,
        newComment.trim()
      );
      setComments([...comments, response.comment]);
      setNewComment("");
      setSuccess("Comment added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to add comment"
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;

    try {
      const response = await apiClient.updateComment(
        commentId,
        editingCommentText.trim()
      );
      setComments(
        comments.map((c) => (c.comment_id === commentId ? response.comment : c))
      );
      setEditingCommentId(null);
      setEditingCommentText("");
      setSuccess("Comment updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update comment"
      );
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await apiClient.deleteComment(commentId);
      setComments(comments.filter((c) => c.comment_id !== commentId));
      setSuccess("Comment deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete comment"
      );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "LOW":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="glass rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--tile)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{task.title}</h2>
            <p className="text-sm opacity-70 mt-1">Edit Task Details</p>
          </div>
          <button
            onClick={onClose}
            className="neo-icon hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 opacity-70" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Messages */}
          {error && (
            <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/20 text-green-400 flex items-center gap-2">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Task Details Section */}
          <div className="glass rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp
                className="w-5 h-5"
                style={{ color: "var(--brand)" }}
              />
              Task Settings
            </h3>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">
                Priority
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm ${
                      priority === p
                        ? getPriorityColor(p)
                        : "border-white/10 hover:border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 glass rounded-lg border border-white/10 focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 outline-none transition-colors"
                style={{ background: "var(--tile-dark)" }}
              >
                <option value="NEW">New</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium opacity-70">
                  Progress
                </label>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "var(--brand)" }}
                >
                  {progress}%
                </span>
              </div>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--brand) 0%, var(--brand) ${progress}%, rgba(255,255,255,0.1) ${progress}%, rgba(255,255,255,0.1) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs opacity-50">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressColor(
                      progress
                    )}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="glass rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare
                className="w-5 h-5"
                style={{ color: "var(--brand)" }}
              />
              Comments ({comments.length})
            </h3>

            {/* Comments List */}
            {loadingComments ? (
              <div className="text-center py-8 opacity-70">
                Loading comments...
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-center py-8 opacity-50 text-sm">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment) => {
                    const isOwnComment =
                      comment.user?.user_id === user?.user_id ||
                      comment.user_id === user?.user_id;
                    return (
                      <div
                        key={comment.comment_id}
                        className="glass rounded-lg p-4 space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {comment.user?.username || "Unknown"}
                              </span>
                              {isOwnComment && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand)]/20 text-[var(--brand)]">
                                  You
                                </span>
                              )}
                              <span className="text-xs opacity-50">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            {editingCommentId === comment.comment_id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editingCommentText}
                                  onChange={(e) =>
                                    setEditingCommentText(e.target.value)
                                  }
                                  className="flex-1 px-3 py-2 glass rounded-lg border border-white/10 focus:border-[var(--brand)]/50 outline-none text-sm"
                                  style={{ background: "var(--tile-dark)" }}
                                  autoFocus
                                />
                                <button
                                  onClick={() =>
                                    handleUpdateComment(comment.comment_id)
                                  }
                                  className="neo-icon w-8 h-8 hover:bg-green-500/20"
                                >
                                  <Check className="w-4 h-4 text-green-400" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingCommentText("");
                                  }}
                                  className="neo-icon w-8 h-8 hover:bg-red-500/20"
                                >
                                  <X className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            ) : (
                              <p className="opacity-80 text-sm">
                                {comment.comment_text}
                              </p>
                            )}
                          </div>
                          {isOwnComment &&
                            editingCommentId !== comment.comment_id && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.comment_id);
                                    setEditingCommentText(comment.comment_text);
                                  }}
                                  className="neo-icon w-8 h-8 hover:bg-blue-500/20"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment.comment_id)
                                  }
                                  className="neo-icon w-8 h-8 hover:bg-red-500/20"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Add Comment */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !submittingComment) {
                    handleAddComment();
                  }
                }}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-3 glass rounded-lg border border-white/10 focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 outline-none"
                style={{ background: "var(--tile-dark)" }}
                disabled={submittingComment}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-6"
              >
                {submittingComment ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-ghost" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
