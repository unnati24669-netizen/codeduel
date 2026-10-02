import API from "./axiosInstance";

export async function geminiAPIreview({code,question,language}){
        const res= await API.post("/gemini/review",{code,question,language});
        return res.data.success;

}

export async function geminichatContinuation({chat,history}){
  const res=await API.post("/gemini/chatcontinuation",{chat,history});
  return res.data.success;
}




