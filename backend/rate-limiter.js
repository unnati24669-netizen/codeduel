const { rateLimit ,ipKeyGenerator} =require('express-rate-limit')
const {RedisStore} =require('rate-limit-redis') 
const {clientPromise,client} =require( './matchmaking/queue.js')

  
	 const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	passOnStoreError: true,
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    store:new RedisStore({
        sendCommand:async(...args)=>
			await clientPromise.then(()=>client.sendCommand(args)),
        prefix:"rl:basic"
    })
	
})






 const strictLimiter = rateLimit({
	windowMs: 1 * 60 * 1000,     // shrink window: 1 min instead of 15
	limit: 5,                     // shrink count: 5 requests per window instead of 100
	passOnStoreError: true,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: 'Too many requests, please try again later.', // custom message instead of default
	keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip), // key by user ID not IP — important since you have JWT auth, otherwise all users behind same NAT/hostel wifi share one limit
	
    store: new RedisStore({
        sendCommand:async(...args)=>
			await clientPromise.then(() => client.sendCommand(args)), // ensure Redis client is connected before sending command
		prefix:"rl:strict"
	})
})


module.exports={limiter,strictLimiter}

