import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  FaArrowLeft, FaPlus, FaEdit, FaTrash,
  FaTachometerAlt, FaUsers, FaBuilding,
  FaCheckCircle, FaSignOutAlt
} from "react-icons/fa";

const adminMenu = [
  { text: "Application Master", icon: <FaTachometerAlt />, path: "/application-master" },
    { text: "Hosting Server", icon: <FaCheckCircle />, path: "/Hosting-Server" }, 
    { text: "Owner Details", icon: <FaCheckCircle />, path: "/Owner-master" }, 
        { text: "Company Details", icon: <FaBuilding />, path: "/Company-Page" },  
 { text: "Logout", icon: <FaSignOutAlt />, path: "/" }
 
];

const VersionPage = () => {
  const { id } = useParams(); // aapid
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [releaseTypes, setReleaseTypes] = useState([]);
  const [appName, setAppName] = useState("Selected Application");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    version_date: "",
    release_type_id: "",
    changes: "",
  });

  const createdBy = "admin";

  const fetchVersions = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/app-versions/${id}`);
      setVersions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching versions:", err);
    }
  };

  const fetchReleaseTypes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/release-types");
      setReleaseTypes(res.data);
    } catch (err) {
      console.error("Error fetching release types:", err);
    }
  };

  const fetchAppName = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/app-name/${id}`);
      if (res.data?.app_name) setAppName(res.data.app_name);
    } catch (err) {
      console.error("Error fetching app name:", err);
    }
  };

  useEffect(() => {
    fetchAppName();
    fetchVersions();
    fetchReleaseTypes();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const payload = {
      aapid: parseInt(id),
      ...formData,
      updated_by: createdBy,
      updated_date: now,
      ...(editingId ? {} : { created_by: createdBy, created_date: now }),
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/app-versions/${editingId}`
        : `http://localhost:5000/api/app-versions`;
      const method = editingId ? axios.put : axios.post;

      await method(url, payload);
      await fetchVersions();
      setShowModal(false);
      setEditingId(null);
      setFormData({ version_date: "", release_type_id: "", changes: "" });
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleEdit = (ver) => {
    setEditingId(ver.version_entry_id);
    setFormData({
      version_date: ver.version_date,
      release_type_id: ver.release_type_id,
      changes: ver.changes,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this version?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/app-versions/${id}`);
      fetchVersions();
    } catch (err) {
      console.error("Delete error:", err);
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
                Versions for {appName}
              </h1>
              <p className="text-gray-500 text-base">Track and manage version releases for this application.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormData({ version_date: "", release_type_id: "", changes: "" });
                  setEditingId(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaPlus className="text-lg" />
                Add Version
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

          {versions.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
              No versions present.
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <table className="w-full text-left rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2 px-4">Version Date</th>
                    <th className="py-2 px-4">Release Type</th>
                    <th className="py-2 px-4">Changes</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((ver) => (
                    <tr key={ver.version_entry_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{new Date(ver.version_date).toISOString().split("T")[0]}</td>
                      <td className="py-2 px-4">{ver.release_type_name}</td>
                      <td className="py-2 px-4">{ver.changes}</td>
                      <td className="py-2 px-4">
                        <button
                          className="text-gray-700 hover:text-gray-900 mr-3 transition"
                          onClick={() => handleEdit(ver)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition"
                          onClick={() => handleDelete(ver.version_entry_id)}
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

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-6 text-gray-800">
                  {editingId ? "Edit Version Details" : "Add Version Details"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">Version Date</label>
                    <input
                      type="date"
                      value={formData.version_date}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setFormData({ ...formData, version_date: e.target.value })}
                      className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">Release Type</label>
                    <select
                      value={formData.release_type_id}
                      onChange={(e) => setFormData({ ...formData, release_type_id: e.target.value })}
                      className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      required
                    >
                      <option value="">Select Release Type</option>
                      {releaseTypes.map((type) => (
                        <option key={type.release_type_id} value={type.release_type_id}>
                          {type.release_type_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">Changes</label>
                    <textarea
                      value={formData.changes}
                      onChange={(e) => setFormData({ ...formData, changes: e.target.value })}
                      className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      placeholder="Describe changes"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
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
                      {editingId ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default VersionPage;
