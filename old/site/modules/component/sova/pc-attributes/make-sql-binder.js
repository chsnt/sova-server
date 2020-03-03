/* const {
	shema_pcattributes_insert,
	pc_attributes_bind,
	pc_attributes_bind_del,
	shema_pcattributes_updata,
	pc_attributes_bind_updata,
	shema_pcattributes_hists_insert,
	pc_attributes_hists_bind
} = require('./sql-shema/shema-PC_ATTRIBUTES') */

class makeSQL  {
	constructor(args) {
		// code
	}

	static makeSelect(data){
		
		let queryString= `
			SELECT 
			* 
			FROM PC_STAFF st
			JOIN QUAL_CERT qs
			 ON st.ID = qs.ID_STAFF `;			

		return {
			queryString: queryString,
			binds:undefined,
			optionsObj:{ outFormat: OBJECT }
		}	
	} 	

	
	static makeInsert(data){
		
		let pc_attributes_sql_string= `
			DECLARE
				id_com  number;
				BEGIN 
					SAVEPOINT update_bar;
						${shema_pcattributes_hists_insert}RETURNING "ID" INTO id_com;
				COMMIT;
				EXCEPTION
					WHEN OTHERS THEN
					ROLLBACK TO update_bar;
					RAISE;
			END;`;			

		return {
			queryString:pc_attributes_sql_string,
			bind:pc_attributes_hists_bind(data),
			optionsObj:{ autoCommit: true }
		}	
	} 	


	static makeUpdate(data){

		//let pc_attributes_sql_string=`${shema_pcattributes_updata}`;

		let pc_attributes_sql_string = `
			DECLARE
				id_com  number;
				BEGIN 
					SAVEPOINT update_bar;
						${shema_pcattributes_updata};
				COMMIT;
				EXCEPTION
					WHEN OTHERS THEN
					ROLLBACK TO update_bar;
					RAISE;
			END;`;

		return {
			queryString:pc_attributes_sql_string,
			bind:pc_attributes_bind_updata(data),
			optionsObj:{ autoCommit: true }
		}

	}

	static makeDelete(data){
		let pc_attributes_sql_string = `
			DECLARE
				id_com  number;
				BEGIN 
					SAVEPOINT update_bar;
						DELETE FROM PC_ATTRIBUTES WHERE ID = :ID;
				COMMIT;
				EXCEPTION
					WHEN OTHERS THEN
					ROLLBACK TO update_bar;
					RAISE;
			END;`;

		return {
			queryString:pc_attributes_sql_string,
			bind:pc_attributes_bind_del(data),
			optionsObj:{ autoCommit: true }
		}	
	}		
	
}

module.exports = makeSQL


// let queryString = `
// 			DECLARE
// 				id_com  number;
// 				BEGIN 
// 					SAVEPOINT update_bar;
// 					INSERT INTO TEST_CUSTOMERS (ID, NAME, AGE) 
// 						VALUES (:ID,:NAME,:AGE)  RETURNING "ID" INTO id_com;
// 					INSERT INTO TEST_WIN_PIN (ID, NAME, AGE) 
// 						VALUES (id_com,:NAME,:AGE);
// 				COMMIT;
// 				EXCEPTION
// 					WHEN OTHERS THEN
// 					ROLLBACK TO update_bar;
// 					RAISE;
// 			END;`;