
const axios = require('axios').default;
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
        
        console.log("emit sent "+enchere.concat('LOCAL'))
        let type ="";
        if(enchere.includes("_inverses")){
            type="enchereInverse";
        }else{
            type="enchere"
        }
        axios.get(`http://127.0.0.1:8000/api/surveilles`,{
            params:{
                [type]: enchere
            }
        }).then(response=>response["data"]["hydra:member"].map(surveille=>{
            if(type==="enchereInverse"){
                axios.post("http://127.0.0.1:8000/api/notifications",{
                    user: surveille["user"]["@id"],
                    title:`reduction ${enchere}`,
                    description: `${user} a réduit le prix de ${surveille.enchereInverse.article.name} jusqu'a ${newPrice}`,
                    date: new Date(),
                    route: surveille.enchereInverse.id,
                    type:"enchereInverse"
                }).then(response=>
                    {
                        console.log("notification created successfully")
                        socket.to(enchere.concat('LOCAL')).emit("NEW_PRICE",enchere, user , newPrice, initPrice) 
                        //TODO DISPLAY REAL TIME NOTIFICATION
                        socket.to(enchere).emit("NOTIFICATION",response["data"]) 
                    }
                ).catch(err=>console.log(err))
            }
            else{
                axios.post("http://127.0.0.1:8000/api/notifications",{
                    user: surveille["user"]["@id"],
                    description: `${user} a augmenté le prix de ${surveille.enchere.article.name} jusqu'a ${newPrice}`,
                    title:`augmentation ${enchere}`,
                    date: new Date(),
                    route: surveille.enchere.id,
                    type:"enchere"
                }).then(response=>{
                    console.log("notification created successfully")
                    socket.to(enchere.concat('LOCAL')).emit("NEW_PRICE",enchere, user , newPrice, initPrice) 
                    socket.to(enchere).emit("NOTIFICATION",response["data"]) 

                }
                ).catch(err=>console.log(err))
            }
            })).catch(err=>console.log(err))
            
    })
    // socket.on("REDUCT", (enchere, user, newPrice, initPrice)=>{
    //     socket.to(enchere.concat('LOCAL')).emit("NEW_PRICE",enchere, user,  newPrice, initPrice)
    //     console.log("emit sent "+enchere.concat('LOCAL') )
    // })
    socket.on("leave-room", enchere=>{socket.leave(enchere.concat('LOCAL'))
    console.log(enchere.concat('LOCAL')+ "left")
    })
})
