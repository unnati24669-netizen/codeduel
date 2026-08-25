import {RouterProvider,Route,createRoutesFromElements,createBrowserRouter,Navigate} from "react-router-dom"
import {useSelector,useDispatch} from "react-redux"

import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";
import LeaderBoard from "./pages/leaderboard";
import WaitingRoom from "./pages/waiting";
import {MatchRoom} from "./pages/matchroom";
import MatchResult from "./pages/matchresult";
import Profile from "./pages/profile";
import {store} from "./store/store"
import Layout from "./layout"
import { Provider } from "react-redux";
import {useEffect,useState} from "react";
import {jwtDecode} from "jwt-decode"
import {setUser} from "./slice/authSlice"
import MatchLayout from "./matchLayout"

function ProtectedRoute({children}){
  const token=useSelector((state)=>state.auth.token);
  return (token?children:<Navigate to="/login"/>)

}

function MatchFound({children}){
  const match=useSelector((state)=>state.match.matchId);
  return(match?children:<Navigate to="/match"/>)
}



const router=createBrowserRouter(
   createRoutesFromElements(
    <>
    <Route path="/login" element={<Login/>}/>
    <Route path="/signup" element={<Signup/>}/>
    <Route path="/" element={<ProtectedRoute ><Layout/></ProtectedRoute>}>
    <Route index element={<Home/>}/>
    <Route path="leaderboard" element={<LeaderBoard/>}/>
    <Route path="profile/:userId" element={<Profile/>}/>
    
    <Route path="/match" element={<WaitingRoom/>}/>
    
    
    
   
    
   
    

    </Route>
     <Route element={<ProtectedRoute><MatchLayout/></ProtectedRoute>}>
    <Route path="/match/room"  element={<MatchFound ><MatchRoom/></MatchFound>}/>
    <Route path="/match/result" element={<MatchResult/>}/>
    </Route>
    
  
    
    </>
   )
)

export default function App(){
       
  return (
    <div>
             <Provider store={store}><Child/></Provider>
             
    </div>

  


)

}





function Child(){
   const dispatch=useDispatch();
   const [authChecked,setAuthChecked]=useState(false);
        useEffect(()=>{
      
      const token=localStorage.getItem("token")
      if(token){
        const {id:userId,role}=jwtDecode(token);
        dispatch(setUser({userId,token}));


      }
      setAuthChecked(true);
      
},[])
if(!authChecked){
  return null
}
return (
  <div>
    <RouterProvider router={router}/>
  </div>
)

}