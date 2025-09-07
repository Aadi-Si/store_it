// CategoryCard.jsx
import React from "react";

// Make sure formatStorage is imported or defined
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

const CategoryCard = ({ icon, name, size ,count}) => (
  <div className="bg-white w-[95%] xl:w-[45%] xl:h-[45%] flex flex-col rounded-b-2xl flex-shrink-0 rounded-tr-2xl">
    <div className="w-full h-2/5 bg-[#F2F4F8] flex overflow-hidden rounded-tr-2xl">
      <div className="w-1/2 h-full bg-white overflow-hidden">
        <img
          src={icon}
          alt={name}
          className="transform scale-115 "
        />
      </div>
      <div className="w-1/2 h-full bg-white rounded-tr-2xl mt-4.5 xl:mt-4 flex justify-center pt-2">
        <h5 className="h5">{formatStorage(size)}</h5>
      </div>
    </div>
    <div className="w-full flex-1 rounded-b-2xl">
      <h3 className="text-center text-lg font-bold">{name}</h3>
      <h5 className="font-medium  text-center mt-5 text-lg">No of Files : {count}</h5>
    </div>
  </div>

);

export default CategoryCard;

{/* <div className="bg-white w-[45%] h-[45%] flex flex-col rounded-b-2xl flex-shrink-0 rounded-tr-2xl">
    <div className="w-full h-2/5 bg-[#F2F4F8] flex overflow-hidden rounded-tr-2xl">
      <div className="w-1/2 h-full bg-white overflow-hidden">
        <img
          src={icon}
          alt={name}
          className="transform scale-115 "
        />
      </div>
      <div className="w-1/2 h-full bg-white rounded-tr-2xl mt-4 flex justify-center pt-2">
        <h5 className="h5">{formatStorage(size)}</h5>
      </div>
    </div>
    <div className="w-full flex-1 rounded-b-2xl">
      <h3 className="text-center text-lg font-bold">{name}</h3>
      <h5 className="font-medium  text-center mt-5 text-lg">No of Files : {count}</h5>
    </div>
  </div> */}
