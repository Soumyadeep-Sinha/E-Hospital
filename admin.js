/*imporing node modules*/
const express = require("express");
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
/*import ends*/

/*initializing the modules*/
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
/*ending initialization*/

/*declaring server urls*/
const uri = "mongodb+srv://" + process.env.NAME + ":" + process.env.PASSWORD + "08@hospital-cluster.gbtkhxf.mongodb.net/?retryWrites=true&w=majority";
/*console.log(uri);*/
const locale = "mongodb://localhost:27017/hospitalDB";
/*depriciation warning suppressed*/
mongoose.set('strictQuery', true);
/*done declaring urls*/

/*connecting mongoose*/
mongoose.connect(locale, function (err) {
    if (err) {
        console.log("connection error");
        console.log(err);
        mongoose.disconnect();
    } else {
        console.log("successfully connected to your MongoDB database.");
    }
});
/*connection function ends*/

/*initializing mongodb sessions*/
const store = new mongodbSession({
    uri: locale,
    collection: "MySessions",
})

app.use(session({
    secret : "key that will sign cookie",
    resave : false,
    saveUninitialized : false,
    store: store
}));

const isAuth = function(req,res,next){
    if(req.session.isAuth){
        next();
    }else{
        res.redirect("/");
    }
}

var sstatus = false;

app.use(express.static('public'));

app.get("/dashboard", function (req, res) {
    res.sendFile(__dirname + "/pages/Dasboard.html");
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/pages/admin.html");
});

app.get("/update", function (req, res) {
    res.sendFile(__dirname + "/pages/acoount_update_page.html");
});

const admindata = new mongoose.Schema({
    Name: { type: String, required: true },
    Phone_No: { type: String, required: true, unique: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true }
});

/*initializing a model*/
const admininputs = new mongoose.model("adminData", admindata);

/*const firstdata = new admininputs({
    Name: "admin",
    Phone_No: "000000000",
    Email: "admin@gmail.com",
    Password: "admin12345"
});

firstdata.save();*/

app.post("/", async function (req, res) {
    try {
        const email = req.body.Email;
        const password = req.body.cust_password;
        const usermail = await admininputs.findOne({ Email: email });
        /*console.log(email);
        console.log(password);
        console.log(usermail);
        console.log(usermail.Password);*/
        var id = usermail._id.toString().replace(/ObjectId\("(.*)"\)/, "$1");
        var usrname = usermail.Name;
        if (usermail.Password === password) {
            req.session.isAuth = true;
            sstatus = true;
            console.log("Session ID -->" + req.session.id);
            console.log("success");

            const count = await userinputs.countDocuments();
            console.log(count);
            res.redirect("/dashboard")

            /*res.send("<h2>you are signed in, your unique user ID is : " + id+"</h2>");*/
        } else {
            var err_name = "Sign-in failed. (invalid credentials!). You can go back and try again."
            res.render("Error_Page", { errmessage: err_name })
            /*res.send("Oops! invalid credentials,go back and try again");*/
            console.log("invalid credentials")
        }

    } catch (error) {
        var error_name = "looks like you are not an admin"
        res.render("Error_Page", { errmessage: error_name })
        console.log("Not registered");
    }
});


/*user model*/
const userdata = new mongoose.Schema({
    Name: { type: String, required: true },
    Gender: { type: String, required: true },
    DOB: { type: Date, required: true },
    Phone_No: { type: String, required: true, unique: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true }
});

/*schema for patients*/
const patient_inputs = new mongoose.Schema({
    BookedBy : { type: String, required: true },
    Department: { type: String, required: true },
    Name: { type: String, required: true },
    Age: { type: Number, required: true },
    Gender: { type: String, required: true },
    Phone_No: { type: String, required: true },
    Date: { type: Date, required: true },
    Email: { type: String }
});
/*initializing a model*/
/*user parts*/
const userinputs = new mongoose.model("StoredDatas", userdata);

app.get("/dashboard/users", async function (req, res){
    if(sstatus){
        userinputs.find({})
        .then((x)=>{
            res.render("Dashboard", {x})
        }).catch((y)=>{
            console.log(y)
        })
    }else{
        res.redirect("/")
    }
    
})

const updateuser = mongoose.model("StoredDatas", userdata);

app.post("/update", function (req, res) {
    if(sstatus){
        const maindata = new updateuser({
            _id: req.body.upd_uid,
            Name: req.body.new_name,
            Phone_No: req.body.new_phone,
            Email: req.body.new_email,
            Password: req.body.new_pwd
        });
        console.log("we have id ==>",req.body.upd_uid)
        updateuser.findByIdAndUpdate(req.body.upd_uid, maindata, function (err, user) {
            if (err) {
                res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
            } else {
                console.log("newname ==>", req.body.new_name)
                res.sendFile(__dirname + "/pages/Dasboard.html")
            }
        });
    }
    else{
        res.redirect("/")
    }
    
});

app.get("/user/deleteuser/:id", function (req, res) {
    if(sstatus){
        console.log(req.params.id)
        userinputs.findByIdAndRemove(req.params.id, function (err) {
            if (err) {
                res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
                /*console.log(err);*/
            } else {
                /*console.log(user);*/
                res.sendFile(__dirname + "/pages/Dasboard.html")
            }
        });
    }else{
        res.redirect("/")
    }
    
});
/* user section ends */

/*patients for every department */
const anesthesiainputs = new mongoose.model("AnesthesiologyDatas", patient_inputs);
const cardioinputs = new mongoose.model("CardioLogyDatas", patient_inputs);
const ENTinputs = new mongoose.model("ENTDatas", patient_inputs);
const Gastroinputs = new mongoose.model("GastroenterologyDatas", patient_inputs);
const Gynaecoinputs = new mongoose.model("GynaecologyDatas", patient_inputs);
const Pediatricinputs = new mongoose.model("PediatricsDatas", patient_inputs);
const Psychiatryinputs = new mongoose.model("PsychiatryDatas", patient_inputs);
const Neuroinputs = new mongoose.model("NeurologyDatas", patient_inputs);
const Orthoinputs = new mongoose.model("OrthopaedicDatas", patient_inputs);
const Uroinputs = new mongoose.model("UrologyDatas", patient_inputs);
const blooddonation = new mongoose.model("bloodDonation", patient_inputs);


app.get("/dashboard/Anesthesiology", async function (req, res){
    if(sstatus){
        anesthesiainputs.find({})
        .then((x)=>{
            res.render("Dashboard_pat", {x})
        }).catch((y)=>{
            console.log(y)
        })
    }
    else{
        res.redirect("/")
    }
})

app.get("/dashboard/Cardiology", async function (req, res){
    if(sstatus){
        cardioinputs.find({})
        .then((x)=>{
            res.render("Dashboard_pat", {x})
        }).catch((y)=>{
            console.log(y)
        })
    }
    else{
        res.redirect("/")
    }
})

app.get("/dashboard/ENT", async function (req, res){
    if(sstatus){
        ENTinputs.find({})
        .then((x)=>{
            res.render("Dashboard_pat", {x})
        }).catch((y)=>{
            console.log(y)
        })
    }
    else{
        res.redirect("/")
    }
})

app.get("/dashboard/Gastroenterology", async function (req, res){
    if(sstatus){
        Gastroinputs.find({})
        .then((x)=>{
            res.render("Dashboard_pat", {x})
        }).catch((y)=>{
            console.log(y)
        })
    }
    else{
        res.redirect("/")
    }
})



app.post("/logout", function(req,res){
    sstatus = false;
    req.session.destroy(function(err){
        if(err){
            throw err;
        }else{
            res.redirect("/");
        }
    })
})


/*server starter*/
app.listen(4000, function () {
    console.log("Server has started successfully on port 4000");
});
/*end of function*/