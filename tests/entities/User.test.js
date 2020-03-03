const {container} = require('../../bottle')
const User = require('../../entities/User')

/**
 * User
 */
describe('User', () => {
    it('primaryKeyName', async () => {
        expect(User.primaryKeyName).toBe('ID')
    })

    it('columnsWoPrimaryKey', () => {
        expect(User.columnsWoGenerated).toBeInstanceOf(Object)
        expect(User.columnsWoGenerated).not.toHaveProperty('ID')
        expect(User.columnsWoGenerated).toHaveProperty('EMAIL')
    })
    it('find', async () => {
        let entity = await container.transaction(async (connection) => User.find(connection, 23))
        expect(entity).toBeInstanceOf(User)
        expect(entity.ID).toBe(23)
        expect(entity.EMAIL).toContain('stupak_da@open.ru')
    })

    it('list', async () => {
        let list = await container.transaction(async (connection) => User.list(connection, {"ID": 23, "FULLNAME": "Ступак Д.А."}))
        expect(list).toBeInstanceOf(Array)
        expect(list[0]).toBeInstanceOf(User)
        expect(list[0].EMAIL).toContain('stupak_da@open.ru')
    })

    it('listWOParams', async () => {
        let list = await container.transaction(async (connection) => User.list(connection))
        //console.log(list)
        expect(list).toBeInstanceOf(Array)
    })

    it.skip('findByParamsErrors', async () => {
        // Test handling errors
        try{
            let entity = await container.transaction(async (connection) => User.findByParams(connection, {"ID": 23, "FULLNAME": undefined}))
            throw new Error('should not be hire')
        }
        catch(err){
            expect(err.message).toMatch(/Field .+ is undefined/)
        }
    })

    it('findByParams', async () => {
        let entity = await container.transaction(async (connection) => User.findByParams(connection, {"ID": 23, "FULLNAME": "Ступак Д.А."}))
        expect(entity).toBeInstanceOf(User)
        expect(entity.EMAIL).toContain('stupak_da@open.ru')
    })


})
