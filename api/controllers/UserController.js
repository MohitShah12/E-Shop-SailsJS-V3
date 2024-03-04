/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// const bcrypt = require('bcrypt');
// const validator = require('validator')
// const jwt = require('jsonwebtoken')
// const dotenv = require('dotenv').config();
const {bcrypt,validator,jwt,dotenv} = sails.config.constants.Dependencies
const Messages = sails.config.constants.Messages
const ResCodes = sails.config.constants.ResCodes


module.exports = {

  postSignup: async(req,res)=>{
    try {
      const checkUser = await User.findOne({email:req.body.email});
      
      //unique email
      if(checkUser){
        return res.status(ResCodes.conflict).send(Messages.alreadyUser)
      }
      
      //valid email is needed
      if(!validator.isEmail(req.body.email)){
        return res.badRequest(Messages.validEmail)
        //return res.redirect('/signup')
      }
      
      //length of name
      if(!validator.isLength(req.body.name,{min:3})){
        return res.badRequest(Messages.nameLength)
        //return res.redirect('/signup')
      }
      
      //length of password
      if(!validator.isLength(req.body.password,{min:5})){
        return res.badRequest(Messages.passwordLength)
        //return res.redirect('/signup')
      }
      
      //phone number validation
      if(!validator.isNumeric(req.body.mobileno)||!validator.isLength(req.body.mobileno,{min:10,max:10})){
        return res.badRequest(Messages.phoneno)
      }
      
      //address is required
      if(!req.body.address){
        return res.badRequest(Messages.address)
      }

      const salt = 12;
      const password = req.body.password
      delete req.body.password;
      const hashPassword = await bcrypt.hash(password,salt);

        //creating new user
        const user = await User.create({
            name : req.body.name,
            email : req.body.email,
            password : hashPassword,
            address: req.body.address,
            mobileno:req.body.mobileno,
            superUser:false
        }).fetch()
        delete user.password;//deleting user password from response
        console.log(req.body)
        console.log(user)
        return res.ok(Messages.signin)
        //return res.redirect('/login')
    } catch (error) {
        return res.serverError(error.message)
    }
  },

  postLogin: async(req,res)=>{
    // console.log(req.body)
    try {
        const user = await User.findOne({email:req.body.email})
        //if user exist in database
        if(user){
            const validPassword = await bcrypt.compare(req.body.password,user.password)
            if(validPassword){
              console.log(process.env.SESSION_SECRET)
              const token = jwt.sign({id:user.id,email:user.email,superUser:user.superUser},process.env.SESSION_SECRET,{expiresIn:'1d'})
              res.set('token', token);
              console.log(user.email)
              await User.update({email:user.email},{token:token})
                //generating token

                //storing token into cookie
                res.cookie('JWTtoken',token, {
                  maxAge:1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
                  // maxAge:5000,
                  httpOnly: true, // preventing client-side JavaScript from accessing the cookie
                })
                //console.log(token)
                // const headers = 'token'
                // res.set(headers)

                // res.set('Authorization','Bearer' + token)
                console.log('token',res.get('token'))
                //res.ok(Messages.login)
                return res.json({'token':token})
                // return res.redirect('/')
            }

            //if password and email does not match
            
            return res.status(ResCodes.unAuth).send(Messages.unauthorized)
            //return res.redirect('/login')
        }

        //if user does not exist in database
        return res.status(ResCodes.notFound).send(Messages.noemail)
       
    } catch (error) {
          console.log(error)
          return res.serverError(error.message)
    }
  },

  //signup page
  getSingup : async(req,res)=>{
    try {
        return res.view('auth/signup',{
          path:'/signup',
          isAuthenticated:false,
        })
    } catch (error) {
      return res.serverError(error.message)
    }
  },

  //login page
  getLogin : async(req,res)=>{
    try {
      return res.view('auth/login')
    } catch (error) {
      return res.serverError(error.message)
    }
  },

  //POST getuser
  getUser : async(req,res)=>{
    const token = req.header('token')
    const user = jwt.verify(token,process.env.SESSION_SECRET)
    req.user = user
    return res.send(user)
  },

  //logout
  postLogout : async(req,res)=>{
    try {
      //Clearing token and redirecting 
      //res.clearCookie('JWTtoken');
      console.log(req.cookies.token)
      await User.update({token:req.cookies.token},{token:''})
      return res.ok(Messages.logout)
    } catch (error) {
      return res.serverError(error.message)
    }
  } 
};

