import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { apiClient } from "../../lib/api";
import { User, Mail, Phone, MapPin, Briefcase, Calendar } from "lucide-react";

interface UserPopoverProps {
  userId: string;
  username: string;
  children: React.ReactNode;
}

interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  role: string;
  profile_photo_url?: string;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  bio?: string;
  join_date?: string;
}

export const UserPopover = ({
  userId,
  username,
  children,
}: UserPopoverProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      isVisible &&
      !profile &&
      !isLoading &&
      userId &&
      userId !== "undefined"
    ) {
      loadProfile();
    }
  }, [isVisible, userId]);

  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isVisible]);

  const loadProfile = async () => {
    if (!userId || userId === "undefined") {
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/profile/${userId}`);
      if (response.profile) {
        setProfile(response.profile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Use basic info if profile fetch fails
      setProfile({
        user_id: userId,
        username: username,
        email: "",
        role: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 320;
    const popoverHeight = 400;
    const gap = 8;

    // Default: position to the right of the trigger
    let top = triggerRect.top;
    let left = triggerRect.right + gap;

    // Check if popover goes off-screen on the right
    if (left + popoverWidth > window.innerWidth - 16) {
      // Try positioning to the left
      left = triggerRect.left - popoverWidth - gap;

      // If still off-screen, center align below
      if (left < 16) {
        left = triggerRect.left + triggerRect.width / 2 - popoverWidth / 2;
        top = triggerRect.bottom + gap;

        // Ensure it stays within viewport horizontally
        if (left < 16) left = 16;
        if (left + popoverWidth > window.innerWidth - 16) {
          left = window.innerWidth - popoverWidth - 16;
        }
      }
    }

    // Check if popover goes off-screen at the bottom
    if (top + popoverHeight > window.innerHeight - 16) {
      // Position above trigger
      top = triggerRect.top - popoverHeight - gap;

      // If still off-screen at top, align to top with margin
      if (top < 16) {
        top = 16;
      }
    }

    setPosition({ top, left });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toUpperCase()) {
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
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block cursor-pointer"
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            ref={popoverRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="fixed z-[9999] animate-fade-in"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: "320px",
            }}
          >
            <div
              className="border border-white/20 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl text-white"
              style={{ backgroundColor: "#171717" }}
            >
              {isLoading ? (
                <div className="p-6 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/10 border-t-[var(--brand)] rounded-full animate-spin" />
                </div>
              ) : profile ? (
                <div className="p-5 space-y-4">
                  {/* Header with Photo */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      {profile.profile_photo_url ? (
                        <img
                          src={profile.profile_photo_url}
                          alt={profile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {profile.username}
                      </h3>
                      {profile.position && (
                        <p className="text-sm opacity-70 truncate">
                          {profile.position}
                        </p>
                      )}
                      {profile.role && (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${getRoleBadgeColor(
                            profile.role
                          )}`}
                        >
                          {profile.role}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div className="glass-soft rounded-lg p-3">
                      <p className="text-sm opacity-80 line-clamp-3">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2.5 text-sm">
                    {profile.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 opacity-50 flex-shrink-0" />
                        <span className="opacity-80 truncate">
                          {profile.email}
                        </span>
                      </div>
                    )}

                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 opacity-50 flex-shrink-0" />
                        <span className="opacity-80">{profile.phone}</span>
                      </div>
                    )}

                    {profile.department && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 opacity-50 flex-shrink-0" />
                        <span className="opacity-80">{profile.department}</span>
                      </div>
                    )}

                    {profile.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 opacity-50 flex-shrink-0" />
                        <span className="opacity-80 truncate">
                          {profile.address}
                        </span>
                      </div>
                    )}

                    {profile.join_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 opacity-50 flex-shrink-0" />
                        <span className="opacity-80">
                          Joined{" "}
                          {new Date(profile.join_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center opacity-70">
                  <p className="text-sm">Profile not available</p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};
