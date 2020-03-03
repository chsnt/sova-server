const {container} = require('../../bottle')

module.exports = async function getStaffAttributes(req, res) {
    let result = await container.transaction(async (connection) => {
        const sql = `
            SELECT *
            FROM PC_STAFF_HUM_VIEW
            WHERE ID_COMPANY = :id
        `
        const {rows} = await connection.execute(sql, {
            id: req.params.id
        });

        // Схлопываем данные сотрудников, данные о сертификатах в отдельное поле в массив
        let data = []

        if (rows.length > 0) { // Если есть хотябы один сотрудник

            data = function reducer(data) {

                let prevRow = {};
                prevRow.ID = 0;

                let bank = [];
                let lump = {};

                const mkTempl = (row) => {

                    row.QUAL_CERTS = (row.ID_QUAL_CERT !== "") ?
                        row.QUAL_CERTS = [{
                            ID_QUAL_CERT: row.ID_QUAL_CERT,
                            //ID_STAFF: row.ID_STAFF,
                            DIRECTION: row.DIRECTION,
                            NUM: row.NUM,
                            DATE_START: row.DATE_START,
                            DATE_END: row.DATE_END,
                        }] :
                        row.QUAL_CERTS = [];

                    delete row.ID_QUAL_CERT;
                    //delete row.ID_STAFF
                    delete row.DIRECTION;
                    delete row.NUM;
                    delete row.DATE_START;
                    delete row.DATE_END;

                    return row
                };

                try {

                    for (let row of data) {

                        if (row.ID === prevRow.ID) {
                            lump.QUAL_CERTS.push({
                                ID_QUAL_CERT: row.ID_QUAL_CERT,
                                //ID_STAFF: row.ID_STAFF,
                                DIRECTION: row.DIRECTION,
                                NUM: row.NUM,
                                DATE_START: row.DATE_START,
                                DATE_END: row.DATE_END,
                            });
                            prevRow = lump
                        } else {
                            bank.push(lump);
                            lump = mkTempl(row);
                            prevRow = lump
                        }
                    }

                } catch (err) {
                    console.dir(err)
                }

                bank.splice(0, 1);

                bank.push(lump);
                return bank

            }(rows)

            // Берем только неповторяющиеся элементы массива
            const unique = (arr) => {
                let result = [];
                for (let str of arr) {
                    if (!result.includes(str)) {
                        result.push(str);
                    }
                }
                return result;
            }

            // Строки в массивы
            data = data.map(emp => {
                // let processed = emp
                emp.POSITIONS = emp.POSITIONS ? unique(emp.POSITIONS.split(',')) : [];
                emp.QUAL_CERTS_LIST_DIR = emp.QUAL_CERTS_LIST_DIR ? unique(emp.QUAL_CERTS_LIST_DIR.split(',')) : [];
                emp.QUAL_CERTS_LIST_DIR_SHORT = emp.QUAL_CERTS_LIST_DIR_SHORT ? unique(emp.QUAL_CERTS_LIST_DIR_SHORT.split(',')) : [];
                emp.POSITION_WEIGHT_DECOMPOSE = emp.POSITION_WEIGHT_DECOMPOSE ? unique(emp.POSITION_WEIGHT_DECOMPOSE.split(',')) : [];

                emp.POSITION_WEIGHT_DECOMPOSE = emp.POSITION_WEIGHT_DECOMPOSE.map(e => parseInt(e));

                return emp
            })

            data.forEach(eachRow => {
                eachRow.POSITIONS = eachRow.POSITION_WEIGHT_DECOMPOSE.map((eachWeight, eachWeightIndex) => {
                    return {
                        value: eachWeight,
                        text: eachRow.POSITIONS[eachWeightIndex],
                    }
                })
            })
        }

        return data

    })
    res.send(result)
}