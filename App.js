
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
    socket.on("DEMANDE",(demande,user)=>{
        axios.post("http://127.0.0.1:8000/api/notifications",{
                    user: `/api/users/${user}`,
                    title:`demande ${demande["@id"]}`,
                    description: `${demande.transmitter.displayName} vous a envoyé une demande de devis`,
                    date: new Date(),
                    route: `/demande_devis/${demande.id}`,
                    type:"demande_devis"
                }).then(response=>
                    {
                        console.log("notification de demande created successfully")
                        console.log(user)
                        socket.to(user+"USER").emit("NOTIFICATION",response["data"]) 
                    }
                ).catch(err=>console.log(err))
    })
    socket.on("PROPOSITION",(proposition)=>{
        axios.post("http://127.0.0.1:8000/api/notifications",{
                    user: proposition.transmittedTo["@id"],
                    title:`proposition ${proposition["@id"]}`,
                    description: `${proposition.transmitter.displayName} vous a envoyé une proposition de devis`,
                    date: new Date(),
                    route: `/enchere/${proposition.enchere.replace('/api/encheres/', '')}`,
                    type:"proposition"
                }).then(response=>
                    {
                        console.log("notification de proposition created successfully")
                        console.log()
                        socket.to(proposition.transmittedTo.id+"USER").emit("NOTIFICATION",response["data"]) 
                    }
                ).catch(err=>console.log(err))
 
    })
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
            console.log("hey")
            if(type==="enchereInverse"){
                axios.post("http://127.0.0.1:8000/api/notifications",{
                    user: surveille["user"]["@id"],
                    title:`reduction ${enchere}`,
                    description: `${user} a réduit le prix de ${surveille.enchereInverse.article.name} jusqu'a ${newPrice}`,
                    date: new Date(),
                    route: `/enchereInverse/${surveille.enchereInverse.id}`,
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
                    route: `/enchere/${surveille.enchere.id}`,
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
