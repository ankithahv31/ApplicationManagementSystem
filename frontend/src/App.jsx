import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ApplicationMaster from './pages/ApplicationMaster';
import AddNewApplication from './pages/AddNewApplication';
import EditApplication from './pages/EditApplication';
import AuditPage from "./pages/AuditPage";
import ServerPage from './pages/ServerPage';
import DomainPage from './pages/DomainPage';
import SslPage from './pages/SslPage';
import VersionPage from './pages/VersionPage';
import OwnerPage from './pages/OwnerPage';
import HostingServer from "./pages/HostingServer";
import CompanyPage from "./pages/CompanyPage";
import OwnerMaster from "./pages/OwnerMater";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/application-master" element={<ApplicationMaster />} />
        <Route path="/add-new" element={<AddNewApplication />} />
        <Route path="/Hosting-Server" element={<HostingServer />} />
        <Route path="/Company-Page" element={<CompanyPage/>}/>
        <Route path="/applications/edit/:id" element={<EditApplication />} />
        <Route path="/applications/audit/:id" element={<AuditPage />} />
        <Route path="/audit-report" element={<AuditPage />} />
        <Route path="/applications/server/:id" element={<ServerPage />} />
        <Route path="/applications/domain/:id" element={<DomainPage />} />
        <Route path="/applications/ssl/:id" element={<SslPage />} />
        <Route path="/applications/version/:id" element={<VersionPage />} />
        <Route path="/Owner-master" element={<OwnerMaster/>}/>
        <Route path="/Owner-report" element={<OwnerPage />} />
        <Route path="/applications/owner/:id" element={<OwnerPage/>}/>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
