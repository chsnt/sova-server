const {container} = require('../../bottle');
const Company = require('../../entities/Company');
const data= require('../routes/company/put.data')

describe('Company', () => {
    it('find', async () => {
        await container.transaction(async (connection) => {
            let entity = await Company.find(connection, 342);
            expect(entity.PSRN).toBe('1092724002502');
            expect(entity.QUANTITY_APPRAISERS).toBe(3);
            expect(entity.history.ID).toBe('e6e6177e-2feb-4402-b8fa-33a3ddd73c82    ')
            console.log(entity)
        })
    })


    it('create', async () => {
       await container.transaction(async (connection) => {
           let entity =   new Company()
           entity.merge(data)
           entity.history.merge(data)
           entity.history.ID= null
           entity.history.ID_TYPE_OF_COMPANY='7d0bd035-16dd-4ea8-b6eb-662f6dae0201'
           await entity.create(connection)

            // загружаем обратно и проверяем
           entity =  await Company.find(connection, entity.primaryKey)
           expect(entity.OKPO).toBe('17260662')
           expect(entity.history.NAME).toBe('Акционерное общество КПМГ')
       })
    })
})
