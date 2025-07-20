import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FaTachometerAlt, FaUsers, FaBuilding, FaCheckCircle ,FaSignOutAlt, FaPlusCircle, FaArrowLeft} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const adminMenu = [
  { text: "Application Master", icon: <FaTachometerAlt />, path: "/application-master" },
    { text: "Hosting Server", icon: <FaCheckCircle />, path: "/Hosting-Server" }, 
    { text: "Owner Details", icon: <FaCheckCircle />, path: "/Owner-master" }, 
        { text: "Company Details", icon: <FaBuilding />, path: "/Company-Page" },  
 { text: "Logout", icon: <FaSignOutAlt />, path: "/" }
 
];

const AddNewApplication = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    app_name: '',
    app_owner_id: '',
    company_id: '',
    access_type_id: '',
    created_by: 'admin',
  });

  const [owners, setOwners] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [accessTypes, setAccessTypes] = useState([]);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    fetch('http://localhost:5000/api/owners')
      .then(res => res.json())
      .then(data => setOwners(data))
      .catch(err => console.error("Failed to load owners:", err));

    fetch('http://localhost:5000/api/companies')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error("Failed to load companies:", err));

    fetch('http://localhost:5000/api/access-types')
      .then(res => res.json())
      .then(data => setAccessTypes(data))
      .catch(err => console.error("Failed to load access types:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);

    try {
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (res.ok && data.success) {
        setSuccess(true);
        setMessage('Application added successfully!');
        setFormData({
          app_name: '',
          app_owner_id: '',
          company_id: '',
          access_type_id: '',
          created_by: 'admin'
        });

        // Optional: delay then navigate
        setTimeout(() => navigate('/application-master'), 1000);
      } else {
        setMessage(data.error || 'Failed to add application');
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar menuItems={adminMenu} />
      <main className="flex-1 ml-64 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Add New Application</h2>
            <p className="text-gray-500 text-base">Register a new application in the AppRegistry Hub. Please fill in all required details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`text-sm mb-2 ${success ? 'text-green-600' : 'text-red-600'}`}>{message}</div>
            )}

            <div>
              <label className="block mb-1 font-semibold text-gray-700">Application Name</label>
              <input
                type="text"
                name="app_name"
                value={formData.app_name}
                onChange={handleChange}
                required
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                placeholder="Enter application name"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">Owner</label>
              <select
                name="app_owner_id"
                value={formData.app_owner_id}
                onChange={handleChange}
                required
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              >
                <option value="">Select Owner</option>
                {owners.map(owner => (
                  <option key={owner.owner_id} value={owner.owner_id}>{owner.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">Company</label>
              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                required
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              >
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">Access Type</label>
              <select
                name="access_type_id"
                value={formData.access_type_id}
                onChange={handleChange}
                required
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              >
                <option value="">Select Access Type</option>
                {accessTypes.map(a => (
                  <option key={a.access_type_id} value={a.access_type_id}>{a.access_type_name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaPlusCircle className="text-lg" />
                Add Application
              </button>
              <button
                type="button"
                onClick={() => navigate('/application-master')}
                className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <FaArrowLeft className="text-lg" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddNewApplication;
