/**
 * Adds CORS headers to the response
 *
 * {@link https://en.wikipedia.org/wiki/Cross-origin_resource_sharing}
 * {@link http://expressjs.com/en/4x/api.html#res.set}
 * @param {object} request the Request object
 * @param {object} response the Response object
 * @param {function} next function to continue execution
 * @returns {void}
 * @example
 * <code>
 * const express = require('express');
 * const corsHeaders = require('./middleware/cors-headers');
 *
 * const app = express();
 * app.use(corsHeaders);
 * </code>
 */
module.exports = (request, response, next) => {
    // http://expressjs.com/en/4x/api.html#res.set
    response.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,origin,accept,Set-Cookie,set-Cookie,Cookie,cookie',
		'Access-Control-Allow-Credentials': true
    });

    // intercept OPTIONS method
    /*if(request.method === 'OPTIONS') {
        response.send(200);
    } else { */
        next();
    // }
};