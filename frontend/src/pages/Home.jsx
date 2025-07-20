import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="flex justify-between items-center p-6 bg-white shadow">
        <div className="flex items-center gap-3">
          <img
            src="https://www.bing.com/th/id/OIP.PD0SAnvyZpwnKOiUmdnSOAAAAA?w=160&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"
            alt="Company Logo"
            className="h-24 w-24 object-contain rounded-lg bg-white shadow border border-gray-200 p-2"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="text-gray-900 font-semibold text-lg">Manipal Technologies Limited</span>
        </div>
        {/* Navigation Bar */}
        <nav className="flex gap-8 items-center">
          <a href="#about" className="text-gray-900 font-medium hover:text-gray-700 transition">About</a>
          <a href="#features" className="text-gray-900 font-medium hover:text-gray-700 transition">Features</a>
          <a href="#contact" className="text-gray-900 font-medium hover:text-gray-700 transition">Contact</a>
        </nav>
      </header>
      {/* Hero Section: Split Layout */}
      <main className="flex flex-1 flex-col md:flex-row items-center justify-center bg-gray-100">
        <div className="flex-1 p-10 flex flex-col items-start justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">AppRegistry Hub</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-xl font-light text-gray-800">
            Centralized platform to manage all your company’s applications, websites, servers, and compliance data. Simplify audits, boost security, and stay organized—all in one place.
          </p>
          <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold px-10 py-4 rounded-lg shadow-xl text-lg transition" onClick={() => navigate("/login")}>Get Started</button>
        </div>
        <div className="flex-1 flex items-center justify-center p-10">
          <img src="/company-logo.jpg" alt="Corporate Technology" className="rounded-2xl shadow-2xl max-h-[400px] w-full object-cover" />
        </div>
      </main>
      {/* About Section */}
      <section id="about" className="w-full bg-gray-50 py-24 flex flex-col items-center border-t border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">About AppRegistry Hub</h3>
        <p className="max-w-3xl text-center text-gray-800 text-lg">
          AppRegistry Hub is an internal platform designed for Manipal Technologies Limited to centralize and streamline the management of all company applications, websites, servers, and compliance data. It empowers teams to stay organized, secure, and audit-ready, while providing transparency and accountability across the organization.
        </p>
      </section>
      {/* Feature Highlights Section */}
      <section id="features" className="w-full bg-gray-50 py-24 flex flex-col items-center border-t border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Key Features</h3>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center px-4">
          {/* Card 1 */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-200 hover:shadow-2xl transition">
            <div className="text-4xl mb-4">🗂️</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Application Management</h4>
            <p className="text-gray-600">Add, edit, and organize all your company’s applications and websites in one place.</p>
          </div>
          {/* Card 2 */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-200 hover:shadow-2xl transition">
            <div className="text-4xl mb-4">📋</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Audit Tracking</h4>
            <p className="text-gray-600">Track audit status, history, and compliance for every application with ease.</p>
          </div>
          {/* Card 3 */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-200 hover:shadow-2xl transition">
            <div className="text-4xl mb-4">🔐</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">SSL & Server Management</h4>
            <p className="text-gray-600">Manage SSL certificates, hosting, and server details securely and efficiently.</p>
          </div>
          {/* Card 4 */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-200 hover:shadow-2xl transition">
            <div className="text-4xl mb-4">👤</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Owner & Domain Registry</h4>
            <p className="text-gray-600">Keep track of application owners and domain registrations for accountability and transparency.</p>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="w-full bg-gray-50 py-24 flex flex-col items-center border-t border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact</h3>
        <p className="max-w-2xl text-center text-gray-800 text-lg mb-2">
          For support or inquiries, please contact the IT department at Manipal Technologies Limited.
        </p>
        <p className="text-gray-700 font-medium">Email: <a href="mailto:support@manipaltech.com" className="underline">support@manipaltech.com</a></p>
        <p className="text-gray-700 font-medium">Phone: <a href="tel:+910000000000" className="underline">+91 00000 00000</a></p>
      </section>
      <footer className="text-gray-500 text-sm text-center py-4 bg-white border-t">
        © {new Date().getFullYear()} Manipal Technologies Limited. All rights reserved.
      </footer>
      {/* Back to Top Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-gray-700 hover:bg-gray-800 text-white rounded-full p-4 shadow-lg transition-all duration-300"
          aria-label="Back to Top"
        >
          <span className="text-2xl">↑</span>
        </button>
      )}
    </div>
  );
};

export default Home;
