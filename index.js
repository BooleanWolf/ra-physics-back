const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xsh8x1y.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollection = client.db("physics").collection("users");
    const coursescollection = client.db("physics").collection("courses");
    const requestsCollection = client.db("physics").collection("requests");

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.get("/courses", async (req, res) => {
      const result = await coursescollection.find().toArray();
      res.send(result);
    });

    
    app.post("/addcourses", async (req, res) => {
      const newCourse = req.body; 
      const result = await coursescollection.insertOne(newCourse);
      res.send(result);
    });



    app.get("/requests", async (req, res) => {
      const result = await requestsCollection.find().toArray();
      res.send(result);
    });
    app.get("/courses/:id", async (req, res) => {
      // console.log(req.params.id);
      const result = await coursescollection.findOne({ course_id: req.params.id });
      res.send(result);
    });

    app.get("/courses_single_video/:id", async (req, res) => {
      const param_id = req.params.id; 
      const param_arr = param_id.split("-");
      const cid = param_arr[0]; 
      const result = await coursescollection.findOne({ course_id: cid });
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    app.post("/requests", async (req, res) => {
      const newRequest = req.body;
      const result = await requestsCollection.insertOne(newRequest);
      res.send(result);
    });

    app.post("/approve", async (req, res) => {
      const newRequest = req.body;
      
      var myquery = { bkash: newRequest.bkash };
      var newvalues = { $set: {approved: "true" } };
 
      const result = await requestsCollection.updateOne(myquery, newvalues);

      res.send(result); 
    });

    app.post("/userupdate", async (req, res) => {
      const newRequest = req.body;
      // console.log(newRequest);

      const buy_id_arr = newRequest.buy_id.split("%");
      const course_id_bought = buy_id_arr[0]; 
      
      const userBought = await usersCollection.find({email: newRequest.email}).toArray();
      
      const already = await userBought[0].courseList; 

      const newCourseList = `${already}%${course_id_bought}`;

      var myquery = { email: newRequest.email };
      var newvalues = { $set: {courseList: newCourseList } };
 
      const result = await usersCollection.updateOne(myquery, newvalues);
      
      res.send(result); 
    });


     app.post("/courseupdate", async (req, res) => {
      const newRequest = req.body;
      // console.log(newRequest)

      var myquery = { course_id: newRequest.course_id };
      var newvalues = { $set: newRequest };
 
      const result = await coursescollection.updateOne(myquery, newvalues);
      
      res.send(result); 
    });


     app.post("/decline", async (req, res) => {
      const newRequest = req.body;
     
      var myquery = { bkash: newRequest.bkash };
      const result = await requestsCollection.deleteOne(myquery);

      
      res.send(result); 
    });

    
    app.post("/deleteCourse", async (req, res) => {
      const newRequest = req.body;
     
      var myquery = { course_id: newRequest.course_id };
      const result = await coursescollection.deleteOne(myquery);
      
      res.send(result); 
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("physics project is runnings");
});
app.listen(port, () => {
  console.log(`physics project is running, ${port}`);
});
