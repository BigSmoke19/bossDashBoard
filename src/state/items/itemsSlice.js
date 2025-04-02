// itemsSlice.js

import { dataBase } from "../../configure.js"; // Import Firestore instance
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, getFirestore,where, onSnapshot, query, orderBy, limit } from "firebase/firestore";




const colRef = collection(dataBase, "items");

// Redux Slice
const itemsSlice = createSlice({
  name: "data",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(getItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// Create async thunk to get items with limit and order
export const getItems = createAsyncThunk(
  "items/getItems",
  async (_, { rejectWithValue }) => {
    try {
      return new Promise((resolve, reject) => {
        // Create a query with orderBy and limit
        const q = query(
          colRef,
          //where("category","==","Drinks"),
          orderBy("name"),  // You can change this to another field like "price" if needed
          //limit(1)          // Limit the number of items to 10 (or any number you prefer)
        );

        // Set up the real-time listener with onSnapshot
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            let data = [];
            snapshot.docs.forEach((doc) => {
              data.push({
                id: doc.id,
                name: doc.data().name,
                category: doc.data().category,
                description: doc.data().description,
                descriptionA: doc.data().descriptionA,
                price: doc.data().price,
                
                image: doc.data().image,
                addsChecked: false,
                checkedSubs : [],
                ingredients: doc.data().ingredients,
                subItems: (doc.data().subItems)?doc.data().subItems:[],
              });
            });
            resolve(data); // Resolve with the updated data
          },
          (error) => {
            reject(rejectWithValue(error.message)); // Reject in case of an error
          }
        );

        // Return unsubscribe function to clean up the listener when needed
        return () => unsubscribe();
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



export default itemsSlice.reducer;
