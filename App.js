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
    socket.on("AUGMENT", (enchere, user, newPrice,initPrice)=>{
        socket.to(enchere.concat('LOCAL')).emit("NEW_PRICE",enchere, user , newPrice, initPrice) 
        console.log("emit sent "+enchere.concat('LOCAL') )
        
    })
    socket.on("REDUCT", (enchere, user, newPrice, initPrice)=>{
        socket.to(enchere.concat('LOCAL')).emit("NEW_PRICE",enchere, user,  newPrice, initPrice)
        console.log("emit sent "+enchere.concat('LOCAL') )
    })
    socket.on("leave-room", enchere=>{socket.leave(enchere.concat('LOCAL'))
    console.log(enchere.concat('LOCAL')+ "left")
    })
})
