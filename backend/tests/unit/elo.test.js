const calculateElo=require("../../controllers/elo.js");

test("rating change for two users A,B having rating 1200 and winner is A player",()=>{
    expect(calculateElo(1200,1200,1)).toEqual({newRating1:1216,newRating2:1184})
})