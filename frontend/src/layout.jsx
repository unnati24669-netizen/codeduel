import { Outlet } from "react-router-dom";
import NavBar from "./components/navBar";

export default function Layout(){
    return(
        <div>
            <NavBar/>

            <Outlet/>
        </div>
    )
}