const {
  userConnected,
  userDisconnected,
  getUsers,
  saveMessage,
} = require("../controllers/sockets");
const { validateJWT } = require("../helpers/jwt");

class Sockets {
  constructor(io) {
    this.io = io;

    this.socketEvents();
  }

  socketEvents() {
    // On connection
    this.io.on("connection", async (socket) => {
      // Validate JWT
      const [valid, uid] = validateJWT(socket.handshake.query["x-token"]);

      if (!valid) {
        console.log("Invalid socket");
        socket.disconnect();
      }

      await userConnected(uid);

      // Socket join
      socket.join(uid);

      // TODO: Know which user is active (UID)

      // Emit users connected
      this.io.emit("users-list", await getUsers());

      // On message sent
      socket.on("personal-message", async (payload) => {
        const message = await saveMessage(payload);
        this.io.to(payload.from).emit("personal-message", message);
        this.io.to(payload.to).emit("personal-message", message);
      });

      // Disconnect
      socket.on("disconnect", async () => {
        await userDisconnected(uid);
        this.io.emit("users-list", await getUsers());
      });
    });
  }
}

module.exports = Sockets;
