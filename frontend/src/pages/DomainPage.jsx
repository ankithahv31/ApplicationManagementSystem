import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  FaTachometerAlt, FaUsers, FaBuilding, FaCheckCircle,
  FaSignOutAlt, FaArrowLeft, FaPlus, FaEdit, FaTrash
} from "react-icons/fa";
const adminMenu = [
  { text: "Application Master", icon: <FaTachometerAlt />, path: "/application-master" },
    { text: "Hosting Server", icon: <FaCheckCircle />, path: "/Hosting-Server" }, 
    { text: "Owner Details", icon: <FaCheckCircle />, path: "/Owner-master" }, 
        { text: "Company Details", icon: <FaBuilding />, path: "/Company-Page" },  
 { text: "Logout", icon: <FaSignOutAlt />, path: "/" }
 
];

const DomainPage = () => {
  const { id } = useParams(); // aapid
  const navigate = useNavigate();

  const [appName, setAppName] = useState("Selected Application");
  const [domainList, setDomainList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createdBy = "admin"; // replace with session value if needed

  const [formData, setFormData] = useState({
    aapid: id || "",
    domain_name: "",
    other_details: "",
  });

  const fetchAppName = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/app-name/${id}`);
      if (res.data?.app_name) {
        setAppName(res.data.app_name);
      }
    } catch (err) {
      console.error("Error fetching app name:", err);
    }
  };

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const endpoint = id
        ? `http://localhost:5000/api/domain/${id}`
        : `http://localhost:5000/api/domain-report`;

      const response = await axios.get(endpoint);
      const data = Array.isArray(response.data) ? response.data : [];

      setDomainList(data);
      setError("");
    } catch (err) {
      console.error("Error fetching domain data:", err);
      setError("Failed to load domain data.");
      setDomainList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppName();
    fetchDomains();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const payload = {
      ...formData,
      aapid: id,
      updated_by: createdBy,
      updated_date: now,
      ...(editingId ? {} : { created_by: createdBy, created_date: now }),
    };

    try {
      const endpoint = editingId
        ? `http://localhost:5000/api/domain/${editingId}`
        : "http://localhost:5000/api/domain";

      const method = editingId ? axios.put : axios.post;

      await method(endpoint, payload);
      fetchDomains();
      setShowModal(false);
      setEditingId(null);
      setFormData({ aapid: id || "", domain_name: "", other_details: "" });
    } catch (err) {
      console.error("Error submitting domain:", err);
    }
  };

  const handleEdit = (domain) => {
    setFormData({
      aapid: domain.aapid,
      domain_name: domain.domain_name,
      other_details: domain.other_details || "",
    });
    setEditingId(domain.domain_id);
    setShowModal(true);
  };

  const handleDelete = async (domainId) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/domain/${domainId}`);
      setDomainList((prev) => prev.filter((d) => d.domain_id !== domainId));
    } catch (err) {
      console.error("Error deleting domain:", err);
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
                {id ? `Domain Mapping for ${appName}` : "All Domain Records"}
              </h1>
              <p className="text-gray-500 text-base">Manage domain mappings for this application.</p>
            </div>
            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={() => {
                  setShowModal(true);
                  setFormData({ aapid: id || "", domain_name: "", other_details: "" });
                  setEditingId(null);
                }}
              >
                <FaPlus className="text-lg" />
                Add Domain
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

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : domainList.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
              No domain records present.
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <table className="w-full text-left rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2 px-4">Domain Name</th>
                    <th className="py-2 px-4">Other Details</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {domainList.map((item) => (
                    <tr key={item.domain_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{item.domain_name}</td>
                      <td className="py-2 px-4">{item.other_details}</td>
                      <td className="py-2 px-4">
                        <button
                          className="text-gray-700 hover:text-gray-900 mr-3 transition"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition"
                          onClick={() => handleDelete(item.domain_id)}
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
                  {editingId ? "Edit Domain" : "Add Domain"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">Domain Name</label>
                    <input
                      type="text"
                      value={formData.domain_name}
                      onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
                      placeholder="Domain Name"
                      className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">Other Details</label>
                    <input
                      type="text"
                      value={formData.other_details}
                      onChange={(e) => setFormData({ ...formData, other_details: e.target.value })}
                      placeholder="Other Details"
                      className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
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

export default DomainPage;
