const { MongoClient, ServerApiVersion } = require('mongodb');

async function connectToMongoDB() {
    try {

        const uri = process.env.MONGODB_URI
        const client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        return uri;
    } catch {

    }
}

module.exports = connectToMongoDB

