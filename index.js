const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;

require('dotenv').config()



const { MongoClient, ServerApiVersion, ObjectId  } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.spfvw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

//products

const productCollection = client.db('product').collection('server');
const recommendationCollection = client.db('product').collection('recommendations'); // Recommendations Collection

app.get('/product',async(req,res)=>{
  const cursor = productCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

// Route to add a new product query
app.post('/product', async (req, res) => {
  try {
    const newQuery = req.body; // Get form data from frontend
    const result = await productCollection.insertOne(newQuery); // Insert into MongoDB
    res.status(201).json(result); // Send success response
  } catch (error) {
    console.error('Error inserting query:', error);
    res.status(500).json({ message: 'Failed to add query' });
  }
});


 // ✅ Get a specific query by ID
 app.get('/product/:id', async (req, res) => {
  try {
      const queryId = req.params.id;
      const query = await productCollection.findOne({ _id: new ObjectId(queryId) });
      if (!query) {
          return res.status(404).json({ message: "Query not found" });
      }
      res.json(query);
  } catch (error) {
      console.error('Error fetching query:', error);
      res.status(500).json({ message: 'Failed to fetch query' });
  }
});

// // ✅ Get all recommendations for a query
// app.get('/recommendations/:queryId', async (req, res) => {
//   try {
//       const queryId = req.params.queryId;
//       const recommendations = await recommendationCollection.find({ queryId }).toArray();
//       res.json(recommendations);
//   } catch (error) {
//       console.error('Error fetching recommendations:', error);
//       res.status(500).json({ message: 'Failed to fetch recommendations' });
//   }
// });

// app.get('/recommendation', async (req, res) => {
//   try {
//       const queryId = req.query.queryId || req.params.queryId; // Accept both ?queryId=ID and /recommendation/ID
//       if (!queryId) {
//           return res.status(400).json({ message: "Missing queryId parameter" });
//       }
//       const recommendations = await recommendationCollection.find({ queryId }).toArray();
//       res.json(recommendations);
//   } catch (error) {
//       console.error('Error fetching recommendations:', error);
//       res.status(500).json({ message: 'Failed to fetch recommendations' });
//   }
// });
app.delete('/product/:id', async (req, res) => {
  try {
      const queryId = req.params.id;
      const result = await productCollection.deleteOne({ _id: new ObjectId(queryId) });

      if (result.deletedCount === 1) {
          res.json({ message: "Query deleted successfully" });
      } else {
          res.status(404).json({ message: "Query not found" });
      }
  } catch (error) {
      console.error('Error deleting query:', error);
      res.status(500).json({ message: 'Failed to delete query' });
  }
});


app.get('/recommendation', async (req, res) => {
  try {
      const queryId = req.query.queryId; // Extract queryId from query parameters
      if (!queryId) {
          return res.status(400).json({ message: "Missing queryId parameter" });
      }

      console.log("Received queryId:", queryId); // Debugging statement

      const recommendations = await recommendationCollection.find({ queryId: queryId }).toArray();
      res.json(recommendations);
  } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});


app.get('/recommendation', async (req, res) => {
    try {
        const { email } = req.query; // ✅ Extract user email from query params

        if (!email) {
            return res.status(400).json({ message: "Missing email parameter" });
        }

        console.log("Fetching recommendations for email:", email); // Debugging log

        const recommendations = await recommendationCollection.find({ userEmail: email }).toArray();
        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
});





    // ✅ Fix: Get all recommendations for a query
  //   app.get('/recommendation/:queryId', async (req, res) => {
  //     try {
  //         const queryId = req.params.queryId;
  //         const recommendations = await recommendationCollection.find({ queryId }).toArray();
  //         res.json(recommendations);
  //     } catch (error) {
  //         console.error('Error fetching recommendations:', error);
  //         res.status(500).json({ message: 'Failed to fetch recommendations' });
  //     }
  // });




// // ✅ Add a new recommendation
// app.post('/recommendation', async (req, res) => {
//   try {
//       const recommendation = req.body;
//       const result = await recommendationCollection.insertOne(recommendation);

//       // ✅ Update recommendation count for the query
//       await productCollection.updateOne(
//           { _id: new ObjectId (recommendation.queryId) },
//           { $inc: { recommendationCount: 1 } }
//       );

//       res.status(201).json(result);
//   } catch (error) {
//       console.error('Error adding recommendation:', error);
//       res.status(500).json({ message: 'Failed to add recommendation' });
//   }
// });
 // ✅ Fix: Add a new recommendation
 app.post('/recommendation', async (req, res) => {
  try {
      const recommendation = req.body;
      const result = await recommendationCollection.insertOne(recommendation);

      // ✅ Fix: Properly update recommendation count in queries collection
      await recommendationCollection.updateOne(
          { _id: new ObjectId(recommendation.queryId) },
          { $inc: { recommendationCount: 1 } }
      );

      res.status(201).json(result);
  } catch (error) {
      console.error('Error adding recommendation:', error);
      res.status(500).json({ message: 'Failed to add recommendation' });
  }
});


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.use(cors())
app.use(express.json()); // This enables JSON parsing


app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })