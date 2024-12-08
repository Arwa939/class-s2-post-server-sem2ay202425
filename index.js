import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import UserModel from './Models/Users.js';
import PostModel from './Models/Posts.js';
import bcrypt from 'bcrypt';

let app=express();
app.use(cors());
app.use(express.json());

const conStr="mongodb+srv://admin:1234@cluster0.kbo8y4l.mongodb.net/PostITApp-S12425-FS2?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(conStr);

app.post("/insertUser",async(req,res)=>{
    try{
        const user= await UserModel.findOne({email:req.body.email});
        if(user)
        {
            res.send("User Exists..");
        }
        else{
            const hpass=await bcrypt.hash(req.body.password,10);
            const newuser=new UserModel({
                uname:req.body.uname,
                password:hpass,
                email:req.body.email,
                pic:req.body.pic
            });
            await newuser.save();
            res.send("User Added..");
        }
    }
    catch(error)
    {

    }
});
app.post("/login",async(req,res)=>{
    try{
        const {rpass,remail}=req.body;
        const user= await UserModel.findOne({email:req.body.email});
        if(!user)
        {
            return res.status(500).json({message:"User not found.."});
        }
        else{
            const passMatch=await bcrypt.compare(req.body.password,user.password);
            if(passMatch)
                return res.status(200).json({user:user,message:"success"});
            else
                return res.status(401).json({message:"Authorization Failed"});
        }
    }
    catch(error)
    {
        return res.status(500).json({message:error});
    }
});
app.post("/logout",async(req,res)=>{
    try{
       //Session clear
        res.send({message:'Logged out successfully..'});   
    }
    catch(error)
    {
        return res.status(500).json({message:error});
    }
});
app.post("/savePost",async(req,res)=>{
    try{
        const msg=req.body.message;
        const email=req.body.email;
        const lat=req.body.lat;
        const lng=req.body.lng;
        const newpost=new PostModel({
            postMsg:msg,
            email:email,
            lat:lat,
            lng:lng
        });
        await newpost.save();
        res.send({post:newpost,message:'Posted..'});   
    }
    catch(error)
    {
        return res.status(500).json({message:error});
    }
});
app.get("/getPosts",async(req,res)=>{
    try{
        const postsWithUser=await PostModel.aggregate([
            {
                $lookup:{
                    from:"Users",
                    localField:"email",
                    foreignField:"email",
                    as:"user"
                },
            },
            {
                $sort:{createdAt:-1}
            } ,
            {
                "$project":{
                    "user.password":0,
                    "user.email":0,
                }
            }
        ]);
        res.json({posts:postsWithUser});
    }
    catch(error){
        return res.status(500).json({message:error});
    }
});
app.put("/updatePost",async(req,res)=>{
    try{
        const msg=req.body.postMsg;
        const id=req.body.postID;
        const post= await PostModel.findOne({_id:id});
        post.postMsg=msg;
        await post.save();
        res.send({post:post,message:'Post Updated..'});   
    }
    catch(error)
    {
        return res.status(500).json({message:error});
    }
});
app.delete("/deletePost/:postID",async(req,res)=>{
    try{
        const id=req.params.postID;
        const delpost= await PostModel.findOneAndDelete({_id:id});
        if(delpost)
            res.send({message:'Post Deleted..'});
        else
            res.send({message:'Post Not Deleted..'});   
    }
    catch(error)
    {
        return res.status(500).json({message:error});
    }
});
app.listen(8080,()=>{
    console.log("Server Connected..");
})