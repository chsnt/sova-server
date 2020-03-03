class Column {
    constructor() {
        /** тип колонки
         * @type {Number} oracledb.STRING | oracledb.NUMBER | oracledb.DATE
         */
        this.type = null
        /**
         * Если поле не задано во время AbstractEntity.create()
         * то присваивается значение по умолчанию
         *
         * @type {boolean}
         */
        this.required = false
        /**
         * @typedef {function} generatorCallback
         * @param {AbstractEntity} entity
         *
         * Колбэк-функция Генератор поля. Генерирует значение на стороне node.js при вызове create() , save()
         * @type {generatorCallback}
         */
        this.generator = null
        this.primaryKey = false
        /** Генерируется БАЗОЙ ДАННЫХ
         *
         * @type {boolean}
         * */
        this.generated = false
        /** @type {AbstractEntity} */
        this.entity = null
    }
}

module.exports = Column
