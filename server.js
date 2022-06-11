const express = require('express');
const dayjs = require('dayjs');
 
const serv = express();

serv.use(express.json());

// Add headers before the routes are defined
serv.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://NodeDB:nodedblogin@cluster0.6r7gqii.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
/*
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  console.log("insidemongodb")
  client.close();
});
*/

async function getdayticket(day) {
  try {
    await client.connect();
    const database = client.db('ticket');
    const collect1 = database.collection('ticketavailable');
    const query = { ticketdate: `${day}`};
    //console.log(query);
    const res = await collect1.find(query).toArray();
    //console.log(res);
    if(res == null)
    {
      return [
        "Results not found"
      ]
    }
    else
    {
      return res;
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function loginprocess(uname, pw) {
  try {
    await client.connect();
    const database = client.db('user');
    const collect1 = database.collection('user_details');
    const query = { username: `${uname}`, password: `${pw}`};
    console.log("loginquery: "+query);
    const res = await collect1.findOne(query);
    console.log(res);
    if(res == null)
    {
      return {
        text:"Results not found"
      }
    }
    else
    {
      return res;
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function registeruser(body) {
  try {
    await client.connect();
    const database = client.db('user');
    const dev = database.collection('user_details');
    const query ={
      "username": body.username,
      "password": body.password,
      "telnum": body.telnum,
      "email": body.email,
      "firstname": body.firstname
    }
    const result = await dev.insertOne(query);
    if(result == null)
    {
      console.log(
        `Result is empty`
      );
      return [
        "Results not found"
      ]
    }
    else
    {
      console.log(
        `A document was inserted with the _id: ${result.insertedId}`
      );
      await updatevalue('ticket','ticketstat',{id:1}, 'totaluser', 1)
      return [
        `Register Successful! A user was inserted with the _id: ${result.insertedId}`
      ]
    }
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function updatevalue(db, coll, querydata, updateparam, amount)
{
  try {
    await client.connect();
    const database = client.db(db);
    const dev = database.collection(coll);
    var updateDocument = {
      $inc: {
      }
    };
    updateDocument.$inc[updateparam] = amount;
    console.log(updateDocument)
    const result = await dev.updateOne(querydata, updateDocument);
    console.log(result);
    if(result == null)
    {
      console.log(
        `Result is empty`
      );
      return [
        "Results not found"
      ]
    }
    else
    {
      console.log(
        `A document was updated`
      );
      return [
        `Update successful`
      ]
    }
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function accessone(db, coll, querydata)
{
  try {
    await client.connect();
    const database = client.db(db);
    const dev = database.collection(coll);
    const result = await dev.findOne(querydata);
    //console.log(result);
    if(result == null)
    {
      console.log(
        `Result is empty`
      );
      return [
        "Results not found"
      ]
    }
    else
    {
      console.log(
        `A document was found`
      );
      return result
    }
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function accessmany(db, coll, querydata)
{
  try {
    await client.connect();
    const database = client.db(db);
    const dev = database.collection(coll);
    const result = await dev.find(querydata).toArray();
    //console.log(result);
    if(result == null)
    {
      console.log(
        `Result is empty`
      );
      return [
        "Results not found"
      ]
    }
    else
    {
      return result
    }
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function modifyticket(day, tickettype, amount) {
  try {
    await client.connect();
    const database = client.db('ticket');
    const collect1 = database.collection('ticketavailable');
    const query = { ticketdate: `${day}`, ticketclass: `${tickettype}`};
    console.log(query);
    const res = await collect1.findOne(query);
    if(res != null)
    {
      console.log(res);

      if(res.ticketavailable - Math.abs(amount) < 0 || Math.abs(amount) < res.ticketminimumbuy)
      {
        console.log("Purchase amount more than available or less than minimumbuy")
      }
      else
      {
        var updateDocument = {
          $inc: {
            'ticketavailable': amount
          },
        };
        const result = await collect1.updateOne(query, updateDocument);
        console.log(result);
        return ["Update Complete"];
      }
    }
    else
    {
      console.log("ticket null error");
      return [
        "Results not found"
      ]
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
  /*
  try {
    await client.connect();
    const database = client.db('ticket');
    const collect1 = database.collection('ticketavailable');
    const query = { date: `${dayjs(day).format('DD/MM/YYYY')}`};
    const res = await collect1.findOne(query);
    //const filterquery = { date: `${dayjs(day).format('DD/MM/YYYY')}`};
    //const findticketclass = await collect1.findOne(filterquery);
    console.log("tr "+res)
    if(res == null)
    {
      if(findticketclass.ticketavailable - Math.abs(amount) < 0 || Math.abs(amount) < findticketclass.ticketminimumbuy)
      {
        console.log("Purchase amount more than available or less than minimumbuy")
      }
      else
      {
        const updateDocument = {
          $inc: {
            "allticket.$.ticketavailable": amount
          },
        };
        const result = await collect1.updateOne(filterquery, updateDocument);
        console.log(result);
      }
    }
    else
    {
      console.log("ticket null error");
    }
    
    //return res.allticket;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
  */
}


async function resetdb() {
  try {
    await client.connect();
    const database = client.db('ticket');
    const collect1 = database.collection('ticketavailable');
    var resu = await collect1.deleteMany();
    console.log("Deleted: "+resu.deletedCount);
    const today = new Date()
    //console.log("dayjsconvert: "+dayjs(today).format('DD/MM/YYYY') );
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const next2day = new Date(today)
    next2day.setDate(next2day.getDate() + 2)
    var tdate = `${dayjs(today).format('DD/MM/YYYY')}`
    var ticket_init = [
      {
          "ticketdate": tdate,
          "ticketclass": "A",
          "ticketprice": 5000,
          "ticketavailable": 10,
          "ticketmaxperday": 10,
          "ticketminimumbuy": 1
      },
      {
          "ticketdate": tdate,
          "ticketclass": "B",
          "ticketprice": 2500,
          "ticketavailable": 20,
          "ticketmaxperday": 20,
          "ticketminimumbuy": 2
      },
      {
          "ticketdate": tdate,
          "ticketclass": "C",
          "ticketprice": 1000,
          "ticketavailable": 30,
          "ticketmaxperday": 30,
          "ticketminimumbuy": 2
      },
      {
          "ticketdate": tdate,
          "ticketclass": "D",
          "ticketprice": 500,
          "ticketavailable": 40,
          "ticketmaxperday": 40,
          "ticketminimumbuy": 3
      }
    ];
    var query = ticket_init
    var result = await collect1.insertMany(query);
    console.log(
      `A document was inserted with the _id: ${result.insertedIds}`,
    );
    tdate = `${dayjs(tomorrow).format('DD/MM/YYYY')}`
    ticket_init = [
      {
          "ticketdate": tdate,
          "ticketclass": "A",
          "ticketprice": 5000,
          "ticketavailable": 10,
          "ticketmaxperday": 10,
          "ticketminimumbuy": 1
      },
      {
          "ticketdate": tdate,
          "ticketclass": "B",
          "ticketprice": 2500,
          "ticketavailable": 20,
          "ticketmaxperday": 20,
          "ticketminimumbuy": 2
      },
      {
          "ticketdate": tdate,
          "ticketclass": "C",
          "ticketprice": 1000,
          "ticketavailable": 30,
          "ticketmaxperday": 30,
          "ticketminimumbuy": 2
      },
      {
          "ticketdate": tdate,
          "ticketclass": "D",
          "ticketprice": 500,
          "ticketavailable": 40,
          "ticketmaxperday": 40,
          "ticketminimumbuy": 3
      }
    ];
    result = await collect1.insertMany(ticket_init);
    console.log(
      `A document was inserted with the _id: ${result.insertedIds}`,
    );
    tdate = `${dayjs(next2day).format('DD/MM/YYYY')}`
    ticket_init = [
      {
          "ticketdate": tdate,
          "ticketclass": "A",
          "ticketprice": 5000,
          "ticketavailable": 10,
          "ticketmaxperday": 10,
          "ticketminimumbuy": 1
      },
      {
          "ticketdate": tdate,
          "ticketclass": "B",
          "ticketprice": 2500,
          "ticketavailable": 20,
          "ticketmaxperday": 20,
          "ticketminimumbuy": 2
      },
      {
          "ticketdate": tdate,
          "ticketclass": "C",
          "ticketprice": 1000,
          "ticketavailable": 30,
          "ticketmaxperday": 30,
          "ticketminimumbuy": 2
      },
      {
          "ticketdate": tdate,
          "ticketclass": "D",
          "ticketprice": 500,
          "ticketavailable": 40,
          "ticketmaxperday": 40,
          "ticketminimumbuy": 3
      }
    ];
    result = await collect1.insertMany(ticket_init);
    console.log(
      `A document was inserted with the _id: ${result.insertedIds}`,
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function insert(db, coll,body) {
  try {
    await client.connect();
    const database = client.db(db);
    const dev = database.collection(coll);
    const doc = body;
    const result = await dev.insertOne(doc);
    if(result == null)
    {
      return false
    }
    else
    {
      console.log(
        `A document was inserted with the _id: ${result.insertedId}`,
      );
      return true
    } 
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function del(body) {
  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const dev = database.collection('devices');
    var aa = String(body.id);
    console.log(
      `${aa}`,
    );
    const result = await dev.findOneAndDelete({"id":aa})
    console.log(
      `A document was deleted`
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

serv.get('/reseta', (req, res) => {
  resetdb();
  res.json({ message: 'Reset the database' });
});

serv.get('/gettodayticket', async (req, res) => {
  const resu = await getdayticket(`${dayjs(new Date()).format('DD/MM/YYYY')}`);
  //console.log(resu)
  res.json(resu);
});

serv.post('/login', async (req, res) => {
  //console.log(req.body)
  const resu = await loginprocess(req.body.username, req.body.password);
  res.json(resu);
});

serv.post('/getticketofdate', async (req, res) => {
  console.log(req.body)
  //const resu = await modifyticket(req.body.date, req.body.ticketclass, req.body.amount);
  var convertedDate = `${dayjs(new Date()).format('DD/MM/YYYY')}`
  if(req.body.date instanceof Date)
  {
    console.log("body.date is date")
    convertedDate = `${dayjs(req.body.date).format('DD/MM/YYYY')}`
  }
  else
  {
    console.log("body.date is string")
    convertedDate = req.body.date
  }
  const resu = await getdayticket(convertedDate);
  //console.log(resu)
  res.json(resu);
});

serv.post('/gettransaction', async (req, res) => {
  console.log(req.body)
 
  const resu = await accessmany('ticket','tickettransaction',{buyerusername: req.body.buyerusername});
  //console.log(resu)
  res.json(resu);
});

serv.post('/getstat', async (req, res) => {
  console.log(req.body)
  const resu = await accessone('ticket','ticketstat', {id:1});
  //console.log(resu)
  res.json(resu);
});

serv.post('/modifyticket', async (req, res) => {
  console.log(req.body)
  const resu = await modifyticket(req.body.date, req.body.ticketclass, req.body.amount);
  //console.log(resu)
  res.json(resu);
});

serv.post('/inserta', (req, res) => {
  insert(req.body);
  res.json({ message: 'Ahoy!, insert' });
});

serv.post('/deletea', (req, res) => {
  del(req.body);
  res.json({ message: 'Ahoy!, delete' });
});

serv.get('/', (req, res) => {
  res.json({ message: 'Ahoy!' });
});

serv.get('/aa', (req, res) => {
    res.json({ message: 'Indomitus!' });
  });

// mock data
const products = [
  {
    id: '1001',
    name: 'Node.js for Beginners',
    category: 'Node',
    price: 990
  },
  {
    id: '1002',
    name: 'React 101',
    category: 'React',
    price: 3990
  },
  {
    id: '1003',
    name: 'Getting started with MongoDB',
    category: 'MongoDB',
    price: 1990
  }
];

serv.get('/products', (req, res) => {
  res.json(products);
});

serv.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const result = products.find((product) => product.id === id);
  res.json(result);
});

serv.post('/register', async (req, res) => {
  console.log('post detected, registering user.., ', req.body);
  const resu = await registeruser(req.body)
  res.json(resu);
});

serv.post('/buy', async (req, res) => {
  console.log('post detected, registering transaction: ', req.body);
  const resa = await insert('ticket','tickettransaction', req.body)
  for (let j = 0; j < req.body.transactiondetails.length; j++) {
    await modifyticket(req.body.transactiondetails[j].ticketdate,req.body.transactiondetails[j].ticketclass, -req.body.transactiondetails[j].ticketbuy)
    await updatevalue('ticket','ticketstat',{id:1}, 'todayticketsold', parseInt(req.body.transactiondetails[j].ticketbuy))
    await updatevalue('ticket','ticketstat',{id:1}, 'todayticketleft', parseInt(-req.body.transactiondetails[j].ticketbuy))
  }
  res.json(resa);
});

serv.listen(1942, () => {
  console.log('Application is running on port 1942');
});

