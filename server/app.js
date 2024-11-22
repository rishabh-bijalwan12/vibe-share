const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User-model.js');
const Post = require('./models/Post-model.js')
const path = require('path');
const requireLogin = require('./middelwares/requireLogin.js');
const app = express();
const port = process.env.port || 5000;

app.use(express.json());
app.use(cors());
require('dotenv').config();


const _dirname = path.resolve();
const jwtSecret =  process.env.jwtSecret

// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 8);

        // Create a new user instance
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save(); // Save to the database

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists
        const userExisted = await User.findOne({ email });
        if (!userExisted) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, userExisted.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ _id: userExisted.id }, jwtSecret);
        return res.status(200).json({ token, user: userExisted });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// create post
app.post('/createpost', requireLogin, async (req, res) => {
    const { body, imageURL } = req.body;

    if (!imageURL || !body) {
        return res.status(422).json({ error: "All fields are required" });
    }
    try {
        const newPost = new Post({
            body,
            image: imageURL,
            postedBy: req.user._id,
        });

        const result = await newPost.save();
        return res.status(201).json({ result });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

//fetch post for home page
app.get('/allpost', requireLogin, async (req, res) => {
    const allPosts = await Post.find().populate("postedBy", "_id name")
        .populate('comments.postedBy', 'name')
    if (!allPosts) {
        return res.json("Error Fetching posts");
    }
    return res.json(allPosts)
})

//fetch user posts in profile page
app.get('/mypost', requireLogin, async (req, res) => {
    try {
        const response = await Post.find({ postedBy: req.user._id }).populate("postedBy", "_id name")
        res.json(response);
    } catch (error) {
    
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// For Adding Likes to the Post
app.put('/like', requireLogin, async (req, res) => {
    try {
        // Check if the user has already liked the post
        const post = await Post.findById(req.body.postId);

        if (!post.likes.includes(req.user._id)) {
            // If not, push the user ID to the likes array
            const updatedPost = await Post.findByIdAndUpdate(
                req.body.postId,
                { $push: { likes: req.user._id } },
                { new: true }
            )
                .populate('postedBy', 'name')  // Populate the user who posted the post
                .populate('likes', 'name');   // Populate the users who liked the post

            return res.status(200).json(updatedPost);
        } else {
            return res.status(400).json({ message: "You have already liked this post." });
        }
    } catch (error) {

        return res.status(500).json({ message: "Something went wrong while liking the post." });
    }
});

// For Removing Likes from the Post
app.put('/unlike', requireLogin, async (req, res) => {
    try {
        // Check if the user has liked the post
        const post = await Post.findById(req.body.postId);

        if (post.likes.includes(req.user._id)) {
            // If yes, pull the user ID from the likes array
            const updatedPost = await Post.findByIdAndUpdate(
                req.body.postId,
                { $pull: { likes: req.user._id } },
                { new: true }
            )
                .populate('postedBy', 'name')  // Populate the user who posted the post
                .populate('likes', 'name');   // Populate the users who liked the post

            return res.status(200).json(updatedPost);
        } else {
            return res.status(400).json({ message: "You have not liked this post yet." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong while unliking the post." });
    }
});

// For Adding Comments to Posts
app.put('/comment', requireLogin, async (req, res) => {
    try {
        const { postId, comment } = req.body;

        // Check for required fields
        if (!postId || !comment) {
            return res.status(400).json({ message: "Post ID and comment are required." });
        }

        // Update the post with the new comment
        const response = await Post.findByIdAndUpdate(
            postId,
            {
                $push: {
                    comments: {
                        text: comment,
                        postedBy: req.user._id
                    }
                }
            },
            { new: true }
        )
            .populate('comments.postedBy', 'name')  // Populate the commenter's name
            .populate('postedBy', 'name');  // Populate the post author's name

        if (!response) {
            return res.status(404).json({ message: "Post not found." });
        }

        return res.status(200).json(response);
    } catch (error) {

        return res.status(500).json({ message: "Something went wrong while adding the comment." });
    }
});

//for deleting the posts
app.delete('/deletepost/:postId', requireLogin, async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this post" });
        }
        await post.deleteOne();
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        
        res.status(500).json({ error: "Server error" });
    }
});

//for fetching user posts for user profile
app.get('/userprofile/:Id', requireLogin, async (req, res) => {
    const { Id } = req.params;
    try {
        const data = await User.findById(Id);
        if (!data) {
            return res.status(404).json({ error: "User not found" });
        }
        const posts = await Post.find({ postedBy: data._id });
        return res.json({ data, posts });

    } catch (error) {
    
        return res.status(500).json({ error: "Server error" });
    }
});

// To follow a user
app.put('/follow', requireLogin, (req, res) => {
    const { followId } = req.body;
    const userId = req.user._id; // Current user's ID

    // Check if already following
    User.findById(userId)
        .then(user => {
            if (user.following.includes(followId)) {
                return res.status(400).json({ error: "You are already following this user." });
            }

            // If not already following, update both user and followed user
            User.findByIdAndUpdate(followId, 
                { $push: { followers: userId } }, 
                { new: true }
            )
            .then(updatedUser => {
                User.findByIdAndUpdate(
                    userId, 
                    { $push: { following: followId } },
                    { new: true }
                )
                .then(updatedUserFollowing => {
                    res.json({ updatedUser, updatedUserFollowing });
                })
                .catch(err => {
                    res.status(500).json({ error: "Error updating the following list", details: err });
                });
            })
            .catch(err => {
                res.status(500).json({ error: "Error following the user", details: err });
            });
        })
        .catch(err => {
            res.status(500).json({ error: "Error fetching the user", details: err });
        });
});

//to unfollow a user
app.put('/unfollow', requireLogin, (req, res) => {
     const { followId } = req.body;
    const userId = req.user._id;

    // Check if the user is actually following
    User.findById(userId)
        .then(user => {
            if (!user.following.includes(followId)) {
                return res.status(400).json({ error: "You are not following this user." });
            }

            // If following, proceed with unfollowing
            User.findByIdAndUpdate(followId,
                { $pull: { followers: userId } },
                { new: true }
            )
                .then(updatedUser => {
                    User.findByIdAndUpdate(
                        userId,
                        { $pull: { following: followId } },
                        { new: true }
                    )
                        .then(updatedUserFollowing => {
                            res.json({ updatedUser, updatedUserFollowing });
                        })
                        .catch(err => {
                            res.status(500).json({ error: "Error updating the following list", details: err });
                        });
                })
                .catch(err => {
                    res.status(500).json({ error: "Error unfollowing the user", details: err });
                });
        })
        .catch(err => {
            res.status(500).json({ error: "Error fetching the user", details: err });
        });
});

// to fetch Login user details
app.get('/userdetails', requireLogin, (req, res) => {
    User.findById(req.user._id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(user);
        })
        .catch((err) => {
            res.status(500).json({ error: "Error fetching user details", details: err });
        });
});

//to get user details of any user by id
app.get('/userdetails/:userId', requireLogin, (req, res) => {
    User.findById(req.params.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(user);
        })
        .catch((err) => {
            res.status(500).json({ error: "Error fetching user details", details: err });
        });
});

//frontend through backend
app.use(express.static(path.join(_dirname, "/client/build")))
app.get('*',(req,res)=>{
    res.sendFile(path.resolve(_dirname,"client","build","index.html"));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
