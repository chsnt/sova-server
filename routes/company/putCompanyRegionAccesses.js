let path = require("path");
let packageRoot = path.resolve('./entities/pcAttrRegionsWeight');
let pcAttrRegionsWeight = require(`${packageRoot}/pc-attr-hist`);


class PutCompanyRegionAccesses {

  static async inPointPut(req,res){
    //let cookie_id = req.cookies.uid;
    let cookie_id ="'2aa6daceac5dece94605cc230694355ea3d3328c41f9f579bae458f270055e68'";
    let body = req.body;
    let data = await pcAttrRegionsWeight.upd(body, cookie_id);
    let send = "";

    try {
      send = data[0]['rowsAffected']
    } catch (e) {
      send = "err";
    }

    res.send({param:send})
  }

}

module.exports = PutCompanyRegionAccesses;
