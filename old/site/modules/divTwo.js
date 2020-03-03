
const divTwo = function (number){
    
    var arr = []
    let mod = 0

    var rem = number

    do {
       mod = rem % 2
       arr.push(mod)
       rem = Math.floor( rem/2 )        
    } while ( rem > 0 )

    // Возводим в степени
    let result = arr.map( (elem, index) => { 
        if (elem) 
            return Math.pow( 2, index )          
    }) 
    .filter( e => e )   // Убираем пустые (undefined)

    return result

}

module.exports.divTwo = divTwo ;


//console.dir( divTwo(17) )