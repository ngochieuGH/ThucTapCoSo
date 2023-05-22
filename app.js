const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const multer = require("multer");
const session = require('express-session')
const fs = require('fs');
const path = require('path');
// const find_d = require("__dirname" + "/mapbox.js");

// const request = require("request");
const https = require("https");
// const userPost = [];
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

let check = "nothing";
let Ma_User = "";
let obj;
mongoose.connect("mongodb://127.0.0.1:27017/ThucTapCoSoDB",{useNewUrlParser:true});
//Tao bang luu thong tin nguoi dung
const userSchema = mongoose.Schema({
    name: String,
    email: String,
    pass: String
});
const User = mongoose.model("User",userSchema);

//Tao bang luu thong tin bai dang
const postSchema = mongoose.Schema({
    idUser: String,
    Type: String,
    Format: String,
    Tittle: String,
    Address: String,
    Area: String,
    Price: String,
    Df: String,
    Rooms: Number,
    Prior: String,
    Information: String,
    Fname: String,
    Tel: String,
    Status: Boolean,
    YoN: Boolean,
    Cmt: String,
    Img:{
        data: Buffer,
        contentType: String
    }
});
const Post = mongoose.model("Post", postSchema);

//Dinh nghia noi luu tru, cach lay file
const storage = multer.diskStorage({
    destination: (req,file,res)=>{
        res(null,'./UpLoad')
    },
    filename: (req,file,res)=>{
        res(null,file.originalname)
    }
});
const upload = multer({storage: storage});

app.get("/",function (req,res) {
    res.render("home",{text: check, h:"nothing"});    
})
// app.get("/",(req,res)=>{
//     res.redirect("login");
// })


app.get("/manageUser",(req,res)=>{
    Post.find({idUser: Ma_User})
        .then(data => {
            res.render("manageUser",{Content: data,h:"nothing", text: check}); 
        })
})
app.get("/logout",(req,res)=>{
    check = "nothing";
    Ma_User = "";
    res.render("home",{h:"nothing", text: check});
})
app.get("/FindHouse",function (req,res) {
    Post.find({ Status: true, Type: "Tìm trọ" })
        .then(data => {
            res.render( "FindHouse",{h:"nothing", text: check,posts: data});   
        }) 
})
app.get("/pov/:postName",(req,res)=>{
    const a = req.params.postName;
    obj = a;
    Post.findById(a)
        .then(data => {
            res.render("pov",{text:check, h: "nothing", posts: data});
        })
})
app.get("/FindRoomates", function (req,res) {
    Post.find({ Status: true, Type: "Tìm người ở ghép" })
    .then(data => {
        res.render( "FindRoomates",{h:"nothing", text: check,posts: data});   
    })   
})
app.get("/FormPost", function (req,res) {
    if(check === "nothing"){
        res.redirect("login");
    }
    else{
        res.render("FormPost",{text: check, h: "nothing"});  
    }  
})
app.route("/login")
    .get((req,res)=>{
        res.render("login",{h: "nothing", text: check});
    })
    .post((req,res) =>{
        console.log(req.body.email);
        console.log(req.body.pass);
        User.findOne({email: req.body.email})
            .then(data =>{
                if(data.pass === req.body.pass){
                    check = data.name;
                    Ma_User = data._id;
                    console.log(check);
                    console.log(Ma_User);
                    res.render("home",{text: check, h:"nothing"});
                }
                else{
                    res.render("login",{h:"nothing", text: check});
                }
            })
    })
app.route("/SignUp")
    .get((req,res) => {
        res.render("SignUp",{h:"nothing", text: check}); 
    })
    .post((req,res) => {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            pass: req.body.pass
        });
        newUser.save()
            .then(data => {
                check = data.name;
                Ma_User = data._id;
                res.render("home",{h:"nothing", text: check});
            })
    })
// app.get("/SignUp", function (req,res) {
//     res.render("SignUp");    
// })
app.post("/FormPost",upload.single("tenFile") ,function(req,res) {
        const newPost = new Post({
            idUser: Ma_User,
            Type: req.body.sl1,
            Format: req.body.sl2,
            Tittle: req.body.Tittle,
            Address: req.body.address,
            Area: req.body.area,
            Price: req.body.price,
            Rooms: req.body.room,
            Df: req.body.sl3,
            Prior: req.body.sl4,
            Information: req.body.information,
            Fname: req.body.Fname,
            Tel: req.body.telephone,
            YoN: true,
            Status: false,
            Img: {
                data: fs.readFileSync(path.join(__dirname + '/UpLoad/' + req.file.filename)),
                contentType: "image/png"
            }
        });
        newPost.save();
        res.redirect("/");
})

app.get("/listPost", function (req,res) {
    Post.find({Status: false, YoN: true})
        .then(data =>{
                res.render("listPost",{Content: data,h:"nothing", text: check}); 
        })   
}) 

app.get("/post/:postName",function(req,res) {
    // const requestTitle = _.lowerCase(req.params.postName);
    // for(var i=0 ; i < userPost.length ; i++){
    //     if( requestTitle === _.lowerCase(userPost[i].Tittle) ){
    //         res.render("post",{Tittle: userPost[i].Tittle, Address: userPost[i].Address,Area: userPost[i].Area,
    //         Price:userPost[i].Price,Information:userPost[i].Information,
    //         Fname:userPost[i].Fname, Tel:userPost[i].Tel,
    //         Type: userPost[i].Type, Format:userPost[i].Format,
    //         Df: userPost[i].Df, Prior: userPost[i].Prior,Img: userPost[i].Image});
    //     }
    //     console.log(userPost[i].Img);
    // }
    const requestTitle = req.params.postName;
    obj = requestTitle;
    // console.log(requestTitle);
    Post.findById(requestTitle)
        .then(data => {
            res.render("Post",{posts: data,h:"nothing", text: check});
        })
})
app.get("/update", (req,res)=>{
    // const requestTitle = req.params.postName;
    Post.updateOne({ _id: obj },{ $set: { Status: true }})
        .then(data => {
            res.redirect("listPost");
        })
        .catch(err => {
            res.send(err);
        })
})
app.get("/delete",(req,res)=>{
    // const requestTitle = req.params.postName;
    Post.updateOne({ _id: obj },{ $set: { YoN: false }})
        .then(()=>{
            res.redirect("listPost");
        })
})

app.get("/delete_fUser",(req,res)=>{
    // const requestTitle = req.params.postName;
    Post.findOneAndDelete({"_id": obj})
        .then((data)=>{
            res.redirect("manageUser");
        })
})
app.listen(3000, function () {
    console.log("Server is running on port 3000");
});