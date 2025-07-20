import React from "react";
import { FaTachometerAlt, FaUsers, FaBuilding, FaCheckCircle } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const adminMenu = [
  { text: "Dashboard", icon: <FaTachometerAlt />, path: "/admin-dashboard" },
  { text: "Users", icon: <FaUsers />, path: "/admin/approve-students" },
  { text: "Companies", icon: <FaBuilding />, path: "/Company-Page" },
  { text: "Audits", icon: <FaCheckCircle />, path: "/audit-report" },
  { text: "Logout", icon: <FaCheckCircle />, path: "/" },
];

const AdminDashboard = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar menuItems={adminMenu} />
      <div className="flex-1 ml-64">
        <Navbar title="Admin Dashboard" />
        <div className="p-8 mt-16">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Welcome, Admin!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FaUsers className="text-3xl text-gray-700" />
              <div>
                <div className="text-2xl font-bold text-gray-900">120</div>
                <div className="text-gray-600">Total Users</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FaBuilding className="text-3xl text-gray-700" />
              <div>
                <div className="text-2xl font-bold text-gray-900">8</div>
                <div className="text-gray-600">Companies</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FaCheckCircle className="text-3xl text-gray-700" />
              <div>
                <div className="text-2xl font-bold text-gray-900">15</div>
                <div className="text-gray-600">Pending Audits</div>
              </div>
            </div>
          </div>
          {/* Add more dashboard content here */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
