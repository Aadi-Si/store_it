import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StorageOverview from "../components/StorageOverview";
const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex flex-col h-screen">
      <Navbar setIsSidebarOpen={setIsSidebarOpen} />
      <div className="md:flex md:flex-1">
        <div
          className={`fixed md:static z-50 top-0 left-0 h-full w-5/6 md:w-1/5 bg-white transform 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transition-transform duration-300 ease-in-out p-5 3xl:px-15`}
        >
          <Sidebar />
        </div>

        {/* Overlay (only mobile) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-transparent backdrop-blur-md z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="w-full p-5 3xl:w-4/5 3xl:p-10 pt-5">
          <StorageOverview />
        </div>
      </div>
    </div>
  );
};

export default Home;
