import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import { TaskStatus } from '../../lib/database.types';

interface Project {
  project_id: string;
  project_name: string;
  description: string | null;
}

interface Task {
  task_id: string;
  project_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TaskStatus;
  created_at: string;
  assignments: {
    developer: {
      user_id: string;
      username: string;
      email: string;
    };
  }[];
}

interface TaskManagerProps {
  project: Project;
  onBack: () => void;
}

export const TaskManager = ({ project, onBack }: TaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignments:task_assignments(
          developer:profiles(user_id, username, email)
        )
      `)
      .eq('project_id', project.project_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [project.project_id]);

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('task_id', taskId);

    if (error) {
      alert('Error deleting task: ' + error.message);
    } else {
      fetchTasks();
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-gray-100 text-gray-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{project.project_name}</h1>
            <p className="text-gray-600">{project.description || 'No description'}</p>
          </div>
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No tasks yet</p>
            <p className="text-gray-400 text-sm">Create your first task to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.task_id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
                    <p className="text-gray-600 mb-3">{task.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {task.start_date && (
                        <span>Start: {new Date(task.start_date).toLocaleDateString()}</span>
                      )}
                      {task.end_date && (
                        <span>End: {new Date(task.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setAssigningTask(task)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded transition"
                      title="Assign developers"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit task"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.task_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  {task.assignments && task.assignments.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Assigned to:</span>
                      {task.assignments.map((assignment: any) => (
                        <span
                          key={assignment.developer.user_id}
                          className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                        >
                          {assignment.developer.username}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTaskForm && (
        <TaskForm
          projectId={project.project_id}
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false);
            fetchTasks();
          }}
        />
      )}

      {editingTask && (
        <EditTaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => {
            setEditingTask(null);
            fetchTasks();
          }}
        />
      )}

      {assigningTask && (
        <AssignDevelopersModal
          task={assigningTask}
          onClose={() => setAssigningTask(null)}
          onSuccess={() => {
            setAssigningTask(null);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

interface TaskFormProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TaskForm = ({ projectId, onClose, onSuccess }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title,
          description,
          start_date: startDate || null,
          end_date: endDate || null,
          status: 'NEW',
        });

      if (insertError) throw insertError;
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditTaskFormProps {
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

const EditTaskForm = ({ task, onClose, onSuccess }: EditTaskFormProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [startDate, setStartDate] = useState(task.start_date || '');
  const [endDate, setEndDate] = useState(task.end_date || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          title,
          description,
          start_date: startDate || null,
          end_date: endDate || null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('task_id', task.task_id);

      if (updateError) throw updateError;
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AssignDevelopersModalProps {
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignDevelopersModal = ({ task, onClose, onSuccess }: AssignDevelopersModalProps) => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDevelopers = async () => {
      console.log('Fetching developers...'); // Debug log
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, email')
        .eq('role', 'DEVELOPER');

      console.log('Developers data:', data); // Debug log
      console.log('Developers error:', error); // Debug log

      setDevelopers(data || []);

      const currentAssignments = task.assignments.map((a: any) => a.developer.user_id);
      setSelectedDevelopers(currentAssignments);
      setLoading(false);
    };

    fetchDevelopers();
  }, [task]);

  const handleToggleDeveloper = (developerId: string) => {
    setSelectedDevelopers((prev) =>
      prev.includes(developerId)
        ? prev.filter((id) => id !== developerId)
        : [...prev, developerId]
    );
  };

  const handleSave = async () => {
    setSaving(true);

    const currentAssignments = task.assignments.map((a: any) => a.developer.user_id);
    const toAdd = selectedDevelopers.filter((id) => !currentAssignments.includes(id));
    const toRemove = currentAssignments.filter((id) => !selectedDevelopers.includes(id));

    try {
      if (toRemove.length > 0) {
        await supabase
          .from('task_assignments')
          .delete()
          .eq('task_id', task.task_id)
          .in('developer_id', toRemove);
      }

      if (toAdd.length > 0) {
        const assignments = toAdd.map((developerId) => ({
          task_id: task.task_id,
          developer_id: developerId,
        }));
        await supabase.from('task_assignments').insert(assignments);
      }

      if (selectedDevelopers.length > 0 && task.status === 'NEW') {
        await supabase
          .from('tasks')
          .update({ status: 'ASSIGNED' })
          .eq('task_id', task.task_id);
      }

      onSuccess();
    } catch (error) {
      console.error('Error updating assignments:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="text-center">Loading developers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Assign Developers</h2>
        <p className="text-gray-600 mb-6">Select developers to assign to this task</p>

        <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
          {developers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No developers found.</p>
              <p className="text-sm">Make sure there are users with the DEVELOPER role.</p>
            </div>
          ) : (
            developers.map((dev) => (
              <label
                key={dev.user_id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedDevelopers.includes(dev.user_id)}
                  onChange={() => handleToggleDeveloper(dev.user_id)}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-800">{dev.username}</div>
                  <div className="text-sm text-gray-600">{dev.email}</div>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>
    </div>
  );
};
