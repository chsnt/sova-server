///////////////////////////////////////////
// Constants

const PORT = 80;
const PORTSTATS = 8888;

// const TABLE_TO_INSERT = 'QUIZ_URZ_2018'
const TABLE_ATTR = 'PC_ATTRIBUTES'
const TABLE_ATTR_STAFF = 'PC_STAFF'

var SCHEMA_SOVA = 'regpc'

///////////////////////////////////////

var express = require('express');
var app = express();
var path = require('path');
var dbConfig = require('./site/modules/dbconfig.js');
var getColumnsArray = require('./site/modules/getColumnsArray.js').getColumnsArray;
var requestDB = require('./site/modules/requestDBwoPromise.js').requestDBwoPromise;

var bodyParser = require('body-parser');
// const iconv = require("iconv-lite");
// var json2xls = require('json2xls');
var moment = require('moment');
//var morgan = require('morgan'); 
var winston = require('winston');   // logger
var read = require('read');
var Seq = require('seq');

//var util = require('util')

const oracledb = require('oracledb');
var SimpleOracleDB = require('simple-oracledb');

const typesCRE = [      // Types of commercial real estate (in lower case)
    'offices_business_center',
    'offices_other',
    'retail_shopping_center',
    'retail_street',
    'retail_other',
    'warehouse_complex',
    'warehouse_other',
    'land_living',
    'land_commercial',
    'land_industrial'];

//
const dateOptions = {
    year:   'numeric',
    month:  'long',
    day:    'numeric',
    hour:   'numeric',
    minute: 'numeric',
    second: 'numeric'
};    

var allVisits     = 0;
var ctVisits      = 0;
var creVisits     = 0;
var rreVisits     = 0;
var landrreVisits = 0;

var homeVisits    = 0;
var userAgent;
var userIP;
var usersCount    = 0;
//var arrUserAgent = [];
var userStats = {};

var now ;
moment.locale('ru');

SimpleOracleDB.extend(oracledb);
SimpleOracleDB.autoCommit = true;

//////////////////////////////////////

var logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: './logs/all-logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        })
    ],
    exitOnError: false
})

logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

app.use(require("morgan")("combined", { stream: logger.stream }));

app.use(bodyParser.urlencoded( { extended: true }))
app.use(bodyParser.json());

/* app.use(session({
    
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    saveUninitialized: false,
    resave: false,
    store: mongoose_store

})); */

app.use(express.static(__dirname + '/site'));

app.get('/', function(req, res) {
    
    res.sendFile(path.join(__dirname + '/site/cre.html'));
    
    // Collect statictics
    allVisits++;
    creVisits++;
 
    identification('cre', req);

});

/************** Pages & statistics */

app.get('/questurz', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/questurz.html'));
});

app.get('/test', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/test.html'));
});

app.get('/regpc/', function(req, res) {
    //console.log('there norm');
    res.sendFile(path.join(__dirname + '/site/regpc-dev/index.html'));
});

app.get('/sova/add', function(req, res) {
    //console.log('there norm');
    //express.static(__dirname + '/site/regpc-dev/')
    //var test1 = req.ip
    res.sendFile(path.join(__dirname + '/site/sova/add-form/index.html'));
});

app.get('/sova/trouble-signal', function(req, res) {
    //console.log('there norm');
    //express.static(__dirname + '/site/regpc-dev/')
    //var test1 = req.ip
    res.sendFile(path.join(__dirname + '/site/sova/trouble-signal/index.html'));
});

app.get('/1', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/1.html'));
});

app.get('/2', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/2.html'));
});

app.get('/3', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/3.html'));
});

app.get('/4', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/4.html'));
});

/************** Statistics */

app.get('/ct', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/ct.html'));
    allVisits++;
    ctVisits++;
    identification('ct', req);
});

app.get('/cre', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/cre.html'));
    allVisits++;
    creVisits++;
    identification('cre', req);
});

app.get('/rre', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/rre.html'));
    allVisits++;
    rreVisits++;
    identification('rre', req);
});

app.get('/landrre', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/landrre.html'));
    allVisits++;
    rreVisits++;
    identification('landrre', req);
});

app.get('/th', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/th.html'));
    allVisits++;
    rreVisits++;
    identification('th', req);
});

app.get('/~', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/portal.html'));
    allVisits++;
    homeVisits++;
    identification('~', req);
});

app.get('/liq', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/liq.html'));
/*     allVisits++;
    liqVisits++; */
    //identification('liq', req);
});

/***************** API *********/

app.param('level1', function(req, res, next, level1) {
    req.level1 = level1;
    next();
});

app.param('level2', function(req, res, next, level2) {
    req.level2 = level2;
    next();
});

app.param('level3', function(req, res, next, level3) {
    req.level3 = level3;
    next();
});

//
app.post('/api/:level1', function(req, res) {
    insertIntoDB(req, res);     
});

app.post('/api/:level1/:level2', function(req, res) {
    //console.dir(JSON.parse(req))   //JSON.parse(
    console.dir(req.body)
    insertIntoDB(req, res);  
});

app.post('/api/:level1/:level2/:level3', function(req, res) {
    insertIntoDB(req, res);  
});

//
app.get('/api/', function(req, res) {

        let userIP = req.ip;                    // IP

        if (userIP.substr(0, 7) == "::ffff:") {
            userIP = userIP.substr(7)
        };    
 
        console.log(userIP + ' interested in REST API!');
        res.redirect('/');
});


app.get('/api/:level1', function(req, res) {

    getFromDB(req, res);     
});

app.get('/api/:level1/:level2', function(req, res) {
    getFromDB(req, res);     
});

app.get('/api/:level1/:level2/:level3', function(req, res) {

    getFromDB(req, res); 
    
    /* if( Object.keys(req.query).length==0 ){            

    } else if (req.query.service && req.query.type && req.query.region && req.query.location) {

    }; */    

/*     var pp = "";
    for (var prop in req.query) {
        var p = "req." + prop + " = " +  req.query[prop];
        console.log(p);
        pp += "\n" + p;
    };
    res.send(pp); */
     
});




app.listen(PORT);
console.log('Rabotaet on ' + PORT + ' port'); 

  Seq()
  .seq(function () {
    read({ prompt : 'Do you wanna abort? (y): ' }, this.into('answer'));
  })
  .seq(function (answer) {
    if ( this.vars.answer === 'y' || this.vars.answer === 'н'  ) { process.exit(-1); }
  });


// Vars env
var http = require("http");

http.createServer(function(request, response) {
    
    var dateOptions = {
        year:   'numeric',
        month:  'long',
        day:    'numeric',
        hour:   'numeric',
        minute: 'numeric',
        second: 'numeric'
    };

    response.writeHead(200, {"Content-Type": "text/plain; charset=UTF-8"});  
    response.write("Statistics\n");   
    response.write("All visits:                               " + allVisits  + "\n");  
    response.write("Homepage visits:                          " + homeVisits + "\n");	  
    response.write("Commercial  Real Estate visits:           " + creVisits  + "\n");	
    response.write("Residential Real Estate visits:           " + rreVisits  + "\n");	
    response.write("Commercial  Transport   visits:           " + ctVisits   + "\n");
    response.write("Lands for Residential Real Estate visits: " + landrreVisits   + "\n\n");

    usersCount = 0;
    for (ip in userStats) { usersCount++; };
    response.write("Unique users:                             " + usersCount + "\n\n");	
    
    response.write("--------------------------------------------\n\n");	
    response.write("From " + now.toLocaleString("en-US", dateOptions) + "\n\n");  
    // response.write("- " + userAgent + "\n");  

    // Footer of table
    response.write("--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n");  
    response.write("|   IP              |  All  | Home |  CRE  |  RRE  |  CT  |LANDRRE|  TH   |                                  Last User Agent                                                                                                            \n");  
    response.write("--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n");  

    for (ip in userStats) {
        response.write("| - " + fillSpaces(ip, 16) + " | " + fillSpaces(userStats[ip].allVisits, 6, 1) + " | " + fillSpaces(userStats[ip].homeVisits, 5, 1) + " | " + 
                       fillSpaces(userStats[ip].creVisits, 6, 1) + " | " + fillSpaces(userStats[ip].rreVisits, 6, 1) + " | " + fillSpaces(userStats[ip].ctVisits, 5, 1) + " | " + 
                       fillSpaces(userStats[ip].landrreVisits, 6, 1) + " | " + fillSpaces(userStats[ip].thVisits, 6, 1) + " | " + userStats[ip].userAgent + "\n");  
                       //response.write();
    };

    response.end();
    
}).listen(PORTSTATS);


////////////////////////////////////
// Func for identification
// page - 're', 'ct'
function identification (page, req){
    
    // Identification
    userAgent = req.get('User-Agent');  // Browser
    userIP = req.ip;                    // IP

    if (userIP.substr(0, 7) == "::ffff:") {
        userIP = userIP.substr(7)
    };    
   
    if(!(userIP in userStats)){

        // New user
        //console.log("New user  " + userIP); 
        userStats[userIP] = { userAgent: userAgent, allVisits : 1 };
        
        userStats[userIP].homeVisits    = 0;
        userStats[userIP].creVisits     = 0;     
        userStats[userIP].rreVisits     = 0;
        userStats[userIP].ctVisits      = 0;         
        userStats[userIP].landrreVisits = 0;  
        userStats[userIP].thVisits      = 0;

        switch (page) {
            case '~':
                userStats[userIP].homeVisits = 1;          
                break;
            case 'cre':
                userStats[userIP].creVisits  = 1;
                break;
            case 'rre':
                userStats[userIP].rreVisits  = 1;
                break;                
            case 'ct':              
                userStats[userIP].ctVisits   = 1;
                break;
            case 'landrre':
                userStats[userIP].landrreVisits = 1;
                break;  
            case 'th':
                userStats[userIP].thVisits = 1;
                break;                                
            default:
                console.log('Новая страница ' + page + ' , обработайте ее, в противном случае не будет сохраняться статистика.');
            };

    }else{

        // Old user; 
        userStats[userIP].userAgent = userAgent;
        userStats[userIP].allVisits = ++userStats[userIP].allVisits;

        switch (page) {
            case '~':
                userStats[userIP].homeVisits = ++userStats[userIP].homeVisits;
                break;
            case 'cre':
                userStats[userIP].creVisits  = ++userStats[userIP].creVisits;
                break;
            case 'rre':
                userStats[userIP].rreVisits  = ++userStats[userIP].rreVisits;
                break;                
            case 'ct':
                userStats[userIP].ctVisits   =  ++userStats[userIP].ctVisits;
                break;
            case 'landrre':
                userStats[userIP].landrreVisits  =  ++userStats[userIP].landrreVisits;
                break;         
            case 'th':
                userStats[userIP].thVisits  =  ++userStats[userIP].thVisits;
                break;                         
            default:
                console.log('Новая страница ' + page + ' , обработайте ее, в противном случае не будет сохраняться статистика.');
            };

    };


};


// Дополнение строки пробелами до указанного количества
// 255.255.255.255 - 16 символов
function fillSpaces(string, count, center){

    string = String(string);

    for (var i = string.length; i < count-1; i++) {
        if (center==1 && i%2==0){
            string = " " + string;
        } else {
            string = string + " ";
        };
    };   

    return string;
};


async function getFromDB( request, response ) {

    var js = ''
    let params = request.query
    
    let argsCount = Object.keys(params).length;

    let queryString = '';
    let bindObj = {};
    let optionsObj = {};
    let bindsArr = [];

    let excelFlag = false;

    // Type to lower case  
    if (params.type) { params.type = params.type.toLowerCase() };

    // String with types
    typesCREstr = typesCRE.join(', ');

    caseStatement  = ``;    // Case conditions
    typesCRE.forEach(function(item, i, arr) {
        caseStatement += `WHEN '${item}' THEN ${item} \n`;           
    });



    // 
    if ( request.level1 == 'locations' && (argsCount == 0 || (argsCount == 1 && params.excel) )) {
        queryString = ` SELECT 
                            state, locality 
                        FROM  SHORT_LIST_LOCATIONS `;
        optionsObj = { outFormat: oracledb.OBJECT };
        excelFlag  = ( params.excel )? true : false;            

    } else if ( request.level1 == 'locations' && params.service == 'cre' ) {
        //console.log('come into locations cre');
        queryString = ` SELECT 
                            state, locality 
                        FROM  SHORT_LIST_LOCATIONS 
                        WHERE cre = 1 `;
        optionsObj = { outFormat: oracledb.OBJECT };
        excelFlag  = (params.excel)? true : false;   

    } else if ( request.level1 == 'locations' && params.service == 'rre' )  {
        
        queryString = ` SELECT 
                            state, locality 
                        FROM  SHORT_LIST_LOCATIONS 
                        WHERE rre = 1 `;
        optionsObj = { outFormat: oracledb.OBJECT };
        excelFlag  = (params.excel)? true : false; 

    } else if ( request.level1 == 'locations' && params.service == 'landrre' )  {
        
        queryString = ` SELECT
                            ll.id, ll.state, ll.locality 
                        FROM  SHORT_LIST_LOCATIONS ll
                        JOIN  RRE_AVG_PRICE_CURRENT pr
                        ON    ll.state = pr.state AND pr.locality = ll.locality
                        WHERE ll.landrre = 1 
                        ORDER BY pr.price DESC `;

        optionsObj = { outFormat: oracledb.OBJECT };
        excelFlag  = (params.excel)? true : false; 

    } else if ( argsCount == 4 && request.level1 == 'catalog' && request.level2 == 'avgprice' && params.service == 'cre' && typesCRE.indexOf(params.type)>-1 && params.region && params.location ) {
       
        // /api/catalog/avgprice?service=cre&type=offices_other&region=Москва&location=ЦАО 
        queryString = `  SELECT 
                             CASE :type 
                                  ${caseStatement} 
                             END
                         FROM CRE_AVG_PRICE_CURRENT
                         WHERE (state = :region AND locality = :location)
                       `;

        // JSON_OBJECT ('deptId' IS department_id, 'name' IS department_name)

        bindObj = {
                  region:   params.region
                , location: params.location
                , type:     params.type  
                , price:  { dir: oracledb.BIND_OUT, type: oracledb.STRING }
        };

        //optionsObj = { outFormat: oracledb.OBJECT };


    } else if ( argsCount == 3 && request.level1 == 'catalog' && request.level2 == 'avgprice' && params.service == 'cre' && typesCRE.indexOf(params.type)>-1 && params.region ) {
        // /api/catalog/avgprice?service=cre&type=offices_other&region=Москва    
        console.log('come into catalog avgprice cre (region)');

        queryString =  `SELECT 
                             locality
                            ,CASE :type 
                                ${caseStatement} 
                             END
                        FROM CRE_AVG_PRICE_CURRENT
                        WHERE state = :region
                        `;
        bindObj = {
                  region: params.region                
                , type:   params.type  
        };

    } else if (argsCount == 1 && request.level1 == 'catalog' && request.level2 == 'avgprice' && params.service == 'landrre') {
        queryString = ` 
                        SELECT pr.state, pr.locality, pr.price 
                        FROM RRE_AVG_PRICE_CURRENT pr
                        JOIN (select * from SHORT_LIST_LOCATIONS WHERE LANDRRE=1) ll        
                        ON pr.state = ll.state AND pr.locality = ll.locality 
                        ORDER BY pr.price DESC
                      `;
        
        optionsObj = { outFormat: oracledb.OBJECT };    

        /* bindObj = {
              region:   params.region
            , location: params.location
            //, price: { dir: oracledb.BIND_OUT, type: oracledb.STRING}
        };  */        

    } else if ( argsCount == 2 && params.service == 'cre' && params.type == 'avgprice' ) {
        queryString = ' SELECT * FROM CRE_AVG_PRICE_CURRENT ';

    } else if ( argsCount == 2 && params.service == 'cre' && params.type == 'avgprice' ) {
        queryString = ' SELECT * FROM CRE_AVG_PRICE_CURRENT ';

    } else if (argsCount == 3 && request.level1 == 'catalog' && request.level2 == 'avgprice' && params.service == 'rre' && params.region && params.location) {
        //queryString = ' RRE_AVG_PRICE_CURRENT ';

        console.log('there')
        queryString = ` 
                        SELECT PRICE 
                        FROM RRE_AVG_PRICE_CURRENT 
                        WHERE STATE = :region AND LOCALITY = :location         
                      `; 

        bindObj = {
              region:   params.region
            , location: params.location
            //, price: { dir: oracledb.BIND_OUT, type: oracledb.STRING}
        };                      
        optionsObj = { outFormat: oracledb.OBJECT };

    } else if (argsCount == 3 && request.level1 == 'catalog' && request.level2 == 'avgprice' && params.service == 'landrre' && params.region && params.location) {
        queryString = ` 
                        SELECT price 
                        FROM RRE_AVG_PRICE_CURRENT 
                        WHERE (state = :region AND locality = :location)         
                      `;

        bindObj = {
              region:   params.region
            , location: params.location
            //, price: { dir: oracledb.BIND_OUT, type: oracledb.STRING}
        };                            
        optionsObj = { outFormat: oracledb.OBJECT };

        // *********** REGPC ***************** // 
    } else if ( request.level1 == 'regpc' && params.list == 'loсations' && params.subj == 'state')  {

        queryString = ` 
        SELECT DISTINCT STATE
        FROM SHORT_LIST_LOCATIONS 
        ORDER BY STATE ASC         
        `;
                        
        optionsObj = { outFormat: oracledb.OBJECT };          
        
    } else if ( request.level1 == 'regpc' && params.list == 'loсations' && params.subj == 'loc')  {

        queryString = ` 
        SELECT DISTINCT LOCALITY
        FROM SHORT_LIST_LOCATIONS 
        WHERE LOCALITY != 'Прочие населенные пункты' AND STATE != 'Москва' AND STATE != 'Санкт-Петербург'
        ORDER BY LOCALITY ASC         
        `;
                        
        optionsObj = { outFormat: oracledb.OBJECT };              

        // toc - types of company
    } else if ( request.level1 == 'regpc' && params.list == 'toc' )  {

        // Запилить здесь SELECT Distinct TYPE_COMPANY FROM PC_ATTRIBUTES ORDER BY TYPE ASC
        queryString = ` 
        SELECT id, TYPE 
        FROM ${ SCHEMA_SOVA}.TYPE_OF_COMPANY 
        ORDER BY TYPE ASC         
        `;
                        
        optionsObj = { outFormat: oracledb.OBJECT };   

    // Свободная форма
    // && argsCount == 1 && params.add === '1' 
    } else if ( request.level1 == 'regpc' && params.field_out && params.table && params.field_where && params.value && params.valtype )  {

        //console.log('params.valtype = ' + params.valtype)

        if( params.valtype == 'string' ){
            val = `'${params.value}'`
        } else if ( params.valtype == 'number' ) {
            val = params.value
        }
        
        queryString = ` 
        SELECT ${params.field_out} response
        FROM   ${ SCHEMA_SOVA}.${params.table}  
        WHERE  ${params.field_where} = ${val}          
        `;
                        
        optionsObj = { outFormat: oracledb.OBJECT };   


    /// !!! GET_COMPANIES_DATA 
    } else if ( argsCount == 2 && request.level1 == 'sova' && request.level2 == 'get' && params.service == 'companies_data' && params.v ) {

        // Parse version
        v = params.v.split('.')

        switch (v[0]) {
            case '0':
            case '1':
                    // /api/sova/get?service=COMPANIES_data&v=1.0
                    queryString = `  SELECT 
                                            id,
                                            TYPE_OF_COMPANY type,
                                            name,
                                            ABBREVIATION abbr,
                                            TIN,
                                            REG_PLACE place,
                                            ${ function() {
                                                    switch (v[1]) {
                                                        case '0': return `TO_CHAR (PRESENCE_LOCALITY) LOCALITY`
                                                        case '1': return `JSON_QUERY(PRESENCE_LOCALITY, '$.region' WITH  WRAPPER) AS region,
                                                                        JSON_QUERY(PRESENCE_LOCALITY, '$.city'   WITH  WRAPPER) AS city`
                                                    }
                                                }()
                                            }
                                        
                                        FROM ${ SCHEMA_SOVA}.PC_ATTRIBUTES 
                                        ORDER BY ID ASC  
                                    `;
                    break;

        }
       
        console.log(queryString)


        // JSON_OBJECT ('deptId' IS department_id, 'name' IS department_name)

        optionsObj = { outFormat: oracledb.OBJECT };   


    } else if ( argsCount == 2 && request.level1 == 'baudit' && request.level2 == 'get' && params.service == 'classifications' && params.v ) {

        //console.log( oracledb.outFormat )    //oracledb.outFormat = oracledb.OUT_FORMAT_ARRAY;

        SCHEMA = request.level1.toUpperCase()
        TABLE  = params.service.toUpperCase()

        colunms = await getColumnsArray(SCHEMA, TABLE)
        colunms= JSON.parse(colunms)
        //var g = new getColumnsArray()

        console.log(colunms[0] )


        // Parse version
        v = params.v.split('.')

        switch (v[0]) {
            case '0':
            case '1':

            switch (v[1]) {
                case '0':
                    // /api/baudit/get?service=classifications&v=1.0
                    cicle = 1   // Циклический запрос
                    queryString = `  SELECT 
                                        *                                        
                                     FROM ${SCHEMA}.${TABLE} 
                                     ORDER BY ID ASC  
                                    `;
                    break;

                case '1':
                    queryString = ` SELECT DISTINCT
                                        TYPE_BUILD
                                    FROM ${SCHEMA}.${TABLE} 
                                    WHERE TYPE_BUILD IS NOT NULL

                                  `;
                    break;

            }

        }
       
        console.log(queryString)


        // JSON_OBJECT ('deptId' IS department_id, 'name' IS department_name)

        optionsObj = { outFormat: oracledb.OBJECT };   


    } else {

        console.log('Bad request')

    };


    t = await requestDB(queryString, optionsObj)
    response.send(t); 
    return t;

    // If the request has matured
    if (queryString != '') {
        
        try {

            connection4 = await oracledb.getConnection(
            { 
                user: dbConfig.user, 
                password: dbConfig.password, 
                connectString: dbConfig.connectString
            });

        
        // json = JSON.stringify(myContent);
        console.log('-- Before SQL execute -- : ' + queryString )

        for(key in bindObj){
            console.log(`bindObj[${key}] = ${bindObj[key]}`);
        };

        result = await connection4.execute(
             queryString
            ,bindObj
            ,optionsObj
        )

            // 
            if ( result.rows.length ) {   // If result there is         
                
                if ( excelFlag ) {
                    js = await JSON.parse(JSON.stringify(result.rows));     // Workaround for JSON work
                    response.xls('data.xlsx', js);

                } else {
                    js = await JSON.stringify(result.rows);  
                    response.send(js);
                };

            } else {
                js = 'No results';
                response.send(js);
            };
    
        } catch (err) {
            console.error(err);
            response.send(err);
        } finally {
            if (connection4) {
                try {
                    await connection4.close();
                } catch (err) {
                    console.error(err);
                }
            }

        }

    } else {   

       response.send('Request not processed');        

    };

  };


  /// http://urz.open.ru:88/api/questurz?newrecord=1

  async function insertIntoDB ( request, response ) {
  
    var js = '';

    

    let params = request.query;
    
    let argsCount = Object.keys(params).length;

    let queryString = '';
    let bindObj = {};
    let optionsObj = {};

    let excelFlag = false;

    let multiInsert = false;

    var ip  = request.ip;

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    };     

    // Type to lower case  
    if (params.type) { params.type = params.type.toLowerCase() };

    // String with types
    typesCREstr = typesCRE.join(', ');

    caseStatement  = ``;    // Case conditions
    typesCRE.forEach(function(item, i, arr) {
        caseStatement += `WHEN '${item}' THEN ${item} \n`;           
    });
    

    let bindsArr = []

    console.log( "request.level1  = " + request.level1  )
    console.log( "request.level2  = " + request.level2  )
    console.log( "params.service  = " + params.service  )
    console.log( "argsCount  = " + argsCount  )
    console.log( "params.v  = " + params.v  )


    if ( request.level1 == 'questurz' && argsCount == '1' && params.newrecord ) {

    } else if (request.level1 == 'regpc' && argsCount == 1 && params.add === '1' ){        
        
        multiInsert = false

        console.log("request.body");
        console.dir(request.body);
        let objInput = request.body;
        
        console.log("objInput:");
        console.dir(objInput);

        bindsObj = await bindObjMaker(objInput, ip, "pc_attributes")
        
        console.log("bindsObj:")
        console.dir ( bindsObj );


    queryString = `INSERT INTO ${ SCHEMA_SOVA}.${TABLE_ATTR} (
                name, ABBREVIATION, TIN, PSRN, REG_DATE, OKPO, LEGAL_ADDRESS_COUNTRY, LEGAL_ADDRESS, ACTUAL_ADDRESS_REGION, ACTUAL_ADDRESS, PHONE, MOBILE_PHONE, FAX, EMAIL, SITE, 
                ACCOUNT_DETAILS_BANK_NAME, ACCOUNT_DETAILS_SETTLEMENT_ACC, ACCOUNT_DETAILS_CORR_ACC, ACCOUNT_DETAILS_BIC, TIME_OF_ACTIVITY, CAPITAL_AMOUNT, FEDERAL_TAX_SERVICE_CONTACTS, AFFILIATES_INFO, 
                INSURANCE_COMPANIES, APPRAISERS_NUMBER, APPRAISERS_INV_AVAILABILITY, QUANTITY_APPRAISERS, 
                AVG_QTY_REPORTS_IN_MOUNTH, INV_EXTERNAL_MAX, MAX_REPORTS, PARTNER_BANKS, WORKS_INFO, RVC, ID_TYPE, ACTUAL_ADDRESS_LOCALITY, SUBSIDIARIES, SUM_INSURED, DATE_OF_START_INSURANCE_POLICY, 
                DATE_OF_END_INSURANCE_POLICY, QUANTITY_APPRAISERS_DECLARED, REG_PLACE, REG_AGENCY, PRESENCE_LOCALITY, TYPE_OF_COMPANY, DATE_ADD, AUTHOR_ADD )

                VALUES ( :nm, :abr, :tin, :psrn, to_date(:rd, 'DD.MM.YYYY'), :okpo, :lac, :lad, :aar, :aad, :pho, :mpho, :fax, :email, :site, 
                         :adbn, :adsett, :adcorr, :adb, :toa, :capa, :ftsc, :afi, 
                         :inscom, :appnum, :appiav, :qtyapp, 
                         :avgrepm, :extmax, :maxrep, :partnb, :wrkinf, :rvc, :idty, :actaddr, :subs, :sumins, to_date(:dtst, 'DD.MM.YYYY'), 
                         to_date(:dten, 'DD.MM.YYYY'), :qtydc, :regpl, :regag, :pres, :tyco, :dadd, :auth )`;
        

        optionsObj = {
            
             autoCommit: true,
              bindDefs: {    


                     nm:    { type: oracledb.STRING , maxSize: 1000 }  //name
                    ,abr:   { type: oracledb.STRING , maxSize: 1000 }  //ABBREVIATION                    
                    ,tin:   { type: oracledb.STRING , maxSize: 1000 }  //TIN 
                    ,psrn:  { type: oracledb.STRING , maxSize: 20   }  //PSRN
                    ,rd:	{ type:oracledb.DATE }                     //REG_DATE                    
                    ,okpo:  { type: oracledb.STRING , maxSize: 50   }  //OKPO
                    ,lac:   { type: oracledb.STRING , maxSize: 30   }  //LEGAL_ADDRESS_COUNTRY              
                    ,lad:   { type: oracledb.STRING , maxSize: 500  }  //LEGAL_ADDRESS        
                    ,aar:   { type: oracledb.STRING , maxSize: 50   }  //ACTUAL_ADDRESS_REGION
                    ,aad:   { type: oracledb.STRING , maxSize: 1000 }  //ACTUAL_ADDRESS
                    ,pho:   { type: oracledb.STRING , maxSize: 20   }  //PHONE        
                    ,mpho:  { type: oracledb.STRING , maxSize: 20 }    //MOBILE_PHONE
                    ,fax:   { type: oracledb.STRING , maxSize: 20 }    //FAX
                    ,email: { type: oracledb.STRING , maxSize: 20 }    //EMAIL        
                    ,site:  { type: oracledb.STRING , maxSize: 30 }    //SITE
                    ,adbn:  { type: oracledb.STRING , maxSize: 50 }    //ACCOUNT_DETAILS_BANK_NAME        
                    ,adsett:  { type: oracledb.STRING , maxSize: 30 }  //ACCOUNT_DETAILS_SETTLEMENT_ACC              	
                    ,adcorr:  { type: oracledb.STRING , maxSize: 30 }  //ACCOUNT_DETAILS_CORR_ACC    
                    ,adb:   { type: oracledb.STRING , maxSize: 20   }  //ACCOUNT_DETAILS_BIC
                    ,toa:   { type:oracledb.DATE }                     //TIME_OF_ACTIVITY                        
                    ,capa:  { type: oracledb.NUMBER }                  //CAPITAL_AMOUNT
                    ,ftsc:  { type: oracledb.STRING , maxSize: 1000  }  //FEDERAL_TAX_SERVICE_CONTACTS                    
                    ,afi:   { type: oracledb.STRING , maxSize: 1500  }  //AFFILIATES_INFO
                    //,ofo:    { type: oracledb.STRING , maxSize: 1500 }  //ORGANIZATION_FOUNDERS
                    ,appnum:  { type: oracledb.NUMBER }                  //APPRAISERS_NUMBER                  
                    /*  ,head:    { type: oracledb.STRING , maxSize: 1500   }  //HEAD_OF_ORGANIZATION        
                    ,chacc:   { type: oracledb.STRING , maxSize: 1500 }  //CHIEF_ACCOUNTANT */                   
                    ,inscom:  { type: oracledb.STRING , maxSize: 2000 }  //INSURANCE_COMPANIES        
                    ,appiav:  { type: oracledb.NUMBER }                  //APPRAISERS_INV_AVAILABILITY                    
                    ,qtyapp:  { type: oracledb.NUMBER }                  //QUANTITY_APPRAISERS            
                    ,avgrepm: { type: oracledb.NUMBER }                  //AVG_QTY_REPORTS_IN_MOUNTH            
                    ,extmax:  { type: oracledb.NUMBER }                  //INV_EXTERNAL_MAX  
                    ,maxrep:  { type: oracledb.NUMBER }	                 //MAX_REPORTS
                    ,partnb:  { type: oracledb.STRING , maxSize: 1500 }  //PARTNER_BANKS
                    ,wrkinf:  { type: oracledb.STRING , maxSize: 2000 }  //WORKS_INFO
                    ,rvc:     { type: oracledb.NUMBER }	                 //RVC
                    ,idty:    { type: oracledb.NUMBER }                  //ID_TYPE        
                    ,actaddr: { type: oracledb.STRING , maxSize: 1000 }  //ACTUAL_ADDRESS_LOCALITY
                    ,subs:    { type: oracledb.STRING , maxSize: 2000 }  //SUBSIDIARIES
                    ,sumins:  { type: oracledb.NUMBER }                  //SUM_INSURED        
                    ,dtst:    { type: oracledb.DATE }                    //DATE_OF_START_INSURANCE_POLICY
                    ,dten:    { type: oracledb.DATE }                    //DATE_OF_END_INSURANCE_POLICY        
                    ,qtydc:   { type: oracledb.NUMBER }                  //QUANTITY_APPRAISERS_DECLARED	        
                    ,regpl:   { type: oracledb.STRING , maxSize: 2000 }  // REG_PLACE
                    ,regag:   { type: oracledb.STRING , maxSize: 2000 }  // REG_AGENCY
                    ,pres:    { type: oracledb.STRING , maxSize: 64000 } // PRESENCE_LOCALITY  
                    ,dadd:    { type: oracledb.STRING , maxSize: 32 }    // DATE_ADD
                    ,auth:    { type: oracledb.STRING , maxSize: 32 }    // AUTHOR_ADD
   
              }                          

        }
        
        //
    // If the request has matured
    if (queryString != '') {
        
            try {

                connection = await oracledb.getConnection(
                { 
                    user: dbConfig.user, 
                    password: dbConfig.password, 
                    connectString: dbConfig.connectString
                });
                
                result = await connection.execute(
                    queryString
                    ,bindsObj
                    ,optionsObj
                ); 
                  
                console.log( result.rowsAffected )          

                // 
                if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
                    

                    try {

                        connection2 = await oracledb.getConnection(
                        { 
                            user: dbConfig.user, 
                            password: dbConfig.password, 
                            connectString: dbConfig.connectString
                        });
                        
                        let id_company = await connection2.execute("SELECT max(id) from regpc.pc_attributes");
                          
                        console.log( id_company )        

                        result.id_company = id_company.rows[0][0];
                        console.dir(result)
                        response.send(result);

                
                    } catch (err) {
                        console.error(err);
                        response.send(err);
                    
                    } finally {
                        if (connection2) {
                            try {
                        await connection2.close();
                            } catch (err) {
                        console.error(err);
                            }
                        }
                
                    }
                    

                };
        
            } catch (err) {
                console.error(err);
                response.send(err);
            
            } finally {
                if (connection) {
                    try {
                await connection.close();
                    } catch (err) {
                console.error(err);
                    }
                }
        
            }

        } else {   

        response.send('Request not processed');        

        };


    } else if (request.level1 == 'regpc' && argsCount == 1 && params.add === '2' ){
       
        multiInsert = true
        console.log('params.add = 2')
        console.log("request.body");
        console.dir(request.body);
        let objInput = request.body;
        //let objInput = JSON.parse(request.body)
        console.log(objInput);

         /* for (var key in o) {
            console.log(key, ':', o[key]);
        } */
        //objInput = request.body;
        //console.dir ( bindsObj );

        //bindsArr = prepareArrawToDB( objInput )
        bindsArr = await bindArrMakerMany( objInput, ip, 'staff' )
        console.log("bindsArr:")
        console.dir ( bindsArr );

        //
        queryString = `INSERT INTO ${ SCHEMA_SOVA}.${TABLE_ATTR_STAFF} (
                            POSITION_WEIGHT, FULLNAME, DATEBORN, PLACEBORN, PASSPORT, PASSPORT_ISSUER, PASSPORT_DATE, 
                            ADDRESS_REG, EXPERIENCE_IN_COMPANY, PHONE_NUM, EMPL_CONTRACT,DIPLOM, SELFREG_ORG_NAME, SELFREG_PROOF_DOC, 
                            INSURANCE_POLICY, INSURANCE_COMPANY, INSURANCE_AMOUNT, INSURANCE_START_DATE, INSURANCE_END_DATE,
                            EXPERIENCE_ALL, ID_COMPANY, ADDRESS_RESIDENTIAL, CERT_DATA, DATE_ADD, AUTHOR_ADD )

                    VALUES ( :pos, :fulln , to_date(:dtb, 'DD.MM.YYYY'), :plb , :passp , :passpi, to_date(:passpd, 'DD.MM.YYYY'), 
                                :addrr , :expc , :phn , :empc , :dipl , :orgn , :prfd , 
                                :insp , :insc , :insa , to_date(:inds, 'DD.MM.YYYY'), to_date(:inde, 'DD.MM.YYYY'), 
                                :expa , :idc , :addr, :cert, :dadd, :auth )`;    
    
                    
        // STATUS, FULLNAME, DATEBORN, PLACEBORN, PASSPORT, PASSPORT_ISSUER, PASSPORT_DATE, ADDRESS_REG, EXPERIENCE_IN_COMPANY, PHONE_NUM, EMPL_CONTRACT,DIPLOM,SELFREG_ORG_NAME,SELFREG_PROOF_DOC,INSURANCE_POLICY,INSURANCE_COMPANY,INSURANCE_AMOUNT,INSURANCE_START_DATE,INSURANCE_END_DATE,EXPERIENCE_ALL,QUAL_CERT_DIRECTION,QUAL_CERT_NUM,QUAL_CERT_DATE_START,QUAL_CERT_DATE_END,ID_COMPANY,ADDRESS_RESIDENTIAL

        optionsObj = {
            
             autoCommit: true,
              bindDefs: {    

                 pos:    { type: oracledb.STRING , maxSize: 64 }    // status
                ,fulln:  { type: oracledb.STRING , maxSize: 1000 }    // fullname
                
                /////  dtb:    { type: oracledb.DATE }          // dateborn

                ,dtb:    { type: oracledb.STRING, maxSize: 10 }

                ,plb:    { type: oracledb.STRING , maxSize: 1000 }   // placeborn
                ,passp:  { type: oracledb.STRING , maxSize: 1000 }   // passport
                ,passpi: { type: oracledb.STRING , maxSize: 1000 }   // passport_issuer
                ,passpd: { type: oracledb.STRING , maxSize: 10 }     // passport_date
                ,addrr:  { type: oracledb.STRING , maxSize: 1000 }   // address_reg
                ,expc:   { type: oracledb.STRING , maxSize: 1000 }   // experience_in_company

                ,phn:    { type: oracledb.STRING , maxSize: 20 }     // phone_num
                ,empc:   { type: oracledb.STRING , maxSize: 1000 }    // empl_contract
                ,dipl:   { type: oracledb.STRING , maxSize: 1000 }    // diplom
                ,orgn:   { type: oracledb.STRING , maxSize: 1000 }    // selfreg_org_name
                ,prfd:   { type: oracledb.STRING , maxSize: 1000 }    // selfreg_proof_doc
                ,insp:   { type: oracledb.STRING , maxSize: 1000 }    // insurance_policy
                ,insc:   { type: oracledb.STRING , maxSize: 1000 }    // insurance_company
                ,insa:   { type: oracledb.STRING , maxSize: 128 }    // insurance_amount
                ,inds:   { type: oracledb.STRING , maxSize: 10  }    // insurance_start_date
                ,inde:   { type: oracledb.STRING , maxSize: 10  }    // insurance_end_date
                ,expa:   { type: oracledb.STRING , maxSize: 118 }    // experience_all
                               
                ,idc:    { type: oracledb.STRING , maxSize: 128 }    // id_company
                ,addr:   { type: oracledb.STRING , maxSize: 1000 }    // address_residential

                ,cert:   { type: oracledb.STRING , maxSize: 64000 }    // cert

                ,dadd:   { type: oracledb.STRING , maxSize: 32 }    // DATE_ADD
                ,auth:   { type: oracledb.STRING , maxSize: 32 }    // AUTHOR_ADD      
                
                
                //              
                                
              } 
        }   
        
        
        // If the request has matured
        if (queryString != '' && objInput != {}) {
                
            try {

                connection3 = await oracledb.getConnection(
                { 
                    user: dbConfig.user, 
                    password: dbConfig.password, 
                    connectString: dbConfig.connectString
                });
                            
                //result = await connection.batchInsert(  
                result = await connection3.executeMany(  
                     queryString
                    ,bindsArr
                    ,optionsObj
                );                        

                console.log( result.rowsAffected )          

                // 
                if ( result.rowsAffected > 0 ) {   // If result there is ( !!! check result consist and find success result )
                    
                    //let id_company = await connection.execute("SELECT max(id) from regpc.pc_attributes");    // Здесь нужно возвращать значение ID с помощью BIND_OUT еще при вызове execute, тогда будет корректно 
                    console.dir(result)
                    
                    // result.id_company = id_company.rows[0][0];
                    console.dir(result)
                    response.send(result);
                };

            } catch (err) {
                console.error(err);
                response.send(err);
            
            } finally {
                if (connection3) {
                    try {
                await connection3.close();
                    } catch (err) {
                console.error(err);
                    }
                }
            }

        } else {   
            response.send('Request not processed');    
        };        

    // Удалить компанию
    } else if (request.level1 == 'regpc' && argsCount == 1 && params.del === '1' && (typeof params.id == "number")  ){   
        
        // Delete 
        queryString = `DELETE FROM ${ SCHEMA_SOVA}.${TABLE_ATTR} WHERE ID=${params.id}`

        if (queryString != '') {
                
            try {

                connection3 = await oracledb.getConnection(
                { 
                    user: dbConfig.user, 
                    password: dbConfig.password, 
                    connectString: dbConfig.connectString
                });
                            
                //result = await connection.batchInsert(  
                result = await connection3.executeMany(  
                     queryString
                );
                
                console.log( 'Удалены: ' + result.rowsAffected )          

                // 
                if ( result.rowsAffected > 0 ) {   // If result there is ( !!! check result consist and find success result )
                    
                    //let id_company = await connection.execute("SELECT max(id) from regpc.pc_attributes");    // Здесь нужно возвращать значение ID с помощью BIND_OUT еще при вызове execute, тогда будет корректно 
                    console.dir(result)
                    
                    // result.id_company = id_company.rows[0][0];
                    console.dir(result)
                    response.send(result);
                };

            } catch (err) {
                console.error(err);
                response.send(err);
            
            } finally {
                if (connection3) {
                    try {
                await connection3.close();
                    } catch (err) {
                console.error(err);
                    }
                }
            }

        } else {   
            response.send('Request not processed');    
        };        

    // trouble-signal
    } else if (request.level1 == 'sova' && request.level2 == 'post' && argsCount == 2 && params.service == 'trouble-signal' && params.v  ){        
        
        multiInsert = false


         console.dir(request);
        //console.log(JSON.stringify(request.body))
        /* console.log(JSON.parse(request.body));
        console.log(JSON.stringify(request.body)); */
        // Костыль для обработки криво получаемого объекта
        console.log("request.body по ключам");

        /* for (key in request.body) {   
            console.log(key)         
            console.log(request.body[key])    
            //objInput = JSON.parse(JSON.parse(key))
            objInput = JSON.parse(key)
          } */


        let objInput = request.body;
        
        console.log("objInput:");
        console.dir(objInput);


        bindsObj = await bindObjMaker(objInput, ip, "trouble_signal")
        
        console.log("bindsObj:")
        console.dir ( bindsObj );

        v = params.v.split('.')

        switch (v[0]) {
            case '0':
                console.log('case 0')
                console.dir(objInput)               
                response.send(JSON.stringify(objInput))
                break;
            case '1':
                console.log('case 1')
                // /api/sova/get?service=COMPANIES_data&v=1.0
                queryString = `INSERT INTO ${ SCHEMA_SOVA}.TROUBLE_SIGNAL (
                                    USERNAME,
                                    DEPARTMENT,
                                    ID_COMPANY,
                                    STATE,
                                    TYPE_OF_TROUBLE,
                                    DESCRIPTION,
                                    AUTHOR_IP,
                                    DATE_ADD
                    )

                    VALUES ( :usn, :depa, :idc, :stat, :totr, :descr, :auth, :dadd )`;
                                            


                    optionsObj = {
                        
                        autoCommit: true,
                        bindDefs: {    

                                 usn:    { type: oracledb.STRING , maxSize: 1000 }  //username
                                ,depa:   { type: oracledb.STRING , maxSize: 1000 }  //department                    
                                ,idc:    { type: oracledb.NUMBER }                  //id_company 
                                ,stat:   { type: oracledb.STRING , maxSize: 128  }  //state     
                                ,totr:   { type: oracledb.STRING , maxSize: 128  }  //type_of_trouble                    
                                ,descr:  { type: oracledb.STRING , maxSize: 4000 }  //description

                                ,auth:  { type: oracledb.STRING , maxSize: 32 }    // AUTHOR_ADD
                                ,dadd:  { type: oracledb.STRING , maxSize: 32 }    // DATE_ADD
            
                        }                          

                    }

                     
                    //
                // If the request has matured
                if (queryString != '') {
                    
                        try {

                            connection = await oracledb.getConnection(
                            { 
                                user: dbConfig.user, 
                                password: dbConfig.password, 
                                connectString: dbConfig.connectString
                            });
                            
                            result = await connection.execute(
                                queryString
                                ,bindsObj
                                ,optionsObj
                            ); 
                            
                            console.log( result.rowsAffected )          

                            // 
                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
                                //
                                response.send(result);
                                
                            };
                    
                        } catch (err) {
                            console.error(err);
                            response.send(err);
                        
                        } finally {
                            if (connection) {
                                try {
                            await connection.close();
                                } catch (err) {
                            console.error(err);
                                }
                            }
                    
                        }

                    } else {   

                        response.send('Request not processed');        

                    };

                    break;  
        default:
            response.send('Request not processed');      

      }

        } else if (request.level1 == 'sova' && request.level2 == 'post' && argsCount == 2 && params.service == 'trouble-signal' && params.v  ){        
        
        multiInsert = false


         console.dir(request);
        //console.log(JSON.stringify(request.body))
        /* console.log(JSON.parse(request.body));
        console.log(JSON.stringify(request.body)); */
        // Костыль для обработки криво получаемого объекта
        console.log("request.body по ключам");

        /* for (key in request.body) {   
            console.log(key)         
            console.log(request.body[key])    
            //objInput = JSON.parse(JSON.parse(key))
            objInput = JSON.parse(key)
          } */


        let objInput = request.body;
        
        console.log("objInput:");
        console.dir(objInput);


        bindsObj = await bindObjMaker(objInput, ip, "trouble_signal")
        
        console.log("bindsObj:")
        console.dir ( bindsObj );

        v = params.v.split('.')

        switch (v[0]) {
            case '0':
                console.log('case 0')
                console.dir(objInput)               
                response.send(JSON.stringify(objInput))
                break;
            case '1':
                console.log('case 1')
                // /api/sova/get?service=COMPANIES_data&v=1.0
                queryString = `INSERT INTO ${ SCHEMA_SOVA}.TROUBLE_SIGNAL (
                                    USERNAME,
                                    DEPARTMENT,
                                    ID_COMPANY,
                                    STATE,
                                    TYPE_OF_TROUBLE,
                                    DESCRIPTION,
                                    AUTHOR_IP,
                                    DATE_ADD
                    )

                    VALUES ( :usn, :depa, :idc, :stat, :totr, :descr, :auth, :dadd )`;
                                            


                    optionsObj = {
                        
                        autoCommit: true,
                        bindDefs: {    

                                 usn:    { type: oracledb.STRING , maxSize: 1000 }  //username
                                ,depa:   { type: oracledb.STRING , maxSize: 1000 }  //department                    
                                ,idc:    { type: oracledb.NUMBER }                  //id_company 
                                ,stat:   { type: oracledb.STRING , maxSize: 128  }  //state     
                                ,totr:   { type: oracledb.STRING , maxSize: 128  }  //type_of_trouble                    
                                ,descr:  { type: oracledb.STRING , maxSize: 4000 }  //description

                                ,auth:  { type: oracledb.STRING , maxSize: 32 }    // AUTHOR_ADD
                                ,dadd:  { type: oracledb.STRING , maxSize: 32 }    // DATE_ADD
            
                        }                          

                    }

                     
                    //
                // If the request has matured
                if (queryString != '') {
                    
                        try {

                            connection = await oracledb.getConnection(
                            { 
                                user: dbConfig.user, 
                                password: dbConfig.password, 
                                connectString: dbConfig.connectString
                            });
                            
                            result = await connection.execute(
                                queryString
                                ,bindsObj
                                ,optionsObj
                            ); 
                            
                            console.log( result.rowsAffected )          

                            // 
                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
                                //
                                response.send(result);
                                
                            };
                    
                        } catch (err) {
                            console.error(err);
                            response.send(err);
                        
                        } finally {
                            if (connection) {
                                try {
                            await connection.close();
                                } catch (err) {
                            console.error(err);
                                }
                            }
                    
                        }

                    } else {   

                        response.send('Request not processed');        

                    };

                    break;  
        default:
            response.send('Request not processed');      

      }

    } else {
        console.log('elseelse-else')
        response.send('Request not processed');   
    }

  };


  // 
  let bindObjMaker = (objInput, ip, type) => {

    // { id : {val: 1 }, nm : {val: 'Chris'}  
    var now = new Date()

    var bindsObj = {};

    switch(type) {

        case "pc_attributes":

            bindsObj.nm      = {val: objInput.name}
            bindsObj.abr     = {val: objInput.abbreviation}    
            bindsObj.tin     = {val: objInput.tin }    
            bindsObj.psrn    = {val: objInput.psrn}    
            bindsObj.rd      = {val: objInput.reg_date }    
            bindsObj.okpo    = {val: objInput.okpo}    
            bindsObj.lac     = {val: objInput.legal_address_country}     
            bindsObj.lad     = {val: objInput.legal_address}   
            bindsObj.aar     = {val: objInput.actual_address_region}   
            bindsObj.aad     = {val: objInput.actual_address}      
            bindsObj.pho     = {val: objInput.phone}      
            bindsObj.mpho    = {val: objInput.mobile_phone}    
            bindsObj.fax     = {val: objInput.fax}   
            bindsObj.email   = {val: objInput.email} 
            bindsObj.site    = {val: objInput.site}    
            bindsObj.adbn    = {val: objInput.account_details_bank_name}  
            bindsObj.adsett  = {val: objInput.account_details_settlement_acc } 
            bindsObj.adcorr  = {val: objInput.account_details_corr_acc}    
            bindsObj.adb     = {val: objInput.account_details_bic}     
            bindsObj.toa     = {val: objInput.time_of_activity}    
            bindsObj.capa    = {val: objInput.capital_amount}      
            bindsObj.ftsc    = {val: objInput.federal_tax_service_contacts}    
            bindsObj.afi     = {val: objInput.affiliates_info}         
            //bindsObj.ofo     = {val: objInput.organization_founders }   
           /*  bindsObj.head    = {val: objInput.head_of_organization}    
            bindsObj.chacc   = {val: objInput.chief_accountant}   */  
            // bindsObj.appnum  = {val: objInput.appraisers_number}   
            bindsObj.inscom  = {val: objInput.insurance_companies}     
            bindsObj.appnum  = {val: objInput.appraisers_number    }     
            bindsObj.appiav  = {val: objInput.appraisers_inv_availability}     
            bindsObj.qtyapp  = {val: objInput.quantity_appraisers     }     
            bindsObj.avgrepm = {val: objInput.avg_qty_reports_in_mounth  }   
            bindsObj.extmax  = {val: objInput.inv_external_max     }    
            bindsObj.maxrep  = {val: objInput.max_reports}     
            bindsObj.partnb  = {val: objInput.partner_banks}   
            bindsObj.wrkinf  = {val: objInput.works_info}      
            bindsObj.rvc     = {val: objInput.rvc}     
            bindsObj.idty    = {val: objInput.id_type}     
            bindsObj.actaddr = {val: objInput.actual_address_locality    }     
            bindsObj.subs    = {val: objInput.subsidiaries}    
            bindsObj.sumins  = {val: objInput.sum_insured}     
            bindsObj.dtst    = {val: objInput.date_of_start_insurance_policy}      
            bindsObj.dten    = {val: objInput.date_of_end_insurance_policy}    
            bindsObj.qtydc   = {val: objInput.quantity_appraisers_declared	}      
            bindsObj.regpl   = {val: objInput.reg_place}   
            bindsObj.regag   = {val: objInput.reg_agency}      
            //bindsObj.ctypr = {val: objInput.city_of_presence }    
            bindsObj.pres    = {val: JSON.stringify(objInput.presence_locality) }
            
            bindsObj.tyco    = {val: objInput.type_company }
            console.log(now.toLocaleString("en-US", dateOptions))
            bindsObj.dadd    = {val: now.toLocaleString("en-US", dateOptions) }
            bindsObj.auth    = {val: ip }
            // console.log("ip = " + ip)
        
            break;

        case "trouble_signal":

                bindsObj.usn      = {val: objInput.username}
                bindsObj.depa     = {val: objInput.department}    
                bindsObj.idc     = {val: objInput.id_company }  
                bindsObj.stat     = {val: objInput.state }   
                bindsObj.totr     = {val: objInput.type_of_trouble}    
                bindsObj.descr    = {val: objInput.description }    
                   
                bindsObj.auth    = {val: ip }   
                bindsObj.dadd    = {val: now.toLocaleString("en-US", dateOptions) }


            break;

    }

    return bindsObj

  }

  //
  let bindArrMakerMany = (objInput, ip, type) => {

    // { val: '0' }
    let i = 0

    var now = new Date()

    var bindsArr = [];

    switch(type) {
        
        case 'staff': 

            for (var key in objInput) {

                bindsArr[i] = {}    //
        
                bindsArr[i].pos    =  objInput[key].status   
                bindsArr[i].fulln  =  objInput[key].fullname    
        
                bindsArr[i].dtb    =  objInput[key].dateborn   // { val: '29.06.2019' }
        
                bindsArr[i].plb    =  objInput[key].placeborn
                bindsArr[i].passp  =  objInput[key].passport
                bindsArr[i].passpi =  objInput[key].passport_issuer
                bindsArr[i].passpd =  objInput[key].passport_date
                bindsArr[i].addrr  =  objInput[key].address_reg
                bindsArr[i].expc   =  objInput[key].experience_in_company == undefined? '' : objInput[key].experience_in_company
                bindsArr[i].phn    =  objInput[key].phone_num             == undefined? '' : objInput[key].phone_num
                bindsArr[i].empc   =  objInput[key].empl_contract         == undefined? '' : objInput[key].empl_contract
                bindsArr[i].dipl   =  objInput[key].diplom                == undefined? '' : objInput[key].diplom
                bindsArr[i].orgn   =  objInput[key].selfreg_org_name      == undefined? '' : objInput[key].selfreg_org_name
                bindsArr[i].prfd   =  objInput[key].selfreg_proof_doc     == undefined? '' : objInput[key].selfreg_proof_doc
        
                bindsArr[i].insp   =  objInput[key].insurance_policy      == undefined? '' : objInput[key].insurance_policy
                bindsArr[i].insc   =  objInput[key].insurance_company     == undefined? '' : objInput[key].insurance_company
                bindsArr[i].insa   =  objInput[key].insurance_amount      == undefined? '' : objInput[key].insurance_amount
        
                bindsArr[i].inds   =  objInput[key].insurance_start_date
                bindsArr[i].inde   =  objInput[key].insurance_end_date
        
                bindsArr[i].expa   =  objInput[key].experience_all        == undefined? '' : objInput[key].experience_all 
        
                /* 
                bindsArr[i].qcd    =  objInput[key].qual_cert_direction
                bindsArr[i].qcn    =  objInput[key].qual_cert_num
                bindsArr[i].qcds   =  objInput[key].qual_cert_date_start 
                */
        
                bindsArr[i].idc    =  objInput[key].id_company
                bindsArr[i].addr   =  objInput[key].address_residential 
        
                bindsArr[i].cert   = JSON.stringify(objInput[key].cert_data)
        
                bindsArr[i].dadd   = now.toLocaleString("en-US", dateOptions) 
                bindsArr[i].auth   = ip        
                
                i++;
        
            }

            break;

    }


    return bindsArr

  }


  function prepareArrayToDB( objInput ){

    //console.dir(objInput)
    var binds = [];

    binds[0] = objInput.fullname
    let i = 0

    /* for(key in objInput){                
        binds[i] = objInput[key];
        i++;
    } */

    console.dir(binds);

    return binds;

  }


