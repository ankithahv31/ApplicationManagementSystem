import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const SSLCertificatePage = () => {
  const { id } = useParams(); // aapid
  const navigate = useNavigate();
  const [certs, setCerts] = useState([]);
  const [appName, setAppName] = useState("Selected Application");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    certificate_name: "",
    expiry_date: "",
  });

  const createdBy = "admin"; // simulate login

  const fetchCerts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/ssl-certificates/${id}`);
      console.log("Fetched SSLs:", res.data);
      setCerts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching certificates:", err);
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
    fetchCerts();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const payload = {
      aapid: parseInt(id), // ✅ Ensure a valid number is passed
      ...formData,
      updated_by: createdBy,
      updated_date: now,
      ...(editingId ? {} : { created_by: createdBy, created_date: now }),
    };

    console.log("Submitting payload:", payload); // ✅ Log the data being sent

    try {
      const url = editingId
        ? `http://localhost:5000/api/ssl-certificates/${editingId}`
        : "http://localhost:5000/api/ssl-certificates";

      const method = editingId ? axios.put : axios.post;

      await method(url, payload);
      await fetchCerts(); // ✅ Ensures table refresh
      setShowModal(false);
      setEditingId(null);
      setFormData({ certificate_name: "", expiry_date: "" });
    } catch (err) {
      console.error("Error submitting SSL certificate:", err);
    }
  };

  const handleEdit = (cert) => {
    setEditingId(cert.cert_id);
    setFormData({
      certificate_name: cert.certificate_name || "",
      expiry_date: cert.expiry_date ? cert.expiry_date.slice(0, 10) : "",
    });
    setShowModal(true);
  };

  const handleDelete = async (certId) => {
    if (!window.confirm("Are you sure you want to delete this certificate?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/ssl-certificates/${certId}`);
      await fetchCerts();
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
              SSL Certificates for {appName}
            </h1>
            <p className="text-gray-500 text-base">Manage SSL certificates for this application.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFormData({ certificate_name: "", expiry_date: "" });
                setEditingId(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <FaPlus className="text-lg" />
              Add Certificate
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

        {certs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
            No SSL certificates present.
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <table className="w-full text-left rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-2 px-4">Certificate Name</th>
                  <th className="py-2 px-4">Expiry Date</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((cert) => {
                  const dateObj = new Date(cert.expiry_date);
                  const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
                  return (
                    <tr key={cert.cert_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{cert.certificate_name}</td>
                      <td className="py-2 px-4">{formattedDate}</td>
                      <td className="py-2 px-4">
                        <button
                          className="text-gray-700 hover:text-gray-900 mr-3 transition"
                          onClick={() => handleEdit(cert)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition"
                          onClick={() => handleDelete(cert.cert_id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                {editingId ? "Edit" : "Add"} Certificate
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Certificate Name</label>
                  <input
                    type="text"
                    placeholder="Certificate Name"
                    value={formData.certificate_name}
                    onChange={(e) => setFormData({ ...formData, certificate_name: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    required
                    min={new Date().toISOString().split("T")[0]}
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

export default SSLCertificatePage;
