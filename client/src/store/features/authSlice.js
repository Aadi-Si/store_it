import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { supabase } from "../../lib/superbase";

axios.defaults.withCredentials = true;

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        backendURL + "/auth/register",
        userData
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        backendURL + "/auth/login",
        credentials
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(backendURL + "/auth/logout");
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        backendURL + "/auth/send-reset-otp",
        credentials
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const resetNewPassword = createAsyncThunk(
  "auth/resetNewPassword",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        backendURL + "/auth/reset-password",
        credentials
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(backendURL + "/user/data");
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const uploadFile = createAsyncThunk(
  "auth/uploadFile",
  async (fileData, { rejectWithValue }) => {
    try {
      const { userId, file } = fileData;
      const MAX_SIZE = 70 * 1024 * 1024; // 70 MB
      if (file.size > MAX_SIZE) {
        return rejectWithValue(
          `File "${file.name}" is too large. Max size allowed is 70MB.`
        );
      }

      const filePath = `${userId}/${Date.now()}-${file.name}`;

      const getFileType = (fileName) => {
        const ext = fileName.split(".").pop().toLowerCase();
        const documentExts = ["doc", "docx", "pdf", "txt", "csv", "xlsx"];
        const imageExts = ["jpg", "jpeg", "png", "gif", "svg"];
        const videoExts = ["mp4", "mov", "mkv"];
        const audioExts = ["mp3", "wav"];

        if (documentExts.includes(ext)) return "document";
        if (imageExts.includes(ext)) return "image";
        if (videoExts.includes(ext)) return "video";
        if (audioExts.includes(ext)) return "audio";
        return "other";
      };

      const simplifiedFileType = getFileType(file.name);

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("user_files")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user_files").getPublicUrl(filePath);

      // Insert file metadata in Supabase table
      const { error: insertError } = await supabase.from("files").insert([
        {
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_type: simplifiedFileType, // store simplified type
          file_size: file.size,
          url: publicUrl,
        },
      ]);
      if (insertError) throw insertError;

      return {
        fileName: file.name,
        filePath,
        publicUrl,
        fileType: simplifiedFileType,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isLoggedIn: false,
    isAccountVerified: false,
    status: "idle",
    uploadStatus: "idle",
    error: null,
    email: "",
    isEmailSent: false,
    otp: null,
  },
  reducers: {
    clearAuthStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    setOtp: (state, action) => {
      state.otp = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        toast.success(action.payload.message);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isLoggedIn = true;
        state.user = action.payload.user;
        toast.success(action.payload.message);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = null;
        state.isLoggedIn = false;
        state.otp = null;
        toast.success(action.payload.message);
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch user
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.userData;
        state.isLoggedIn = true;
        state.isAccountVerified = !!action.payload.userData.isAccountVerified;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.isAccountVerified = false;
        state.isLoggedIn = false;
        state.error = action.payload;
      })

      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.uploadStatus = "loading";
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";
        toast.success(`File uploaded: ${action.payload.fileName}`);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploadStatus = "failed";
        if (action.payload) {
          toast.error(action.payload);
        } else {
          toast.error("Upload failed");
        }
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isEmailSent = true;
        toast.success(action.payload.message);
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.isEmailSent = false;
        state.error = action.payload;
      })

      // Reset new password
      .addCase(resetNewPassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetNewPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.otp = null;
        state.isEmailSent = false;
        state.email = "";
        toast.success(action.payload.message);
      })
      .addCase(resetNewPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearAuthStatus, setOtp, setEmail } = authSlice.actions;
export default authSlice.reducer;
