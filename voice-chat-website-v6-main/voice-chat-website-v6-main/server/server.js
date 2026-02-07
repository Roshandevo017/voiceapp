const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.static(path.join(__dirname, "../public")));

const rooms = {};

io.on("connection", socket => {
  socket.on("join-room", ({ room, username }) => {
    socket.join(room);
    socket.room = room;

    if (!rooms[room]) rooms[room] = [];
    rooms[room].push({ id: socket.id, username });

    socket.to(room).emit("user-joined", {
      id: socket.id,
      members: rooms[room]
    });

    socket.emit("room-info", rooms[room]);
  });

  socket.on("signal", data => {
    socket.to(socket.room).emit("signal", {
      from: socket.id,
      type: data.type,
      payload: data.payload
    });
  });

  socket.on("disconnect", () => {
    const room = socket.room;
    if (!room || !rooms[room]) return;
    rooms[room] = rooms[room].filter(u => u.id !== socket.id);
    socket.to(room).emit("user-left", { members: rooms[room] });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Server running"));