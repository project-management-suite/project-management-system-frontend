import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  MapPin,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { apiClient } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import "react-calendar/dist/Calendar.css";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: "task_due" | "meeting" | "milestone";
  location?: string;
  attendees?: string[];
  project_id?: string;
  task_id?: string;
  milestone_id?: string;
  created_by: string;
}

interface Meeting {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: string[];
}

interface User {
  user_id: string;
  username: string;
  email: string;
}

export const CalendarView = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [newMeeting, setNewMeeting] = useState<Meeting>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    attendees: [],
  });

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/calendar/events");
      setEvents(response.data || response);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get("/projects/users");
      setUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (
      Array.isArray(value) &&
      value.length > 0 &&
      value[0] instanceof Date
    ) {
      setSelectedDate(value[0]);
    }
    // Handle null and other cases by keeping the current selectedDate
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => event.date === dateStr);
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    return (
      <div className="absolute top-1 right-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>
    );
  };

  const handleCreateMeeting = async () => {
    try {
      const meetingData = {
        ...newMeeting,
        created_by: user?.user_id,
        type: "meeting",
      };

      await apiClient.post("/calendar/meetings", meetingData);

      setShowMeetingModal(false);
      setUserSearch("");
      setNewMeeting({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        attendees: [],
      });

      fetchEvents(); // Refresh events
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const handleEditEvent = (event: Event) => {
    if (event.type === "meeting") {
      setEditingEvent(event);
      setNewMeeting({
        title: event.title,
        description: event.description || "",
        date: event.date,
        time: event.time,
        location: event.location || "",
        attendees: event.attendees || [],
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateMeeting = async () => {
    if (!editingEvent) return;

    try {
      await apiClient.put(`/calendar/meetings/${editingEvent.id}`, newMeeting);

      setShowEditModal(false);
      setEditingEvent(null);
      setNewMeeting({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        attendees: [],
      });

      fetchEvents(); // Refresh events
    } catch (error) {
      console.error("Error updating meeting:", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await apiClient.delete(`/calendar/events/${eventId}`);
      fetchEvents(); // Refresh events
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "task_due":
        return "bg-red-900/20 text-red-300 border-red-800";
      case "meeting":
        return "bg-blue-900/20 text-blue-300 border-blue-800";
      case "milestone":
        return "bg-green-900/20 text-green-300 border-green-800";
      default:
        return "bg-gray-900/20 text-gray-300 border-gray-800";
    }
  };

  const formatEventType = (type: string) => {
    switch (type) {
      case "task_due":
        return "Task Due";
      case "meeting":
        return "Meeting";
      case "milestone":
        return "Milestone";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-sm opacity-70">
              Manage your schedule and meetings
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowMeetingModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="calendar-container">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={tileContent}
                className="react-calendar glass border-0 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">
              Events for {selectedDate.toLocaleDateString()}
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-white/10 rounded mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="glass-soft p-4 rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm opacity-70 mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      {event.created_by === user?.user_id &&
                        event.type === "meeting" && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1 hover:bg-white/10 rounded text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </div>
                      <span
                        className={`px-2 py-1 rounded border text-xs ${getEventTypeColor(
                          event.type
                        )}`}
                      >
                        {formatEventType(event.type)}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-1 text-xs opacity-70">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    )}

                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-1 text-xs opacity-70">
                        <Users className="w-3 h-3" />
                        {event.attendees.length} attendees
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-50">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2" />
                <p>No events scheduled for this day</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {events.filter((e) => e.type === "meeting").length}
              </div>
              <div className="text-xs opacity-70">Meetings</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-red-500">
                {events.filter((e) => e.type === "task_due").length}
              </div>
              <div className="text-xs opacity-70">Due Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMeetingModal(false)}
          />
          <div className="relative card p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Schedule Meeting</h3>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) =>
                    setNewMeeting((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="input w-full"
                  placeholder="Meeting title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) =>
                    setNewMeeting((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="input w-full h-20 resize-none"
                  placeholder="Meeting description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) =>
                      setNewMeeting((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) =>
                      setNewMeeting((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newMeeting.location}
                  onChange={(e) =>
                    setNewMeeting((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="input w-full"
                  placeholder="Meeting location or video link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Attendees
                </label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.user_id}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={newMeeting.attendees.includes(user.user_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewMeeting((prev) => ({
                              ...prev,
                              attendees: [...prev.attendees, user.user_id],
                            }));
                          } else {
                            setNewMeeting((prev) => ({
                              ...prev,
                              attendees: prev.attendees.filter(
                                (id) => id !== user.user_id
                              ),
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {user.username} ({user.email})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMeetingModal(false)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCreateMeeting();
                  setUserSearch("");
                }}
                className="btn-primary flex-1"
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowEditModal(false);
              setEditingEvent(null);
              setUserSearch("");
              setNewMeeting({
                title: "",
                description: "",
                date: "",
                time: "",
                location: "",
                attendees: [],
              });
            }}
          />
          <div className="relative card p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Edit Meeting</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEvent(null);
                  setNewMeeting({
                    title: "",
                    description: "",
                    date: "",
                    time: "",
                    location: "",
                    attendees: [],
                  });
                }}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) =>
                    setNewMeeting((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="input w-full"
                  placeholder="Meeting title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) =>
                    setNewMeeting((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="input w-full h-20 resize-none"
                  placeholder="Meeting description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) =>
                      setNewMeeting((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) =>
                      setNewMeeting((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newMeeting.location}
                  onChange={(e) =>
                    setNewMeeting((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="input w-full"
                  placeholder="Meeting location or video link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Attendees
                </label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.user_id}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={newMeeting.attendees.includes(user.user_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewMeeting((prev) => ({
                              ...prev,
                              attendees: [...prev.attendees, user.user_id],
                            }));
                          } else {
                            setNewMeeting((prev) => ({
                              ...prev,
                              attendees: prev.attendees.filter(
                                (id) => id !== user.user_id
                              ),
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {user.username} ({user.email})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEvent(null);
                  setNewMeeting({
                    title: "",
                    description: "",
                    date: "",
                    time: "",
                    location: "",
                    attendees: [],
                  });
                }}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMeeting}
                className="btn-primary flex-1"
              >
                Update Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .calendar-container {
          --react-calendar-bg: transparent;
          --react-calendar-border: rgba(255, 255, 255, 0.1);
          --react-calendar-text: white;
          --react-calendar-hover-bg: rgba(255, 255, 255, 0.1);
          --react-calendar-selected-bg: rgba(59, 130, 246, 0.5);
        }

        .react-calendar {
          background: var(--react-calendar-bg) !important;
          border: 1px solid var(--react-calendar-border) !important;
          color: var(--react-calendar-text) !important;
          font-family: inherit !important;
          width: 100% !important;
        }

        .react-calendar__navigation {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        .react-calendar__navigation button {
          color: white !important;
          background: transparent !important;
          border: none !important;
          font-size: 16px !important;
          font-weight: 500 !important;
        }

        .react-calendar__navigation button:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .react-calendar__month-view__weekdays {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        .react-calendar__month-view__weekdays__weekday {
          color: rgba(255, 255, 255, 0.7) !important;
          font-weight: 500 !important;
          text-transform: uppercase !important;
          font-size: 12px !important;
        }

        .react-calendar__tile {
          background: transparent !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          position: relative !important;
          height: 60px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .react-calendar__tile:hover {
          background: var(--react-calendar-hover-bg) !important;
        }

        .react-calendar__tile--active {
          background: var(--react-calendar-selected-bg) !important;
          border-color: rgba(59, 130, 246, 0.8) !important;
        }

        .react-calendar__tile--now {
          background: rgba(34, 197, 94, 0.2) !important;
          border-color: rgba(34, 197, 94, 0.5) !important;
        }

        .react-calendar__tile--hasActive {
          background: var(--react-calendar-selected-bg) !important;
        }

        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
