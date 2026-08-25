import {createSlice,createAsyncThunk} from  '@reduxjs/toolkit'
import API from "../api/axiosInstance"

const initialState={
    username:null,
    rating:null,
    matchesPlayed:null,
    wins:null,
    loss:null,
    isLoading:false,
    isError:false
}

export const profile=createAsyncThunk("./profile",async (userId,thunkAPI)=>{
   try{

    const data=await API.get(`/user/${userId}`);
    return data.data;

   }catch(err){
        return thunkAPI.rejectWithValue(err.response?.data||"could not fetch data");
   }
})

export const profileSlice=createSlice({
    name:"profile",
    initialState,

    extraReducers:(builder)=>{
        builder
        .addCase(profile.pending,(state,action)=>{
            state.isLoading=true;
            state.isError=false;
            state.username=null;
            state.rating=null;
            state.matchesPlayed=null;
            state.loss=null;
            state.wins=null;
        })
        .addCase(profile.fulfilled,(state,action)=>{
            state.username=action.payload.username;
            state.rating=action.payload.rating;
            state.matchesPlayed=action.payload.matchesPlayed;
            state.loss=action.payload.losses;
            state.wins=action.payload.wins;
            state.isLoading=false;
            state.isError=false
        })
        .addCase(profile.rejected,(state,action)=>{
            state.isError=true;
            state.isLoading=false;
        })
    }
})

export default profileSlice.reducer;