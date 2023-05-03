const { MongoClient } = require('mongodb');
const connectionString = process.env.DB_URI;
const client = new MongoClient(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
let dbConnection;
module.exports = {
    connectToServer: function(callback) {
        client.connect(function(err, db) {
            if (err || !db) {
                return callback(err);
            }
            dbConnection = db.db('liberary');
            console.log('Successfully connected to MongoDB.');
            return callback();
        });
    },
    getDb: function() {
        return dbConnection;
    },
};
module.exports = {
    connectDB: async() => {
        try {
            await client.connect(connectionString);
            console.log('Database connected...');
        } catch (error) {
            console.log(error.message);
        }
    },
};