const Utils = require('./utils.js');


class Router{

	constructor(){

	}

	static async API(request, response){

		switch(request.params.service) {
			  
			case 'get-hash-for-pass':
				await Utils.getHashForPass(request, response)
				break			  
		  
			default:
			  // Здесь должен быть ответ с ошибкой
			  break
		  }
	}

}

module.exports = Router