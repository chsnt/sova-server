const Staff = require('./pc-staff/pc-staff.js');
const Others = require('./others/others.js');
const PcAttrHits = require('./pc-attr-regions-weight/pc-attr-hist');

class Router{

	constructor(){

	}

	static async API(request, response){		
		
	   /* if ( request.query.service == 'staff-attributes' ) {
		   await Staff.get(request, response)
		} */
		
		let params = { body: request.body, query: request.query };


		switch(request.query.service) {
			case 'staff-attributes': 
			  await Staff.get(request, response);
			  break;
			  
			case 'staff-position-weight': 
			  await Staff.getPositionWeight(request, response);
			  break;
		  
			case 'add-new-staff':  // if (x === 'value2')
			   await Staff.insert(request.body, response);
			  break;
			  
			case 'get-hash-for-pass':
				await Utils.getHashForPass(request, response);
				break;
			default:
			  // Здесь должен быть ответ с ошибкой
			  break
		  }
	}

}

module.exports = Router;