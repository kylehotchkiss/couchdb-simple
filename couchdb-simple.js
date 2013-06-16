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

///////////////////////////
// DATABASE READ REQUEST //
///////////////////////////
Database.prototype.read = function( path, callback ) {
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
};


////////////////////////////
// DATABASE WRITE REQUEST //
////////////////////////////
Database.prototype.write = function( path, data, callback ) {
    var scope = this;

    this.read( path, function( results, error ) {

        if ( typeof error === "undefined" ) {
            ////////////////////////////////
            // CASE: DATA EXISTS, REWRITE //
            ////////////////////////////////
            data._rev = results._rev;
        }

        var buffer = "";
        var couchdb = http.request({
            auth: scope.db_user + ":" + scope.db_pass,
            host: scope.db_host,
            path: path,
            port: scope.db_port,
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
};


/////////////////////////////
// DATABASE DELETE REQUEST //
/////////////////////////////
Database.prototype.remove = function( path, callback ) {
    var scope = this;

    this.read( path, function( results, error ) {
        if ( typeof error !== "undefined" && error ) {
            if ( typeof callback !== "undefined" ) {
                callback( false, true );
            }
        } else {
            var buffer;
            var revision = results._rev;

            var couchdb = http.request({
                auth: scope.db_user + ":" + scope.db_pass,
                host: scope.db_host,
                path: path,
                port: scope.db_port,
                headers: { "If-Match": revision },
                method: "DELETE"
            }, function( response ) {
                response.setEncoding('utf8');
                
                response.on("data", function( data ) {
                    buffer += data;
                });
                
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
};


//////////////////////////////
// Push Database to Node.js //
//////////////////////////////
module.exports = Database;