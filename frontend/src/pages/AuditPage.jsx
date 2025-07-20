// ✅ Full AuditPage component with enhanced "Add Audit Log" form (with audit name + date)
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Accordion from "../components/Accordion";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaCheckCircle,
  FaSignOutAlt,
  FaPlusCircle, FaArrowLeft, FaEdit, FaTrash
} from "react-icons/fa";

const adminMenu = [
  { text: "Application Master", icon: <FaTachometerAlt />, path: "/application-master" },
    { text: "Hosting Server", icon: <FaCheckCircle />, path: "/Hosting-Server" }, 
    { text: "Owner Details", icon: <FaCheckCircle />, path: "/Owner-master" }, 
        { text: "Company Details", icon: <FaBuilding />, path: "/Company-Page" },  
 { text: "Logout", icon: <FaSignOutAlt />, path: "/" }
 
];

const AuditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appName, setAppName] = useState("");

  const [editLog, setEditLog] = useState(null);
  const [editFinding, setEditFinding] = useState("");
  const [editSeverity, setEditSeverity] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [editVerificationStatus, setEditVerificationStatus] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [auditName, setAuditName] = useState("");
  const [auditDate, setAuditDate] = useState("");
  const [formReady, setFormReady] = useState(false);
  const [newFinding, setNewFinding] = useState("");
  const [newSeverity, setNewSeverity] = useState(""); // ← empty string, not "Medium"
  const [newRemarks, setNewRemarks] = useState("");
  const [newVerificationStatus, setNewVerificationStatus] = useState("");
  const [tempLogs, setTempLogs] = useState([]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const endpoint = id
        ? `http://localhost:5000/api/audit-logs/by-app/${id}`
        : `http://localhost:5000/api/audit-logs`;
      const response = await axios.get(endpoint);
      setAuditLogs(Array.isArray(response.data) ? response.data : []);
      if (response.data?.length > 0 && response.data[0].app_name) {
        setAppName(response.data[0].app_name);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppName();
    fetchAuditLogs();
  }, [id]);

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

  const confirmDelete = async (findingId) => {
    if (!window.confirm("Are you sure you want to delete this audit log?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/audit-logs/${findingId}`);
      fetchAuditLogs();
    } catch (err) {
      console.error("Error deleting audit log:", err);
    }
  };

  const handleEditClick = (log) => {
    setEditLog(log);
    setEditFinding(log.findings);
    setEditSeverity(log.severity);
    setEditRemarks(log.developer_remarks);
    setEditVerificationStatus(log.verification_status);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/audit-logs/${editLog.finding_id}`,
        {
          findings: editFinding,
          severity: editSeverity,
          verification_status: editVerificationStatus,
          developer_remarks: editRemarks,
        }
      );
      setEditLog(null);
      fetchAuditLogs();
    } catch (err) {
      console.error("Error updating audit log:", err);
    }
  };

  const handleAddTempLog = () => {
    if (!newFinding || !newSeverity || !newVerificationStatus) {
      alert("All fields in Finding section are required");
      return;
    }
    setTempLogs([
      ...tempLogs,
      {
        findings: newFinding,
        severity: newSeverity,
        developer_remarks: newRemarks,
        verification_status: newVerificationStatus,
      },
    ]);
    setNewFinding("");
    setNewSeverity("Medium");
    setNewRemarks("");
    setNewVerificationStatus("Yes");
  };

  const handleSaveAllAuditLogs = async () => {
    try {
      if (!auditName || !auditDate || tempLogs.length === 0) {
        alert("Audit name, date and at least one finding are required.");
        return;
      }

      // Use the new endpoint that creates one audit report with multiple findings
      await axios.post("http://localhost:5000/api/audit-report-with-findings", {
        aapid: id, // this must match the current application ID
        audit_name: auditName,
        created_date: auditDate,
        findings: tempLogs // Send all findings as an array
      });

      alert("Audit Logs saved successfully!");
      setAuditName("");
      setAuditDate("");
      setTempLogs([]);
      setFormReady(false);
      setShowAddForm(false);
      fetchAuditLogs();
    } catch (err) {
      console.error("Error saving audit logs:", err);
      alert("Error saving audit logs. See console for details.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar menuItems={adminMenu} />
      <main className="flex-1 ml-64 p-6 flex flex-col gap-6">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800 mb-1">
                {id ? `Audit Logs for ${appName}` : "All Audit Logs"}
              </h1>
              <p className="text-gray-500 text-base">View and manage audit logs for your applications.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaPlusCircle className="text-lg" />
                {showAddForm ? "Cancel" : "Add Audit Log"}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <FaArrowLeft className="text-lg" />
                Back
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-6 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Add Audit Log</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Audit Name</label>
                  <input
                    type="text"
                    placeholder="Audit Name"
                    value={auditName}
                    onChange={(e) => setAuditName(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    disabled={formReady}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Audit Date</label>
                  <input
                    type="date"
                    value={auditDate}
                    onChange={(e) => setAuditDate(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    max={new Date().toISOString().split("T")[0]}
                    disabled={formReady}
                  />
                </div>
              </div>
              {!formReady ? (
                <button
                  onClick={() => {
                    if (!auditName || !auditDate)
                      return alert("Please fill both fields");
                    setFormReady(true);
                  }}
                  className="mb-6 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Next
                </button>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div>
                      <label className="block mb-1 font-semibold text-gray-700">Finding</label>
                      <input
                        type="text"
                        placeholder="Finding"
                        value={newFinding}
                        onChange={(e) => setNewFinding(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-gray-700">Severity</label>
                      <select
                        value={newSeverity}
                        onChange={(e) => setNewSeverity(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                        required
                      >
                        <option value="" disabled hidden>Select Severity</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-gray-700">Developer Remarks</label>
                      <input
                        type="text"
                        placeholder="Developer Remarks"
                        value={newRemarks}
                        onChange={(e) => setNewRemarks(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-gray-700">Verification Status</label>
                      <select
                        value={newVerificationStatus}
                        onChange={(e) => setNewVerificationStatus(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      >
                        <option value="" disabled hidden>Select Verification Status</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAddTempLog}
                    className="mt-4 flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <FaPlusCircle className="text-lg" />
                    Add
                  </button>
                  {tempLogs.length > 0 && (
                    <div className="mt-6">
                      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-4 py-2">Finding</th>
                            <th className="border px-4 py-2">Severity</th>
                            <th className="border px-4 py-2">Remarks</th>
                            <th className="border px-4 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tempLogs.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="border px-4 py-2">{row.findings}</td>
                              <td className="border px-4 py-2">{row.severity}</td>
                              <td className="border px-4 py-2">{row.developer_remarks}</td>
                              <td className="border px-4 py-2">{row.verification_status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button
                        onClick={handleSaveAllAuditLogs}
                        className="mt-4 flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <FaPlusCircle className="text-lg" />
                        Save
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {editLog && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-6 max-w-3xl mx-auto">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Edit Audit Log</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Findings</label>
                  <input
                    type="text"
                    value={editFinding}
                    onChange={(e) => setEditFinding(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Severity</label>
                  <select
                    value={editSeverity}
                    onChange={(e) => setEditSeverity(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  >
                    <option value="" disabled hidden>Select Severity</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Developer Remarks</label>
                  <input
                    type="text"
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Verification Status</label>
                  <select
                    value={editVerificationStatus}
                    onChange={(e) => setEditVerificationStatus(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  >
                    <option value="" disabled hidden>Select Status</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleEditSubmit}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <FaEdit className="text-lg" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditLog(null)}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <FaArrowLeft className="text-lg" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : auditLogs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
              No audit logs found.
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                // Group findings by audit_report_id
                const groupedLogs = auditLogs.reduce((groups, log) => {
                  const key = log.audit_report_id || log.finding_id;
                  if (!groups[key]) {
                    groups[key] = {
                      audit_name: log.audit_name || `Audit Log #${log.finding_id}`,
                      audit_date: log.created_date,
                      findings: []
                    };
                  }
                  groups[key].findings.push(log);
                  return groups;
                }, {});

                return Object.entries(groupedLogs).map(([reportId, report]) => (
                  <Accordion
                    key={reportId}
                    title={report.audit_name}
                    className="bg-white rounded-2xl shadow border border-gray-100"
                  >
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-4 py-2 text-left">Findings</th>
                            <th className="border px-4 py-2 text-left">Severity</th>
                            <th className="border px-4 py-2 text-left">Developer Remarks</th>
                            <th className="border px-4 py-2 text-left">Verification Status</th>
                            <th className="border px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.findings.map((log) => (
                            <tr key={log.finding_id} className="hover:bg-gray-50">
                              <td className="border px-4 py-2">{log.findings}</td>
                              <td className="border px-4 py-2">{log.severity}</td>
                              <td className="border px-4 py-2">{log.developer_remarks}</td>
                              <td className="border px-4 py-2">{log.verification_status}</td>
                              <td className="border px-4 py-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditClick(log)}
                                    className="flex items-center gap-1 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-2 py-1 rounded text-sm transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                                  >
                                    <FaEdit className="text-xs" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => confirmDelete(log.finding_id)}
                                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-2 py-1 rounded text-sm transition focus:outline-none focus:ring-2 focus:ring-red-400"
                                  >
                                    <FaTrash className="text-xs" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Accordion>
                ));
              })()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuditPage;
