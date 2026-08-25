import {useForm} from "react-hook-form";
import {useDispatch} from "react-redux";
import {login} from "../slice/authSlice"
import {useNavigate} from "react-router-dom"
import {useState} from "react"

export default function Login(){
    const {handleSubmit,formState:{errors},register}=useForm();
    const dispatch=useDispatch();
    const [apiError,setApiError]=useState(null);
    const navigate=useNavigate()
   
    async function onSubmit({email,password}){
        try{
              await dispatch(login({email,password})).unwrap();
              navigate("/")
        }catch(err){
            setApiError(err);
        }
      
        
    }

    return(
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5">
                <h1 className="text-2xl font-semibold text-slate-100 text-center mb-2">Log in to CodeDuel</h1>

                {apiError&&(<p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">{apiError.message}</p>)}
                
               <div className="space-y-1">
                <input type="text"
                placeholder="Enter your email"
                className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                {...register("email",{
                    required:"this field is required"
                })}/>
                 {errors.email&&<p className="text-sm text-red-400">{errors.email.message}</p>}

                </div> 
                <div className="space-y-1">
                    <input type="password"
                    placeholder="enter your password"
                    className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    {...register("password",{
                        required:"this field is required"
                    })}/>
                    {errors.password&&<p className="text-sm text-red-400">{errors.password.message}</p>}
                </div>
                <div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-2.5 transition-colors">
                        Log in
                    </button>
                </div>
               
            </form>
        </div>
    )
}