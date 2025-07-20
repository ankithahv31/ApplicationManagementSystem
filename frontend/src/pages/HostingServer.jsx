// HostingServer.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaTachometerAlt, FaUsers, FaBuilding, FaCheckCircle, FaSignOutAlt, FaPlus, FaArrowLeft } from "react-icons/fa";

const adminMenu = [
  { text: "Application Master", icon: <FaTachometerAlt />, path: "/application-master" },
    { text: "Hosting Server", icon: <FaCheckCircle />, path: "/Hosting-Server" }, 
    { text: "Owner Details", icon: <FaCheckCircle />, path: "/Owner-master" }, 
        { text: "Company Details", icon: <FaBuilding />, path: "/Company-Page" },  
 { text: "Logout", icon: <FaSignOutAlt />, path: "/" }
 
];

const HostingServer = () => {
  const navigate = useNavigate();
  const [servers, setServers] = useState([]);
  const [serverName, setServerName] = useState("");
  const [localIp, setLocalIp] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchServers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/servers");
      if (Array.isArray(response.data)) {
        setServers(response.data.sort((a, b) => a.server_id - b.server_id));
      } else {
        setServers([]);
      }
    } catch (err) {
      console.error("Failed to fetch servers", err);
      setServers([]);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      server_name: serverName,
      server_local_ip: localIp,
      updated_by: "admin",
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/servers/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:5000/api/servers", {
          ...payload,
          created_by: "admin",
        });
      }
      setServerName("");
      setLocalIp("");
      setEditingId(null);
      setShowForm(false);
      fetchServers();
    } catch (err) {
      alert("Server error. See console for details.");
      console.error(err);
    }
  };

  const handleEdit = (server) => {
    setEditingId(server.server_id);
    setServerName(server.server_name);
    setLocalIp(server.server_local_ip);
    setShowForm(true);
  };
const handleDelete = async (id) => {
  console.log("Attempting to delete server ID:", id);

  if (!id) {
    alert("Server ID is missing.");
    return;
  }

  if (!window.confirm("Are you sure you want to delete this server?")) return;

  try {
    await axios.delete(`http://localhost:5000/api/servers/${id}`);
    await fetchServers();
    alert("Server deleted successfully and moved to Trash Bin.");
  } catch (err) {
    console.error("❌ Error deleting server:", err);
    if (err.response) {
      alert(err.response.data.error || "Unknown server error");
    } else {
      alert("Failed to delete server due to network/server error.");
    }
  }
};


  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar menuItems={adminMenu} />
      <main className="flex-1 ml-64 p-6 flex flex-col gap-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Hosting Servers</h1>
              <p className="text-gray-500 text-base">Manage all hosting servers in the system.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaPlus className="text-lg" /> {showForm ? "Cancel" : "Add Server"}
              </button>
              <button
                onClick={() => navigate("/application-master")}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <FaArrowLeft className="text-lg" />
                Back
              </button>
            </div>
          </div>

          {showForm ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-xl mx-auto mb-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">{editingId ? "Update Server Details" : "Add New Server"}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Server Name</label>
                  <input
                    type="text"
                    placeholder="Server Name"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    required
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Local IP Address</label>
                  <input
                    type="text"
                    placeholder="Local IP"
                    value={localIp}
                    onChange={(e) => setLocalIp(e.target.value)}
                    onBlur={() => {
                      const ipv4Pattern = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.|$)){4}$/;
                      const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1)$/;
                      const isValidIp = ipv4Pattern.test(localIp) || ipv6Pattern.test(localIp);
                      if (localIp && !isValidIp) {
                        alert("Please enter a valid IPv4 or IPv6 address.");
                        setLocalIp("");
                      }
                    }}
                    required
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                </div>
                <div className="flex justify-end gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    <FaArrowLeft className="text-lg" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <FaPlus className="text-lg" />
                    {editingId ? "Update Server" : "Save Server"}
                  </button>
                </div>
              </form>
            </div>
          ) : servers.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
              No servers present.
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <table className="w-full text-left rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2 px-4">Server Name</th>
                    <th className="py-2 px-4">Local IP</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {servers.map((server) => (
                    <tr key={server.server_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{server.server_name}</td>
                      <td className="py-2 px-4">{server.server_local_ip}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(server)}
                          className="text-gray-700 hover:text-gray-900 transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(server.server_id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HostingServer;
