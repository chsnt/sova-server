class MackeSqlTolerant{
	constructor(data,id_reg,cookie_id){
		this.ID_COMPANY = data.ID_COMPANY;
		this.ID_REGION  = id_reg;
		this.sum = {}
		this.COOKIE_ID = cookie_id;
		
	}

	static getNewPcAttSql(id,action){
		return `
			SELECT a.ID_REGION,a.ID_COMPANY,a.ID_REGION, s.ID_USER 
			FROM PC_ATTR_BY_REGIONS_HIST a,
			     "SYSTEM".AUTH_SESSIONS s 
			WHERE a.ID = ${action} AND s.ID ='${id}'
		`
	}

	static getCookieIdSql(id){
		return `SELECT ID_USER FROM "SYSTEM".AUTH_SESSIONS WHERE ID = '${id}'`
	}

	static delWeight(id,param){
		return`
		DECLARE
		id_com  number;
				BEGIN 
			DELETE PRESENCE_LOCALITY_TEST WHERE id_LOCALITY IN(
 			SELECT id  FROM "SYSTEM".SHORT_LIST_LOCATIONS  WHERE state IN(
  			SELECT state FROM "SYSTEM".SHORT_LIST_LOCATIONS WHERE ID =
    			(SELECT ID_REGION FROM PC_ATTR_BY_REGIONS_HIST WHERE ID = ${id}))
			AND ID_COMPANY = (SELECT ID_COMPANY FROM PC_ATTR_BY_REGIONS_HIST WHERE ID = ${id}));
			INSERT INTO PC_ATTR_BY_REGIONS_HIST 
			(ID_COMPANY,ID_REGION,ACCESS_WEIGHT,DATETIME,ID_USER)
			VALUES(${param.ID_COMPANY},${param.ID_REGION},-1,SYSTIMESTAMP,${param.ID_USER});
			EXCEPTION
					WHEN OTHERS THEN
					ROLLBACK TO update_bar;
					RAISE;
			END;
		`}

	static getRegion(params){
		let name = params.STATE
		return `SELECT ID FROM "SYSTEM".SHORT_LIST_REGIONS WHERE STATE = '${name}'`
	}

	static bindSqlGetWeight(){
		return `SELECT ENG_NAME, WEIGHT FROM ACCESS_LEVEL_WEIGHTS`
	}

	shemaSqlSet(){
		return `
			INSERT INTO PC_ATTR_BY_REGIONS_HIST 
			(ID_COMPANY,
			 ID_REGION,
			 ACCESS_WEIGHT,
			 DATETIME,
			 ID_USER)
			 VALUES(${this.ID_COMPANY},
			 		${this.ID_REGION[0]},
			 		${this.sum},
			 		SYSTIMESTAMP,
			 		${this.COOKIE_ID})`
	}

	helpMakeWeightObj(res,params){
		let dataWeight,sumNumber,obWeight;
		dataWeight = res.rows;
		sumNumber = 0;
		obWeight = {}; 

		dataWeight.map((val,key)=>{
			obWeight[val[0]]=val[1]
		});

		 params.ENG_NAME.map((val,key)=>{
			sumNumber += obWeight[val];
		 })

		 this.sum = sumNumber;
	}

	static SqlSet(res,params,resReg,cookie_id){
		
		console.log(cookie_id)
		
		let obj = new MackeSqlTolerant(params,resReg.rows[0],cookie_id.rows[0].ID_USER);
		//let obj = new MackeSqlTolerant(params, resReg.rows[0], cookie_id);
		obj.helpMakeWeightObj(res,params)			
		return obj.shemaSqlSet()

	}

}

module.exports = MackeSqlTolerant;