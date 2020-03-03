const {NUMBER, STRING, BIND_OUT} = require('oracledb')
const entities = require("../entities")
const AbstractEntity = require("./AbstractEntity")

class AbstractHistoryEntity extends AbstractEntity {

    constructor() {
        super()
        /** @type {AbstractEntity} сущность самой свежей версии из истории (хваст) */
        console.log(entities)
        this.history = new this.constructor.History()
    }

    /**
     * Класс истории
     * @returns {AbstractEntity.constructor}
     */
    static get History() {
        const historyClassName = this.name + 'History'  // 'CompanyHistory'
        return entities[historyClassName]
    }

    /**
     * Возвращает первичный ключ актуальной строки таблицы истории
     *
     * @param connection
     * @param primaryKey
     * @returns {Promise<Number|String>}
     */
    static async getHistoryPrimaryKey(connection, primaryKey) {
        const binds = {
            parentForeignKey: {val: primaryKey, type: this.History.columns[this.History.parentForeignKeyName].type}
        }
        const sql = `
            SELECT ${this.History.primaryKeyName} 
            FROM ${this.History.table} 
            WHERE ${this.History.parentForeignKeyName}= :parentForeignKey
            ORDER BY DATETIME DESC 
            FETCH NEXT 1 ROWS ONLY`
        console.log(sql, binds)
        let {rows} = await connection.execute(sql, binds)
        console.log('History primary key=', rows[0][this.History.primaryKeyName])
        return rows[0][this.History.primaryKeyName]
    }

    static async find(connection, id) {
        const result = await super.find(connection, id) // объект Company/Office
        const historyPrimaryKey = await this.getHistoryPrimaryKey(connection, id)
        console.log('historyPrimaryKey', historyPrimaryKey)
        result.history = await this.History.find(connection, historyPrimaryKey) // объект CompanyHistory
        return result
    }

    static async findByParams(connection, params) {
        const result = await super.findByParams(connection, params) // объект Company/Office
        const historyPrimaryKey = await this.getHistoryPrimaryKey(connection, id)
        console.log('historyPrimaryKey', historyPrimaryKey)
        result.history = await this.History.find(connection, historyPrimaryKey) // объект CompanyHistory
        return result
    }

    /**
     * Первичный ключ
     * @returns {string}
     */
    static get primaryKeyName() {
        let result
        Object.keys(this.columns).forEach(eachColumnName => {
            if (this.columns[eachColumnName].primaryKey) {
                result = eachColumnName
            }
        })
        if (!result) {
            throw new Error('Primary key is not found')
        }
        return result
    }

    /**
     * Колонки без генерируемого ключа
     * @returns {Object<string, Column>}
     */
    static get columnsWoGenerated() {
        const result = Object.assign({}, this.columns)
        Object.keys(this.columns).forEach(eachColumnName => {
            if (this.columns[eachColumnName].generated) {
                delete result[eachColumnName]
            }
        })
        return result
    }

    /**
     * Колонки без первичного ключа
     * @returns {Object<string, Column>}
     */
    static get columnsWoPrimaryKey() {
        const result = Object.assign({}, this.columns)
        Object.keys(this.columns).forEach(eachColumnName => {
            if (this.columns[eachColumnName].primaryKey) {
                delete result[eachColumnName]
            }
        })
        return result
    }


    /**
     * Создает новую сущность в БД
     * @param {OracleDB.Connection} connection
     */
    async create(connection) {
        await super.create(connection)
        this.history[this.constructor.History.parentForeignKeyName]= this.primaryKey

        await this.history.create(connection)
    }

    /**
     * Обновляет существующую сущность в БД
     * @param {OracleDB.Connection} connection
     */
    async save(connection) {
        await super.save(connection)
        await this.history.save(connection)
    }

    /**
     * Удаляет сущность из БД и устанавливает Primary key = null
     * @param {OracleDB.Connection} connection
     */
    async delete(connection) {
        const bindings = {
            primaryKey: {val: this.primaryKey, type: this.constructor.columns[this.constructor.primaryKeyName].type}
        }
        const sql = `delete from ${this.constructor.table} WHERE ${this.constructor.primaryKeyName} = :primaryKey`
        console.log(sql, bindings)
        let dataset = await connection.execute(sql, bindings)
        if (!dataset.rowsAffected) {
            throw new Error('No rows affected. Looks like entity does not persisted id=' + this.primaryKey)
        }
    }

    static async list(connection, table) {
        let {rows} = await connection.execute(`select * from ${table}`)
        if (!rows.length) {
            throw new Error(`There's no rows in table ${table}`)
        }
        return rows;
    }
}


module.exports = AbstractHistoryEntity
