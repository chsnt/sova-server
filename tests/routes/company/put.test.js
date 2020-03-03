const request = require('supertest')
const app = require('../../../app')
const body= require('./put.data')
const {container}= require('../../../bottle')
const Company= require('../../../entities/Company')

describe('/api/company/', () => {
    it('put', async () => {
        const res = await request(app).put('/api/company/put').send(body)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toBeInstanceOf(Object)
        expect(res.body).toHaveProperty('ID')
        expect(typeof res.body.ID).toBe('number')
        expect(res.body.ID).toBeTruthy()

        let company
        await container.transaction(async (connection)=>{
            company= await Company.find(connection, res.body.ID)
        })
        expect(company.history.NAME).toBeTruthy()
    })
})
