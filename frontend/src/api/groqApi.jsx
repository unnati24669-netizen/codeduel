import API from "./axiosInstance";

export async function groqAPIreview({code,question,language}){
        const res= await API.post("/groq/review",{code,question,language});
        return res.data;

}

export async function groqchatContinuation({chat,history}){
  const res=await API.post("/groq/chatcontinuation",{chat,history});
  return res.data
}




