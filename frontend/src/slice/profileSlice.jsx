import {createSlice,createAsyncThunk} from  '@reduxjs/toolkit'
import API from "../api/axiosInstance"

const initialState={
    username:null,
    rating:null,
    matchesPlayed:null,
    wins:null,
    loss:null,
    playerHistory:[],
    activityHistory:[],
    avatarUrl:null,
    isLoading:false,
    isError:false,
    isAvatarUploading:false,
    isAvatarError:false
}

export const profile=createAsyncThunk("./profile",async (userId,thunkAPI)=>{
   try{

    const data=await API.get(`/user/${userId}`);
    return data.data;

   }catch(err){
        return thunkAPI.rejectWithValue(err.response?.data||"could not fetch data");
   }
})

export const uploadAvatar= createAsyncThunk("./uploadAvatar",async({id,formData},thunkAPI)=>{
    try{

      const res=await API.put(`/user/avatar/${id}`,formData)
      return res.data

    }catch(err){
      console.log(err);
      return thunkAPI.rejectWithValue(err.response?.data||"could not upload Avatar")
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
            state.playerHistory=[];
            state.activityHistory=[];
            state.loss=null;
            state.wins=null;
            state.avatarUrl=null
        })
        .addCase(profile.fulfilled,(state,action)=>{
            state.username=action.payload.username;
            state.rating=action.payload.rating;
            state.matchesPlayed=action.payload.matchesPlayed;
            state.loss=action.payload.losses;
            state.wins=action.payload.wins;
            state.playerHistory=action.payload.playerHistory;
            state.activityHistory=action.payload.activityHistory
            state.isLoading=false;
            state.isError=false
            state.avatarUrl=action.payload.avatarUrl
        })
        .addCase(profile.rejected,(state,action)=>{
            state.isError=true;
            state.isLoading=false;
        })

        .addCase(uploadAvatar.pending,(state,action)=>{
            state.isAvatarError=false;
            state.isAvatarUploading=true;
        })

        .addCase(uploadAvatar.fulfilled,(state,action)=>{
            state.avatarUrl=action.payload.avatarUrl;
            state.isAvatarUploading=false;
            state.isAvatarError=false;
        })

        .addCase(uploadAvatar.rejected,(state,action)=>{
            state.isAvatarUploading=false;
            state.isAvatarError=true;
        })
    }
})

export default profileSlice.reducer;
