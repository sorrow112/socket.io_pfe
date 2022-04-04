const  io = require("socket.io")(8081,{
    cors:{
        origin: ['http://localhost:3000']
    }
})
io.on("connection", socket =>{
    console.log("call from"+socket.id)
    socket.on("join-rooms",rooms=>{
        socket.join(rooms)
        console.log("sombody joined " +rooms)
    })
    socket.on("disconnect", ()=>console.log(socket.id + " got disconnected"))
    socket.on("AUGMENT", (enchere, user, newPrice)=>{
        socket.to(enchere).emit("NEW_PRICE",enchere, user)
        console.log("emit sent "+enchere )
    })
    socket.on("leave-room", enchere=>{socket.leave(enchere)
    console.log("room left " + enchere)
    })
})
