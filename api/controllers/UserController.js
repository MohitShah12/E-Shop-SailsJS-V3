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
const ResCodes = sails.config.constants.ResCodes
const {messages} = sails.config.constants.Dependencies


module.exports = {

  postSignup: async(req,res)=>{
    try {
      const{email,name,password,mobileno,address} = req.body
      if(!email || !name || !password || !mobileno || !address){
        return res.badRequest({error:messages.required})
      }
      const checkUser = await User.findOne({email:email});
      
      //unique email
      if(checkUser){
        return res.status(ResCodes.conflict).send({error:messages.alreadyUser})
      }
      
      //valid email is needed
      if(!validator.isEmail(email)){
        return res.badRequest({error:messages.validEmail})
        //return res.redirect('/signup')
      }
      
      //length of name
      if(!validator.isLength(name,{min:3})){
        return res.badRequest({error:messages.nameLength})
        //return res.redirect('/signup')
      }
      
      //length of password
      if(!validator.isLength(password,{min:5})){
        return res.badRequest({error:messages.passwordLength})
        //return res.redirect('/signup')
      }
      
      //phone number validation
      if(!validator.isNumeric(mobileno)||!validator.isLength(req.body.mobileno,{min:10,max:10})){
        return res.badRequest({error:messages.phoneno})
      }
  
      const salt = 12;
      //const password = req.body.password
      delete req.body.password;
      const hashPassword = await bcrypt.hash(password,salt);

        //creating new user
        const user = await User.create({
            name : name,
            email : email,
            password : hashPassword,
            address: address,
            mobileno:mobileno,
            superUser:false
        }).fetch()
        delete user.password;//deleting user password from response
        console.log(req.body)
        console.log(user)
        return res.status(ResCodes.ok).json({
          success:messages.signin,
          user:user
        })
        //return res.redirect('/login')
    } catch (error) {
        return res.serverError(error.message)
    }
  },

  postLogin: async(req,res)=>{
    // console.log(req.body)
    try {
        const {email,password} = req.body
        if(!email||!password){
          return res.send({error:messages.required})
        } 
        const user = await User.findOne({email:email})
        //if user exist in database
        if(user){
            const validPassword = await bcrypt.compare(password,user.password)
            if(validPassword){
              console.log('env with or without congig',process.env.SESSION_SECRET)
              //generating token
              const token = jwt.sign({id:user.id,email:user.email,superUser:user.superUser},process.env.SESSION_SECRET,{expiresIn:'1d'})
              console.log(user.email)
              console.log(token)
              await User.update({email:user.email},{token:token})

                //storing token into header
                res.set('token',token)
                // res.cookie('JWTtoken',res.get('token'), {
                //   maxAge:1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
                //   httpOnly: true, // preventing client-side JavaScript from accessing the cookie
                // })
                //console.log(token)
                // const headers = 'token'
                // res.set(headers)              
                // res.set('Authorization','Bearer' + token)
                //console.log('tokenn',res.get('token'))
                delete user.password
                return res.status(ResCodes.ok).json({
                  success:messages.success,
                  user:user

                })
                // return res.json({'token':token})
                // return res.redirect('/')
            }
            //if password and email does not match
            
            return res.status(ResCodes.unAuth).send({Unauthorized:messages.unauthorized})
            //return res.redirect('/login')
        }

        //if user does not exist in database
        return res.status(ResCodes.notFound).send({NoEmail:messages.noemail})
       
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

  //logout
  postLogout : async(req,res)=>{
    try {
      //Clearing token and redirecting 
      //res.clearCookie('JWTtoken');
      if(req.user){
        console.log('jnsknx',req.cookies.JWTtoken)
        const cookieToken = req.headers.authorization.split(" ")[1]
        if(cookieToken){
          await User.update({email:req.user.email},{token:''})
          //res.clearCookie('JWTtoken');
          return res.status(ResCodes.ok).json({
            success:messages.logout,
          })
        }
      }
      return res.badRequest({error:messages.logoutError})
    } catch (error) {
      return res.serverError(error.message)
    }
  } 
};

