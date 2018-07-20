const io = require("socket.io-client");
const boardC = require("./constants/board-action-types");

/**
 * Environment Variables
 */
require("dotenv").load();
const { PORT } = process.env;

const socket = io(`http://localhost:${PORT}`);
socket.emit(boardC.CONNECT_BOARD, { simulate: true });
setTimeout(() => {
  console.log("Start Sample");
  socket.emit(boardC.START_SAMPLE);
  socket.on(boardC.DATA_SAMPLE, data => console.log(data));
  setTimeout(() => {
    console.log("Disconnect Board");
    socket.emit(boardC.DISCONNECT_BOARD);
  }, 5000);
}, 5000);
