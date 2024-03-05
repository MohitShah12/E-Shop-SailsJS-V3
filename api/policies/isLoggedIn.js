const {jwt} = sails.config.constants.Dependencies
const ResCodes = sails.config.constants.ResCodes
const {messages} = sails.config.constants.Dependencies
//Authenticating the user
module.exports= async (req,res,proceed)=>{
    console.log('inside loggedin policy')
    if(req.cookies.JWTtoken){
        //decoding jwt token
        console.log('token bro',res.get('token')) 
        const cookieToken = req.cookies.JWTtoken
        console.log('Getting token: ',cookieToken )

        //finding user from given token in database
        const token = await User.findOne({token:cookieToken })
        console.log('finding user of given token from database:',token)

        //if user of given token does not exist
         if(!token){
            console.log('can not enter')
            return res.status(ResCodes.unAuth).send(messages.notAllowed)
         }
         console.log('wbhb',token)
        const decodedToken = await jwt.verify(token.token,process.env.SESSION_SECRET)
        req.user = decodedToken
        console.log(req.user)
        console.log(decodedToken,token.email)
        if(decodedToken){
            if(decodedToken.email!==token.email){
                console.log('Not allowed')
                return res.status(401).send('Unauthorized')
            }
        }
    }
    proceed();
}