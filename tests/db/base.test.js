const {container} = require('../../bottle')
const AbstractEntity = require('../../entities/AbstractEntity')

/**
 * Базовые проверки работы БД
 */
describe('db main', () => {
    let connection

    beforeAll(async () => {
        connection = await container.connection
    })

    /**
     * проверям подключения к БД
     * https://oracle.github.io/node-oracledb/doc/api.html#getstarted
     */
    it('should select 1 row', async () => {
        const result = await connection.execute(`select 1 from USER_PRIVILEGE_MAP`)
        expect(result.rows).toBeInstanceOf(Array)
    })


    it('tran throw error', async () => {
        try {
            await container.transaction(async connection => {
                throw new Error('from tran')
            })
            throw new Error('should not be hire')
        } catch (err) {
            expect(err.message).toBe('from tran')
        }
    })

    /**
     * Проверяем ролбэк транзакции
     */
    it('tran rollback', async () => {
        let entity
        try {
            // 1. открыли транзакцию
            await container.transaction(async connection => {
                entity = new AbstractEntity
                entity.NAME = 'should be rollbacked'
                // 2. создали сущность внутри транзакции
                await entity.create(connection)
                expect(entity.ID).toBeTruthy()
                // 3. выбросили ошибку
                throw new Error('from tran')
            })
        } catch (err) {
            expect(err.message).toBe('from tran')
        }

        // 4. открыли вторую транзакцию чтобы считать созданную сущность
        await container.transaction(async connection => {
            try {
                // 5. считать созданную сущность
                entity = await AbstractEntity.find(connection, entity.ID)
                throw new Error('should not be hire')
            } catch (err) {
                // 6. если здесь, значит сущности нет, и ролбэк сработал
                expect(err.message).toBe('from tran')
            }
        })
    })
})
