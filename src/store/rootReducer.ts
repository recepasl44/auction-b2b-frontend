import { combineReducers } from '@reduxjs/toolkit';
// import authReducer from '../slices/auth';  // Adım 2.3’te oluşturduktan sonra ekleyeceğiz
// import auctionsReducer from '../slices/auctions';
// vs.

const rootReducer = combineReducers({
  // auth: authReducer,
  // auctions: auctionsReducer,
  // ...
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
