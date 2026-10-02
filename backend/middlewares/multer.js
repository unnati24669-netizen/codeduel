const multer=require("multer")

const fileFilter=require("../fileFilter")
const storage=multer.memoryStorage();

const upload=multer({storage:storage,
    fileFilter:fileFilter,
    limits:{fileSize:1024*1024*2}
})


module.exports=upload
