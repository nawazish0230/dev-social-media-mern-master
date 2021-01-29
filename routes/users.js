const router = require('express').Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const jwtSecret = require('../config/keys').jwtSecret;

const User = require('../model/User');

// @route    POST api/users
// @desc     register route
// @access   Public
router.post('/', [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'valid email is required').isEmail(),
    check('password', 'password length must be 5 character').not().isEmpty().isLength({min: 5}),
],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({errors: errors.array() });
    }
    const {name, email, password} = req.body;

    try{
        // see if user exists
        let user  = await User.findOne({email});
        if(user){
            return res.status(400).json({errors: [{msg: 'user already exists'}]});
        }

        // get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })
        user  = new User({name, email, avatar, password});

        // encrypt password
        let salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

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