const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true 
    },
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    comments:[{
        text:{type:String},
        postedBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    }
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;