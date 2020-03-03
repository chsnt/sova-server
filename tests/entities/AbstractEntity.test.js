const {container} = require('../../bottle')
const AbstractEntity = require('../../entities/AbstractEntity')
const {CompanyHistory} = require('../../entities')
const Company = require('../../entities/Company')
const User = require('../../entities/User')

/**
 * Базовые проверки работы БД
 */
describe('AbstractEntity', () => {
    describe('column.generator', () => {
        it('create', async () => {
            await container.transaction(async (connection) => {
                const entity = new AbstractEntity()
                entity.NAME = 'test TIMESTAMP_GENERATOR create'
                await entity.create(connection)

                const loadedEntity= await AbstractEntity.find(connection, entity.ID)
                // const a= new Date()
                expect(Object.prototype.toString.call(loadedEntity.TIMESTAMP_GENERATOR)).toBe('[object Date]')
                expect(loadedEntity.TIMESTAMP_GENERATOR).toEqual(entity.TIMESTAMP_GENERATOR)
            })
        })
    })


    it('primaryKeyName', async () => {
        expect(AbstractEntity.primaryKeyName).toBe('ID')
    })

    it('columnsWoPrimaryKey', async () => {
        expect(AbstractEntity.columnsWoGenerated).toBeInstanceOf(Object)
        expect(AbstractEntity.columnsWoGenerated).not.toHaveProperty('ID')
        expect(AbstractEntity.columnsWoGenerated).toHaveProperty('NAME')
    })


    describe('merge', () => {
        it('basic', async () => {
            const entity = new AbstractEntity()
            const data = {
                ID: 1234,
                NAME: 'test NAME',
            }
            entity.merge(data)
            expect(entity.ID).toBe(data.ID)
            expect(entity.NAME).toBe(data.NAME)
        })
        it('other property', async () => {
            const entity = new AbstractEntity()
            const data = {
                SOME_OTHER_PROPERTY: 1234
            }
            entity.merge(data)
            expect(entity).not.toHaveProperty('SOME_OTHER_PROPERTY')
        })
        it('null && undefined', async () => {
            const entity = new AbstractEntity()
            entity.ID = 1234
            entity.NAME = '1234'
            const data = {
                ID: null,
                NAME: undefined
            }
            entity.merge(data)
            expect(entity.ID).toBe(data.ID)
            expect(entity.NAME).toBe(data.NAME)
        })
    })

    it('create', async () => {
        const entity = new AbstractEntity()
        entity.NAME = 'this is name'

        await container.transaction(async (connection) => {
            await entity.create(connection)
        })
        expect(entity.ID).toBeTruthy()

        await container.transaction(async connection => {
            const {rows} = await connection.execute('select * from ABSTRACT_TABLE where ID=' + entity.ID)
            expect(rows[0].ID).toBe(entity.ID)
        })
    })

    it('find', async () => {
        let entity = await container.transaction(async (connection) => AbstractEntity.find(connection, 701))
        // let entity = await container.transaction(async (connection) => Company.find(connection, 563))
        expect(entity).toBeInstanceOf(AbstractEntity)
        expect(entity.ID).toBe(701)
        expect(entity.NAME).toContain('this is name')
    })

    it('findByParams', async () => {
        let entity = await container.transaction(async (connection) => User.findByParams(connection, {
            "ID": 23,
            "FULLNAME": "Ступак Д.А."
        }))
        expect(entity).toBeInstanceOf(User)
        expect(entity.EMAIL).toContain('stupak_da@open.ru')
    })

    it.skip('findByParamsErrors', async () => {
        // Test handling errors
        try {
            let entity = await container.transaction(async (connection) => User.findByParams(connection, {
                "ID": 23,
                "FULLNAME": undefined
            }))
            throw new Error('should not be hire')
        } catch (err) {
            expect(err.message).toMatch(/Field .+ is undefined/)
        }
    })

    it('find CompanyHistory', async () => {
        let entity = await container.transaction(async (connection) => CompanyHistory.find(connection, 'b87528c8-97b8-414b-bdb6-e6d55144c870    '))
        expect(entity).toBeInstanceOf(CompanyHistory)
        expect(entity.ID).toBe('b87528c8-97b8-414b-bdb6-e6d55144c870    ')
    })

    it('save', async () => {
        await container.transaction(async (connection) => {
            let entity = await AbstractEntity.find(connection, 701)
            let newName = entity.NAME = 'this is name' + new Date().toLocaleDateString()
            await entity.save(connection)

            // fetching after save and check
            const {rows} = await connection.execute('select * from ABSTRACT_TABLE where ID=701')
            expect(rows[0].NAME).toBe(newName)
        })
    })

    it('delete', async () => {
        await container.transaction(async (connection) => {
            const entity = new AbstractEntity()
            entity.NAME = 'delete me'
            await entity.create(connection)
            await entity.delete(connection)

            // fetching after delete and check
            const {rows} = await connection.execute('select * from ABSTRACT_TABLE where ID=' + entity.primaryKey)
            expect(rows.length).toBe(0)
        })
    })

    it('listWOParams', async () => {
        let list = await container.transaction(async (connection) => User.list(connection))
        console.log(list)
        expect(list).toBeInstanceOf(Array)
    })

    it('list', async () => {
        let list = await container.transaction(async (connection) => User.list(connection, {
            "ID": 23,
            "FULLNAME": "Ступак Д.А."
        }))
        expect(list).toBeInstanceOf(Array)
        expect(list[0]).toBeInstanceOf(User)
        expect(list[0].EMAIL).toContain('stupak_da@open.ru')
    })

})
