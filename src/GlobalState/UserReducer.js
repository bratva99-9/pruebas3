import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  isLogged: false,
  balance: '0.00 WAX',
  sexy: '0.00 SEXY'
};

const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPlayerData: (state, action) => ({
      ...state,
      ...action.payload
    }),
    setPlayerLogout: () => initialState,
    setPlayerBalance: (state, action) => ({
      ...state,
      balance: action.payload
    }),
    setPlayerSexy: (state, action) => ({
      ...state,
      sexy: action.payload
    })
  }
});

export const {
  setPlayerData,
  setPlayerLogout,
  setPlayerBalance,
  setPlayerSexy
} = user.actions;

export default user.reducer;
