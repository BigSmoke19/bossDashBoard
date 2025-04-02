import { createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import { initializeApp } from "firebase/app";
import { collection,getFirestore,query, orderBy,getDocs } from "firebase/firestore";

const firebaseConfig = {
  
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

const dataBase = getFirestore();
const colRef = collection(dataBase,"categories");


const categoriesSlice = createSlice({
    name: 'categories',
    initialState: {
      categories: [],
      status: 'idle',
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(getCats.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(getCats.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.categories = action.payload;
        })
        .addCase(getCats.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        })
    },
  });

  export const getCats = createAsyncThunk(
    "categories/getCats",
    async (_, { rejectWithValue }) => {
      try {
        // Query to fetch items, order them by price, and limit the results to 20 for fast loading
        const q = query(
          colRef,
            orderBy("priority")
        );
  
        // Fetch documents from Firestore
        const snapshot = await getDocs(q);
  
        // Map through documents and transform the data to only include the necessary fields
        const categories = snapshot.docs.map(doc => 
          doc.data().category,

          // Add any other necessary fields
        );
        
        return categories;  // Return the items as the result of the async operation
      } catch (error) {
        // Handle errors and reject with error message
        return rejectWithValue(error.message);
      }
    }
  );

export default categoriesSlice.reducer;