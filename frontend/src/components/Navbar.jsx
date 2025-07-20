import React from "react";

const Navbar = ({ title }) => {
  return (
    <header className="bg-teal-600 text-white px-6 py-4 fixed w-full top-0 z-10 shadow">
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  );
};

export default Navbar;
