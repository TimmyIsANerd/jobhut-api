/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = 'test_key'

module.exports = {
    // Register
    register_get:(req,res)=>{
        return res.view('register');
    },
    register_post: async (req,res)=>{
        // Collect Body
        const {email,password:plainTextPassword} = req.body;
        // Hash Password
        const password = await bcrypt.hash(plainTextPassword, 10);
        try {
            const newUser = Auth.create({email,password})
            // Create JWT Token
            const maxAge = 3 * 24 * 60 * 60;
            const createToken = (id) =>{
                return jwt.sign(
                    { id },
                    JWT_SECRET,
                    {expiresIn:maxAge}
                );
            }
            const token = await createToken(newUser.id)
            console.log(`Created Token : ${token}`);
            res.cookie('jwt', token, {httpOnly:true, maxAge : maxAge * 1000})
        } catch (error) {
            if(error){
                res.json({
                    status:'error',
                    error:'Failed to Create New User'
                })
            }
        }
        res.redirect('/dashboard')
    },
    // Login
    login_get:(req,res)=>{
        return res.view('login');
    },
    login_post: async (req,res)=>{
        // Collect Body
        const {email,password} = req.body;
        const user = await Auth.findOne({email});

        // Check if Email was found in database
        if(!user){
            return res.json(
                {
                    status:error,
                    error:'Invalid Email/Password'
                }
            )
        }

        // Login Condition
        if(await bcrypt.compare(password, user.password)){
            // Compare password with database entry
            try{
                // Create Token
                const maxAge = 3 * 24 * 60 * 60;
                const createToken = (id) =>{
                    return jwt.sign(
                        { id },
                        JWT_SECRET,
                        {expiresIn:maxAge}
                    );
                }
                // Create Cookie
                const token = await createToken(user.id);
                res.cookie('jwt', token, {httpOnly:true, maxAge : maxAge * 1000})
                return res.status(200).json({
                    status:'ok',
                    user:user.id
                })
            }catch(error){
                if(error){
                    return res.status(500).json({
                        status:error,
                        error:'Invalid Email/Password'
                    })
                }
            }
        } else {
            return res.json({ status: 'error', error: 'Invalid Email/Password'});
        }
    },
    // Login/Sign Up Success
    dashboard_get:(req,res)=>{
        return res.view('dashboard')
    }
};

