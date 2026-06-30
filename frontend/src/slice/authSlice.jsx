import{createSlice,createAsyncThunk} from "@reduxjs/toolkit"
import authapi from "../api/axiosInstance"
const initialstate={
    token:localStorage.getItem("token"),
    user:{},
    isLoading:false,
    isError:false
}

const signup=createAsyncThunk("/signup",async({username,email,firstName,lastName,password},thunkAPI)=>{
    try{
       const res=await authapi.post("/user/signup",{
         username,email,firstName,lastName,password
    })

    return res.data;
    }catch(err){
        return thunkAPI.rejectWithValue(err.response?.data||"could not sign you up")
    }
    
   
})
  

const login=createAsyncThunk("/login",async({email,password},thunkAPI)=>{
    try{
       const res=await authapi.post("/user/login",{
        email,password
    })

    return res.data;
    }catch(err){
        return thunkAPI.rejectWithValue(err.response?.data||"could not log you in")
    }
    
   
})


const adminUpdate=createAsyncThunk("/admin",async(id,thunkAPI)=>{
   try{
           const res=await authapi.put(`/user/${id}`)
           return res.data;

   }catch(err){
             return thunkAPI.rejectWithValue(err.response?.data||"could not make you an admin")
   }
})

export const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        logout:(state,action)=>{
            localStorage.removeItem("token");
            state.token=null;
            state.isError=false;
        }
    },

    extraReducers:(builder)=>{
        builder
        .addCase(signup.pending,(state,action)=>{
            state.isLoading=true;
            state.isError=false;
        })
        .addCase(signup.fulfilled,(state,pending)=>{
            state.isLoading=false;
            state.isError=false;
        })
        .addCase(signup.rejected,(state,action)=>{
            state.isLoading=false;
            state.isError=true;
        })

        .addCase(login.pending,(state,action)=>{
            state.isLoading=true;
            state.isError=false;
        })
        .addCase(login.fulfilled,(state,action)=>{
            state.token=action.payload.token
            state.isLoading=false;
            state.isError=false;
        })
        .addCase(login.rejected,(state,action)=>{
            state.isError=true;
            state.isLoading=false;
        })

        .addCase(adminUpdate.pending,(state,action)=>{
            state.isLoading=true;
            state.isError=false;
        })
        .addCase(adminUpdate.fulfilled,(state,action)=>{
                state.user.role=action.payload.role;
                localStorage.setItem("token",action.payload.token);
                state.isLoading=false;
                state.isError=false;
        })
        .addCase(adminUpdate.rejected,(state,action)=>{
            state.isError=true;
            state.isLoading=false;
        })

    }
}

)


export default authSlice.reducer;