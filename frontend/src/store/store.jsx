import {configureStore} from "@reduxjs/toolkit"
import authReducer from "../slice/authSlice"
import matchReducer from "../slice/matchSlice"
import profileReducer from "../slice/profileSlice"
import leaderboardReducer from "../slice/leaderboardSlice"

export  const store=configureStore({
    reducer:{auth:authReducer,match:matchReducer,profile:profileReducer,leaderboard:leaderboardReducer}
})