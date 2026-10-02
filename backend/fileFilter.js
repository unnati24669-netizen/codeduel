const allowedList=["image/jpeg","image/png","image/jpg","image/webp"]
const fileFilter=(req,file,cb)=>{
    if(allowedList.includes(file.mimetype)){
        cb(null,true)
    }
    else{
        cb(new Error("Invalid file type"),false)
    }

}