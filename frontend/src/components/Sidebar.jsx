import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ menuItems = [] }) => {
  return (
    <aside className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-white w-64 h-screen fixed top-0 left-0 pt-0 shadow-lg rounded-r-2xl flex flex-col items-center">
      <div className="w-full flex flex-col items-center py-6 border-b border-gray-700 mb-2">
        <img src="/company-hero.jpg" alt="Company Hero" className="h-16 w-16 object-cover rounded-xl bg-white border border-gray-300 shadow mb-2" />
        <span className="text-lg font-bold tracking-wide text-white mt-1">Manipal Technologies</span>
      </div>
      <ul className="flex flex-col gap-2 p-4 w-full">
        {menuItems.length > 0 ? (
          menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-600 hover:shadow-md focus:bg-gray-600 focus:shadow-md outline-none"
                tabIndex={0}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.text}</span>
              </Link>
            </li>
          ))
        ) : (
          <li className="text-gray-400 italic">No menu items available</li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
