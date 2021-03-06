const express = require("express");
const app = express();
var jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
let cors = require("cors");
const port = process.env.PORT || 4000;
require("dotenv").config();
app.use(cors());
app.use(express.json());
const uri =
  "mongodb+srv://gymEquipment:0GR0UNjfzcKA8Mvh@cluster0.c00dq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// test commit

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("gymEquipment").collection("equipment");
    const myitemCollection = client.db("myItem").collection("item");

    // get all product
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
    });
    // get single product by id
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productCollection.findOne(filter);
      res.send(result);
    });

    // delivered
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateProduct.quantity,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // addProudct

    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateProduct.number,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // delete item
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // post  new item
    app.post("/additem", async (req, res) => {
      const newItem = req.body;
      const item = await productCollection.insertOne(newItem);
      res.send(item);
    });

    // verify token

    function verifyToken(req, res, next) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOEKN, function (err, decoded) {
        if (err) {
          return res.status(403).send({ message: "forbiden access" });
        }

        req.decoded = decoded;
        next();
      });
    }

    // query by email
    app.get("/myitem", verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      console.log({ decodedEmail });
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = productCollection.find(query);
        const result = await cursor.toArray();
        console.log({ result });
        res.send(result);
      } else {
        res.send({ message: "Forbiden" });
      }
    });

    //create token
    app.post("/login", (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOEKN, {
        expiresIn: "1d",
      });
      console.log(accessToken);
      res.send(accessToken);
    });
  } finally {
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World2!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
