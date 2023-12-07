const Post = require("../models/Post");
const User = require("../models/user");

const router = require("express").Router()

//create a post 

router.post('/', async (req, res) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost)
    } catch (err) {
        res.status(500).json(err)
    }
})
//update a post 
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("Post has been updated")
        } else {
            res.status(403).json("you can update only your account")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})


//delete a post 

router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await post.deleteOne()
            res.status(200).json("Post has been deleted")
        } else {
            res.status(403).json("you can delete only your post")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})
//like a post / dislike a post

router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } })
            res.status(200).json("post Liked")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } })
            res.status(200).json("post disliked")
        }
    } catch (err) {
        res.status(403).json(err)
    }
})
//get a post 

router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post)
    } catch (err) {
        res.status(500).json(err)
    }
})
//get timeline posts
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const freindsPosts = await Promise.all(
            currentUser.followings.map((freindId) => {
                return Post.find({ userId: freindId });
            })
        )
        res.status(200).json(userPosts.concat(...freindsPosts))
    } catch (error) {
        res.status(500).json(error)
    }
})

//get user's posts
router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        const posts = await Post.find({ userId: user._id })
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json(error)
    }
})



module.exports = router