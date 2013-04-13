/**
 *
 * couchdb-simple for Node.js
 * Copyright 2011-2013 Kyle Hotchkiss
 * Released under the GPL
 *
 */

var url = require("url");
var http = require("http");


////////////////////////////////////////
// Database Initialization and Config //
////////////////////////////////////////
var Database = function( db_host, db_port, db_user, db_pass ) {
    this.db_host = db_host || "127.0.0.1";
    this.db_port = db_port || 5984;
    this.db_user = db_user || "";
    this.db_pass = db_pass || "";
}


//////////////////////////////////////
// Database Prototype Establishment //
//////////////////////////////////////
Database.prototype = {


    ///////////////////////////
    // DATABASE READ REQUEST //
    ///////////////////////////
    read: function( path, callback ) {
        if ( path.substr(-1) === "/" ) {
            path += "_all_docs?include_docs=true&ascending=true";
        }

        var buffer = "";
        var couchdb = http.get({
            auth: this.db_user + ":" + this.db_pass,
            host: this.db_host,
            path: path,
            port: this.db_port
        }, function( response ) {
            response.setEncoding('utf8');

            response.on("data", function( data ) {
                buffer += data;
            });

            response.on("end", function() {
                var results;

                try {
                    results = JSON.parse( buffer );
                } catch ( error ) { }

                // if results.error, is false
                if ( typeof callback !== "undefined"
                    && typeof results !== "undefined"
                    && typeof results.error === "undefined" ) {

                    callback( results );
                } else {
                    callback( false, true );
                }
            });
        }).on("error", function() {
            callback( false, true );
        });
    },


    ////////////////////////////
    // DATABASE WRITE REQUEST //
    ////////////////////////////
    write: function( path, data, callback ) {
        this.read( path, function( results, error ) {
            if ( typeof error === "undefined" ) {
                ////////////////////////////////
                // CASE: DATA EXISTS, REWRITE //
                ////////////////////////////////
                data._rev = results._rev;
            }

            var buffer = "";
            var couchdb = http.request({
                auth: this.db_user + ":" + this.db_pass,
                host: this.db_host,
                path: path,
                port: this.db_port,
                headers: { "Content-Type": "application/json" },
                method: "PUT"
            }, function( response ) {
                response.setEncoding('utf8');

                response.on("data", function( data ) {
                    buffer += data;
                });

                response.on("end", function() {
                    var results;

                    try {
                        results = JSON.parse( buffer );
                    } catch ( error ) { }

                    if ( typeof callback !== "undefined" && typeof results === "object" ) {
                        if ( typeof results.rev !== "undefined" ) {
                            callback();
                        } else {
                            callback( true );
                        }
                    } else {
                        callback( true );
                    }
                });
            }).on("error", function() {
                  callback( true );
            });

            couchdb.write( JSON.stringify(data) );
            couchdb.end();
        });
    },


    /////////////////////////////
    // DATABASE DELETE REQUEST //
    /////////////////////////////
    remove: function( path, callback ) {
        //
        // Callbacks here are rather unreliable.
        // Currently just running this async, since status
        // is rather unimportant.
        //
        this.read( path, function( results, error ) {
            if ( typeof error !== "undefined" && error ) {
                if ( typeof callback !== "undefined" ) {
                    callback( false, true );
                }
            } else {
                var revision = results._rev;

                var couchdb = http.request({
                    auth: this.db_user + ":" + this.db_pass,
                    host: this.db_host,
                    path: path,
                    port: this.db_port,
                    headers: { "If-Match": revision },
                    method: "DELETE"
                }, function( response ) {
                    response.on("end", function() {
                        if ( typeof callback !== "undefined") {
                            callback();
                        }
                    });
                }).on("error", function() {
                    if ( typeof callback !== "undefined" ) {
                        callback( false, true );
                    }
                });

                couchdb.end();
            }
        });
    }


}


//////////////////////////////
// Push Database to Node.js //
//////////////////////////////
module.exports = Database;