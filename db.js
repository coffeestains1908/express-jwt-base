const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;

const host = process.env.MONGO_HOST || 'localhost';
const port = process.env.MONGO_PORT || '27017';
const dbname = process.env.PROJECT_ID + '-' + process.env.DB_NAME;

/**
 * @return {Promise<MongoClient>}
 */
function get_client() {
    const url = 'mongodb://' + host + ':' + port;
    console.info(url);
    return new Promise(resolve => {
        MongoClient.connect(url, (err, client) => {
            assert.equal(null, err);
            resolve(client);
        });
    });
}
module.exports.get_client = get_client;

/**
 *
 * @param dbName
 * @return {Promise<{client: MongoClient, db: Db}>}
 */
function get_db() {
    return new Promise(async (resolve, reject) => {
        const client = await get_client();
        const db = client.db(dbname);
        resolve({client, db});
    });
}
module.exports.get_db = get_db;
