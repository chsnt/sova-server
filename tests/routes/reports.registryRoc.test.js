const request = require('supertest')
const app = require('../../app')

describe('/reports/registryRoc', () => {
    it('/reports/registryRoc', async () => {
        const res = await request(app).get('/reports/registryRoc').send()
        expect(res.statusCode).toEqual(200)
    })
})
