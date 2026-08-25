import {useState,useEffect} from "react"
import { useDispatch,useSelector } from "react-redux";
import { leaderboard } from "../slice/leaderboardSlice";
import { useNavigate } from "react-router-dom";

export default function LeaderboardPage(){
    const [page,setPage]=useState(1);
    const limit=15;
    const dispatch=useDispatch();
    useEffect(()=>{
        dispatch(leaderboard({page,limit}))
    },[page,limit]);
    const navigate=useNavigate();
    const leaders=useSelector((state)=>state.leaderboard.leaderboard);
    const totalPages=useSelector((state)=>state.leaderboard.totalPages)
    const isLoading=useSelector((state)=>state.leaderboard.isLoading);
    const isError=useSelector((state)=>state.leaderboard.isError)

    return(
        <div className="min-h-screen bg-slate-950 px-4 py-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-semibold text-slate-100 mb-6">Leaderboard</h1>

                {isLoading&&(
                    <div className="flex flex-col items-center gap-4 py-16">
                        <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="text-slate-400 text-sm">Loading leaderboard…</div>
                    </div>
                )}

                {isError&&(
                    <div className="text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-4 py-3">
                        Some Error Occured
                    </div>
                )}

                {!isLoading&&!isError&&(
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-[3rem_1fr_5rem_4rem_4rem_5rem] gap-2 px-5 py-3 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800">
                            <span>Rank</span>
                            <span>Name</span>
                            <span className="text-right">Rating</span>
                            <span className="text-right">Wins</span>
                            <span className="text-right">Losses</span>
                            <span className="text-right">Matches</span>
                        </div>

                        {leaders.map((leader,key)=>(
                            <div
                                key={key}
                                onClick={()=>navigate(`/profile/${leader.userId}`)}
                                className="grid grid-cols-[3rem_1fr_5rem_4rem_4rem_5rem] gap-2 px-5 py-3 items-center border-b border-slate-800 last:border-b-0 hover:bg-slate-800/60 cursor-pointer transition-colors"
                            >
                                <span className="text-slate-500 font-medium">#{leader.rank}</span>
                                <span className="text-slate-100 font-medium truncate">{leader.name}</span>
                                <span className="text-indigo-400 text-right">{leader.rating}</span>
                                <span className="text-green-400 text-right">{leader.wins}</span>
                                <span className="text-red-400 text-right">{leader.losses}</span>
                                <span className="text-slate-400 text-right">{leader.matchesPlayed}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-center gap-4 mt-6">
                    {page>1&&(
                        <button onClick={()=>setPage(page-1)} className="text-sm text-slate-300 border border-slate-700 rounded-lg px-4 py-2 hover:bg-slate-800 transition-colors">
                            Prev
                        </button>
                    )}
                    <span className="text-sm text-slate-500">{page} / {totalPages}</span>
                    {page<totalPages&&(
                        <button onClick={()=>setPage(page+1)} className="text-sm text-slate-300 border border-slate-700 rounded-lg px-4 py-2 hover:bg-slate-800 transition-colors">
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    )


}