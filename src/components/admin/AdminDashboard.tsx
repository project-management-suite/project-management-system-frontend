import { useAuth } from "../../contexts/AuthContext";
import { Users, Shield } from "lucide-react";

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-600 p-3 rounded-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">
            System administration and user management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                System Status
              </p>
              <p className="text-3xl font-bold text-gray-800">Operational</p>
            </div>
            <Users className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-800">-</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Active Projects
              </p>
              <p className="text-3xl font-bold text-gray-800">-</p>
            </div>
            <Users className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 font-medium">
          Admin Dashboard Under Development
        </p>
        <p className="text-yellow-700 text-sm mt-1">
          Full admin functionality will be available soon. For now, you can
          access basic system information.
        </p>
      </div>
    </div>
  );
};
