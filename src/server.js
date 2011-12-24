/**
 * @author John Walley / http://www.walley.org.uk/
 */
 
/**
 * Main entry point for our game
 */

var requirejs = require('../utils/nodejs/node_modules/requirejs');

requirejs.config({
    baseUrl: '../src/',
    nodeRequire: require
});
 
requirejs(["server/Server"], function (Server) {
  var game = new Server();
});
