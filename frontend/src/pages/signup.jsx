import {useForm} from "react-hook-form";
import{useSelector,useDispatch} from "@reduxjs/toolkit"
import {useNavigate} from "react-router-dom"
import {signup} from "../slice/authSlice"

export default function Signup(){
    const {register,handleSubmit,formState:{errors}}=useForm();

    const dispatch=useDispatch();
    const navigate=useNavigate()
     async function onSubmit({username,email,firstName,lastName,password}){
    try{
       
       await dispatch(signup({username,email,firstName,lastName,password}))
        navigate("/login")

    

    }catch(err){
       console.log(err);
    }
}
    
    


    return(
        <form onSubmit={handleSubmit(onSubmit)}>
            {errors&&(<p>{errors.message}</p>)}
            <div>
             <input type="text"
            placeholder="Enter a unique username"
            {...register("username",{
                required:"this field is required"
            })}/>
            {errors.username&&(<p>{errors.username.message}</p>)}
            </div>

            <div>
                <input type="text"
                placeholder="Enter your email"
                {...register("email",{
                    required:"this field is required"
                })}/>
                {errors.email&&(<p>{errors.email.message}</p>)}
            </div>

             <div>
                <input type="text"
                placeholder="Enter your first name"
                {...register("firstName",{
                    required:"this field is required"
                })}/>
                {errors.firstName&&(<p>{errors.firstName.message}</p>)}
            </div>

             <div>
                <input type="text"
                placeholder="Enter your last Name"
                {...register("lastName",{
                    required:"this field is required"
                })}/>
                {errors.lastName&&(<p>{errors.lastName.message}</p>)}
            </div>

             <div>
                <input type="password"
                placeholder="Enter your password"
                {...register("password",{
                    required:"this field is required"
                })}/>
                {errors.password&&(<p>{errors.password.message}</p>)}
            </div>
            <div>
                <button type="submit" >signup</button>
            </div>
            


    </form>
    )

    

    
    
}