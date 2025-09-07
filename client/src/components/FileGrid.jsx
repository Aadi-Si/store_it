import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFiles, clearFilesError } from "../store/features/fileSlice";
import CategoryCard from "./CategoryCard";
import toast from "react-hot-toast";
import Card from "./Card";
import StorageCircle from "./StorageCircle";

const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "txt":
      return "/assets/icons/file-txt.svg";
    case "pdf":
      return "/assets/icons/file-pdf.svg";
    case "doc":
      return "/assets/icons/file-doc.svg";
    case "docx":
      return "/assets/icons/file-docx.svg";
    case "csv":
      return "/assets/icons/file-csv.svg";
    case "xlsx":
      return "/assets/icons/file-csv.svg";
    case "mp3":
    case "wav":
      return "/assets/icons/file-audio.svg";
    case "mp4":
    case "mov":
      return "/assets/icons/file-video.svg";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "/assets/icons/file-image.svg";
    default:
      return "/assets/icons/file-other.svg";
  }
};

// Helper function: filter files by category
const isFileInCategory = (fileName, category) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const docExt = ["txt", "pdf", "doc", "docx", "csv", "xlsx"];
  const imageExt = ["jpg", "jpeg", "png", "gif"];
  const mediaExt = ["mp3", "wav", "mp4", "mov"];

  switch (category) {
    case "documents":
      return docExt.includes(ext);
    case "images":
      return imageExt.includes(ext);
    case "media":
      return mediaExt.includes(ext);
    case "others":
      return ![...docExt, ...imageExt, ...mediaExt].includes(ext);
    default:
      return true;
  }
};

// Helper function: format storage size dynamically
const formatStorage = (sizeInGB) => {
  const sizeInBytes = sizeInGB * 1024 * 1024 * 1024;

  if (sizeInBytes < 1024) return `${sizeInBytes} B`;
  const sizeInKB = sizeInBytes / 1024;
  if (sizeInKB < 1024) return `${sizeInKB.toFixed(2)} KB`;
  const sizeInMB = sizeInKB / 1024;
  if (sizeInMB < 1024) return `${sizeInMB.toFixed(2)} MB`;
  const sizeInGBFinal = sizeInMB / 1024;
  return `${sizeInGBFinal.toFixed(2)} GB`;
};

// Helper: get total size in GB and count of files in a category
const getCategoryData = (files, category) => {
  const filteredFiles = files.filter((file) =>
    isFileInCategory(file.file_name, category)
  );
  const totalSize =
    filteredFiles.reduce((sum, file) => sum + (file.file_size || 0), 0) /
    1024 ** 3;
  const count = filteredFiles.length;
  return { size: totalSize, count };
};

const FileGrid = ({ userId, category }) => {
  const dispatch = useDispatch();
  const { files, error } = useSelector((state) => state.files);
  const { uploadStatus } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userId) dispatch(fetchFiles(userId));

    if (error) {
      toast.error(`Error fetching files: ${error}`);
      dispatch(clearFilesError());
    }

    if (uploadStatus === "succeeded") {
      dispatch(fetchFiles(userId));
    }
  }, [dispatch, userId, error, uploadStatus]);

  if (!userId) return <p>User ID not found.</p>;

  // Dashboard view
  if (category === "dashboard") {
    const totalStorage = 2; // GB

    // Calculate used and remaining storage
    const usedStorage = files.reduce(
      (total, file) => total + (file.file_size || 0) / 1024 ** 3,
      0
    );
    const remainingStorage = totalStorage - usedStorage;

    // Get category sizes and counts
    const documentsData = getCategoryData(files, "documents");
    const imagesData = getCategoryData(files, "images");
    const mediaData = getCategoryData(files, "media");
    const othersData = getCategoryData(files, "others");

    return (
      <div className="w-full h-full md:flex ">
        <div className="h-full w-full xl:w-[45%]">
          {/* Storage Circle */}
          <div className="p-1 pt-5 pb-5 md:pt-0 md:pb-0 md:p-0 bg-red w-[100%] xl:w-[96%] h-[35%] flex items-center justify-center gap-0 xl:gap-10 rounded-4xl mb-10 md:mb-5 3xl:mb-10">
            <StorageCircle remaining={remainingStorage} total={totalStorage} />
            <div className="text-center">
              <h1 className="text-white font-medium text-md md:text-xl 3xl:text-2xl mb-2">
                Available Storage
              </h1>
              <h3 className="text-white text-sm xl:text-lg font-medium">
                {formatStorage(remainingStorage)} /{" "}
                {formatStorage(totalStorage)}
              </h3>
            </div>
          </div>
          {/* Category Cards */}
          <div className="w-full h-[60%] flex gap-10 flex-wrap ml-2 md:ml-0">
            <CategoryCard
              icon="/assets/icons/file-document-light.svg"
              name="Documents"
              size={documentsData.size}
              count={documentsData.count}
            />
            <CategoryCard
              icon="/assets/icons/file-image-light.svg"
              name="Images"
              size={imagesData.size}
              count={imagesData.count}
            />
            <CategoryCard
              icon="/assets/icons/file-video-light.svg"
              name="Media"
              size={mediaData.size}
              count={mediaData.count}
            />
            <CategoryCard
              icon="/assets/icons/file-other-light.svg"
              name="Others"
              size={othersData.size}
              count={othersData.count}
            />
          </div>
        </div>
        
        <div className=" md:block md:flex-1 md:h-full bg-white rounded-2xl p-5 xl:p-10 pt-5 overflow-y-auto mt-10 md:mt-0">
          <h2 className="h2 mb-3">Recent file uploads</h2>
          {files.length > 0 ? (
            <ul className="space-y-4">
              {files
                .slice() // make a copy
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // newest first
                .map((file) => (
                  <li
                    key={file.id}
                    className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-center gap-5">
                      <div className="hidden w-[3vw] h-[3vw] bg-[#FFF1F2] rounded-full md:flex items-center justify-center">
                        <img
                          src={getFileIcon(file.file_name)}
                          alt="File Icon"
                          className="w-10 h-10"
                        />
                      </div>
                      <p className="font-medium">{file.file_name}</p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-200 text-center mt-5">No recent uploads</p>
          )}
        </div>
      </div>
    );
  }

  // Other categories
  const filteredFiles = files.filter((file) =>
    isFileInCategory(file.file_name, category)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 gap-4">
      {filteredFiles.length > 0 ? (
        filteredFiles.map((file) => <Card key={file.id} file={file} />)
      ) : (
        <p className="col-span-3 text-center text-gray-500">No files found.</p>
      )}
    </div>
  );
};

export default FileGrid;
