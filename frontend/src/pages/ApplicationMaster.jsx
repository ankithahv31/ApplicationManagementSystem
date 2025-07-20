import Sidebar from '../components/Sidebar';
import React, { useEffect, useState, useRef } from "react";
import { FaTachometerAlt,  FaBuilding, FaCheckCircle, FaEdit, FaEllipsisV, FaTrash,FaSignOutAlt, FaClipboardList, FaServer, FaCodeBranch, FaGlobe, FaLock, FaUser, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const adminMenu = [
  { text: "Application Master", icon: <FaTachometerAlt />, path: "/application-master" },
    { text: "Hosting Server", icon: <FaCheckCircle />, path: "/Hosting-Server" }, 
    { text: "Owner Details", icon: <FaCheckCircle />, path: "/Owner-master" }, 
        { text: "Company Details", icon: <FaBuilding />, path: "/Company-Page" },  
 { text: "Logout", icon: <FaSignOutAlt />, path: "/" }
 
];

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ApplicationRow = ({ app, navigate, onDelete, rowClassName = "" }) => {
  const [showMore, setShowMore] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className={`border-b relative ${rowClassName}`}>
      <td className="p-2">{app?.app_name}</td>
      <td className="p-2">{app?.access_type_name}</td>
      <td className="p-2">{app?.owner_name}</td>
      <td className="p-2">{app?.company_name}</td>
      
      <td className="p-2 flex items-center gap-2 min-w-[350px]">
        <button
          onClick={() => navigate(`/applications/edit/${app.aapid}`)}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-700 text-white hover:bg-gray-800 hover:shadow transition"
          aria-label="Edit Application"
        >
          <FaEdit />
          Edit
        </button>

        <button
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete \"${app.app_name}\"?`)) {
              onDelete(app.aapid);
            }
          }}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 hover:shadow transition"
          aria-label="Delete Application"
        >
          <FaTrash />
          Delete
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className="p-2 rounded hover:bg-gray-200"
            aria-label="More actions"
          >
            <FaEllipsisV />
          </button>

          {showMore && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border rounded shadow-lg z-10">
              {[
                { key: "audit", label: "Audit Logs", icon: <FaClipboardList className='mr-2 text-gray-600' /> },
                { key: "server", label: "Servers", icon: <FaServer className='mr-2 text-gray-600' /> },
                { key: "version", label: "Versions", icon: <FaCodeBranch className='mr-2 text-gray-600' /> },
                { key: "domain", label: "Domains", icon: <FaGlobe className='mr-2 text-gray-600' /> },
                { key: "ssl", label: "SSL Certificates", icon: <FaLock className='mr-2 text-gray-600' /> },
                { key: "owner", label: "Owners", icon: <FaUser className='mr-2 text-gray-600' /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(`/applications/${item.key}/${app.aapid}`);
                    setShowMore(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const ApplicationMaster = () => {
  const navigate = useNavigate();
  const [allApplications, setAllApplications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(applications.length / pageSize);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/applications');
        const data = await response.json();
        setAllApplications(data);
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    fetchApplications();
  }, []);

  const handleSearch = () => {
    const filtered = allApplications.filter(app =>
      app.app_name.toLowerCase().includes(search.toLowerCase())
    );
    setApplications(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/applications/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (response.ok) {
      // ✅ Remove deleted app from lists
      const updatedApps = allApplications.filter(app => app.aapid !== id);
      setAllApplications(updatedApps);
      setApplications(updatedApps);
      alert(result.message || "Application deleted successfully.");
    } else {
      // ✅ Handle backend error message
      alert(result.error || "Failed to delete application.");
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    alert("Error deleting application.");
  }
};

  // Pagination logic
  const paginatedApps = applications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Keyboard navigation for pagination
  const handlePaginationKeyDown = (e) => {
    // Removed
  };

  return (
     <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:block w-64 fixed h-full ">
        <Sidebar menuItems={adminMenu} />
      </div>
      {/* Mobile sidebar placeholder */}
      <div className="md:ml-64 flex-1">
        <div className="p-4 md:p-8">
          {/* Title and Add New */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h2 className="text-3xl font-extrabold text-gray-900">Manage Applications</h2>
            <button
              onClick={() => navigate('/add-new')}
              className="bg-gray-700 hover:bg-gray-800 text-white w-full sm:w-auto px-6 py-2 rounded-lg font-bold shadow transition"
            >
              + Add New
            </button>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <label className="font-medium text-gray-700 w-full sm:w-40">Search by App Name:</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Enter app name"
                className="border border-gray-300 px-3 py-2 rounded w-full"
              />
              <button
                onClick={handleSearch}
                className="bg-gray-700 hover:bg-gray-800 text-white w-full sm:w-auto px-6 py-2 rounded-lg font-bold shadow transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow p-4 md:p-6 overflow-x-auto">
            <div className="min-w-[600px] md:min-w-[1200px]">
              {applications.length > 0 ? (
                <table className="w-full text-left text-sm table-auto">
                  <thead className="sticky top-0 bg-white z-10 shadow-sm">
                    <tr className="border-b">
                      <th className="p-2 text-gray-700">App Name</th>
                      <th className="p-2 text-gray-700">Access Type</th>
                      <th className="p-2 text-gray-700">App Owner </th>
                      <th className="p-2 text-gray-700">Company </th>
                      <th className="p-2 min-w-[350px] text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApps.map(app => (
                      <ApplicationRow key={app.aapid} app={app} navigate={navigate} onDelete={handleDelete} rowClassName="hover:bg-gray-100 transition" />
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg width="120" height="120" fill="none" viewBox="0 0 120 120">
                    <rect width="120" height="120" rx="24" fill="#F3F4F6"/>
                    <path d="M40 60h40M60 40v40" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                  <div className="mt-6 text-xl font-semibold text-gray-700">No applications found</div>
                  <div className="mt-2 text-gray-500">Get started by adding your first application.</div>
                  <button
                    onClick={() => navigate('/add-new')}
                    className="mt-6 bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-bold shadow transition"
                  >
                    + Add New Application
                  </button>
                </div>
              )}
              {/* Pagination Controls */}
              {applications.length > pageSize && (
                <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 font-semibold text-base disabled:opacity-50"
                    aria-label="Previous Page"
                  >
                    <FaArrowLeft />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`px-3 py-1.5 rounded font-semibold text-base focus:outline-none focus:ring-2 focus:ring-gray-700 ${
                        currentPage === idx + 1
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      aria-label={`Go to page ${idx + 1}`}
                      aria-current={currentPage === idx + 1 ? 'page' : undefined}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 font-semibold text-base disabled:opacity-50"
                    aria-label="Next Page"
                  >
                    <FaArrowRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationMaster;
