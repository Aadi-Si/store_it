import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/superbase";

// ✅ Fetch all user files
export const fetchFiles = createAsyncThunk(
  "files/fetchFiles",
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const filesSlice = createSlice({
  name: "files",
  initialState: {
    files: [],
    status: "idle",
    error: null,
    category:'dashboard',
  },
  reducers: {
    setCategory:(state,action)=>{
      state.category = action.payload
    },
    clearFilesError: (state) => {
      state.error = null;
    },
    updateFileName: (state, action) => {
      const { id, newName } = action.payload;
      const file = state.files.find((f) => f.id === id);
      if (file) {
        file.file_name = newName; // update the file name in Redux state
      }
    },
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    removeFile: (state, action) => {
      state.files = state.files.filter((file) => file.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.files = action.payload || [];
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearFilesError, updateFileName, setFiles, removeFile ,setCategory} =
  filesSlice.actions;
export default filesSlice.reducer;
