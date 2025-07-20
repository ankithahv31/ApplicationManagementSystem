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
 { text: "Logout", icon: <FaSignOutAlt />, path: "/" }
 
];

const CompanyPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const createdBy = "admin"; // replace later with session user

  const fetchCompanies = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/all-companies");
    console.log("Fetched companies:", res.data); // ✅ DEBUG
    setCompanies(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Error fetching companies:", err);
    setCompanies([]);
  }
};
  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      company_name: companyName,
      group_name: groupName,
      updated_by: createdBy,
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/companies/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:5000/api/companies", {
          ...payload,
          created_by: createdBy,
        });
      }

      setCompanyName("");
      setGroupName("");
      setEditingId(null);
      setShowForm(false);
      fetchCompanies();
    } catch (err) {
      alert("Server error. Check console.");
      console.error(err);
    }
  };

  const handleEdit = (company) => {
    setEditingId(company.company_id);
    setCompanyName(company.company_name);
    setGroupName(company.group_name || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this company?")) return;

  try {
    await axios.delete(`http://localhost:5000/api/companies/${id}`);
    await fetchCompanies();
    alert("Company deleted successfully.");
  } catch (err) {
    console.error("Delete failed:", err);

    if (err.response && err.response.data && err.response.data.error) {
      alert(err.response.data.error); // ✔️ Shows backend message like FK constraint
    } else {
      alert("Failed to delete company due to server error.");
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
              <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Companies</h1>
              <p className="text-gray-500 text-base">Manage all companies in the system.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaPlus className="text-lg" /> {showForm ? "Cancel" : "Add Company"}
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
              <h2 className="text-xl font-bold mb-6 text-gray-800">{editingId ? "Update Company" : "Add New Company"}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Group Name (Optional)</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
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
                    {editingId ? "Update Company" : "Save Company"}
                  </button>
                </div>
              </form>
            </div>
          ) : companies.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
              No companies present.
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <table className="w-full text-left rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2 px-4">Company Name</th>
                    <th className="py-2 px-4">Group Name</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.company_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{c.company_name}</td>
                      <td className="py-2 px-4">{c.group_name?.trim() ? c.group_name : "—"}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="text-gray-700 hover:text-gray-900 transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(c.company_id)}
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

export default CompanyPage;
