import React, { useState } from "react";
import { supabase } from "../lib/superbase";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { updateFileName,removeFile } from "../store/features/fileSlice";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "txt": return "/assets/icons/file-txt.svg";
    case "pdf": return "/assets/icons/file-pdf.svg";
    case "doc":return "/assets/icons/file-doc.svg";
    case "docx": return "/assets/icons/file-docx.svg";
    case "csv":return "/assets/icons/file-csv.svg";
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

const formatSize = (size) => {
  if (!size) return "Unknown";
  if (size < 1024) return size + " B";
  else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  else return (size / (1024 * 1024)).toFixed(1) + " MB";
};

const Card = ({ file }) => {
  if (!file) return null;

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false); 
  const [deleteOpen, setDeleteOpen] = useState(false);


  const dotIndex = file.file_name.lastIndexOf(".");
  const baseName = file.file_name.substring(0, dotIndex);
  const extension = file.file_name.substring(dotIndex + 1);

  const [newName, setNewName] = useState(baseName);

  const createdAt = new Date(file.created_at);
  const date = createdAt.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const time = createdAt.toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  });

  const handleOpenFile = () => {
  if (!file.url) {
    toast.error("File URL not found");
    return;
  }
  window.open(file.url, "_blank"); // opens in new tab
};


  const handleRename = async () => {
    if (!newName.trim()) return;
    const updatedName = `${newName}.${extension}`;
    const { data, error } = await supabase
      .from("files")
      .update({ file_name: updatedName })
      .eq("id", file.id);
    if (error) toast.error(error.message);
    else {
      toast.success("File renamed successfully.");
      dispatch(updateFileName({ id: file.id, newName: updatedName }));
      setOpen(false);
    }
  };

const handleDownload = async () => {
  try {
    // Download the file as a blob from Supabase storage
    const { data, error } = await supabase.storage
      .from("user_files")
      .download(file.file_path);

    if (error) throw error;

    // Create a blob URL (temporary)
    const blobUrl = URL.createObjectURL(data);

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = file.file_name; // file will be saved with this name
    document.body.appendChild(link);
    link.click(); // trigger the download
    document.body.removeChild(link);

    // Release memory
    URL.revokeObjectURL(blobUrl);

    toast.success("Download started!");
    setDownloadOpen(false);
  } catch (err) {
    toast.error("Download failed: " + err.message);
  }
};

const handleDelete = async () => {
  try {
    const { error: storageError } = await supabase
      .storage
      .from("user_files")
      .remove([file.file_path]);

    if (storageError) throw storageError;

    const { error: dbError } = await supabase
      .from("files")
      .delete()
      .eq("id", file.id);

    if (dbError) throw dbError;

    dispatch(removeFile(file.id)); // ✅ now works
    toast.success("File moved to trash successfully!");
    setDeleteOpen(false);
  } catch (error) {
    toast.error("Failed to delete file: " + error.message);
  }
};

  return (
    <div className="md:w-[250px] p-4 rounded-2xl shadow-md flex flex-col gap-2 bg-white">
      <div className="flex items-center justify-between">
        <div className="w-[72px] h-[72px] bg-[#fff1f2] rounded-full flex items-center justify-center">
          <img src={getFileIcon(file.file_name)} alt="File Icon" className="w-12 h-12 cursor-pointer" onClick={handleOpenFile}/>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <img src="/assets/icons/dots.svg" alt="Options" className="cursor-pointer w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-45">
              <DropdownMenuItem className="cursor-pointer" onClick={() => setOpen(true)}>
                <img src="/assets/icons/edit.svg" alt="" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setDetailsOpen(true)}>
                <img src="/assets/icons/info.svg" alt="" /> Details
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setShareOpen(true)}>
                <img src="/assets/icons/share.svg" alt="" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setDownloadOpen(true)}>
                <img src="/assets/icons/download.svg" alt="" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setDeleteOpen(true)}>
                <img src="/assets/icons/delete.svg" alt="" /> Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <p className="text-sm">{formatSize(file.file_size)}</p>
        </div>
      </div>

      <h3 className="font-semibold truncate mt-5">{file.file_name}</h3>
      <p className="text-sm text-gray-500">{time}, {date}</p>

      {/* Rename Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center text-[#444444]">Rename File</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border rounded p-2 border-black"
            placeholder="Enter new file name"
          />
          <DialogFooter>
            <div className="flex w-full gap-2">
              <button onClick={() => setOpen(false)} className="w-full py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleRename} className="w-full py-3 rounded-full bg-[#fb8b8d] hover:bg-[#f76f71] text-white text-sm font-medium cursor-pointer">Rename</button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center text-[#444444]">File Details</DialogTitle>
          </DialogHeader>
          <div className="bg-[#f1f1f1] h-[8vh] rounded-md flex items-center justify-start gap-5 pl-2">
            <div className="w-[3.5vw] h-[3.5vw] bg-white rounded-full flex items-center justify-center">
              <img src={getFileIcon(file.file_name)} alt="File Icon" className="w-12 h-12" />
            </div>
            <span className="font-medium">{file.file_name.length > 25 ? `${file.file_name.slice(0,24)}...`:file.file_name}</span>
          </div>
          <div className="p-2">
            <p><strong className="mr-20">Name:</strong><span className="font-bold text-[#646464]">{baseName.length > 10 ? `${baseName.slice(0, 18)}...` : baseName}</span></p>
            <p><strong className="mr-17.5">Format:</strong><span className="font-bold text-[#646464]">{file.file_type}</span></p>
            <p><strong className="mr-25">Size:</strong><span className="font-bold text-[#646464]">{formatSize(file.file_size)}</span></p>
            <p><strong className="mr-19.5">Owner:</strong><span className="font-bold text-[#646464]">{user?.name || user?.email}</span></p>
            <p><strong className="mr-16.5">Created:</strong><span className="font-bold text-[#646464]">{new Date(file.created_at).toLocaleString()}</span></p>
          </div>
          <DialogFooter>
            <button onClick={() => setDetailsOpen(false)} className="text-white w-full py-3 rounded-full bg-[#fb8b8d] hover:bg-[#f76f71] text-md font-medium cursor-pointer">Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center text-[#444444]">Share File</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-gray-600 text-sm">Share this file using the link below:</p>
            <input type="text" value={file.url} readOnly className="w-full border rounded p-2 border-black" />
          </div>
          <DialogFooter>
            <div className="flex w-full gap-2">
              <button onClick={() => setShareOpen(false)} className="w-full py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium cursor-pointer">Close</button>
              <button onClick={() => {navigator.clipboard.writeText(file.url); toast.success("Link copied to clipboard!"); setShareOpen(false)}} className="w-full py-3 rounded-full bg-[#fb8b8d] hover:bg-[#f76f71] text-white text-sm font-medium cursor-pointer">Copy Link</button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Dialog */}
      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center text-[#444444]">Download File</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-gray-600 text-sm">Click the button below to download the file:</p>
            <input type="text" value={file.url} readOnly className="w-full border rounded p-2 border-black" />
          </div>
          <DialogFooter>
            <div className="flex w-full gap-2">
              <button onClick={() => setDownloadOpen(false)} className="w-full py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium cursor-pointer">Close</button>
              <button onClick={handleDownload} className="w-full py-3 rounded-full bg-[#fb8b8d] hover:bg-[#f76f71] text-white text-sm font-medium cursor-pointer">Download</button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
  <DialogContent className="sm:max-w-[400px]">
    <DialogHeader>
      <DialogTitle className="text-center text-[#444444]">Delete File</DialogTitle>
    </DialogHeader>

    <p className="text-center text-gray-600 mt-4">
      Are you sure you want to delete <strong>{file.file_name.length > 25 ? `${file.file_name.slice(0,30)}...`:file.file_name}</strong>? This action cannot be undone.
    </p>

    <DialogFooter>
      <div className="flex w-full gap-2 mt-4">
        <button
          onClick={() => setDeleteOpen(false)}
          className="w-full py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="w-full py-3 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium cursor-pointer"
        >
          Delete
        </button>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>


    </div>
  );
};

export default Card;
