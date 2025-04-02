import { createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import { collection,getFirestore,query, orderBy,getDocs } from "firebase/firestore";

const dataBase = getFirestore();
const colRef = collection(dataBase,"categories");


const categoriesSlice2 = createSlice({
    name: 'categories2',
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
    "categories2/getCats2",
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
        const categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),  // Spreading the fields of doc.data() into the object
        }));
        
        
        return categories;  // Return the items as the result of the async operation
      } catch (error) {
        // Handle errors and reject with error message
        return rejectWithValue(error.message);
      }
    }
  );

export default categoriesSlice2.reducer;