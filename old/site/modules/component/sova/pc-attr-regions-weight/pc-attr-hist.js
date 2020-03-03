const MackeSqlTolerant = require('./add-db-tolerance');
const Db = require('../db/db-connect.js');

class PcAttrHits {
	constructor(args) {
		// code
	}
	//test valid param
	static updateTestParam(data){

		let resault = "ok"
		let bestObject = {
			"ID":"ID",
			"ID_COMPANY":"ID_COMPANY",
			"STATE":"STATE",
			"ENG_NAME":"ENG_NAME",
			"ABBREVIATION":"ABBREVIATION"
		}
		

		if(Array.isArray(data)){
			data.forEach((val,key)=>{
				let keys = Object.keys(val)

				keys.map((val,key)=>{
					if (bestObject[val] === undefined){
						resault = 'errNonParam'
					}
				})
			})
		}else{
			resault='errNonParam'
		}
		return resault
	}

	static async Upd(par,action=[],cookie_id=[]){
	   
		let status =''
		status = PcAttrHits.updateTestParam(par)
		if (status === "ok"){
			status = await PcAttrHits.Updata(par,action,cookie_id);
		}
		return status;
	}

	static async Updata(par,cookie_id=[]){
		
		

		let data = []
		let sqlStru = "";
		let end = "";
        let cookie_id_Sql = "";

		data = par.map(async (params,key)=>{
					let cookiedSQL = MackeSqlTolerant.getCookieIdSql(cookie_id);
					cookie_id_Sql = await Db.poolDbFormatObj(cookiedSQL);

					let sqlWeight =  MackeSqlTolerant.bindSqlGetWeight();
					let resWeight = await Db.poolDb(sqlWeight);

					let sqlReg = MackeSqlTolerant.getRegion(params);
					let resReg = await Db.poolDb(sqlReg);

					let sqlRes = MackeSqlTolerant.SqlSet(resWeight,params,resReg,cookie_id_Sql);
					return  await Db.poolDb(sqlRes);
			})
	
		return Promise.all(data);
	}


	static async del(id, cookie_id=[]){

			let updateWeightNum,
			swlDelWei,
			id_user;
			
			console.log('cookie_id')
			console.log(cookie_id)
		
			

			id_user = MackeSqlTolerant.getNewPcAttSql(cookie_id, id)
			id_user = await Db.poolDbFormatObj(id_user);
			
			console.log('id_user')
			console.log(id_user)
			
			//process.exit(-1)
			
			swlDelWei = MackeSqlTolerant.delWeight(id, id_user.rows[0])
			swlDelWei = await Db.poolDb(swlDelWei);
			return "ok"
		
	}

	static async addAttr(action,body){
	   let obj = new PcAttrHits();

       let data = await obj.Updata(body);
	   return data
		
	 }	
	
}

module.exports = PcAttrHits;