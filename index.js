const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const Board = require("./utils/cyton-board");
const socketC = require("./constants/socket-action-types");
const headsetC = require("./constants/headset-action-types");

/**
 * Config Variables
 */
require("dotenv").load();
const { PORT } = process.env;

/**
 * Socket Connection
 */
io.on("connection", socket => {
  // Connect Websocket
  console.log("Websocket connected");
  socket.emit(socketC.CONNECT_SUCCESS);
  var board;

  // Connect Cyton Board
  socket.on(headsetC.CONNECT_HEADSET, async config => {
    board = new Board({
      debug: config.debug || true,
      verbose: config.debug || true,
      simulate: config.debug || true,
      boardType: "daisy",
      hardSet: true
    });
    try {
      await board.connect(config);
      socket.emit(headsetC.CONNECT_HEADSET_SUCCESS);
    } catch (error) {
      socket.emit(headsetC.CONNECT_HEADSET_FAILURE, { error });
      throw error;
    }
  });

  // Start Sample
  socket.on(headsetC.START_SAMPLE, async () => {
    try {
      await board.streamStart();
      socket.emit(headsetC.START_SAMPLE_SUCCESS);
      board.on("sample", sample => {
        const data = new Buffer(JSON.stringify(sample));
        socket.emit(headsetC.DATA_SAMPLE, { data });
        // console.log(sample);
      });
    } catch (error) {
      socket.emit(headsetC.START_SAMPLE_FAILURE, { error });
    }
  });

  // Disconnect Board
  socket.on(headsetC.DISCONNECT_HEADSET, async () => {
    if (board.isStreaming()) {
      try {
        await board.streamStop();
      } catch (error) {
        socket.emit(headsetC.DISCONNECT_HEADSET_FAILURE, { error });
      }
    }
    try {
      await board.disconnect();
      socket.emit(headsetC.DISCONNECT_HEADSET_SUCCESS);
    } catch (error) {
      socket.emit(headsetC.DISCONNECT_HEADSET_FAILURE, { error });
    }
  });
});

exports.server = server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
