let path = require("path");
const { container, bottle } = require(path.resolve("./bottle"));
let Employe = require(path.resolve("./entities/Employe"));

class PutAddNewStaff {
  constructor() {
    this.KeyIDAdd = []
  }
  positionsWeighAdditions(data) {
    let resData = data;
    if (data.length !== 0) {
      resData = data.reduce((a, b) => {
        return a + b;
      });
    }
    return resData;
  }

  async AddUser(data, connection) {
    let resId = 0;
    if (data.ID === undefined) {
      let employe = new Employe();
      employe.POSITION_WEIGHT = this.positionsWeighAdditions(data.POSITIONS);
      employe.merge(data);
      await employe.create(connection);
      resId = employe.ID;
    }
    return resId;
  }

  async DelUser() {

  }

  async UpdateUser() {

  }

  async* Generator(data) {
    for (let i = 0; i < data.length; i++) {
      let resData = await container.transaction(async (connection) => {
        let objRes = {
          keyIdAdd:0
        };
        objRes.keyIdAdd = await this.AddUser(data[i], connection);
        //await this.UpdateUser(data[i]);
        //await this.DelUser(data[i]);
        return objRes;
      });
      yield resData;
    }


  }

  static async InPointPut(req, res) {
    const IPP = new PutAddNewStaff();

    if (req.body.length !== 0) {
      let generator = IPP.Generator(req.body);
      for await (let value of generator) {
        if(value.keyIdAdd !== 0 ){
          IPP.KeyIDAdd.push(value.keyIdAdd)
        }
      }
    }

    res.send(IPP);
  }

}

module.exports = PutAddNewStaff;
