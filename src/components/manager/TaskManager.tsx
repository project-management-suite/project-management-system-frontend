import { Project } from "../../lib/api";
import { ArrowLeft, Plus } from "lucide-react";

interface TaskManagerProps {
  project: Project;
  onBack: () => void;
}

export const TaskManager = ({ project, onBack }: TaskManagerProps) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {project.project_name}
          </h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Create your first task to get started
          </p>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">
            Task Management Under Development
          </p>
          <p className="text-blue-700 text-sm mt-1">
            Full task management features including creation, assignment, and
            tracking will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
};
