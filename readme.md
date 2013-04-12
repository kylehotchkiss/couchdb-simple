# Couchdb-simple
This is my first node module, use with caution. I will be integrating this into my own projects, so it will be battle-tested with time. I have used this database code for personal projects for several months and it's pretty bulletproof, IMO.

This takes care of crap like revisions and stuff like that. But doesn't abstract things too much. You're really just throwing around JS objects. Make sure you standardize your database code and your interfaces to make sure you aren' onion-skinning your data, nor losing records.

## Quirks
This library wasn't written for the masses and may not follow typical Node.js module behavior, like `throw`ing anything. It'll just return a `false` if things go awry, and I like that more since you can try at the database again later (or save to disk) instead of having to deal with annoying `try` `catch` patterns