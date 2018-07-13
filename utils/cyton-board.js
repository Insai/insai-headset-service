const Cyton = require("openbci-cyton");
const { OBCISimulatorPortName } = require("openbci-utilities/dist/constants");

class Board extends Cyton {
  constructor(...props) {
    super(...props);
    this.init();
  }
  async init() {
    try {
      this._portName = await this.autoFindOpenBCIBoard();
    } catch (err) {
      console.log(err);
      this._portName = OBCISimulatorPortName;
    }
  }
}

module.exports = Board;
