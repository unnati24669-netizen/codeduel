import {useForm} from "react-hook-form";
import{useDispatch} from "react-redux"
import {useNavigate} from "react-router-dom"
import {signup} from "../slice/authSlice"
import {useState} from "react"

export default function Signup(){
    const {register,handleSubmit,formState:{errors}}=useForm();

    const dispatch=useDispatch();
    const navigate=useNavigate()
    const [apiError,setApiError]=useState(null);
     async function onSubmit({username,email,firstName,lastName,password}){
    try{
       
       await dispatch(signup({username,email,firstName,lastName,password})).unwrap()
        navigate("/login")

    

    }catch(err){
       setApiError(err);
    }
}
    
    


    return(
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
                <h1 className="text-2xl font-semibold text-slate-100 text-center mb-2">Create your account</h1>

                {apiError&&(<p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">{apiError.message}</p>)}
                
                <div className="space-y-1">
                 <input type="text"
                placeholder="Enter a unique username"
                className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                {...register("username",{
                    required:"this field is required"
                })}/>
                {errors.username&&(<p className="text-sm text-red-400">{errors.username.message}</p>)}
                </div>

                <div className="space-y-1">
                    <input type="text"
                    placeholder="Enter your email"
                    className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    {...register("email",{
                        required:"this field is required"
                    })}/>
                    {errors.email&&(<p className="text-sm text-red-400">{errors.email.message}</p>)}
                </div>

                 <div className="space-y-1">
                    <input type="text"
                    placeholder="Enter your first name"
                    className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    {...register("firstName",{
                        required:"this field is required"
                    })}/>
                    {errors.firstName&&(<p className="text-sm text-red-400">{errors.firstName.message}</p>)}
                </div>

                 <div className="space-y-1">
                    <input type="text"
                    placeholder="Enter your last Name"
                    className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    {...register("lastName",{
                        required:"this field is required"
                    })}/>
                    {errors.lastName&&(<p className="text-sm text-red-400">{errors.lastName.message}</p>)}
                </div>

                 <div className="space-y-1">
                    <input type="password"
                    placeholder="Enter your password"
                    className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    {...register("password",{
                        required:"this field is required"
                    })}/>
                    {errors.password&&(<p className="text-sm text-red-400">{errors.password.message}</p>)}
                </div>
                <div className="pt-2">
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-2.5 transition-colors">
                        Sign up
                    </button>
                </div>
                


        </form>
        </div>
    )

    

    
    
}