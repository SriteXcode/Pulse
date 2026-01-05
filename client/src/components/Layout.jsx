import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-64 min-h-screen bg-gray-50">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
