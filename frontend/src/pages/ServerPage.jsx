import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaCheckCircle,
  FaSignOutAlt,FaTrash,FaEdit,FaPlusCircle, FaArrowLeft
} from "react-icons/fa";

const adminMenu = [
  { text: "Application Master", icon: <FaTachometerAlt />, path: "/application-master" },
  { text: "SSL Certificate", icon: <FaBuilding />, path: "/admin/ssl-certificates" },
  { text: "Developers", icon: <FaUsers />, path: "/admin/users" },
 { text: "Hosting Server", icon: <FaCheckCircle />, path: "/Hosting-Server" },
  { text: "Logout", icon: <FaSignOutAlt />, path: "/" },
];

const ServerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appName, setAppName] = useState("Selected Application");
  const [hostingServers, setHostingServers] = useState([]);
  const [serverOptions, setServerOptions] = useState([]);
  const [serverTypes, setServerTypes] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingServer, setEditingServer] = useState(null);

  const [newServerId, setNewServerId] = useState("");
  const [newTypeId, setNewTypeId] = useState("");
  const createdBy = "admin";

  useEffect(() => {
    fetchAppName(); 
    fetchAppNameAndServers();
    fetchServerOptions();
    fetchServerTypes();
  }, [id]);

  const fetchAppName = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/app-name/${id}`);
    if (res.data?.app_name) {
      setAppName(res.data.app_name);
    } else {
      setAppName("Unknown Application");
    }
  } catch (err) {
    console.error("Error fetching app name:", err);
    setAppName("Unknown Application"); // fallback
  }
};

  const fetchAppNameAndServers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/hosting-server/app/${id}`);

      // ✅ Same logic as in AuditPage
      if (Array.isArray(res.data) && res.data.length > 0 && res.data[0].app_name) {
        setAppName(res.data[0].app_name);
      }

      setHostingServers(res.data || []);
    } catch (err) {
      console.error("Error fetching servers:", err);
    }
  };

  const fetchServerOptions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/hosting-server-list");
      setServerOptions(res.data);
    } catch (err) {
      console.error("Error fetching server list:", err);
    }
  };

  const fetchServerTypes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/server-types");
      setServerTypes(res.data);
    } catch (err) {
      console.error("Error fetching server types:", err);
    }
  };

  const handleAddServer = async () => {
    if (!newServerId || !newTypeId) return alert("Select server and type");
    try {
      await axios.post("http://localhost:5000/api/app-server", {
        aapid: id,
        server_id: newServerId,
        type_id: newTypeId,
        created_by: createdBy,
      });
      setShowAddForm(false);
      setNewServerId("");
      setNewTypeId("");
      fetchAppNameAndServers();
    } catch (err) {
      console.error("❌ Error adding server:", err.response?.data || err);
    }
  };

  const handleDelete = async (app_server_id) => {
    if (!window.confirm("Are you sure you want to delete this server?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/app-server/${app_server_id}`);
      fetchAppNameAndServers();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleEdit = (server) => {
    console.log("Editing server object:", server);
    setEditingServer(server);
    setNewServerId(server.server_id);
    setNewTypeId(server.type_id);
    setShowAddForm(true);
  };

 const handleUpdate = async () => {
  try {
    const selectedServer = serverOptions.find(
      (s) => s.server_id === parseInt(newServerId)
    );

    if (!selectedServer) return alert("Invalid server selected");

    console.log("Editing server object:", editingServer);
    console.log("Sending update to:", `http://localhost:5000/api/app-server/${editingServer.app_server_id}`);
    console.log("App server ID being updated:", editingServer.app_server_id);

    // ✅ Update only the app_server table
    await axios.put(
      `http://localhost:5000/api/app-server/${editingServer.app_server_id}`,
      {
        server_id: selectedServer.server_id,
        type_id: Number(newTypeId),
        updated_by: createdBy,
      }
    );

    // ✅ Locally update the edited server in UI
    setHostingServers((prev) =>
      prev.map((srv) =>
        srv.app_server_id === editingServer.app_server_id
          ? {
              ...srv,
              server_id: selectedServer.server_id,
              server_name: selectedServer.server_name,
              server_local_ip: selectedServer.server_local_ip,
              type_id: Number(newTypeId),
            }
          : srv
      )
    );

    // ✅ Reset form state
    setEditingServer(null);
    setNewServerId("");
    setNewTypeId("");
    setShowAddForm(false);

  } catch (err) {
    console.error("Error updating:", err);
    alert("Failed to update server.");
  }
};




  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar menuItems={adminMenu} />
      <main className="flex-1 ml-64 p-6 flex flex-col gap-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800 mb-1">
                Hosting Servers for {appName}
              </h1>
              <p className="text-gray-500 text-base">Manage hosting servers for this application.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingServer(null);
                }}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaPlusCircle className="text-lg" />
                {showAddForm ? "Cancel" : "Add Server"}
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

          {showAddForm ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                {editingServer ? "Edit Server" : "Add Server"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Server</label>
                  <select
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    value={newServerId}
                    onChange={(e) => setNewServerId(e.target.value)}
                  >
                    <option value="">Select Server</option>
                    {serverOptions.map((s) => (
                      <option key={s.server_id} value={s.server_id}>
                        {s.server_name} ({s.server_local_ip})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Server Type</label>
                  <select
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    value={newTypeId}
                    onChange={(e) => setNewTypeId(e.target.value)}
                  >
                    <option value="">Select Type</option>
                    {serverTypes.map((type) => (
                      <option key={type.type_id} value={type.type_id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {editingServer ? (
                <button
                  onClick={handleUpdate}
                  className="mt-6 flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <FaEdit className="text-lg" />
                  Update Server
                </button>
              ) : (
                <button
                  onClick={handleAddServer}
                  className="mt-6 flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <FaPlusCircle className="text-lg" />
                  Add Server
                </button>
              )}
            </div>
          ) : hostingServers.length === 0 ? (
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
                    <th className="py-2 px-4">Type</th>
                    <th className="py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hostingServers.map((server) => (
                    <tr key={server.app_server_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{server.server_name}</td>
                      <td className="py-2 px-4">{server.server_local_ip}</td>
                      <td className="py-2 px-4">{server.server_type_name}</td>
                      <td className="py-2 px-4">
                        <button
                          className="text-gray-700 hover:text-gray-900 mr-3 transition"
                          onClick={() => handleEdit(server)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition"
                          onClick={() => handleDelete(server.app_server_id)}
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

export default ServerPage;
