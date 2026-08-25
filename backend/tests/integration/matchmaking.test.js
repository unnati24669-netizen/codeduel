const {createClient}=require("redis")
const {tryClaimMatch,QUEUE_NAME,client}=require("../../matchmaking/queue.js")
let testclient;

beforeAll(async()=>{
      testclient=await createClient({url:process.env.REDIS_URL});
      await testclient.connect().then(()=>console.log("redis connected"))

})
beforeEach(async ()=>{
    await testclient.flushDb();
})

afterEach(async ()=>{
    await testclient.flushDb();
})
afterAll(async () => {
  await testclient.quit();
  await client.quit();
});

//simple claim  success
test("when both users are present in queue and they get matched the answer would be 1",async ()=>{
    await testclient.zAdd(QUEUE_NAME,[{score:"1200",value:"unnati1"}])
    await testclient.zAdd(QUEUE_NAME,[{score:"1200",value:"sumit1"}]);
    expect(await tryClaimMatch("sumit1","unnati1","1200")).toBe(1);
})

//self already gone

test("when the self is already removed so we get -1",async()=>{
    await testclient.zAdd(QUEUE_NAME,[{score:"1200",value:"unnati1"}]);
    await testclient.zAdd(QUEUE_NAME,[{score:"1200",value:"vartika1"}]);

    await testclient.zRem(QUEUE_NAME,"vartika1");

    expect(await tryClaimMatch("unnati1","vartika1","1200")).toBe(-1);
    expect(await testclient.zScore(QUEUE_NAME,"unnati1")).toBe(1200);

})

//candidate gone

test("when no user is present and we try to find a player we get 0",async()=>{
    expect(await tryClaimMatch("unnati1","sumit1","1200")).toBe(0);
})





