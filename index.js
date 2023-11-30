const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// console.log(`process.env.DB_USER: ${process.env.DB_USER}`);

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kysojnx.mongodb.net/?retryWrites=true&w=majority`;

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

    const employeeCollection = client
      .db("EmployeeManagement")
      .collection("Employees");
    const imageCollection = client
      .db("EmployeeManagement")
      .collection("BannerImages");
    const serviceCollection = client
      .db("EmployeeManagement")
      .collection("services");
    const testimonialCollection = client
      .db("EmployeeManagement")
      .collection("testimonials");
    const paymentCollection = client
      .db("EmployeeManagement")
      .collection("payments");

    app.post("/employees", async (req, res) => {
      const newEmployee = req.body;

      const query = { email: newEmployee.email };
      const existingUser = await employeeCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await employeeCollection.insertOne(newEmployee);
      console.log("Got new employee", req.body);
      res.send(result);
    });

    app.get("/employees", async (req, res) => {
      const cursor = employeeCollection.find({});
      const employees = await cursor.toArray();
      res.send(employees);
    });

    app.get("/employees/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email };
      const employee = await employeeCollection.findOne(query);
      res.send(employee);
    });

    app.get("/BannerImages", async (req, res) => {
      const cursor = imageCollection.find({});
      const employees = await cursor.toArray();
      res.send(employees);
    });
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const employees = await cursor.toArray();
      res.send(employees);
    });
    app.get("/testimonials", async (req, res) => {
      const cursor = testimonialCollection.find({});
      const employees = await cursor.toArray();
      res.send(employees);

    });
    //   Payment Intent

 

    app.post("/create-payment-intent", async (req, res) => {
      const { salary } = req.body;
      console.log(salary,'salary')
      // Create a PaymentIntent with the order amount and currency
      const amount = parseInt(salary * 100);

      console.log(amount,'amount of client')
        const paymentIntent = await stripe.paymentIntents.create({
            amount : amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });
        res.send({
            clientSecret: paymentIntent.client_secret,
        });

    });

    app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment);
            res.send(result);

        
        })

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
  res.send("Employee Management System is running");
});

app.listen(port, () => {
  console.log(`Employee Management System is running ${port}`);
});

/**
 * --------------------------------
 *      NAMING CONVENTION
 * --------------------------------
 * app.get('/users')
 * app.get('/users/:id')
 * app.post('/users')
 * app.put('/users/:id')
 * app.patch('/users/:id')
 * app.delete('/users/:id')
 *
 */
