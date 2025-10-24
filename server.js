const express = require("express");
const http = require("http");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const { Server } = require("socket.io");
require("dotenv").config();

const authRouter = require("./routes/auth");
const Message = require("./model/Message");
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL },
});

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => console.log("mongo connected success!"))
  .catch((err) => console.log("mongo connection error: " + err));

app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

io.on("connection", (socket) => {
  console.log("socket is connected:", socket.id);
  socket.on("sendMessage", async (data) => {
    try {
      const message = new Message({
        userName: data.username,
        message: data.message,
      });
      await message.save();

      io.emit("receiveMessage", {
        username: data.username,
        message: data.message,
        timestamp: message.timestamp,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected");
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`));
