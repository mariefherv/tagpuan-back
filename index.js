const express = require("express");

const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

// setting up connection to mongoDB
mongoose.connect("mongodb+srv://mariefher:KwcPnxVkMaavNgjO@tagpuandb.r9wbx.mongodb.net/?retryWrites=true&w=majority&appName=tagpuanDB",
{
	useNewUrlParser: true,
	useUnifiedTopology: true

});

let db = mongoose.connection;

db.on('error',console.error.bind(console, "MongoDB Connection Error."));
db.once('open',()=>console.log("Connected to MongoDB."))

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

//for userRoutes
const userRoutes = require('./routes/userRoutes');
app.use('/user',userRoutes);

//for bidRoutes
const bidRoutes = require('./routes/bidRoutes');
app.use('/bid', bidRoutes);

//for orderRoutes
const orderRoutes = require('./routes/orderRoutes');
app.use('/order',orderRoutes);

// for conversationRoutes
const conversationRoutes = require('./routes/conversationRoutes');
app.use('/conversation', conversationRoutes);

//for farmerRoutes
const farmerRoutes = require('./routes/farmerRoutes');
app.use('/farmer',farmerRoutes);

//for commodityRoutes
const commodityRoutes = require('./routes/commodityRoutes');
app.use('/commodity',commodityRoutes);


app.listen(port,()=>console.log("API running at localhost:4000"))