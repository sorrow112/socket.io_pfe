const  io = require("socket.io")(8081,{
    cors:{
        origin: ['http://localhost:3000']
    }
})
io.on("connection", socket =>{
    console.log("call from"+socket.id)
    socket.on("join-rooms",rooms=>{
        console.log("somebody joined room " + rooms)
        socket.join(rooms)
    })
    socket.on("AUGMENT", (enchere, user)=>{
        socket.to(enchere).emit("NEW_PRICE",enchere, user)
    })
})
