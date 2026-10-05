const {S3Client}=require("@aws-sdk/client-s3")
console.log(typeof process.env.accessKeyId, typeof process.env.secretAccessKey);

const s3client=new S3Client({
    region:process.env.AWS_REGION,
    credentials:{
        accessKeyId:process.env.accessKeyId,
        secretAccessKey:process.env.secretAccessKey
    }
})

module.exports={s3client}