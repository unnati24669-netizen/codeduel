import {RouterProvider,Router,createRoutesFromElements,createBrowserRouter,Navigate} from "react-router-dom"
import {useSelector} from "react-redux"

import {Login} from "./pages/login";
import {Signup} from "./pages/signup";
import {Home} from "./pages/home";
import {LeaderBoard} from "./pages/leaderboard";
import {WaitingRoom} from "./pages/waiting";
import {MatchRoom} from "./pages/matchroom";
import {MatchResult} from "./pages/matchresult";
import {Profile} from "./pages/profile";
import {store} from "./store/store"
import {Layout} from "./layout"
import { Provider } from "react-redux";

function ProtectedRoute({children}){
  const token=useSelector((state)=>state.auth.token);
  return (token?children:<Navigate to="/login"/>)

}

function MatchFound({children}){
  const match=useSelector((state)=>state.match);
  return(match?children:<Navigate to="/waitingroom"/>)
}

const router=createBrowserRouter(
   createRoutesFromElements(
    <>
    <Route path="/login" element={<Login/>}/>
    <Route path="/signup" element={<Signup/>}/>
    <Route path="/" element={<ProtectedRoute ><Layout/></ProtectedRoute>}>
    <Route index element={<Home/>}/>
    <Route path="leaderboard" element={<LeaderBoard/>}/>
    <Route path="profile" element={<Profile/>}/>
    
    <Route path="match" element={<WaitingRoom/>}>
    
    <Route path="room" element={<MatchFound ><MatchRoom/></MatchFound>}/>
    <Route path="result" element={<MatchResult/>}/>
    </Route>

    

    </Route>
    
  
    
    </>
   )
)

function App(){
  return (
  <Provider store={store}><RouterProvider router={router}/></Provider>

)

}





