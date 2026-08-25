import {Link,NavLink} from "react-router-dom"
import { useSelector } from "react-redux"

const activeStyle=(({isActive})=>isActive?"text-indigo-400 font-semibold":"text-slate-400 hover:text-slate-200")//navlink props receives the an object {isActive, isPending, isTransitioning} so you need to destructure it

export default function NavBar(){
    const userId=useSelector((state)=>state.auth.user._id)
    const profileLink=userId?`/profile/${userId}`:"/"
    return(
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <span className="text-slate-100 font-semibold text-lg">CodeDuel</span>
            <div className="flex items-center gap-6 text-sm transition-colors">
                <NavLink className={activeStyle} to="/" >Home</NavLink>
                <NavLink className={activeStyle} to={profileLink}>Profile</NavLink>
                <NavLink className={activeStyle} to="/leaderboard">LeaderBoard</NavLink>
                <NavLink className={activeStyle} to="/match" >Play Match</NavLink>
            </div>
        </div>
    )
}
