import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCheckCircle,
  FaBuilding,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaArrowLeft, FaPlus
} from "react-icons/fa";

const adminMenu = [
  { text: "Application Master", icon: <FaTachometerAlt />, path: "/application-master" },
  { text: "Hosting Server", icon: <FaCheckCircle />, path: "/Hosting-Server" },
  { text: "Owner Details", icon: <FaCheckCircle />, path: "/Owner-master" },
  { text: "Company Details", icon: <FaBuilding />, path: "/Company-Page" },
  { text: "Logout", icon: <FaSignOutAlt />, path: "/" },
];

const OwnerPage = () => {
  const { id } = useParams(); // app_id
  const navigate = useNavigate();

  const [ownersList, setOwnersList] = useState([]);
  const [assignedOwners, setAssignedOwners] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [appName, setAppName] = useState("Selected Application");

  const [formData, setFormData] = useState({
    owner_id: "",
    role_id: ""
  });

  const createdBy = "admin";

  const fetchOwnersList = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/owners-master");
      setOwnersList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching owner list:", err);
    }
  };

  const fetchAssignedOwners = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/app-owners/${id}`);
      setAssignedOwners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching assigned owners:", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/all-roles");
      setRoles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchAppName = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/app-name/${id}`);
      if (res.data?.app_name) setAppName(res.data.app_name);
    } catch (err) {
      console.error("Error fetching app name:", err);
    }
  };

  useEffect(() => {
    fetchAppName();
    fetchOwnersList();
    fetchAssignedOwners();
    fetchRoles();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const payloadBase = {
      application_id: id,
      owner_id: formData.owner_id,
      role_id: formData.role_id,
      updated_by: createdBy,
      updated_date: now,
    };

    const payload = editingId
      ? payloadBase
      : { ...payloadBase, created_by: createdBy, created_date: now };

    try {
      const url = editingId
        ? `http://localhost:5000/api/app-owners/${editingId}`
        : "http://localhost:5000/api/app-owners";
      const method = editingId ? axios.put : axios.post;
      await method(url, payload);
      setShowModal(false);
      setEditingId(null);
      setFormData({ owner_id: "", role_id: "" });
      fetchAssignedOwners();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleEdit = (owner) => {
    setEditingId(owner.app_owner_id);
    setFormData({
      owner_id: owner.owner_id || "",
      role_id: owner.role_id || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (appOwnerId) => {
    if (!window.confirm("Are you sure you want to delete this owner?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/app-owners/${appOwnerId}`);
      await fetchAssignedOwners();
      alert("Owner deleted successfully.");
    } catch (err) {
      console.error("Error deleting owner:", err);
      if (err.response?.data?.error) alert(err.response.data.error);
      else alert("Failed to delete owner. Server error.");
    }
  };

  const getOwnerName = (owner_id) =>
    ownersList.find((o) => o.owner_id === owner_id)?.name || "N/A";

  const getRoleName = (role_id) =>
    roles.find((r) => r.role_id === role_id)?.role_name || "-";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar menuItems={adminMenu} />
      <main className="flex-1 ml-64 p-6 flex flex-col gap-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Owner Master for {appName}</h1>
              <p className="text-gray-500 text-base">Manage owners and their roles for this application.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(true);
                  setFormData({ owner_id: "", role_id: "" });
                  setEditingId(null);
                }}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaPlus className="text-lg" />
                Add Owner
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

          {assignedOwners.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
              No owners assigned.
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <table className="w-full text-left rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2 px-4">Owner Name</th>
                    <th className="py-2 px-4">Role</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedOwners.map((owner) => (
                    <tr key={owner.app_owner_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{getOwnerName(owner.owner_id)}</td>
                      <td className="py-2 px-4">{getRoleName(owner.role_id)}</td>
                      <td className="py-2 px-4">
                        <button
                          className="text-gray-700 hover:text-gray-900 mr-3 transition"
                          onClick={() => handleEdit(owner)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition"
                          onClick={() => handleDelete(owner.app_owner_id)}
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
                  {editingId ? "Edit Owner" : "Add Owner"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">Owner Name</label>
                    <select
                      name="owner_id"
                      value={formData.owner_id}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      required
                    >
                      <option value="">Select Owner</option>
                      {ownersList.map((owner) => (
                        <option key={owner.owner_id} value={owner.owner_id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">Role</label>
                    <select
                      name="role_id"
                      value={formData.role_id}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
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
                      {editingId ? "Update" : "Add"}
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

export default OwnerPage;
