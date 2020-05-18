const {check, validationResult} = require('express-validator');

const express = require('express');
const {USER_PERMISSIONS} = require("../wrappers/User");
const {signKey} = require("../jwt");
const {BaseUser} = require("../wrappers/User");
const router = express.Router();

router.get('/', function (req, res, next) {
    res.json({message: 'OK'});
});

router.post(
    '/register',
    [
        check('email')
            .exists().withMessage('Email is required')
            .isEmail().withMessage('Invalid email'),
        check('password')
            .exists().withMessage('Password is required')
            .isLength({min: 6}).withMessage('Password must be at least 6 characters long')
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        const body = req.body;

        try {
            const user = await BaseUser.findByEmail(body.email);
            if (user) {
                res.status(503).json({msg: 'Email already used'});
            } else {
                const newUser = BaseUser.new(body.email, body.password, []);
                const result = await newUser.save();
                res.json({
                    user: result,
                });
            }
        } catch (err) {
            console.info(err);
            res.status(500).json({err});
        }
    });

router.post('/login',
    [
        check('email')
            .exists().withMessage('Email is required')
            .isEmail().withMessage('Invalid email'),
        check('password')
            .exists().withMessage('Password is required')
            .isLength({min: 6}).withMessage('Password must be at least 6 characters long')
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        const body = req.body;
        const user = await BaseUser.findByEmail(body.email);
        const passwordValid = await BaseUser.validatePassword(body.password, user.passwordHash);

        if (passwordValid) {
            const token = signKey(user._id, user.email, user.permissions);
            res.json({
                user: {
                    id: user._id,
                    email: user.email,
                    permissions: user.permissions
                },
                token
            });
        } else {
            res.status(403).json();
        }
    });

module.exports = router;
