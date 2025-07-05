const jwt = require('jsonwebtoken');

const jwtAuthmiddleware = (req,res,next) => {

    //first check request headers has authorization or not
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({error: 'Token not found'});

    //Extract the jwt token from the request headers
    const token =req.headers.authorization.split('')[1];
    if(!token) return res.status(401).json({error :'Unauthorized'});

    try{
        //Verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //ATTACH user information to the request object
        req.user = decoded;
        next();
    }catch(err){
        console.error(err);
        res.status(401).json({error: 'INVALID token'});
    }
}

//Function to generate jwt token
const generateToken = (userData) => {
    //Generate new jwt token usin userData
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: 3000});
}

module.exports = {jwtAuthmiddleware, generateToken};