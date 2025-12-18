const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./final_project/auth_users.js').authenticated;
const genl_routes = require('./final_project/general.js').general;

const app = express();

app.use(express.json());
app.use(session({
    secret: "fingerprint_customer",
    resave: false,
    saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req,res,next){
// Check if session exists
    if (req.session.authorization) {
        // Extract the access token
        let token = req.session.authorization['accessToken'];

        // Verify JWT access token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user; // attach user data
                next(); // access token valid allow user request
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
