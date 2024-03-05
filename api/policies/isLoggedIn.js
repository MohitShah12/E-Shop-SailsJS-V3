const {jwt} = sails.config.constants.Dependencies
const ResCodes = sails.config.constants.ResCodes
const {messages} = sails.config.constants.Dependencies
//Authenticating the user
module.exports= async (req,res,proceed)=>{
    console.log('inside loggedin policy')
    //console.log("token",req.headers.authorization.split(" ")[1])
    // console.log("token",req.headers.token)
    const token = req.headers.authorization
    console.log(token)
    if(token){
        const myToken = req.headers.authorization.split(" ")[1]
        //decoding jwt token
        //console.log('token bro',res.get('token')) 
        console.log('Getting token:',myToken )

        //finding user from given token in database
        const decodedToken = await jwt.verify(myToken,process.env.SESSION_SECRET)
        req.user = decodedToken
        console.log(req.user)
        const user = await User.findOne({email:req.user.email })
        console.log('finding user of given token from database:',user)

        //if user of given token does not exist
         if(!user){
            console.log('can not enter')
            return res.status(ResCodes.unAuth).send(messages.notAllowed)
         }
         console.log('wbhb',token)
        console.log(decodedToken,user.email)
        if(decodedToken){
            if(decodedToken.email!==user.email){
                console.log('Not allowed')
                return res.status(401).send('Unauthorized')
            }
        }
    }
    proceed();
}