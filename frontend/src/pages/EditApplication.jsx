import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from '../components/Sidebar';
import { FaTachometerAlt, FaUsers, FaBuilding, FaCheckCircle, FaSignOutAlt, FaPlusCircle, FaArrowLeft, FaEdit } from "react-icons/fa";

const adminMenu = [
  { text: "Application Master", icon: <FaTachometerAlt />, path: "/application-master" },
    { text: "Hosting Server", icon: <FaCheckCircle />, path: "/Hosting-Server" }, 
    { text: "Owner Details", icon: <FaCheckCircle />, path: "/Owner-master" }, 
        { text: "Company Details", icon: <FaBuilding />, path: "/Company-Page" },  
 { text: "Logout", icon: <FaSignOutAlt />, path: "/" }
 
];

const EditApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appName, setAppName] = useState('');
  const [accessTypeId, setAccessTypeId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [companyId, setCompanyId] = useState('');

  const [accessTypes, setAccessTypes] = useState([]);
  const [owners, setOwners] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    // Fetch dropdown data
    const fetchDropdowns = async () => {
      try {
        const [accessRes, ownerRes, companyRes] = await Promise.all([
          fetch('http://localhost:5000/api/access-types'),
          fetch('http://localhost:5000/api/owners'),
          fetch('http://localhost:5000/api/companies')
        ]);

        setAccessTypes(await accessRes.json());
        setOwners(await ownerRes.json());
        setCompanies(await companyRes.json());
      } catch (err) {
        console.error('Error loading dropdown data:', err);
      }
    };

    // Fetch existing application data
    const fetchApplication = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/applications/${id}`);
        const data = await res.json();
        setAppName(data.app_name);
        setAccessTypeId(data.access_type_id);
        setOwnerId(data.app_owner_id);
        setCompanyId(data.company_id);
      } catch (err) {
        console.error('Error loading application data:', err);
      }
    };

    fetchDropdowns();
    fetchApplication();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      app_name: appName,
      access_type_id: accessTypeId,
      app_owner_id: ownerId,
      company_id: companyId
    };

    try {
      const res = await fetch(`http://localhost:5000/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Application updated successfully');
        navigate('/application-master');
      } else {
        alert('Failed to update application');
      }
    } catch (err) {
      console.error('Error updating application:', err);
      alert('Error updating application');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar menuItems={adminMenu} />
      <main className="flex-1 ml-64 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Edit Application</h2>
            <p className="text-gray-500 text-base">Update the details for this application. All fields are required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Application Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                required
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                placeholder="Enter application name"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">Access Type</label>
              <select
                value={accessTypeId}
                onChange={(e) => setAccessTypeId(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                required
              >
                <option value="">Select Access Type</option>
                {accessTypes.map((type) => (
                  <option key={type.access_type_id} value={type.access_type_id}>
                    {type.access_type_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">Application Owner</label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                required
              >
                <option value="">Select Owner</option>
                {owners.map((owner) => (
                  <option key={owner.owner_id} value={owner.owner_id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">Company</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                required
              >
                <option value="">Select Company</option>
                {companies.map((comp) => (
                  <option key={comp.company_id} value={comp.company_id}>
                    {comp.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaEdit className="text-lg" />
                Update Application
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
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
export default EditApplication;