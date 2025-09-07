import FileGrid from "./FileGrid";
import { useSelector } from "react-redux";

const StorageOverview = () => {
  const { user } = useSelector((state) => state.auth);
  const { category } = useSelector((state) => state.files);

  // 🛡️ Prevent crash if user is not loaded yet
  if (!user) {
    return <p className="text-center text-gray-500">Loading user...</p>;
  }

  return (
    <div className=" bg-[#F2F4F8] p-4 pt-5  xl:h-[86vh] w-full rounded-4xl 3xl:p-10 3xl:px-8 overflow-hidden">
      <div className={`${category !== "dashboard" ? "mb-5" : " "}`}>
        {category !== "dashboard" && (
          <h1 className="h1">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h1>
        )}
      </div>
      <div
        className={`h-[100%] ${
          category === "dashboard" ? "overflow-hidden" : "overflow-y-scroll"
        }`}
      >
        {/* Pass user.id safely */}
        <FileGrid userId={user.id} category={category} />
      </div>
    </div>
  );
};

export default StorageOverview;


