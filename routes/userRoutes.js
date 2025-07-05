const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthmiddleware, generateToken} = require('./../jwt');

//POST route to add a person
router.post('/signup', async (req,res)=>{
    try{
        const data = req.body; //Assuming the request body containing the User data

        //create a new User document using the mongoose model
        const newUser = new User(data);
        
        //SAVE THE new user to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
       
        res.status(200).json({response: response, token:token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
});

//Login route
router.post('/login', async(req,res) => {
   try{
    //Extract aadharCardNumber and password from request body
    const {aadharCardNumber,password} = req.body;

    //Find the user by aadharcardNumber
    const user = await User.findOne({aadharCardNumber: aadharCardNumber});

    //If user does not exist or password does not match,return error
    if(!user || !(await user.comparePassword(password))){
        return res.status(401).json({error:'Invalid user or password'});
    }

    //generate Token
    const payload = {
        id: response.id
    } 
    const token = generateToken(payload);

    //return token as response
    res.json({token});
   }catch(err){
    console.log(err);
    res.status(500).json({error:'Internal server error'});
   }
});

//Profile route
router.get('/profile', jwtAuthmiddleware, async(req,res) => {
    try{
        const userId = req.user.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({error:'Internal server error'});
    }
})

//change password
router.put('/profile/password',jwtAuthmiddleware, async(req,res)=>{
    try{
        const userId = req.user.id;//Extract the id from the token
        const {currentPassword, newPassword} = req.body;//Extract the current and new password from request body

        //find the user by userId
        const user = await user.findById(userId);
        
        //If password does not match then return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: 'Invalid password'});
        }

        //update user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message:'Password updated'});

    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
})

module.exports = router;