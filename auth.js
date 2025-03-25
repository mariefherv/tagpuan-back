const jwt = require("jsonwebtoken");

const secret = "ace@auramaster";

module.exports.createAccessToken = (userDetails) => {
	const data = {
		id: userDetails.id,
		email: userDetails.email,
		role: userDetails.role,
	}

    return jwt.sign(
        data,
        secret,
        { expiresIn: "1h" } // Token expires in 1 hour
    );
}

// Verify if authenticated user
module.exports.verify = (req,res,next) => {

    let token = req.headers.authorization
    if(typeof token === "undefined"){
        return res.send({auth: "Failed. No Token."});
    } else {
        token = token.slice(7);
        jwt.verify(token,secret,function(err,decodedToken){
            if(err){
                return res.send({
                    auth: "No such user exists! Please try again.",
                    message: err.message
                })
            } else {
                req.user = decodedToken;
                next();

            }

        })
    }
}

// Verify if authenticated user is an admin
module.exports.verifyAdmin = (req,res,next) => {
    if(req.user.role === "Admin"){
        next();
    } else {
        return res.send({
            auth: "Failed",
            message: "No permission",
            role: req.user.role
        })
    }
}