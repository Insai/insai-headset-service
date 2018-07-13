const Board = require("./utils/cyton-board");

async function main() {
  const board = new Board({
    debug: true,
    verbose: true,
    simulate: true,
    boardType: "daisy",
    hardSet: true
  });

  // connect and start data stream
  await board.connect();
  await board.streamStart();

  board.on("sample", sample => {
    const data = new Buffer(JSON.stringify(sample));
    console.log(data);
  });
}
