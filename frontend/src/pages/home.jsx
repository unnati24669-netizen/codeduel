import { useNavigate } from "react-router-dom"

export default function Home(){
    const navigate=useNavigate()
    return(
        <>
        
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">

            {/* glow backdrop */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* floating code symbols */}
            <div className="absolute top-20 left-16 text-6xl text-slate-800 font-mono select-none animate-[float_6s_ease-in-out_infinite]">{'{'}</div>
            <div className="absolute bottom-24 right-20 text-6xl text-slate-800 font-mono select-none animate-[float_7s_ease-in-out_infinite_0.5s]">{'}'}</div>
            <div className="absolute top-32 right-32 text-4xl text-slate-800 font-mono select-none animate-[float_5s_ease-in-out_infinite_1s]">{'</>'}</div>
            <div className="absolute bottom-32 left-24 text-4xl text-slate-800 font-mono select-none animate-[float_8s_ease-in-out_infinite_0.3s]">{'</>'}</div>

            <div className="relative z-10 text-center max-w-lg">
                <div className="inline-block text-xs font-medium text-indigo-400 bg-indigo-950/50 border border-indigo-900 px-3 py-1 rounded-full mb-6">
                    1v1 Real-time Coding Battles
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-4 leading-tight">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CodeDuel</span>
                </h1>

                <p className="text-slate-400 text-lg mb-10">
                    Are you ready for a battle?
                </p>

                <button
                    onClick={()=>navigate("/match")}
                    className="relative bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-8 py-3.5 text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-600/30"
                >
                    <span className="absolute inset-0 rounded-xl bg-indigo-500 animate-ping opacity-20"></span>
                    <span className="relative">Play Match</span>
                </button>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-16px); }
                }
            `}</style>
        </div>
        </>
    
    )
}