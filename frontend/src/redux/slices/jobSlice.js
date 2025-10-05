import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs: (state, action) => {
      state.jobs = action.payload;
    },
    setCurrentJob: (state, action) => {
      state.currentJob = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearJobs: (state) => {
      state.jobs = [];
      state.currentJob = null;
    }
  }
});

export const { setJobs, setCurrentJob, setLoading, setError, clearJobs } = jobSlice.actions;
export default jobSlice.reducer;
