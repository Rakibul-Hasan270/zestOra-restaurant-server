const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 9000;

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ks5x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const itemCollection = client.db('zestOra_restaurant').collection('foodItems');
        const specificUserCollection = client.db('zestOra_restaurant').collection('specificUserItem');

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
                })
                .send({ success: true });
        })

        app.get('/items', async (req, res) => {
            const result = await itemCollection.find().toArray();
            res.send(result);
        })
        app.get('/item/:id', async (req, res) => {
            const item = req.params.id;
            const filter = { _id: new ObjectId(item) }
            const result = await itemCollection.findOne(filter);
            res.send(result);
        })
        app.post('/cart_item', async (req, res) => {
            const item = req.body;
            const result = await specificUserCollection.insertOne(item);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('zestora server is running');
})

app.listen(port, () => {
    console.log(`server running on port: ${port}`);
})