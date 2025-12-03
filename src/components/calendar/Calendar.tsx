import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import DatePicker from "react-datepicker";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  MapPin,
  Edit,
  Trash2,
  X,
  Eye,
  ExternalLink,
} from "lucide-react";
import { apiClient, Task } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import "react-calendar/dist/Calendar.css";
import "react-datepicker/dist/react-datepicker.css";

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
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showFilteredEventsModal, setShowFilteredEventsModal] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string | null>(null);
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

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleViewTask = async (taskId: string, projectId?: string) => {
    // Navigate to the project's task manager if we have a project_id
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleFilterByType = (type: string) => {
    setEventTypeFilter(type);
    setShowFilteredEventsModal(true);
  };

  const getFilteredEvents = () => {
    if (!eventTypeFilter) return events;
    return events.filter((event) => event.type === eventTypeFilter);
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
                    onClick={() => handleEventClick(event)}
                    className="glass-soft p-4 rounded-lg space-y-2 cursor-pointer hover:bg-white/10 transition-colors"
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
            <div
              onClick={() => handleFilterByType("meeting")}
              className="card p-4 text-center cursor-pointer hover:bg-white/5 transition-colors"
              title="Click to view all meetings"
            >
              <div className="text-2xl font-bold text-blue-500">
                {events.filter((e) => e.type === "meeting").length}
              </div>
              <div className="text-xs opacity-70">Meetings</div>
            </div>
            <div
              onClick={() => handleFilterByType("task_due")}
              className="card p-4 text-center cursor-pointer hover:bg-white/5 transition-colors"
              title="Click to view all due tasks"
            >
              <div className="text-2xl font-bold text-red-500">
                {events.filter((e) => e.type === "task_due").length}
              </div>
              <div className="text-xs opacity-70">Due Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtered Events Modal */}
      {showFilteredEventsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowFilteredEventsModal(false);
              setEventTypeFilter(null);
            }}
          />
          <div className="relative card p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {eventTypeFilter === "meeting"
                  ? "All Meetings"
                  : "All Due Tasks"}{" "}
                <span className="text-sm opacity-70">
                  ({getFilteredEvents().length})
                </span>
              </h3>
              <button
                onClick={() => {
                  setShowFilteredEventsModal(false);
                  setEventTypeFilter(null);
                }}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {getFilteredEvents().length > 0 ? (
                getFilteredEvents()
                  .sort(
                    (a, b) =>
                      new Date(a.date + " " + a.time).getTime() -
                      new Date(b.date + " " + b.time).getTime()
                  )
                  .map((event) => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setShowFilteredEventsModal(false);
                        setEventTypeFilter(null);
                        handleEventClick(event);
                      }}
                      className="glass-soft p-4 rounded-lg space-y-2 cursor-pointer hover:bg-white/10 transition-colors"
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEvent(event);
                                  setShowFilteredEventsModal(false);
                                  setEventTypeFilter(null);
                                }}
                                className="p-1 hover:bg-white/10 rounded"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                                className="p-1 hover:bg-white/10 rounded text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
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

                      {event.type === "task_due" && event.project_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTask(event.task_id!, event.project_id);
                            setShowFilteredEventsModal(false);
                            setEventTypeFilter(null);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Task in Project
                        </button>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-12 opacity-50">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>
                    No{" "}
                    {eventTypeFilter === "meeting" ? "meetings" : "due tasks"}{" "}
                    found
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setShowFilteredEventsModal(false);
                  setEventTypeFilter(null);
                }}
                className="btn-ghost w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowMeetingModal(false);
              setUserSearch("");
            }}
          />
          <div className="relative glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
                  <Plus className="w-5 h-5" style={{ color: "var(--brand)" }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Schedule Meeting</h3>
                  <p className="text-xs opacity-70">
                    Create a new meeting with team members
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMeetingModal(false);
                  setUserSearch("");
                }}
                className="neo-icon w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-2">
              {/* Meeting Title */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <CalendarIcon
                    className="w-4 h-4"
                    style={{ color: "var(--brand)" }}
                  />
                  Meeting Title
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) =>
                    setNewMeeting((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="neo-input w-full"
                  placeholder="e.g., Sprint Planning Meeting"
                  autoComplete="off"
                  data-form-type="other"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Edit className="w-4 h-4" style={{ color: "var(--brand)" }} />
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
                  className="neo-input w-full h-24 resize-none"
                  placeholder="Add meeting agenda or notes..."
                  autoComplete="off"
                  data-form-type="other"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <CalendarIcon
                      className="w-4 h-4"
                      style={{ color: "var(--brand)" }}
                    />
                    Date
                    <span className="text-red-400">*</span>
                  </label>
                  <DatePicker
                    selected={
                      newMeeting.date
                        ? new Date(newMeeting.date + "T00:00:00")
                        : null
                    }
                    onChange={(date: Date | null) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        setNewMeeting((prev) => ({
                          ...prev,
                          date: `${year}-${month}-${day}`,
                        }));
                      } else {
                        setNewMeeting((prev) => ({ ...prev, date: "" }));
                      }
                    }}
                    dateFormat="MMM d, yyyy"
                    placeholderText="Select date"
                    className="neo-input w-full px-3 py-2 rounded-lg cursor-pointer"
                    wrapperClassName="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock
                      className="w-4 h-4"
                      style={{ color: "var(--brand)" }}
                    />
                    Time
                    <span className="text-red-400">*</span>
                  </label>
                  <DatePicker
                    selected={
                      newMeeting.time
                        ? new Date(`2000-01-01T${newMeeting.time}`)
                        : null
                    }
                    onChange={(date: Date | null) => {
                      if (date) {
                        const hours = String(date.getHours()).padStart(2, "0");
                        const minutes = String(date.getMinutes()).padStart(
                          2,
                          "0"
                        );
                        setNewMeeting((prev) => ({
                          ...prev,
                          time: `${hours}:${minutes}`,
                        }));
                      } else {
                        setNewMeeting((prev) => ({ ...prev, time: "" }));
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    placeholderText="Select time"
                    className="neo-input w-full px-3 py-2 rounded-lg cursor-pointer"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin
                    className="w-4 h-4"
                    style={{ color: "var(--brand)" }}
                  />
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
                  className="neo-input w-full"
                  placeholder="Office room, Zoom link, or Google Meet URL"
                  autoComplete="off"
                  data-form-type="other"
                />
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users
                    className="w-4 h-4"
                    style={{ color: "var(--brand)" }}
                  />
                  Attendees
                  <span className="text-xs opacity-60 font-normal">
                    ({newMeeting.attendees.length} selected)
                  </span>
                </label>

                {/* Search Input */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="neo-input w-full pl-9"
                    placeholder="Search by name or email..."
                    autoComplete="off"
                    data-form-type="other"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                {/* Selected Attendees */}
                {newMeeting.attendees.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {users
                      .filter((u) => newMeeting.attendees.includes(u.user_id))
                      .map((attendee) => (
                        <div
                          key={attendee.user_id}
                          className="glass-soft px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                        >
                          <span>{attendee.username}</span>
                          <button
                            onClick={() => {
                              setNewMeeting((prev) => ({
                                ...prev,
                                attendees: prev.attendees.filter(
                                  (id) => id !== attendee.user_id
                                ),
                              }));
                            }}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {/* Attendees List */}
                <div className="glass-soft rounded-lg max-h-48 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {filteredUsers.map((user) => (
                        <label
                          key={user.user_id}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newMeeting.attendees.includes(
                              user.user_id
                            )}
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
                            className="w-4 h-4 rounded border-white/20"
                          />
                          <div className="neo-icon w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 text-xs">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {user.username}
                            </div>
                            <div className="text-xs opacity-60 truncate">
                              {user.email}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center opacity-50">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No users found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setShowMeetingModal(false);
                  setUserSearch("");
                }}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCreateMeeting();
                  setUserSearch("");
                }}
                disabled={
                  !newMeeting.title || !newMeeting.date || !newMeeting.time
                }
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CalendarIcon className="w-4 h-4" />
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowEventDetailsModal(false);
              setSelectedEvent(null);
            }}
          />
          <div className="relative card p-6 w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Event Details</h3>
              <button
                onClick={() => {
                  setShowEventDetailsModal(false);
                  setSelectedEvent(null);
                }}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold mb-2">
                  {selectedEvent.title}
                </h4>
                {selectedEvent.description && (
                  <p className="text-sm opacity-70">
                    {selectedEvent.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedEvent.time}</span>
                </div>
              </div>

              <div>
                <span
                  className={`px-3 py-1 rounded border text-sm inline-block ${getEventTypeColor(
                    selectedEvent.type
                  )}`}
                >
                  {formatEventType(selectedEvent.type)}
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.attendees &&
                selectedEvent.attendees.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Users className="w-4 h-4" />
                      <span>{selectedEvent.attendees.length} attendees</span>
                    </div>
                  </div>
                )}
            </div>

            <div className="flex gap-3 mt-6">
              {selectedEvent.type === "task_due" && selectedEvent.task_id && (
                <button
                  onClick={() => {
                    handleViewTask(
                      selectedEvent.task_id!,
                      selectedEvent.project_id
                    );
                    setShowEventDetailsModal(false);
                    setSelectedEvent(null);
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Task
                </button>
              )}
              {selectedEvent.created_by === user?.user_id &&
                selectedEvent.type === "meeting" && (
                  <button
                    onClick={() => {
                      handleEditEvent(selectedEvent);
                      setShowEventDetailsModal(false);
                      setSelectedEvent(null);
                    }}
                    className="btn-ghost flex-1"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit
                  </button>
                )}
              <button
                onClick={() => {
                  setShowEventDetailsModal(false);
                  setSelectedEvent(null);
                }}
                className="btn-ghost flex-1"
              >
                Close
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
          <div className="relative glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
                  <Edit className="w-5 h-5" style={{ color: "var(--brand)" }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Edit Meeting</h3>
                  <p className="text-xs opacity-70">
                    Update meeting details and attendees
                  </p>
                </div>
              </div>
              <button
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
                className="neo-icon w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-2">
              {/* Meeting Title */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <CalendarIcon
                    className="w-4 h-4"
                    style={{ color: "var(--brand)" }}
                  />
                  Meeting Title
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) =>
                    setNewMeeting((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="neo-input w-full"
                  placeholder="e.g., Sprint Planning Meeting"
                  autoComplete="off"
                  data-form-type="other"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Edit className="w-4 h-4" style={{ color: "var(--brand)" }} />
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
                  className="neo-input w-full h-24 resize-none"
                  placeholder="Add meeting agenda or notes..."
                  autoComplete="off"
                  data-form-type="other"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <CalendarIcon
                      className="w-4 h-4"
                      style={{ color: "var(--brand)" }}
                    />
                    Date
                    <span className="text-red-400">*</span>
                  </label>
                  <DatePicker
                    selected={
                      newMeeting.date
                        ? new Date(newMeeting.date + "T00:00:00")
                        : null
                    }
                    onChange={(date: Date | null) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        setNewMeeting((prev) => ({
                          ...prev,
                          date: `${year}-${month}-${day}`,
                        }));
                      } else {
                        setNewMeeting((prev) => ({ ...prev, date: "" }));
                      }
                    }}
                    dateFormat="MMM d, yyyy"
                    placeholderText="Select date"
                    className="neo-input w-full px-3 py-2 rounded-lg cursor-pointer"
                    wrapperClassName="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock
                      className="w-4 h-4"
                      style={{ color: "var(--brand)" }}
                    />
                    Time
                    <span className="text-red-400">*</span>
                  </label>
                  <DatePicker
                    selected={
                      newMeeting.time
                        ? new Date(`2000-01-01T${newMeeting.time}`)
                        : null
                    }
                    onChange={(date: Date | null) => {
                      if (date) {
                        const hours = String(date.getHours()).padStart(2, "0");
                        const minutes = String(date.getMinutes()).padStart(
                          2,
                          "0"
                        );
                        setNewMeeting((prev) => ({
                          ...prev,
                          time: `${hours}:${minutes}`,
                        }));
                      } else {
                        setNewMeeting((prev) => ({ ...prev, time: "" }));
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    placeholderText="Select time"
                    className="neo-input w-full px-3 py-2 rounded-lg cursor-pointer"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin
                    className="w-4 h-4"
                    style={{ color: "var(--brand)" }}
                  />
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
                  className="neo-input w-full"
                  placeholder="Office room, Zoom link, or Google Meet URL"
                  autoComplete="off"
                  data-form-type="other"
                />
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users
                    className="w-4 h-4"
                    style={{ color: "var(--brand)" }}
                  />
                  Attendees
                  <span className="text-xs opacity-60 font-normal">
                    ({newMeeting.attendees.length} selected)
                  </span>
                </label>

                {/* Search Input */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="neo-input w-full pl-9"
                    placeholder="Search by name or email..."
                    autoComplete="off"
                    data-form-type="other"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                {/* Selected Attendees */}
                {newMeeting.attendees.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {users
                      .filter((u) => newMeeting.attendees.includes(u.user_id))
                      .map((attendee) => (
                        <div
                          key={attendee.user_id}
                          className="glass-soft px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                        >
                          <span>{attendee.username}</span>
                          <button
                            onClick={() => {
                              setNewMeeting((prev) => ({
                                ...prev,
                                attendees: prev.attendees.filter(
                                  (id) => id !== attendee.user_id
                                ),
                              }));
                            }}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {/* Attendees List */}
                <div className="glass-soft rounded-lg max-h-48 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {filteredUsers.map((user) => (
                        <label
                          key={user.user_id}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newMeeting.attendees.includes(
                              user.user_id
                            )}
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
                            className="w-4 h-4 rounded border-white/20"
                          />
                          <div className="neo-icon w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 text-xs">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {user.username}
                            </div>
                            <div className="text-xs opacity-60 truncate">
                              {user.email}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center opacity-50">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No users found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
              <button
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
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMeeting}
                disabled={
                  !newMeeting.title || !newMeeting.date || !newMeeting.time
                }
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit className="w-4 h-4" />
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
