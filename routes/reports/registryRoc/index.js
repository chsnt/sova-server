const json2xlsx = require('node-xlsx').default;

const getRegistryRoc = require('./sheetRegistryRoc')
const getRegistryExclRoc = require('./sheetRegistryExclRoc')

module.exports = async function registryExclRoc(req, res) {

    let sheetRegistryRoc = await getRegistryRoc(req, res);
    let sheetRegistryExclRoc = await getRegistryExclRoc(req, res);

    const options = {
        '!cols': [{
            wch: 35
        }, {
            wch: 38
        }, {
            wch: 21
        }, {
            wch: 6
        }, {
            wch: 98
        }, {
            wch: 16
        }, {
            wch: 33
        }, {
            wch: 55
        }, {
            wch: 24
        }, {
            wch: 16
        }, {
            wch: 8
        }, {
            wch: 8
        }, {
            wch: 8
        }, {
            wch: 8
        }, {
            wch: 8
        }, {
            wch: 8
        }, {
            wch: 11
        }]
    };

    let buffer
    try {
        buffer = json2xlsx.build([{
                name: "Перечень РОК",
                data: sheetRegistryRoc
            },
            {
                name: "Перечень исключенных РОК",
                data: sheetRegistryExclRoc
            }
        ], options)
    } catch (e) {
        throw new Error(e)
    }

    res.attachment()
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Length', buffer.byteLength)
    res.send(buffer)
}