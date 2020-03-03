const request = require('supertest')
const app = require('../../app')

describe('/api/common', () => {
    it('/locations/:service', async () => {
        const res = await request(app).get('/api/common/locations/SOVA').send()
        expect(res.statusCode).toEqual(200)
        expect(res.body).toBeInstanceOf(Array)
        expect(res.body[0]).toHaveProperty('LOCALITY')
    })
})
