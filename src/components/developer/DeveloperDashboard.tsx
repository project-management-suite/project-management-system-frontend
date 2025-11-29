import { useAuth } from "../../contexts/AuthContext";
import { CheckSquare, Code } from "lucide-react";

export const DeveloperDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-green-600 p-3 rounded-lg">
          <Code className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Developer Dashboard
          </h1>
          <p className="text-gray-600">Track your tasks and assignments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">My Tasks</p>
              <p className="text-3xl font-bold text-gray-800">-</p>
            </div>
            <CheckSquare className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                In Progress
              </p>
              <p className="text-3xl font-bold text-gray-800">-</p>
            </div>
            <CheckSquare className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-gray-800">-</p>
            </div>
            <CheckSquare className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 font-medium">
          Developer Dashboard Under Development
        </p>
        <p className="text-blue-700 text-sm mt-1">
          Task management and assignment features will be available soon.
        </p>
      </div>
    </div>
  );
};
