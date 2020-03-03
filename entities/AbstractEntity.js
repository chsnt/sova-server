const {NUMBER, STRING, BIND_IN, BIND_OUT, DATE} = require('./types')
const Column = require("./Column");
const uuid = require('uuid/v4')

class AbstractEntity {

    constructor() {
    }

    /**
     * Таблица с данными сущности
     * @returns {string}
     */
    static get table() {
        return 'ABSTRACT_TABLE'
    }

    /**
     * Типы данных базы данных
     * @returns {Object}
     */
    static get types() {
        return {NUMBER, STRING, BIND_OUT, BIND_IN}
    }

    /**
     * Колонки в которых сохраняются поля сущности
     * Типы https://oracle.github.io/node-oracledb/doc/api.html#-313-node-oracledb-type-constants
     * @return {Object.<string, Column>}
     */
    static get columns() {
        return {
            ID: {
                type: NUMBER,
                required: true,
                primaryKey: true,
                generated: true,
            },
            NAME: {
                type: STRING,
                required: true,
            },
            STRING_GENERATOR: {
                type: STRING,
                required: true,
                generator: function (entity) {
                    return entity.STRING_GENERATOR || uuid()
                },
            },
            TIMESTAMP_GENERATOR: {
                type: DATE,
                required: true,
                generator: function (entity) {
                    return entity.TIMESTAMP_GENERATOR || new Date()
                },
            },
            SOME_DATE: {
                type: STRING,
                required: true,
            },
        }
    }

    /**
     * Find and get row
     */
    static async findBy(connection, param, val) {
        let {rows} = await connection.execute(`
            select * 
            from ${this.table} 
            where ${param}=${val}`)
        if (!rows.length) {
            throw new Error(`There's no rows in table ${this.table} where ${param}=${val}`)
        }
        const result = new this()
        result.merge(rows[0])
        return result
    }

    /**
     *
     * @param {Connection} connection
     * @param {Number | String} id
     * @returns {Promise<AbstractEntity>}
     */
    static async find(connection, id) {

        const bindings = {
            primaryKey: {val: id, type: this.columns[this.primaryKeyName].type}
        }
        let sql = `select * from ${this.table} where ${this.primaryKeyName}=:primaryKey`
        console.log(sql, bindings)
        let {rows} = await connection.execute(sql, bindings)
        if (!rows.length) {
            throw new Error(`There's no rows in table ${this.table} where id=${id}`)
        }
        const result = new this()

        result.merge(rows[0])

        return result
    }


    /**
     * Find by params
     * @param {Object} params
     * can resives only Strings & Numbers
     */
    static async findByParams(connection, params) {
        const bindings = {}
        let sql = `select * from ${this.table}`

        if (params !== undefined) {
            const parts = []
            for (let [eachColumnName, eachWhere] of Object.entries(params)) {
                if (eachWhere===null || eachWhere===undefined){
                    throw new Error(`findByParams null not supported yet class ${this.name} params {${eachColumnName}: null}`)
                }
                if (typeof eachWhere !== 'object') {
                    eachWhere = {
                        operator: '=',
                        value: eachWhere
                    }
                }
                switch (eachWhere.operator) {
                    case '=':
                        parts.push(`${eachColumnName}= :${eachColumnName}`)
                        break
                    case 'in':
                        break
                    default:
                        throw new Error('unknown operator ' + eachWhere.operator)
                }

                bindings[eachColumnName] = {val: eachWhere.value, type: this.columns[eachColumnName].type}
            }
            sql = sql + ' where ' + parts.join(' and ')
        }
        console.log(sql, bindings)

        let {rows} = await connection.execute(sql, bindings)
        if (!rows.length) {
            throw new Error(`There's no rows for: ${sql}`)
        }
        const result = new this()
        result.merge(rows[0])
        return result
    }

    /**
     * Первичный ключ
     * @returns {string}
     */
    static get parentForeignKeyName() {
        let result
        Object.keys(this.columns).forEach(eachColumnName => {
            if (this.columns[eachColumnName].parentForeignKey) {
                result = eachColumnName
            }
        })
        if (!result) {
            throw new Error('Parent foreign key is not found')
        }
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
     * Короткий синтаксис для this[this.constructor.primaryKeyName]
     */
    get primaryKey() {
        return this[this.constructor.primaryKeyName]
    }

    set primaryKey(value) {
        this[this.constructor.primaryKeyName] = value
    }

    /**
     * Вливает data в себя (мержит ее)
     * @param {object} data
     */
    merge(data) {
        Object.keys(this.constructor.columns).forEach(eachColumnName => {
            if (eachColumnName in data) {
                let value = data[eachColumnName]
                switch (this.constructor.columns[eachColumnName].type) {
                    case DATE:
                        if (!value) {
                            value = null
                        } else if (value.constructor.name === 'Date') {
                            //...
                        } else if (typeof value === 'string') {
                            value = new Date(Date.parse(value))
                        } else {
                            throw new Error('undefined format of date')
                        }
                        break
                    case NUMBER:
                        value = (value!==undefined && value!==null) ? parseInt(value) : null
                        break
                    default:
                    // ...
                }
                this[eachColumnName] = value
            }
        })
    }

    /**
     * Создает новую сущность в БД
     * @param {OracleDB.Connection} connection
     */
    async create(connection) {
        const columnsString = Object.keys(this.constructor.columnsWoGenerated).join(', ')
        const columnsWithColonString = Object.keys(this.constructor.columnsWoGenerated).map(eachField => ':' + eachField).join(', ')

        const bindings = {
            ID_RETURNING: {type: this.constructor.columns[this.constructor.primaryKeyName].type, dir: BIND_OUT}
        }
        Object.entries(this.constructor.columnsWoGenerated).forEach(([eachColumnName, eachColumn]) => {
            // для генерируемых полей генерирую значения генератором
            if (eachColumn.generator) {
                this[eachColumnName] = eachColumn.generator(this)
            }
            bindings[eachColumnName] = {val: this[eachColumnName], type: eachColumn.type}
        })
        const sql = `INSERT INTO ${this.constructor.table} (${columnsString}) VALUES(${columnsWithColonString}) RETURNING ${this.constructor.primaryKeyName} INTO :ID_RETURNING`
        console.log(sql, bindings)
        let dataset = await connection.execute(sql, bindings)
        this.primaryKey = dataset.outBinds.ID_RETURNING[0]
        console.log("generated " + this.constructor.primaryKeyName + "=" + this.primaryKey)
    }

    /**
     * Обновляет существующую сущность в БД
     * @param {OracleDB.Connection} connection
     */
    async save(connection) {
        const bindings = {
            primaryKey: {val: this.primaryKey, type: this.constructor.columns[this.constructor.primaryKeyName].type}
        }
        const columnsString = Object.entries(this.constructor.columnsWoPrimaryKey).map(([eachColumnName, eachColumn]) => {
            // для генерируемых полей генерирую значения генератором
            if (eachColumn.generator) {
                this[eachColumnName] = eachColumn.generator(this)
            }
            bindings[eachColumnName] = {val: this[eachColumnName], type: eachColumn.type}
            return `${eachColumnName}= :${eachColumnName}`
        }).join(', ')

        const sql = `UPDATE ${this.constructor.table} SET ${columnsString} WHERE ${this.constructor.primaryKeyName} = :primaryKey`
        console.log(sql, bindings)
        let dataset = await connection.execute(sql, bindings)
        if (!dataset.rowsAffected) {
            throw new Error('No rows affected. Looks like entity does not persisted id=' + this.primaryKey)
        }
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

    /* static async list(connection, table) {
        let {rows} = await connection.execute(`select * from ${table}`)
        if (!rows.length) {
            throw new Error(`There's no rows in table ${table}`)
        }
        return rows;
    } */

    static async list(connection, params) {
        let sql = `
            select * 
            from ${this.table} 
        `
        if (params !== undefined) {
            sql += `
                where 
            `
            for (const field in params) {
                if (params.hasOwnProperty(field)) {
                    let val = params[field]

                    if (typeof val === 'undefined') throw new Error(`Field ${field} is undefined`)
                    if (typeof val === 'number') sql += ` ${field} = ${val}`
                    if (typeof val === 'string') sql += ` ${field} = '${val}'`

                    sql += ` AND`
                }
            }
            // Delete last 4 chars ' AND'
            sql = sql.substring(0, sql.length - 4)
        }
        console.log(sql)
        let {rows} = await connection.execute(sql)
        if (!rows.length) {
            throw new Error(`There's no rows for: ${sql}`)
        }
        const result = rows.map(eachRow => {
            const eachEntity = new this()
            eachEntity.merge(eachRow)
            return eachEntity
        })
        return result
    }

    //
    async verySimpleMethod() {
        await this.load()
        await this.update()
    }

    async veryHardMethod() {
        let rows = await connection.exec('select from USER where id=:id')
    }

}


module.exports = AbstractEntity;
