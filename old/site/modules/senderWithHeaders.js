//senderWithHeaders.js


const senderWithHeaders =  function (response, obj, param3 ){
	
		//return new Promise(async (resolve, reject) => {
			
		//console.dir( param3 )		
		
		try {
			// Если третий параметр используется в качестве типа передачи
			method = 'json'
			if ( typeof param3 === "string" ){
				method = param3
			}
			// Иначе передает куки		
			//response;	
			
			if ( param3 && param3 !== method ) {
				
				param3.forEach( cookie => {
					console.log ( cookie )
					console.log ( ...cookie )
					response.cookie( ...cookie )
				})
				
				if (method == 'json'){
					//response.cookie()				
					//response.charset = 'iso-8859-1'		
					//response.set({'Content-Type': 'application/json; charset=windows-1251'});					
					response.set({
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT,OPTIONS',
								'Access-Control-Allow-Headers': 'Content-Type,Authorization,origin,accept,Set-Cookie,set-Cookie,Cookie,cookie'
								}).json( obj )
					return null
					
				} else if (method == 'send') {
					response.set({
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT,OPTIONS',
								'Access-Control-Allow-Headers': 'Content-Type,Authorization,origin,accept,Set-Cookie,set-Cookie,Cookie,cookie'
								}).cookie(...param3).send( obj )
					return null								
				}			
				
			} else {	
			
				if (method == 'json'){
					response.set({
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT,OPTIONS',
								'Access-Control-Allow-Headers': 'Content-Type,Authorization,origin,accept,Set-Cookie,set-Cookie,Cookie,cookie'
								}).json( obj )
					return null
				} else if (method == 'send') {
					response.set({
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT,OPTIONS',
								'Access-Control-Allow-Headers': 'Content-Type,Authorization,origin,accept,Set-Cookie,set-Cookie,Cookie,cookie'
								}).send( obj )
					return null
				} 
				
			}
				
			//resolve()
			
			} catch (err) {
				console.error(err);
				//response.set({
				//				'Access-Control-Allow-Origin': '*',
				//				'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT',
				//				'Access-Control-Allow-Headers': 'Content-Type,Authorization,origin,accept'
				//				}).send(err);
				//reject()
			
					try {

						
						if (method == 'json'){
							response.set({
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT,OPTIONS',
								'Access-Control-Allow-Headers': 'Content-Type,Authorization,origin,accept,Set-Cookie,set-Cookie,Cookie,cookie'
								}).json( obj )
						} else if (method == 'send') {
							response.set({
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT,OPTIONS',
								'Access-Control-Allow-Headers': 'Content-Type,Authorization,origin,accept,Set-Cookie,set-Cookie,Cookie,cookie'
								}).send( obj )
						}
						
					} catch (err) {
						console.error(err);
						response.send(err);
					}
		
			}			
		
	//})
	
}


module.exports.senderWithHeaders = senderWithHeaders