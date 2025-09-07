import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RiDashboardFill } from "react-icons/ri";
import { IoDocuments, IoImages, IoVideocam } from "react-icons/io5";
import { FaChartPie } from "react-icons/fa";
import { setCategory } from "../store/features/fileSlice";
const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const { category } = useSelector((state) => state.files);
  const dispatch = useDispatch();

  const colorClass = (isActive) =>
    `rounded-full h-[7vh] mb-7 md:mb-5 3xl:mb-7 font-bold text-md flex items-center justify-start gap-5 p-5 px-10 transition-all  cursor-pointer transition-all duration-300 ease-in-out
   ${
     isActive
       ? "text-white bg-brand shadow-md"
       : "text-[#969696] bg-transparent"
   }`;

  return (
    <div className="flex flex-col pt-3">
      <div
        onClick={() => dispatch(setCategory("dashboard"))}
        className={colorClass(category === "dashboard")}
      >
        <RiDashboardFill size={25} /> Dashboard
      </div>

      <div
        onClick={() => dispatch(setCategory("documents"))}
        className={colorClass(category === "documents")}
      >
        <IoDocuments size={25} /> Documents
      </div>

      <div
        onClick={() => dispatch(setCategory("images"))}
        className={colorClass(category === "images")}
      >
        <IoImages size={25} /> Images
      </div>

      <div
        onClick={() => dispatch(setCategory("media"))}
        className={colorClass(category === "media")}
      >
        <IoVideocam size={25} /> Media
      </div>

      <div
        onClick={() => dispatch(setCategory("others"))}
        className={colorClass(category === "others")}
      >
        <FaChartPie size={25} /> Others
      </div>
      <img
        src="assets/images/files-2.png"
        className="w-[220px] h-[180px] md:h-[160px] md:w-[200px] 3xl:h-[220px] 3xl:w-[300px] transition-all hover:rotate-2 hover:scale-105"
        alt="Files"
      />

      <div className="bg-gray-100 w-full h-[8vh] md:h-[8vh] rounded-full flex items-center mt-10 md:mt-6 3xl:mt-10 gap-2">
        <div className="w-[15vw] h-[15vw] md:w-[3vw] md:h-[3vw] rounded-full ml-2 md:ml-0 3xl:ml-2">
          <img
            src="assets/images/avatar.png"
            className="transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
        <div className=" flex flex-col">
          <h5 className="text-md md:text-sm 3xl:text-lg font-bold">{user ? user.name : "Guest"}</h5>
          <h2 className="md:text-sm 3xl:text-lg">{user ? user.email : "guest@gmail.com"}</h2>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
