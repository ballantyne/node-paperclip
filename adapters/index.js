// This was my first attempt at making a middleware plugin for mongoose.
// I tried to make it so that there could be other types of plugins and
// I noticed that sequelize has a plugin archetecture, but I haven't spent 
// a lot of time using it so I thought that this would be all that I would 
// share for the time being.  Take a look at the mongoose plugin, I have a 
// feeling that the same methods could be used in the sequelize plugin, 
// but sequelize has many more hooks than mongoose, so I think that there 
// might need to be a thoughtful consideration of how to make all that people 
// would expect to work to work.


var loader      = require('../loader');
var databases = { mongoose: require('./mongoose') };

module.exports.load = loader('mongoose', databases);
module.exports.mongoose = databases.mongoose;
