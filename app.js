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
        res.redirect("/login");
    }
}

/*creating routes*/
app.use(express.static('public'));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/pages/index.html");
});

app.get("/register", function (req, res) {
    res.sendFile(__dirname + "/pages/user_register.html");
});

app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/pages/login.html");
});

app.get("/update", function (req, res) {
    res.sendFile(__dirname + "/pages/acoount_update_page.html");
});
/*declaring mongoose schema for user registration*/

const userdata = new mongoose.Schema({
    Name: { type: String, required: true },
    Gender: { type: String, required: true },
    DOB: { type: Date, required: true },
    Phone_No: { type: String, required: true, unique: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true }
});

/*initializing a model*/
const userinputs = new mongoose.model("StoredDatas", userdata);

//count of users
const adminsource = userinputs.find();


/*main input function*/
app.post("/register", async function (req, res) {
    const maindata = new userinputs({
        Name: req.body.full_name,
        Gender: req.body.gender,
        DOB: req.body.date_of_birth,
        Phone_No: req.body.mobile_no,
        Email: req.body.email,
        Password: req.body.usr_password
    });
    let pwd1 = req.body.usr_password;
    console.log(pwd1)
    let pwd2 = req.body.usr_password_repeat;
    console.log(pwd2)
    if (pwd1 === pwd2) {
        await maindata.save(function (err) {
            if (err) {
                var error_name = "User already registered";
                res.render("Error_Page", { errmessage: error_name })
                console.log(err);
            } else {
                res.redirect("/login");
                console.log("user data saved successfully");
            }
        });
    }
    else {
        var error_name = "Passwords do not match";
        res.render("Error_Page", { errmessage: error_name })
        console.log("password did not match")
    }
    console.log("hello")
});

let newid = "";

/*sign in function*/
app.post("/login", async function (req, res) {
    try {
        const email = req.body.Email;
        const password = req.body.cust_password;
        const usermail = await userinputs.findOne({ Email: email });
        /*console.log(email);
        console.log(password);
        console.log(usermail);
        console.log(usermail.Password);*/
        id = usermail._id.toString().replace(/ObjectId\("(.*)"\)/, "$1");
        newid = id;
        var usrname = usermail.Name;
        if (usermail.Password === password) {
            req.session.isAuth = true;
            console.log("Session ID -->" + req.session.id);
            console.log("success");

            const count = await userinputs.countDocuments();
            console.log(count);
            console.log(newid);
            res.render("home", { theid: id, usrname: usrname, count: count});

            /*res.send("<h2>you are signed in, your unique user ID is : " + id+"</h2>");*/
        } else {
            var err_name = "Sign-in failed. (invalid credentials!). You can go back and try again."
            res.render("Error_Page", { errmessage: err_name })
            /*res.send("Oops! invalid credentials,go back and try again");*/
            console.log("invalid credentials")
        }

    } catch (error) {
        var error_name = "looks like you are not registered yet"
        res.render("Error_Page", { errmessage: error_name })
        console.log("Not registered");
    }
});

/*creating USER CRUD FUNCTIONS*/
app.get("/user/:id", function (req, res) {
    if(req.session.isAuth){
        console.log(req.params.id)
        userinputs.findById(req.params.id, function (err, user) {
            if (err) {
                res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
                /*console.log(err);*/
            } else {
                /*console.log(user);*/
                console.log("First function call : ", user);
            }
            res.render("user_info", { Users: user });
        });
    }
    else{
        res.redirect("/login");
    }
    
});

const updateuser = mongoose.model("StoredDatas", userdata);

app.post("/update", function (req, res) {
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
            res.render("messagepage", { errmessage: "Account Updated", location:"login" });
        }
    });
    
});

app.get("/user/delete/:id", function (req, res) {
    console.log(req.params.id)
    userinputs.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
            /*console.log(err);*/
        } else {
            /*console.log(user);*/
            res.render("messagepage", { errmessage: "Account Deleted",location:"register" })
        }
    });
});



/*get routes for every department */
app.get("/Anesthesiology", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "Anesthesiology department",
        nameofimg: "anes",
        nameofroute: "/Anesthesiology"
    });
});
app.get("/Cardiology", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "Cardiology department",
        nameofimg: "cardiology",
        nameofroute: "/Cardiology"
    });
});
app.get("/ENT", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "ENT department",
        nameofimg: "ENT",
        nameofroute: "ENT",
        nameofroute: "/ENT"
    });
});
app.get("/Gastroenterology", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "Gastroenterology department",
        nameofimg: "gastro",
        nameofroute: "/Gastroenterology"
    });
});
app.get("/General", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "General surgery",
        nameofimg: "generalsurgery",
        nameofroute: "/General"
    });
});
app.get("/Gynaecology", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "Gynaecology department",
        nameofimg: "gynec",
        nameofroute: "/Gynaecology"
    });
});
app.get("/Pediatrics", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "Pediatrics department",
        nameofimg: "pedia",
        nameofroute: "/Pediatrics"
    });
});
app.get("/Neurology", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "Neurology department",
        nameofimg: "neurology",
        nameofroute: "/Neurology"
    });
});
app.get("/Orthopaedic", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "Orthopaedic department",
        nameofimg: "ortho",
        nameofroute: "/Orthopaedic"
    });
});
app.get("/Urology", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "Urology department",
        nameofimg: "urology",
        nameofroute: "/Urology"
    });
});
app.get("/Psychiatry", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "Psychiatry department",
        nameofimg: "pshycology",
        nameofroute: "/Psychiatry"
    });
});
app.get("/DonateBlood", function (req, res) {
    res.render("Patient_registration", {
        nameofdept: "Donate Blood",
        nameofimg: "donate",
        nameofroute: "/DonateBlood"
    });
});
/*end of routes*/

app.get("/Success", function (req, res) {
    res.render("patient_reg_success");
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

/*new models for each department*/
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

/*posting registrations*/
/*anesthesia dept */
app.post("/Anesthesiology", async function (req, res) {
    const patientdata = new anesthesiainputs({
        BookedBy: id,
        Department: "Anesthesiology Department",
        Name: req.body.Patient_name,
        Age: req.body.Patient_age,
        Gender: req.body.gender,
        Phone_No: req.body.Contact_num,
        Date: req.body.App_date,
        Email: req.body.Patient_email
    });
    console.log(id);
    await patientdata.save(async function (err) {
        if (err) {
            var error_name = "Patient already registered in same department";
            res.render("Error_Page", { errmessage: error_name })
            console.log(err);
        } else {
            /*res.redirect("/login");*/
            const contact = req.body.Contact_num;
            const found = await anesthesiainputs.findOne({ Phone_No: contact });
            var id = found._id.toString().replace(/ObjectId\("(.*)"\)/, "$1");
            console.log(patientdata)
            console.log("Patient registered successfully");
            console.log(id);
            res.render("patient_reg_success", { patid: id, routename: "Anesthesiology" })
        }
    })
})

app.get("/Anesthesiology/:id", function (req, res) {
    console.log(req.params.id)
    anesthesiainputs.findById(req.params.id, function (err, user) {
        if (err) {
            res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
            /*console.log(err);*/
        } else {
            /*console.log(user);*/
            res.render("receipt", { users: user, routename: "Anesthesiology" });
        }
    });
});
app.get("/Anesthesiology/delete/:id", function (req, res) {
    console.log(req.params.id)
    anesthesiainputs.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
            /*console.log(err);*/
        } else {
            /*console.log(user);*/
            res.render("messagepage", { errmessage: "REGISTRATION CANCELLED",location:"" })
        }
    });
});

/*cardiology*/
app.post("/Cardiology", async function (req, res) {
    const patientdata = new cardioinputs({
        BookedBy: id,
        Department: "Cardiology Department",
        Name: req.body.Patient_name,
        Age: req.body.Patient_age,
        Gender: req.body.gender,
        Phone_No: req.body.Contact_num,
        Date: req.body.App_date,
        Email: req.body.Patient_email
    });
    await patientdata.save(async function (err) {
        if (err) {
            var error_name = "Patient already registered in same department";
            res.render("Error_Page", { errmessage: error_name })
            console.log(err);
        } else {
            /*res.redirect("/login");*/
            const contact = req.body.Contact_num;
            const found = await cardioinputs.findOne({ Phone_No: contact });
            var id = found._id.toString().replace(/ObjectId\("(.*)"\)/, "$1");
            console.log(patientdata)
            console.log("Patient registered successfully");
            console.log(id);
            res.render("patient_reg_success", { patid: id, routename: "Cardiology" })
        }
    })
})

app.get("/Cardiology/:id", function (req, res) {
    console.log(req.params.id)
    cardioinputs.findById(req.params.id, function (err, user) {
        if (err) {
            res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
            /*console.log(err);*/
        } else {
            /*console.log(user);*/
            res.render("receipt", { users: user, routename: "Cardiology" });
        }
    });
});
app.get("/Cardiology/delete/:id", function (req, res) {
    console.log(req.params.id)
    cardioinputs.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
            /*console.log(err);*/
        } else {
            /*console.log(user);*/
            res.render("messagepage", { errmessage: "REGISTRATION CANCELLED",location:"" })
        }
    });
});

//ent department
app.post("/ENT", async function (req, res) {
    const patientdata = new ENTinputs({
        BookedBy: id,
        Department: "ENT Department",
        Name: req.body.Patient_name,
        Age: req.body.Patient_age,
        Gender: req.body.gender,
        Phone_No: req.body.Contact_num,
        Date: req.body.App_date,
        Email: req.body.Patient_email
    });
    await patientdata.save(async function (err) {
        if (err) {
            var error_name = "Patient already registered in same department";
            res.render("Error_Page", { errmessage: error_name })
            console.log(err);
        } else {
            /*res.redirect("/login");*/
            const contact = req.body.Contact_num;
            const found = await ENTinputs.findOne({ Phone_No: contact });
            var id = found._id.toString().replace(/ObjectId\("(.*)"\)/, "$1");
            console.log(patientdata)
            console.log("Patient registered successfully");
            console.log(id);
            res.render("patient_reg_success", { patid: id, routename: "ENT" })
        }
    })
})

app.get("/ENT/:id", function (req, res) {
    console.log(req.params.id)
    ENTinputs.findById(req.params.id, function (err, user) {
        if (err) {
            res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
            /*console.log(err);*/
        } else {
            /*console.log(user);*/
            res.render("receipt", { users: user, routename: "ENT" });
        }
    });
});
app.get("/ENT/delete/:id", function (req, res) {
    console.log(req.params.id)
    ENTinputs.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
            /*console.log(err);*/
        } else {
            /*console.log(user);*/
            res.render("messagepage", { errmessage: "REGISTRATION CANCELLED",location:"" })
        }
    });
});

//donate blood
/*posting registrations*/
app.post("/DonateBlood", async function (req, res) {
    const patientdata = new blooddonation({
        BookedBy: id,
        Department: "Blood Donation",
        Name: req.body.Patient_name,
        Age: req.body.Patient_age,
        Gender: req.body.gender,
        Phone_No: req.body.Contact_num,
        Date: req.body.App_date,
        Email: req.body.Patient_email
    });
    await patientdata.save(async function (err) {
        if (err) {
            var error_name = "Patient already registered in same department";
            res.render("Error_Page", { errmessage: error_name })
            console.log(err);
        } else {
            /*res.redirect("/login");*/
            const contact = req.body.Contact_num;
            const found = await blooddonation.findOne({ Phone_No: contact });
            var id = found._id.toString().replace(/ObjectId\("(.*)"\)/, "$1");
            console.log(patientdata)
            console.log("Patient registered successfully");
            console.log(id);
            res.render("patient_reg_success", { patid: id, routename: "DonateBlood" })
        }
    })
})

app.get("/DonateBlood/:id", function (req, res) {
    console.log(req.params.id)
    blooddonation.findById(req.params.id, function (err, user) {
        if (err) {
            res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
            /*console.log(err);*/
        } else {
            /*console.log(user);*/
            res.render("receipt", { users: user, routename: "DonateBlood" });
        }
    });
});
app.get("/DonateBlood/delete/:id", function (req, res) {
    console.log(req.params.id)
    blooddonation.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.render("Error_Page", { errmessage: "RECORD NOT FOUND" });
            /*console.log(err);*/
        } else {
            /*console.log(user);*/
            res.render("messagepage", { errmessage: "REGISTRATION CANCELLED",location:"" })
        }
    });
});

/*similarly other departments can be created*/
/*this is a demo project so i did not create routes for all departments*/

/*appointments for each department*/
app.get("/Appointments", function(req,res){
    res.sendFile(__dirname + "/pages/Appointments.html");
})

app.get("/Appointments/Anesthesiology", async function (req,res) {
    console.log("id is -> " + newid);
    anesthesiainputs.find({BookedBy: newid})
    .then((x)=>{
        res.render("Appointments", {x, route:"Anesthesiology"})
    }).catch((y)=>{
        console.log(y)
    })
})

app.get("/Appointments/Cardiology", async function (req,res) {
    console.log("id is -> " + newid);
    cardioinputs.find({BookedBy: newid})
    .then((x)=>{
        res.render("Appointments", {x, route:"Cardiology"})
    }).catch((y)=>{
        console.log(y)
    })
})

app.get("/Appointments/ENT", async function (req,res) {
    console.log("id is -> " + newid);
    ENTinputs.find({BookedBy: newid})
    .then((x)=>{
        res.render("Appointments", {x, route:"ENT"})
    }).catch((y)=>{
        console.log(y)
    })
})
/*end of appointments section */

/*chatbox function*/

/*logut function*/
app.post("/logout", function(req,res){
    req.session.destroy(function(err){
        if(err){
            throw err;
        }else{
            res.redirect("/login");
        }
    })
})
/*server starter*/
app.listen(3000, function () {
    console.log("Server has started successfully on port 3000");
});
/*end of function*/






