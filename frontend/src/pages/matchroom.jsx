import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { ioCreation } from "../socket";
import { listenMatchEnd ,removeMatchEnd} from "../socketHandler";
import { useDispatch, useSelector } from "react-redux";
import Editor from '@monaco-editor/react';
import { codeSubmit } from "../slice/matchSlice";


export const languages=[{languageId:51,name:"C#",monacoId:"csharp"},
    {languageId:62,name:"Java",monacoId:"java"},
    {languageId:63,name:"JavaScript",monacoId:"javascript"},
    {languageId:71,name:"Python 3",monacoId:"python"},
    {languageId:60,name:"Go",monacoId:"go"},
    {languageId:73,name:"Rust",monacoId:"rust"},
    {languageId:74,name:"TypeScript",monacoId:"typescript"},
    {languageId:68,name:"PHP",monacoId:"php"},
    {languageId:72,name:"Ruby",monacoId:"ruby"},
    {languageId:54,name:"C++",monacoId:"cpp"},
    {languageId:50,name:"C",monacoId:"c"},
    ]


function Question(){
    const question=useSelector((state)=>state.match.question);

    const difficultyColor=(difficulty)=>{
        if(difficulty==="Easy")return "bg-green-950/50 text-green-400 border-green-900";
        if(difficulty==="Medium")return "bg-amber-950/50 text-amber-400 border-amber-900";
        if(difficulty==="Hard")return "bg-red-950/50 text-red-400 border-red-900";
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
   
    return(
        <div className="h-full overflow-y-auto p-6 space-y-4">
            <div className="flex items-center gap-3">
                <span className="text-xl font-semibold text-slate-100">{question?.title}</span>
                {question?.difficulty&&(
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${difficultyColor(question.difficulty)}`}>{question.difficulty}</span>
                )}
            </div>

            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{question?.description}</div>

            <div className="space-y-2 pt-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Examples</p>
                {question?.testcases?.filter((testcase)=>!testcase.isHidden).map((testcase,index)=>(
                    <div key={index} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
                        <div className="text-slate-400"><span className="text-slate-500">Input: </span>{testcase.input}</div>
                        <div className="text-slate-400"><span className="text-slate-500">Output: </span>{testcase.output}</div>
                    </div>
                    ))}
            </div>

            {question?.tag&&(
                <div className="pt-2">
                    <span className="text-xs bg-indigo-950/50 text-indigo-400 border border-indigo-900 px-2.5 py-1 rounded-full">{question.tag}</span>
                </div>
            )}
        </div>
    )
}

function SelectLanguage({setLanguage}){
    return(
        <>
        <select
            onChange={(event)=>setLanguage(languages.find((language)=>(language.languageId===parseInt(event.target.value))))}
            className="bg-slate-800 text-slate-100 text-sm border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
            <option value="">Select a language</option>
            <optgroup>
                {languages.map((language,index)=>(
                     <option key={index} value={language.languageId}>{language.name}</option>
                ))}
            </optgroup>
        </select>
        
        
        </>
    )
}

export function MatchRoom(){
    const dispatch=useDispatch()
     const [language,setLanguage]=useState(null);
    const [code,setCode]=useState("");
    
    const playerId=useSelector((state)=>state.auth.user._id);
    const matchId=useSelector((state)=>state.match.matchId);
    const isLoadingSubmit=useSelector((state)=>state.match.isLoadingSubmit)

    const players=useSelector((state)=>state.match.players)

    const requiredPlayer= players.find((player)=>player.playerId===playerId)

    
    

    
    const matchStatus=useSelector((state)=>state.match.matchStatus);
    const navigate=useNavigate();

    useEffect(()=>{
        const io=ioCreation();
        listenMatchEnd(io,dispatch);
        return()=>{
            removeMatchEnd(io);
        }


    },[])
   
    useEffect(()=>{
        if(matchStatus==="completed"||matchStatus==="abandon"){
            navigate("/match/result");
        }
    },[matchStatus,navigate]);
    const disabledReason=(()=>{
        if(code==="")return "you have not written anything"
        else if(language===null)return "you have not selected any language"
        else if(isLoadingSubmit)return "you have already submitted,wait for response"
        else if(matchStatus==="completed"||matchStatus==="abandon")return "match is already over"
        else return null;
    })();

     const isLoading=useSelector((state)=>state.match.isLoadingQuestion);
      function handleSubmit(){

        dispatch(codeSubmit({code,languageId:language.languageId,matchId,playerId}))
      }
     
    return (
        <div className="h-screen bg-slate-950 flex flex-col md:flex-row">
            <div className="md:w-2/5 md:border-r border-slate-800 border-b md:border-b-0">
                {!isLoading && (<Question/>)}
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-800">
                    <SelectLanguage setLanguage={setLanguage}/>
                    {requiredPlayer&&(
                        <span className="text-sm text-slate-400">{requiredPlayer.status}</span>
                    )}
                </div>

                <div className="flex-1 min-h-0">
                   {language ? (
                        <Editor
                            value={code}
                            language={language.monacoId}
                            onChange={(newcode)=>{setCode(newcode)}}
                            theme="vs-dark"
                            options={{fontSize:14, minimap:{enabled:false}}}
                        />
                   ) : (
                        <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                            Select a language to start coding
                        </div>
                   )}
                </div>

                <div className="px-4 py-3 border-t border-slate-800 space-y-2">
                    <button
                        disabled={!!disabledReason}
                        onClick={handleSubmit}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 transition-colors"
                    >
                        Submit
                    </button>
                    {disabledReason&&(<p className="text-xs text-slate-500 text-center">{disabledReason}</p>)}
                </div>
            </div>
        </div>
    )

}