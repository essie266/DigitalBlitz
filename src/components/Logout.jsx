import React from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      data-i18n="Logout"
      className="w-full bg-[#357598] text-white text-center py-3 rounded text-sm font-medium hover:bg-[#2d6a8d] transition"
    >
      Logout
    </button>
  );
}
