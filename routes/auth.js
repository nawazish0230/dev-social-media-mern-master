const router = require('express').Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const jwtSecret = require('../config/keys').jwtSecret;

const User = require('../model/User');

// @route    GET api/auth
// @desc     Test route
// @access   Public
router.get('/' ,auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.error(err.message);
    }
})



// @route    POST api/login
// @desc     authenticate user and get token
// @access   Public
router.post('/', [
    check('email', 'valid email is required').isEmail(),
    check('password', 'invalid password').exists(),
],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({errors: errors.array() });
    }
    const {email, password} = req.body;

    try{
        // see if user exists
        let user  = await User.findOne({email});
        if(!user){
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
        }


        // decrypt password
        let isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            jwtSecret,
            {expiresIn: 360000},
            (err, token) => {
                if(err) throw err;
                res.json({token});
            }
        )

    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
})

module.exports = router;