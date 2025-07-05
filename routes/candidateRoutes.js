const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Candidate = require('../models/candidate');
const {jwtAuthmiddleware, generateToken} = require('../jwt');

const checkAdminRole = async (userID) => {
    try{
        const user = await User.findById(userID);
        if(user.role === 'admin'){
            return true;
        }
    }catch(err){
        return false;
    }
}

//POST route to add a candidate
router.post('/',jwtAuthmiddleware, async (req,res)=>{
    try{
        if(! await checkAdminRole(req.user.id))
            return res.status(403).json({message:'user does not have admin role'});
            
        const data = req.body; //Assuming the request body containing the candidate data

        //create a new User document using the mongoose model
        const newCandidate = new Candidate(data);
        
        //SAVE THE new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
       res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
});


router.put('/:candidateID',jwtAuthmiddleware, async(req,res) => {
    try{
         if(!checkAdminRole(req.user.id))
            return res.status(403).json({message:'user does not have admin role'});

        const candidateID = req.params.candidateID;//Extract the id from the url parameter
        const updatedCandidateData= req.body  ; //Updated data for the candidate
       
        const response = await User.findByIdAndUpdate(candidateID,updatedCandidateData, {
            new: TRUE, //return the updated document
            runValidators: true //Run Mongoose validation
        })

        if(!response){
            return res.status(404).json({error:'candidate data not found'});
        }

        console.log('candidate data updated');
        res.status(200).json(response);
}catch(err){
        console.error(err);
        res.status(500).json({error:'Internal server error'});
    }
})

router.delete('/:candidateID',jwtAuthmiddleware, async(req,res) => {
    try{
         if(!checkAdminRole(req.user.id))
            return res.status(403).json({message:'user does not have admin role'});

        const candidateID = req.params.candidateID;//Extract the id from the url parameter
       
        const response = await User.findByIdAndDelete(candidateID);

        if(!response){
            return res.status(404).json({error:'candidate data not found'});
        }

        console.log('candidate deleted');
        res.status(200).json(response);
}catch(err){
        console.error(err);
        res.status(500).json({error:'Internal server error'});
    }
})

// let's start voting
router.post('/vote/:candidateID', jwtAuthmiddleware,async(req,res)=>{
    //no admin can vote
    //user can only vote

    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try{

        //find the candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message:'Candidate not found'});
        }

        const user = await User.findById(userID);
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        if(user.isVoted){
            return res.status(400).json({message:'You have already voted'});
        }
        if(user.role = admin){
            return res.status(403).json({message:'Admin is not allowed'});
        }

        //update the candidate document to record the vote
        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        //update the user document 
        user.isVoted = true;
        await user.save();

        res.status(200).json({message:'Vote recorded successfully'});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
});

//vote count
router.get('/vote/count',async(req,res)=>{
    try{
        //find all candidates and sort by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        //Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return{
                party: data.party,
                count:data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
});

//Get list of all candidates with only name & party name
router.get('/', async(req,res)=>{
    try{
         // Find all candidates and select only the name and party fields, excluding _id
        const candidate = await Candidate.find({},'name party -_id');
         
        // Return the list of candidates
        res.status(200).json(candidate);
    }catch(err){
        console.error(err);
        res.status(400).json({error: 'Internal server error'});
    }
});


module.exports = router;