module.exports = (req,res,proceed) =>{
    console.log('This is a admin checker')
    if(req.session.user.superUser!==true){
        return res.send('You are not the admin')
    }
    return proceed();
}