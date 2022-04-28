const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqkio.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        await client.connect();
        const notesCollection = client.db("notesTaker").collection("notes");

        // get api to read all notes
        //http://localhost:4000/notes
        app.get("/notes", async (req, res) => {
            const q = req.query;
            console.log(q);
            const cursor = notesCollection.find(q);
            const result = await cursor.toArray();
            res.send(result);
        });

        // create notestaker || post api
        // http://localhost:4000/note
        /* 
        {
            "userName": "Sumaiya",
            "textData": "Valo acho?"
        } 
        */
        app.post("/note", async (req, res) => {
            const data = req.body;
            const result = await notesCollection.insertOne(data);
            res.send(result);
        });

        // update notestaker
        // http://localhost:4000/note/6269274df7a43ee31044e89d
        app.put("/note/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log("data update", data);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    // userName: data.userName,
                    // textData: data.textData,
                    ...data,
                },
            };
            const result = await notesCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        // delete notestaker
        // http://localhost:4000/note/62692f473b96ca96924b5825
        app.delete("/note/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await notesCollection.deleteOne(query);
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log(
                    "No documents matched the query. Deleted 0 documents."
                );
            }
            res.send(result);
        });
        console.log("connected to db");
    } finally {
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
