import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaCheckCircle,
  FaSignOutAlt,
  FaPlus,
  FaArrowLeft,
} from "react-icons/fa";

const adminMenu = [
  { text: "Application Master", icon: <FaTachometerAlt />, path: "/application-master" },
  { text: "Hosting Server", icon: <FaCheckCircle />, path: "/Hosting-Server" },
  { text: "Owner Details", icon: <FaCheckCircle />, path: "/Owner-master" },
  { text: "Company Details", icon: <FaBuilding />, path: "/Company-Page" },
  { text: "Logout", icon: <FaSignOutAlt />, path: "/" },
];

/**
 * Change log
 * ----------
 * 1. Removed role selection and fetching – OwnerMaster now handles owner names only.
 * 2. Simplified payloads and table columns.
 */
const OwnerMaster = () => {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [ownerName, setOwnerName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // fetch owners
  const fetchOwners = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/owners-master");
      setOwners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch owners", err);
      setOwners([]);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  const payload = {
    name: ownerName,
    updated_by: "admin",
  };

  try {
    if (editingId) {
      await axios.put(
        `http://localhost:5000/api/owners-master/${editingId}`,
        payload
      );
    } else {
      await axios.post("http://localhost:5000/api/owners-master", {
        ...payload,
        created_by: "admin",
      });
    }

    // ✅ Success: reset form
    setOwnerName("");
    setEditingId(null);
    setShowForm(false);
    fetchOwners();
  } catch (err) {
    console.error(err);
    const backendMsg = err?.response?.data?.error;
    alert(backendMsg || "Server error");

    // ✅ Reset form on failure too (to avoid stuck state)
    setOwnerName("");
    setEditingId(null);
    setShowForm(false);
  }
};



  const handleEdit = (owner) => {
    setEditingId(owner.owner_id);
    setOwnerName(owner.name);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this owner?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/owners-master/${id}`);
      await fetchOwners();
      alert("Owner deleted successfully.");
    } catch (err) {
      console.error("Error deleting owner:", err);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Failed to delete owner due to a server error.");
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
              <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Owner Master</h1>
              <p className="text-gray-500 text-base">Manage all owners in the system.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaPlus className="text-lg" /> {showForm ? "Cancel" : "Add Owner"}
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
              <h2 className="text-xl font-bold mb-6 text-gray-800">{editingId ? "Update Owner" : "Add New Owner"}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Owner Name</label>
                  <input
                    type="text"
                    placeholder="Owner Name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                </div>
                <div className="flex justify-end gap-4">
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
                    {editingId ? "Update Owner" : "Save Owner"}
                  </button>
                </div>
              </form>
            </div>
          ) : owners.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
              No owners present.
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <table className="w-full text-left rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2 px-4">Owner Name</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {owners.map((owner) => (
                    <tr key={owner.owner_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{owner.name}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(owner)}
                          className="text-gray-700 hover:text-gray-900 transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(owner.owner_id)}
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

export default OwnerMaster;