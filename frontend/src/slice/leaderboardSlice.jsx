import {createSlice,createAsyncThunk} from  '@reduxjs/toolkit'
import API from "../api/axiosInstance"

const initialState={
    leaderboard:[],
    totalUser:null,
    totalPages:null,
    isLoading:false,
    isError:false
}

export const leaderboard=createAsyncThunk("./leaderboard",async({page,limit},thunkAPI)=>{
   try{
    const res=await API.get("/leaderboard",{params:{page,limit}});
    return res.data;

   }catch(err){
      return thunkAPI.rejectWithValue(err.response?.data||"could not fetch data");
   }
})

export const leaderboardSlice=createSlice({
    name:"leaderboard",
    initialState,

    extraReducers:(builder)=>{
        builder
        .addCase(leaderboard.pending,(state,action)=>{
            state.isLoading=true;
            state.isError=false;
        })
        .addCase(leaderboard.fulfilled,(state,action)=>{
            state.leaderboard=action.payload.leaderboard;
            state.totalPages=action.payload.totalPages;
            state.totalUser=action.payload.totalUser;
            state.isLoading=false;
            state.isError=false;
        })
        .addCase(leaderboard.rejected,(state,action)=>{
            state.isLoading=false;
            state.isError=true;
        })
    }

})
export default leaderboardSlice.reducer;