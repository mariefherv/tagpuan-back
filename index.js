const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // Import http module
const { Server } = require("socket.io");
const User = require("./models/User"); // Import User model

const app = express();
const port = process.env.PORT || 4000;

// Setup HTTP server
const server = http.createServer(app);

// Setting up Socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Track online users
let onlineUsers = new Map();

io.on("connection", async (socket) => {
    console.log("A user connected:", socket.id);

    // Handle user login (update isOnline in DB)
    socket.on("userOnline", async (userId) => {
        onlineUsers.set(userId, socket.id);
        await User.findByIdAndUpdate(userId, { isOnline: true });
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    });

    // Handle user logout or disconnect (update DB)
    socket.on("disconnect", async () => {
        console.log("A user disconnected:", socket.id);
        for (const [userId, sockId] of onlineUsers.entries()) {
            if (sockId === socket.id) {
                onlineUsers.delete(userId);
                await User.findByIdAndUpdate(userId, { isOnline: false });
                break;
            }
        }
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    });
});

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

//for itemRoutes
const itemRoutes = require('./routes/itemRoutes');
app.use('/item',itemRoutes);

//for notificationRoutes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/notification',notificationRoutes);


app.listen(port,()=>console.log("API running at localhost:4000"))