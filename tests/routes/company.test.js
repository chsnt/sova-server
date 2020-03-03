const request = require('supertest')
const app = require('../../app')

describe('/api/company', () => {
    it('/registry', async () => {
        const res = await request(app).get('/api/company/registry').send()
        expect(res.statusCode).toEqual(200)
        expect(res.body[0]).toBeInstanceOf(Object)
        expect(res.body[0]).toHaveProperty('NAME')
    })

    it('/:id/company-attributes', async () => {
        const res = await request(app).get('/api/company/561/company-attributes').send()
        expect(res.statusCode).toEqual(200)
        // console.log(res.body)
        expect(res.body).toBeInstanceOf(Object)
        expect(res.body).toHaveProperty('NAME')
    })

    it('/:id/office-attributes', async () => {
        const res = await request(app).get('/api/company/205/office-attributes').send()
        expect(res.statusCode).toEqual(200)
        expect(res.body).toBeInstanceOf(Array)
        expect(res.body.length).toBe(1)
        expect(res.body[0]).toHaveProperty('PRESENCE_LOCALITY')
        expect(res.body[0].PRESENCE_LOCALITY).toBeInstanceOf(Array)
        expect(res.body[0].PRESENCE_LOCALITY.length).toBe(3)
    })

    it('/region-access', async () => {
        const res = await request(app).get('/api/company/563/region-access').send()

      //console.log(res.body[0].PERMISSIONS.OTHERS)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toBeInstanceOf(Array)
        expect(res.body.length).toBeGreaterThan(1)
        expect(res.body[0]).toHaveProperty('ID')
        expect(res.body[0]).toHaveProperty('PERMISSIONS')
        //expect(res.body[0].PERMISSIONS.OTHERS).toBeTruthy()
        //expect(res.body[0].PERMISSIONS.EQUIPMENT).toBeFalsy()
    })

    it('/staff-attributes', async () => {
        const res = await request(app).get('/api/company/561/staff-attributes').send()
        expect(res.statusCode).toEqual(200)
        //console.log(res.body[0])
        expect(res.body).toBeInstanceOf(Array)
        expect(res.body.length).toBe(2)
        expect(res.body[0].POSITIONS).toBeInstanceOf(Array)
        expect(res.body[0].POSITIONS[0]).toHaveProperty('value')
        expect(res.body[0].POSITIONS[0]).toHaveProperty('text')
    })

    //DELETE
    it.skip('/company-region-accesses/del', async (done) => {
        const res = await request(app).delete('/api/company/company-region-accesses')
            .set("Cookie", "uid='2aa6daceac5dece94605cc230694355ea3d3328c41f9f579bae458f270055e68'")
            .send({
                "ID": 3113,
                "ID_COMPANY": 1055,
                "STATE": "Воронежская область",
                "ENG_NAME": ["RES_REALTY_WITH_LAND"],
                "ABBREVIATION": []
            })

        //expect(res.body).toBeInstanceOf(Object);
        //expect(res.body.length).toBe(2);
    })

    //PUT
    it('/company-region-accesses/put', async (done) => {
        let data = {"ID":3635,"ID_COMPANY":563,"STATE":"Москва и Московская область","PERMISSIONS":{"COMMERCIAL_REALTY":true,"EQUIPMENT":true,"MOVABLE_PROPERTY":false,"OTHERS":true,"RES_REALTY_OTHERS":false,"RES_REALTY_WITH_LAND":true}};

        const res = await request(app).put('/api/company/company-region-accesses')
            .set("Cookie", "uid='2aa6daceac5dece94605cc230694355ea3d3328c41f9f579bae458f270055e68'")
            .send([data])
            .expect((res)=>{
                expect(res.body).toHaveProperty("param");
                done();
            })
    })

    it('add-new-staff/put', async (done) => {
        const res = await request(app).put('/api/company/add-new-staff')
            .set("Cookie", "uid='2aa6daceac5dece94605cc230694355ea3d3328c41f9f579bae458f270055e68'")
            .send(
              [{
                "POSITIONS":[1,3,4],
                "QUAL_CERTS_LIST_DIR":[],
                "QUAL_CERTS_LIST_DIR_SHORT":[],
                "POSITION_WEIGHT_DECOMPOSE":[],
                "EXPERIENCE_ALL":25,
                "INSURANCE_END_DATE":"2019-08-23T11:45:50.000Z",
                "INSURANCE_START_DATE":"2019-08-23T11:45:50.000Z",
                "INSURANCE_AMOUNT":700,
                "INSURANCE_COMPANY":"ty",
                "INSURANCE_POLICY":"ty",
                "SELFREG_PROOF_DOC":"ty",
                "SELFREG_ORG_NAME":'Ассоциация \"МСО\"',
                "DIPLOM":"ty",
                "EMPL_CONTRACT":"ty",
                "PHONE_NUM":"ty",
                "EXPERIENCE_IN_COMPANY":25,
                "ADDRESS_RESIDENTIAL":"yt",
                "ADDRESS_REG":"ty",
                "PASSPORT_DATE":"2019-08-23T11:45:50.000Z",
                "PASSPORT_ISSUER":"ty",
                "PASSPORT":"ty",
                "PLACEBORN":"ty",
                "DATEBORN":"2019-08-23T11:45:50.000Z",
                "FULLNAME":"ty"},
                {
                  "POSITIONS":[1,3,4],
                  "QUAL_CERTS_LIST_DIR":[],
                  "QUAL_CERTS_LIST_DIR_SHORT":[],
                  "POSITION_WEIGHT_DECOMPOSE":[],
                  "EXPERIENCE_ALL":25,
                  "INSURANCE_END_DATE":"2019-08-23T11:45:50.000Z",
                  "INSURANCE_START_DATE":"2019-08-23T11:45:50.000Z",
                  "INSURANCE_AMOUNT":700,
                  "INSURANCE_COMPANY":"ty",
                  "INSURANCE_POLICY":"ty",
                  "SELFREG_PROOF_DOC":"ty",
                  "SELFREG_ORG_NAME":'Ассоциация \"МСО\"',
                  "DIPLOM":"ty",
                  "EMPL_CONTRACT":"ty",
                  "PHONE_NUM":"ty",
                  "EXPERIENCE_IN_COMPANY":25,
                  "ADDRESS_RESIDENTIAL":"yt",
                  "ADDRESS_REG":"ty",
                  "PASSPORT_DATE":"2019-08-23T11:45:50.000Z",
                  "PASSPORT_ISSUER":"ty",
                  "PASSPORT":"ty",
                  "PLACEBORN":"ty",
                  "DATEBORN":"2019-08-23T11:45:50.000Z",
                  "FULLNAME":"ty"}]
            )
            .expect((res) => {
                done()
            })
    })
})
