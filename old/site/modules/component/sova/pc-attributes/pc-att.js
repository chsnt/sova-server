const Db = require('../sql/db-connect.js');
const parseData = require('./make-sql-binder');

/*select update delete get 
  insert for the table
  PC_ATTRIBUTES, PC_ATTRIBUTES_HIST
  */
class PcAttributes {
	static async insert(data){
		let {queryString,bind,optionsObj} = parseData.makeInsert(data)
		let res = await Db.poolDb(queryString,bind,optionsObj)
		console.log(res)
	}

	static async update(data){
		let {queryString,bind,optionsObj} = parseData.makeUpdate(data)
		let res = await Db.poolDb(queryString,bind,optionsObj)
		console.log(res)
	}

	static async delete(data){
		let {queryString,bind,optionsObj} = parseData.makeDelete(data);
		let res = await Db.poolDb(queryString,bind,optionsObj)
		console.log(res)
		
	}

}

module.exports = PcAttributes
//PcAttributes.insert()