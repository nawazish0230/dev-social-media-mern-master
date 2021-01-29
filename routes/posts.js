const router = require('express').Router();
const {validationResult, check} = require('express-validator');
const auth = require('../middleware/auth');

const Post = require('../model/Post');
const User = require('../model/User');
const Profile = require('../model/Profile');


// @route    POST api/posts
// @desc     create a post
// @access   Private
router.post('/', [auth, [
    check('text', 'Text must be filled out').not().isEmpty()
]], 
async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            user: req.user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar
        });
        const post = await newPost.save();
        res.json(post);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Internal error');
    }

});


// @route    GET api/posts
// @desc     get all posts
// @access   Private
router.get('/', auth,async (req, res) => {
    try {
        let posts = await Post.find().sort({date: -1});
        return res.json(posts);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Internal error');
    }
})

// @route    GET api/posts/:id
// @desc     get single post by id
// @access   Private
router.get('/:id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg: 'Post not found'});
        }
        return res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post not found'});
        }
        return res.status(500).send('Internal error');
    }
})

// @route    GET api/posts/:id
// @desc     delete a post
// @access   Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        
        // check post
        if(!post){
            return res.status(404).json({msg: 'Post not found'});
        }
        // check user
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg: 'User not authorized'});
        }
        await post.remove();
        return res.json({msg: 'Post removed'});
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post not found'});
        }
        return res.status(500).send('Internal error');
    }
})

// @route    PUT api/posts/like/:id
// @desc     like a post
// @access   Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);

        // check if the post already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg: 'Post already liked'});
        }
        post.likes.unshift({user: req.user.id});
        await post.save();
        res.json(post.likes);
        
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Internal error');
    }
})

// @route    PUT api/posts/unlike/:id
// @desc     unlike a post
// @access   Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);

        // check if the post already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({msg: 'Post has not yet been liked'});
        }
        // get remove index
        const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post.likes);
        
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Internal error');
    }
})


// @route    POST api/posts/comment/:id
// @desc     comment on post
// @access   Private
router.post('/comment/:id', [auth, [
    check('text', 'Text must be filled out').not().isEmpty()
]], 
async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id)

        const newComment = {
            text: req.body.text,
            user: req.user.id,
            name: user.name,
            avatar: user.avatar
        };
        post.comments.unshift(newComment);
        await post.save();
        return res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Internal error');
    }

});


// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     delete comment
// @access   Private
router.delete('/comment/:id/:comment_id', auth, async(req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        // pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        // Make sure comment exists
        if(!comment){
            return res.status(404).json({msg: 'Comment does not exists'});
        }

        // check user 
        if(comment.user.toString() !== req.user.id){
            return res.status(404).json({msg: 'user not authorized'});
        }

        // get comment index
        const commentIndex = post.comments
            .map(comment => comment.user.toString())
            .indexOf(req.user.id);

        post.comments.splice(commentIndex, 1);
        await post.save();
        res.json(post.comments);

    }catch (err) {
        console.error(err.message);
        return res.status(500).send('Internal error');
    }
})

module.exports = router;