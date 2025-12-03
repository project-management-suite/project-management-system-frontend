import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../lib/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Save,
  Camera,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ProfileData {
  username: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  profile_photo_url?: string;
  // Work details
  department?: string;
  position?: string;
  join_date?: string;
}

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    username: user?.username || "",
    email: user?.email || "",
    phone: "",
    address: "",
    bio: "",
    profile_photo_url: "",
    department: "",
    position: "",
    join_date: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Fetch current user's profile data from API
      const response = await apiClient.get("/profile");
      if (response.profile) {
        setProfileData({
          ...response.profile,
          username: user?.username || response.profile.username,
          email: user?.email || response.profile.email,
        });
        if (response.profile.profile_photo_url) {
          setPhotoPreview(response.profile.profile_photo_url);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // If profile doesn't exist yet, that's okay - we'll create it on save
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image must be less than 5MB" });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      let photoUpdated = false;

      // Upload photo if changed
      if (photoFile) {
        const formData = new FormData();
        formData.append("profilePhoto", photoFile);
        const uploadResponse = await apiClient.post(
          "/profile/photo/upload",
          formData
        );

        if (uploadResponse.success) {
          photoUpdated = true;
          setPhotoFile(null);
        }
      }

      // Update profile data fields
      const updatePayload = {
        phone: profileData.phone || null,
        address: profileData.address || null,
        bio: profileData.bio || null,
        department: profileData.department || null,
        position: profileData.position || null,
        join_date: profileData.join_date || null,
      };

      const profileResponse = await apiClient.put("/profile", updatePayload);

      if (profileResponse.success) {
        setMessage({
          type: "success",
          text: photoUpdated
            ? "Profile and photo updated successfully!"
            : "Profile updated successfully!",
        });
        await loadProfile();
        await refreshUser(); // Refresh user in AuthContext to update sidebar
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to save profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-900/20 text-red-300 border border-red-800";
      case "MANAGER":
        return "bg-blue-900/20 text-blue-300 border border-blue-800";
      case "DEVELOPER":
        return "bg-green-900/20 text-green-300 border border-green-800";
      default:
        return "bg-gray-900/20 text-gray-300 border border-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-sm opacity-70 mt-1">
            Manage your personal and work information
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setPhotoFile(null);
                  setPhotoPreview(profileData.profile_photo_url || null);
                  loadProfile();
                }}
                className="btn-ghost"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`glass-soft rounded-lg p-4 flex items-start gap-3 ${
            message.type === "error"
              ? "border border-red-500/20"
              : "border border-green-500/20"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              message.type === "error" ? "text-red-300" : "text-green-300"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Profile Photo Section */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-white" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 neo-icon w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{profileData.username}</h3>
            <p className="text-sm opacity-70 mb-3">{profileData.email}</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                user?.role || ""
              )}`}
            >
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) =>
                setProfileData({ ...profileData, username: e.target.value })
              }
              disabled={!isEditing}
              className="neo-input w-full"
              placeholder="Enter username"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled={true}
              className="neo-input w-full opacity-60 cursor-not-allowed"
              placeholder="Enter email"
            />
            <p className="text-xs opacity-50 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone || ""}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              disabled={!isEditing}
              className="neo-input w-full"
              placeholder="Enter phone number"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Address
            </label>
            <input
              type="text"
              value={profileData.address || ""}
              onChange={(e) =>
                setProfileData({ ...profileData, address: e.target.value })
              }
              disabled={!isEditing}
              className="neo-input w-full"
              placeholder="Enter address"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={profileData.bio || ""}
            onChange={(e) =>
              setProfileData({ ...profileData, bio: e.target.value })
            }
            disabled={!isEditing}
            className="neo-input w-full min-h-[100px] resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

      {/* Work Information */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Work Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Department
            </label>
            <input
              type="text"
              value={profileData.department || ""}
              onChange={(e) =>
                setProfileData({ ...profileData, department: e.target.value })
              }
              disabled={!isEditing}
              className="neo-input w-full"
              placeholder="e.g., Engineering"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium mb-2">Position</label>
            <input
              type="text"
              value={profileData.position || ""}
              onChange={(e) =>
                setProfileData({ ...profileData, position: e.target.value })
              }
              disabled={!isEditing}
              className="neo-input w-full"
              placeholder="e.g., Senior Developer"
            />
          </div>

          {/* Join Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Join Date</label>
            <input
              type="date"
              value={profileData.join_date || ""}
              onChange={(e) =>
                setProfileData({ ...profileData, join_date: e.target.value })
              }
              disabled={!isEditing}
              className="neo-input w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
