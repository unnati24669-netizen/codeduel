const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose=require('mongoose')
const Match=require("../../models/match")
const Question=require("../../models/question")
const {createSubmitQuestion}=require("../../controllers/matchcontroller")
const calculateElo=require("../../controllers/elo")
const User=require("../../models/user")
let mongod;
let matchId;
let QuestionId;
let player1;
let player2;
jest.mock("axios");
const axios=require("axios")




beforeAll(async()=>{
     mongod=await MongoMemoryServer.create();
    const mongoUri=mongod.getUri()
    await mongoose.connect(mongoUri).then(()=>{
        console.log("database connected")
    });
},300000)

afterAll(async()=>{
    await mongoose.disconnect();
    await mongod.stop();
})


beforeEach(async()=>{
    player1=await User.create({
    username:"player1",
    email:"player1@example.com",
    firstName:"player1",
    lastName:"player1",
    password:"password1",
    rating:1200,
    matchesPlayed:0,
    wins:0,
    losses:0,
    role:"user"
     

   })._id;
    player2=await User.create({
    username:"player2",
    email:"player2@example.com",
    firstName:"player2",
    lastName:"player2",
    password:"password2",
    rating:1200,
    matchesPlayed:0,
    wins:0,
    losses:0,
    role:"user"
   })._id;
   
   QuestionId=await Question.create({
    title:"print Hello World",
    description:"print hello world",
    tag:"easy",
    testcases:[{"input":"","output":"Hello World"}],
    timelimit:2

   })._id
   const doc=await Match.create({
    player1,
    player2,

    questionId:QuestionId,
    rating1:1200,
    rating2:1200,
    status:"ongoing"

   })

   matchId=doc._id;

   
})

//player1 submits correct solution first and win the match
test("Player1 submits correct solution first and wins the match", async () => {
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
                const req={body:
                    {code:"print('Hello World')",languageId:71,matchId:matchId,},
                    user:{_id:player1}
                };
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                axios.post.mockResolvedValue({
                    data:{
                        token:"testtoken"
                    }
                })
                axios.get.mockResolvedValue({
                    data:{
                        status:{id:3}
                    }
                })
                const handler = createSubmitQuestion(io);
                await handler(req, res);
                expect(res.json).toHaveBeenCalledWith({message:"correct solution"});
                
                const updatedMatch=await Match.findById(matchId);
                const updatePlayer1=await User.findById(player1);
                const updatedPlayer2=await User.findById(player2);
                expect(updatedMatch.status).toBe("completed")
                expect(updatedMatch.result).toBe("player1");
                expect(updatedPlayer1.wins).toBe(1);
                expect(updatePlayer2.losses).toBe(1);
                expect(updatedPlayer1.rating).not.toBe(1200);


                



})

//when the match is already over and a player try to submit the code

test("when the match is over and player try to submit the code",async()=>{
    const matchUpated=await Match.findByIdAndUpdate(matchId,{status:"completed"})
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
                const req={body:
                    {code:"print('Hello World')",languageId:71,matchId:matchId,},
                    user:{_id:player1}
                };
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                axios.post.mockResolvedValue({
                    data:{
                        token:"testtoken"
                    }
                })
                axios.get.mockResolvedValue({
                    data:{
                        status:{id:3}
                    }
                })
                const handler = createSubmitQuestion(io);
                await handler(req, res);
                expect(res.json).toHaveBeenCalledWith({message:"match has already been over"});
                expect(res.status).toHaveBeenCalledWith(400);

})

//player 2 wins

test("Player2 submits correct solution first and wins the match", async () => {
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
                const req={body:
                    {code:"print('Hello World')",languageId:71,matchId:matchId,},
                    user:{_id:player2}
                };
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                axios.post.mockResolvedValue({
                    data:{
                        token:"testtoken"
                    }
                })
                axios.get.mockResolvedValue({
                    data:{
                        status:{id:3}
                    }
                })
                const handler = createSubmitQuestion(io);
                await handler(req, res);
                expect(res.json).toHaveBeenCalledWith({message:"correct solution"});
                
                const updatedMatch=await Match.findById(matchId);
                const updatePlayer1=await User.findById(player1);
                const updatedPlayer2=await User.findById(player2);
                expect(updatedMatch.status).toBe("completed")
                expect(updatedMatch.result).toBe("player2");
                expect(updatedPlayer1.losses).toBe(1);
                expect(updatePlayer2.wins).toBe(1);
                expect(updatedPlayer1.rating).not.toBe(1200);


                



})

//wrong solution

test("Player1 submits wrong solution", async () => {
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
                const req={body:
                    {code:"print('Hello World')",languageId:71,matchId:matchId,},
                    user:{_id:player1}
                };
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                axios.post.mockResolvedValue({
                    data:{
                        token:"testtoken"
                    }
                })
                axios.get.mockResolvedValue({
                    data:{
                        status:{id:2}
                    }
                })
                const handler = createSubmitQuestion(io);
                await handler(req, res);
                expect(res.json).toHaveBeenCalledWith({message:"wrong solution"});
                
                


                



})

//someone who is not the participant of the match submits;

test("someone who is not the player submits the code", async () => {
    const randomId=new mongoose.Types.ObjectId();
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
                const req={body:
                    {code:"print('Hello World')",languageId:71,matchId:matchId,},
                    user:{_id:randomId}
                };
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                axios.post.mockResolvedValue({
                    data:{
                        token:"testtoken"
                    }
                })
                axios.get.mockResolvedValue({
                    data:{
                        status:{id:3}
                    }
                })
                const handler = createSubmitQuestion(io);
                await handler(req, res);
                expect(res.json).toHaveBeenCalledWith({message:"invalid or missing user id"});
                expect(res.json).toHaveBeenCalledWith(401)
                
                


                



})

//code is missing

test("code is missing", async () => {
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
                const req={body:
                    {code:"print('Hello World')",languageId:71,matchId:matchId,},
                    user:{_id:player1}
                };
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                axios.post.mockResolvedValue({
                    data:{
                        token:"testtoken"
                    }
                })
                axios.get.mockResolvedValue({
                    data:{
                        status:{id:4}
                    }
                })
                const handler = createSubmitQuestion(io);
                await handler(req, res);
                expect(res.json).toHaveBeenCalledWith({message:"wrong solution"});
                
                


                



})

//someone who is not the participant of the match submits;

test("code is missing", async () => {
    
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
                const req={body:
                    {languageId:71,matchId:matchId,},
                    user:{_id:player1}
                };
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                axios.post.mockResolvedValue({
                    data:{
                        token:"testtoken"
                    }
                })
                axios.get.mockResolvedValue({
                    data:{
                        status:{id:3}
                    }
                })
                const handler = createSubmitQuestion(io);
                await handler(req, res);
                expect(res.json).toHaveBeenCalledWith({message:"code, languageId and matchId are required"});
                expect(res.json).toHaveBeenCalledWith(400)
                
                


                



})

//match not found

test("code is missing", async () => {
    const randomMatch=new mongoose.Types.ObjectId();
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    
                const req={body:
                    {code:"print(hello world)",languageId:71,matchId:randomMatch,},
                    user:{_id:player1}
                };
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                axios.post.mockResolvedValue({
                    data:{
                        token:"testtoken"
                    }
                })
                axios.get.mockResolvedValue({
                    data:{
                        status:{id:3}
                    }
                })
                const handler = createSubmitQuestion(io);
                await handler(req, res);
                expect(res.json).toHaveBeenCalledWith({message:"match not found"});
                expect(res.json).toHaveBeenCalledWith(400)
                
                


                



})

//question not found

test("question not found", async () => {

    const randomQuestion=new mongoose.Types.ObjectId();
    await Match.findByIdAndUpdate(matchId,{questionId:randomQuestion})
    
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
                const req={body:
                    {code:"print(helloWorld)",languageId:71,matchId:matchId,},
                    user:{_id:player1}
                };
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                axios.post.mockResolvedValue({
                    data:{
                        token:"testtoken"
                    }
                })
                axios.get.mockResolvedValue({
                    data:{
                        status:{id:3}
                    }
                })
                const handler = createSubmitQuestion(io);
                await handler(req, res);
                expect(res.json).toHaveBeenCalledWith({message:"question not found"});
                expect(res.json).toHaveBeenCalledWith(400)
                
                


                



})

//judge0 failure 

test("judge0 failure", async () => {
    
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
                const req={body:
                    {languageId:71,matchId:matchId,},
                    user:{_id:player1}
                };
                 const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                axios.post.mockResolvedValue(
                    new Error("Network error")
                    
                )
                axios.get.mockResolvedValue({
                    data:{
                        status:{id:3}
                    }
                })
                const handler = createSubmitQuestion(io);
                await handler(req, res);
                expect(res.json).toHaveBeenCalledWith({message:"judge0 evaluation failed"});
                expect(res.json).toHaveBeenCalledWith(502)
                
                


                



})

