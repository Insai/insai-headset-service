const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const Board = require("./utils/cyton-board");
const socketC = require("./constants/socket-action-types");
const boardC = require("./constants/board-action-types");

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
  socket.on(boardC.CONNECT_BOARD, async config => {
    board = new Board({
      debug: config.debug || true,
      verbose: config.debug || true,
      simulate: config.debug || true,
      boardType: "daisy",
      hardSet: true
    });
    try {
      await board.connect(config);
      socket.emit(boardC.CONNECT_BOARD_SUCCESS);
    } catch (error) {
      console.log(error);
      socket.emit(boardC.CONNECT_BOARD_FAILURE, { error });
      throw error;
    }
  });

  // Start Sample
  socket.on(boardC.START_SAMPLE, async () => {
    try {
      await board.streamStart();
      socket.emit(boardC.START_SAMPLE_SUCCESS);
      board.on("sample", sample => {
        const data = new Buffer(JSON.stringify(sample));
        socket.emit(boardC.DATA_SAMPLE, { data });
        // console.log(sample);
      });
    } catch (error) {
      console.log(error);
      socket.emit(boardC.START_SAMPLE_FAILURE, { error });
    }
  });

  // Disconnect Board
  socket.on(boardC.DISCONNECT_BOARD, async () => {
    try {
      console.log("Disconnect");
      await board.streamStop();
      await board.disconnect();
      socket.emit(boardC.DISCONNECT_BOARD_SUCCESS);
    } catch (error) {
      console.log(error);
      socket.emit(boardC.DISCONNECT_BOARD_FAILURE);
    }
  });
});

exports.server = server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
