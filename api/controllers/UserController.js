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
        // console.log(req.body)

        //Salt for the hash password
        const salt = 12;

        //convertin password to hash
        const hashPassword = await bcrypt.hash(req.body.password,salt);

        const checkUser = await User.findOne({email:req.body.email});
        if(checkUser){
            req.addFlash('error','User with same email already exist try Loggin in or use different email!')
            return res.redirect('/signup')
        }

        let isSuperUser = false;
        
        if(!validator.isEmail(req.body.email)){
          req.addFlash('error','Enter valid email')
          return res.redirect('/signup')
        }
        if(!validator.isLength(req.body.name,{min:3})){
          req.addFlash('error','Name must be at least 3 characters long')
          return res.redirect('/signup')
        }
        if(!validator.isLength(req.body.password,{min:5})){
          req.addFlash('error','Password must be at least 5 charcaters long')
          return res.redirect('/signup')
        }
        if(!validator.isNumeric(req.body.mobileno)||!validator.isLength(req.body.mobileno,{min:10,max:10})){
          req.addFlash('error','Phone no. must be in Numbers and must be 10 characters long')
          return res.redirect('/signup')
        }
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
            superUser:isSuperUser?true:false
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
        if(user){
            // console.log(req.body.password,user.password)
            const validPassword = await bcrypt.compare(req.body.password,user.password)
            if(validPassword){

                //Adding user to the session
                req.session.user = user

                //setting loggedin to true
                req.session.isLoggedIn = true

                //if user is admin or not
                req.session.isAdmin = req.session.user.superUser
                console.log(req.session.isAdmin)
                // console.log(req.session)
                console.log(req.session.isLoggedIn)
                //saving the session
                // req.session.save((err)=>{
                //     console.log(err)
                // })
                // console.log("Session is created")
                return res.redirect('/')
            }
            req.addFlash('error','Wrong credentials email and password does not match')
            return res.redirect('/login')
        }
        req.addFlash('error','User with given email does not exist try signing up')
        return res.redirect('/login')
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
  },

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

  getLogin : async(req,res)=>{
    try {
      return res.view('auth/login')
    } catch (error) {
      console.log(error)
    }
  },

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

