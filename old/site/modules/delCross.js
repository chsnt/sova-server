// delCross(err.cross)
// const requestDBSync = require('./requestDBwoPromise.js').requestDBwoPromise;
// const requestDBMany = require('./requestDBMany.js').requestDBPromise;
const requestDBArr = require('./requestDBArr2.js').requestDBPromise;
const requestDBPromisePool = require('./requestDBPromisePool.js').requestDBPromise;

module.exports = (cross) => {

  /*   "id_user": 5,
    "id_company": 919,
    "id_hist": "32f5360a-e294-4cb5-9827-d25f575e0274",
    "id_acc_lev": [
        2958,
        2959
    ],
    "id_off": [
        "b59ac0cd-14cc-47dc-b07d-7ff5f7c92aba",
        "e0994463-57a7-439c-a8b5-db269b5d9a2c"
    ],
    "id_off_adr": [
        219,
        220
    ], */

   return new Promise ((resolve, reject) => {

        console.log('cross.id_company')
        console.log(!!cross.id_company)
        
        try {

            if ( cross.id_company ) {

                requestDBPromisePool('id_company', `DELETE FROM regpc.PC_ATTRIBUTES WHERE ID=${cross.id_company}`, {}, { autoCommit: true })
                .then( result => {
                    console.dir(result)    
                    if ( result.response ){    
                        return    
                    } else {
                        throw new Error ( 'cant add history company attributes' )
                    }
                
                })
                .then( () => {  // Company attributes history

                    return new Promise ((resolve, reject) => {

                        if ( cross.id_hist ) {                            

                                requestDBPromisePool('id_hist', `DELETE FROM regpc.PC_ATTRIBUTES_HIST WHERE ID = '${cross.id_hist}'`, {}, { autoCommit: true })
                                .then( () => resolve() )                           
                                .catch( err => reject( err ) ) 

                        } else {
                            resolve('ok')
                        }
                    
                    })

                })
                .then( () => {  // Region access levels

                    return new Promise ((resolve, reject) => {

                        if ( cross.id_acc_lev ) {                            

                                requestDBPromisePool('id_acc_lev', `DELETE FROM regpc.PC_ATTR_BY_REGIONS_HIST WHERE ID IN (${cross.id_acc_lev.join(',')})`, {}, { autoCommit: true })
                                .then( () => resolve() )                           
                                .catch( err => reject( err ) ) 

                        } else {
                            resolve('ok')
                        }
                    
                    })

                }) 
                .then( () => {  // Offices

                    return new Promise ((resolve, reject) => {

                        if ( cross.id_off ) {                            

                                requestDBPromisePool('id_off', `DELETE FROM regpc.PC_OFFICES WHERE ID IN ('${cross.id_off.join(`','`)}')`, {}, { autoCommit: true })
                                .then( () => resolve() )                           
                                .catch( err => reject( err ) ) 

                        } else {
                            resolve('ok')
                        }
                    
                    })

                })   
                .then( () => {  // Offices

                    return new Promise ((resolve, reject) => {

                        if ( cross.id_off_adr ) {                            

                                requestDBPromisePool('id_off_adr', `DELETE FROM regpc.PC_OFFICES_ADDRESS_HIST WHERE ID IN (${cross.id_off_adr.join(',')})`, {}, { autoCommit: true })
                                .then( () => resolve() )                           
                                .catch( err => reject( err ) ) 

                        } else {
                            resolve('ok')
                        }
                    
                    })

                })                  
                .then(() => resolve ('ok'))
                .catch( err => reject( err ))

            } else {
                resolve('ok')
            }
            
            //if ( cross.id_hist )    arr.push([{`DELETE FROM regpc.PC_ATTRIBUTES_HIST WHERE ID=${cross.id_hist}`,{},{ autoCommit: true }}])

            /* 
            if ( cross.id_off ) {
                cross.id_off.forEach( id => { arr.push(`DELETE FROM regpc.PC_OFFICES WHERE ID='${id}'`) });
            }        
            if ( cross.id_off_adr ) {
                cross.id_off_adr.forEach( id => { arr.push(`DELETE FROM regpc.PC_OFFICES_ADDRESS_HIST WHERE ID='${id}'`) });
            }   
            */  

           /*  requestDBArr(arr)
            .then( result => { console.dir(result); resolve(result) } ) */
            
        } catch (error) {
            reject(error )
        }

   })




}