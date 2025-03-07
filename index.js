const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require('express-session');
const {
    v4: uuidv4
} = require('uuid');
const multer = require('multer');
const path = require('path');
const pg = require('pg');
const PgSession = require('connect-pg-simple');
const supabase = require('./db/supabase.js');
const cloudinary = require('./db/cloudinary.js');
const upload = require('./middlewares/multer.js');
require('dotenv').config(); // Load environment variables
const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL, // Use your Supabase Postgres URL
    ssl: {
        rejectUnauthorized: false
    },
});
const app = express();
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(session({
    store: new(PgSession(session))({
        pool: pgPool, // Connect to PostgreSQL
        tableName: 'session', // Default: 'session'
    }),
    secret: 'secretfile',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 90000000
    }
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});
// const upload = multer({ storage });
const getUserIP = (req) => {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};
const store = []
app.get('/', async (req, res) => {
    if (!req.session.userData) {
        const userId = uuidv4();
        req.session.userData = {
            id: userId,
            ip: getUserIP(req)
        }
        console.log("setting up session...")
        console.log(req.session.userData)
    }
    const {
        data: myImages
    } = await supabase.from("batman").select("image").eq("user", req.session.userData.id)
    console.log('my images', myImages)
    res.render('index', {
        userData: req.session.userData,
        myImages
    });
});
app.get("/get-ready", async (req, res) => {
    if (!req.session.userData && req.query.session == "null") {
        const userId = uuidv4();
        req.session.userData = {
            id: userId,
            ip: getUserIP(req)
        }
        console.log("setting up session...")
        console.log(req.session.userData)
    }
    if (!req.session.userData && req.query.session != "null") {
        req.session.userData = {
            id: req.query.session,
            ip: getUserIP(req)
        }
        console.log("setted session.")
        console.log(req.session.userData)
    }
    const session = req.session.userData
    const {
        data: images,
        error
    } = await supabase.from('batman').select('image').eq('user', session.id)
    if (error) {
        console.log(error)
        return res.status(500).json({
            error: "Error"
        })
    }
    res.json({
        session: req.session.userData,
        images,
        message: "Welcome"
    })
})
app.get("/getip", (req, res) => {
    const userIP = getUserIP(req);
    const userAgent = req.headers['user-agent'];
    console.log(userIP)
    console.log(userAgent)
    console.log(req.ip)
})
app.post("/upload", upload.single('image'), async (req, res) => {
    if (!req.session.userData && req.query.session == "null") {
        const userId = uuidv4();
        req.session.userData = {
            id: userId,
            ip: getUserIP(req)
        }
        console.log("setting up session...")
        console.log(req.session.userData)
    }
    if (!req.session.userData && req.query.session != "null") {
        req.session.userData = {
            id: req.query.session,
            ip: getUserIP(req)
        }
        console.log("setted session.")
        console.log(req.session.userData)
    }
    try {

        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded"
            });
        }
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'test_images',
            transformation: [{
                width: 250,
                crop: "scale"
            }, {
                quality: "auto"
            }, {
                fetch_format: "auto"
            }]
        });
        if (!result) {
            return res.status(400).json({
                error: "file not uploaded"
            });
        }
        const {
            error
        } = await supabase.from('batman').insert({
            user: req.session.userData.id,
            image: result.secure_url
        })
        const {
            data
        } = await supabase.from("batman").select("image").eq("user", req.session.userData.id)
        store.push({ ...req.session.userData,
            photoUrl: result.secure_url
        })
        console.log(store)
        res.json({
            message: "File uploaded successfully",
            myImages: data,
            file: req.file
        });
    } catch (e) {
        res.status(505).json({err: e})
        console.log(e);
    }
})
app.listen(3000, () => console.log("server started at 3000"))