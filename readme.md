# Couchdb-simple
This is my first node module, use with caution. I will be integrating this into my own projects, so it will be battle-tested with time. I have used this database code for personal projects for several months and it's pretty bulletproof, IMO.

This takes care of crap like revisions and stuff like that. But doesn't abstract things too much. You're really just throwing around JS objects. Make sure you standardize your database code and your interfaces to make sure you aren' onion-skinning your data, nor losing records.

This works nicely with local CouchDB instances or a wonderful service called [Cloudant](http://cloudant.com) that I love very much.

## Getting Started

1) `npm install couchdb-simple`
2) In your code: 

    var couchdb = require("couchdb-simple");
    var database = new couchdb(COUCHDB_HOSTNAME, COUCHDB_PORT, COUCHDB_USERNAME, COUCHDB_PASSWORD);   
    
3) Use per the function docs below

## Usage

### Reading from the database
You can read a list of entries:

    database.read('/dir/', function( results, error ) {
    
        // Iterate on results.rows
    
    });
    
or read a single entry:

    database.read('/dir/entryid', function( results, error ) {
    
        // Results are accessible in results object
    
    });
    
### Writing to the database
Writing is easy, since you don't have to deal with revision information. At the same time, be careful not to wreck your existing data accidentally! Right now, I don't recommend writing without an entry ID, I think it's easier to handle those synchronously by declaring them before you write to the database.

    database.write('/dir/entryid', DATA_OBJECT, function( results, error ) {
    
    });

### Removing from the database
Just like writing, revision data is handled behind the scenes so you can delete an entry in a single step. I should have named the method `delete` but I pushed this live too late :trollface:

    database.remove('/dir/entryid', function( results, error ) {
    
    });
    
    
### Error Handling
There is an error object returned with every request that you can use to determine the success of the request:

    if ( typeof error !== "undefined" && error ) {
    
        // Something's amiss about database request, handle it.
    
    } else {
    
        // All's well!
    
    }
    
This avoids `try`-`catch` patterns which really make cringe. I don't like things that supposed to run for a very long time to just break when something happens, so I find this method fairly graceful.
    
I use Cloudant for my Couchdb work, and it never really breaks so these are all over my code, but don't run that often. If interest is there, I can write in a HEAD method to check database availability. 

## Quirks
This library wasn't written for the masses and may not follow typical Node.js module behavior, like `throw`ing anything. It'll just return a `false` if things go awry, and I like that more since you can try at the database again later (or save to disk) instead of having to deal with annoying `try` `catch` patterns