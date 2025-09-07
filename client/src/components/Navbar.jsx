import { useEffect, useRef, useState } from "react";
import { FiSearch,FiMenu } from "react-icons/fi";
import { IoIosCloudUpload } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, uploadFile, clearAuthStatus } from "../store/features/authSlice";
import { setCategory } from "../store/features/fileSlice"; // Redux action to update category
import toast from "react-hot-toast";
import Loader from "./Loader";

const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "txt": return "/assets/icons/file-txt.svg";
    case "pdf": return "/assets/icons/file-pdf.svg";
    case "doc": return "/assets/icons/file-doc.svg";
    case "docx": return "/assets/icons/file-docx.svg";
    case "csv": return "/assets/icons/file-csv.svg";
    case "xlsx": return "/assets/icons/file-csv.svg";
    case "mp3":
    case "wav": return "/assets/icons/file-audio.svg";
    case "mp4":
    case "mov": return "/assets/icons/file-video.svg";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif": return "/assets/icons/file-image.svg";
    default: return "/assets/icons/file-other.svg";
  }
};

const Navbar = ({setIsSidebarOpen}) => {
  const dispatch = useDispatch();
  const [searchItem, setSearchItem] = useState("");
  const { uploadStatus, user, error } = useSelector((state) => state.auth);
  const { files } = useSelector((state) => state.files);
  const userId = user?.id;
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const userLogout = async () => {
    await dispatch(logoutUser());
  };

  const handleFileChange = async (event) => {
    if (!user) {
      toast.error("You must be logged in to upload files");
      return;
    }
    const filesArr = Array.from(event.target.files);
    for (const file of filesArr) {
      await dispatch(uploadFile({ userId, file }));
    }
    event.target.value = null;
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthStatus());
    }
  }, [error, dispatch]);

  const filteredFiles = files.filter((file) =>
    file.file_name.toLowerCase().includes(searchItem.toLowerCase())
  );

  const handleSelectFile = (file) => {
    const ext = file.file_name.split(".").pop().toLowerCase();
    if (["txt","pdf","doc","docx","csv","xlsx"].includes(ext)) dispatch(setCategory("documents"));
    else if (["jpg","jpeg","png","gif"].includes(ext)) dispatch(setCategory("images"));
    else if (["mp3","wav","mp4","mov"].includes(ext)) dispatch(setCategory("media"));
    else dispatch(setCategory("others"));

    setSearchItem("");
  };

  return (
    <>
      {uploadStatus === "loading" && <Loader type="upload" />}
      <div className="w-full h-[8vh] flex justify-between pt-5 lg:pt-3 pl-7 md:pl-21 pr-5 md:pr-7 relative">
        <div className="flex gap-5 lg:gap-25 3xl:gap-47 items-center justify-center">
          <FiMenu
            size={28}
            className="cursor-pointer md:hidden"
            onClick={() => setIsSidebarOpen(prev => !prev)}
          />
          <img src="/assets/icons/logo-full-brand.svg" className="w-25 md:w-30"/>
          <div className="hidden md:flex border-2 border-white shadow-2xl rounded-full w-[15vw] h-[5vh] items-center justify-center gap-4 relative">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Search your files here"
              className="outline-none w-full"
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
            />
            {searchItem && filteredFiles.length > 0 && (
              <div className="overflow-hidden absolute top-full left-0 w-full bg-white shadow-lg rounded mt-1 max-h-60 overflow-y-auto z-50">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <img src={getFileIcon(file.file_name)} alt="" className="w-5 h-5" />
                    <span>{file.file_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-5 md:gap-10">
          <div
            className="flex items-center justify-center gap-1 md:gap-2 text-white font-medium text-sm bg-red p-1.5 md:p-4 rounded-full cursor-pointer transition duration-150 ease-in-out active:scale-95 active:shadow-inner"
            onClick={handleUploadClick}
          >
            <IoIosCloudUpload size={20} /> Upload
          </div>
          <img
            onClick={userLogout}
            src="/assets/icons/logout.svg"
            alt=""
            className="cursor-pointer"
          />
        </div>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
        />
      </div>
    </>
  );
};

export default Navbar;
