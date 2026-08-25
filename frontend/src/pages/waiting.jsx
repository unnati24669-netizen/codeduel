import {useEffect} from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {matching,unmatch} from "../socketHandler"
export default function WaitingRoom(){
    const dispatch=useDispatch();
    const navigate=useNavigate();

    useEffect(()=>{
          const io=matching(dispatch)

          return()=>{
              unmatch(io);
          }
    },[]
       
    )

    
    
    const matchId=useSelector((state)=>state.match.matchId)
    useEffect(()=>{
        if(matchId){
           navigate("/match/room")
        }
        
    }
     ,[matchId])

     return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
       
  {!matchId && (
    <div className="flex flex-col items-center gap-6">
        <div className="w-14 h-14 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="text-slate-300 text-lg font-medium">Finding an opponent…</div>
        <div className="text-slate-500 text-sm">Hang tight, this usually takes a few seconds</div>
    </div>
  )}

    </div>
)
}
