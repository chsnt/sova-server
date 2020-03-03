/**
 * Обработчик ошибок
 *
 * @param err
 * @param req
 * @param res
 * @param next
 */
module.exports = function errorHandler(err, req, res, next) {
    console.log(err)
    res.json(
        {
            code: err.code || 'unknown',
            message: err.message,
            stack: err.stack,
        }
    )
    next(err)
}
