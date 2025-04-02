import { configureStore } from "@reduxjs/toolkit";
import itemsReducer from "./items/itemsSlice.js";
import categoriesReducer from "./categories/categoriesSlice.js";
import categoriesReducer2 from "./categories/categoriesSlice2.js"

export const store = configureStore({
    reducer:{
        items: itemsReducer,
        categories: categoriesReducer,
        categories2: categoriesReducer2
    }
});


export const RootState = store.getState();
export const AppDispatch = store.dispatch;