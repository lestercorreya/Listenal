const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const backendRoutes = require("./routes/backend.js");
const spotifyRoutes = require("./routes/spotifyRoutes.js");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());
app.use(cors());
app.use("/backend", backendRoutes);
app.use("/spotify", spotifyRoutes);

io.on("connection", (socket) => {
  const username = socket.handshake.query.username;
  console.log("a user connected");
  socket.join(username);
  socket.on("contact-message", (msg) => {
    socket.to(msg.to).emit("contact-message", {
      from: msg.from,
      message: msg.message,
      time: msg.time,
      img: msg.img,
    });
  });
  socket.on("group-message", (msg) => {
    for (var i = 0; i < msg.people.length; i++) {
      if (msg.people[i] != msg.from) {
        socket.to(msg.people[i]).emit("group-message", {
          from: msg.from,
          message: msg.message,
          conversationId: msg.conversationId,
          time: msg.time,
          img: msg.img,
        });
      }
    }
  });
  socket.on("group-created", (msg) => {
    for (var i = 0; i < msg.people.length; i++) {
      if (msg.people[i] !== msg.username) {
        socket.to(msg.people[i]).emit("group-created", {
          name: msg.name,
          people: msg.people,
          conversationId: msg.conversationId,
        });
      }
    }
  });
  socket.on("song-played", (msg) => {
    if (msg.contactOrGroup === "contact") {
      socket.to(msg.selectedPeople).emit("song-played", {
        uri: msg.uri,
        playedWith: [msg.playedWith, msg.selectedPeople],
        selectedContactOrGroupName: msg.selectedContactOrGroupName,
      });
    } else {
      for (var i = 0; i < msg.selectedPeople.length; i++) {
        socket.to(msg.selectedPeople[i]).emit("song-played", {
          uri: msg.uri,
          playedWith: msg.selectedPeople,
          groupName: msg.selectedContactOrGroupName,
        });
      }
    }
  });

  socket.on("song-changed-outgoing", (msg) => {
    for (var i = 0; i < msg.people.length; i++) {
      socket.to(msg.people[i]).emit("song-changed-outgoing", msg);
    }
  });
});

mongoose
  .connect(
    "mongodb+srv://lestercorreya:linusunno@listenalcluster.1ujhq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((res) => console.log("connnected"))
  .catch((err) => console.log(err));

// listening to server
server.listen(3001, () => {
  console.log("listening on *:3000");
});
