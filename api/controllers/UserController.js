/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcrypt = require('bcrypt');
const validator = require('validator')

module.exports = {


  postSignup: async(req,res)=>{
    try {
        const salt = 12;
        const hashPassword = await bcrypt.hash(req.body.password,salt);
        const checkUser = await User.findOne({email:req.body.email});

        //unique email
        if(checkUser){
            req.addFlash('error','User with same email already exist try Loggin in or use different email!')
            return res.redirect('/signup')
        }

        //valid email is needed
        if(!validator.isEmail(req.body.email)){
          req.addFlash('error','Enter valid email')
          return res.redirect('/signup')
        }

        //length of name
        if(!validator.isLength(req.body.name,{min:3})){
          req.addFlash('error','Name must be at least 3 characters long')
          return res.redirect('/signup')
        }

        //length of password
        if(!validator.isLength(req.body.password,{min:5})){
          req.addFlash('error','Password must be at least 5 charcaters long')
          return res.redirect('/signup')
        }

        //phone number validation
        if(!validator.isNumeric(req.body.mobileno)||!validator.isLength(req.body.mobileno,{min:10,max:10})){
          req.addFlash('error','Phone no. must be in Numbers and must be 10 characters long')
          return res.redirect('/signup')
        }

        //address is required
        if(!req.body.address){
          req.addFlash('error','Address is required')
          return res.redirect('/signup')
        }

        //creating new user
        const user = await User.create({
            name : req.body.name,
            email : req.body.email,
            password : hashPassword,
            address: req.body.address,
            mobileno:req.body.mobileno,
            superUser:false
        }).fetch()
        return res.redirect('/login')
    } catch (error) {
        console.log(error)
        return res.badRequest("there was some error with the server")
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
                //Adding user to the session
                req.session.user = user

                //setting loggedin to true
                req.session.isLoggedIn = true

                //if user is admin or not
                req.session.isAdmin = req.session.user.superUser

                return res.redirect('/')
            }

            //if password and email does not match
            req.addFlash('error','Wrong credentials email and password does not match')
            return res.redirect('/login')
        }

        //if user does not exist in database
        req.addFlash('error','User with given email does not exist try signing up')
        return res.redirect('/login')
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
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
        console.log(error)
    }
  },

  //login page
  getLogin : async(req,res)=>{
    try {
      return res.view('auth/login')
    } catch (error) {
      console.log(error)
    }
  },


  //logout
  postLogout : async(req,res)=>{
    try {
       req.session.destroy(err=>{
        console.log(err)
        // console.log(req.session.destroy)
        res.redirect('/')
       })
    } catch (error) {
      console.log(error)
    }
  } 

};

