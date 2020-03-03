let path = require("path");
let packageRoot = path.resolve('./common/db');
let Db = require(`${packageRoot}/db-connect`);
let MackeSqlTolerant = require('./add-db-tolerance');

class PcAttrHits {
	constructor(args) {
		// code
	}
	//test valid param
	static updateTestParam(data){

		let results = "ok";
		let bestObject = {
			"ID":"ID",
			"ID_COMPANY":"ID_COMPANY",
			"STATE":"STATE",
			"PERMISSIONS":"PERMISSIONS",
			"ABBREVIATION":"ABBREVIATION"
		};


		if(Array.isArray(data)){
			data.forEach((val,key)=>{

				let keys = Object.keys(val);
				keys.map((val,key)=>{
					if (bestObject[val] === undefined){
						results = 'errNonParam'
					}
				})
			})
		}else{
			results='errNonParam'
		}
		return results
	}

	static async upd(par,action=[],cookie_id=[]){

		let status ='';
		status = PcAttrHits.updateTestParam(par);
		if (status === "ok"){
			status = await PcAttrHits.Updata(par,action,cookie_id);
		}
		return status;
	}

	static async Updata(par,cookie_id=[]){
		let data = [];
        let cookie_id_Sql = "";

		data = par.map(async (params,key)=>{

					let cookiedSQL = MackeSqlTolerant.getCookieIdSql(cookie_id);
					cookie_id_Sql  = await Db.poolDbFormatObj(cookiedSQL);
					let sqlWeight  =  MackeSqlTolerant.bindSqlGetWeight();
					//console.log(sqlWeight)
					let resWeight  = await Db.poolDb(sqlWeight);
					let sqlReg = MackeSqlTolerant.getRegion(params);
					let resReg = await Db.poolDbFormatObj(sqlReg);
					let sqlRes = MackeSqlTolerant.SqlSet(resWeight,params,resReg,cookie_id_Sql);
					return  await Db.poolDb(sqlRes);
			});

		return Promise.all(data);
	}


	static async del(id, cookie_id=[]){

			let updateWeightNum,
			swlDelWei,
			id_user,
			res_data;
			id_user = MackeSqlTolerant.getNewPcAttSql(cookie_id, id);
			id_user = await Db.poolDbFormatObj(id_user);
			if(id_user.rows.length !== 0) {
				swlDelWei = MackeSqlTolerant.delWeight(id, id_user.rows[0]);
				swlDelWei = await Db.poolDb(swlDelWei);
				res_data = 'ok';
			}else {
				res_data='non';
			}
			return res_data;
	}

	static async addAttr(action,body){
	   let obj = new PcAttrHits();
       let data = await obj.Updata(body);
	   return data

	 }

}

module.exports = PcAttrHits;