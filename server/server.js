const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname+"/public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});


let rooms = {};

io.on("connection",(socket)=>{

 socket.on("join",(data)=>{

  socket.join(data.room);

  socket.to(data.room).emit("user-joined",socket.id);

  socket.on("offer",(d)=>{
   io.to(d.id).emit("offer",{offer:d.offer,id:socket.id});
  });

  socket.on("answer",(d)=>{
   io.to(d.id).emit("answer",{answer:d.answer,id:socket.id});
  });

  socket.on("candidate",(d)=>{
   io.to(d.id).emit("candidate",{candidate:d.candidate,id:socket.id});
  });
 });
});

http.listen(3000,()=>{
 console.log("Server running on 3000");
});
