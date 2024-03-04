const Dependencies = {
    jwt : require('jsonwebtoken'),
    bcrypt : require('bcrypt'),
    validator : require('validator'),
    dotenv : require('dotenv').config()
}

const Messages = {
    error:'There was an Internal Error',
    //User Auth
    signin:'You have signed in succesfully',
    login:'you have successfully logged in',
    unauthorized:'Wrong credentials email and password does not match',
    noemail:'User with given email does not exist try signing up',
    address:'Address is required',
    phoneno:'Phone no. must be in Numbers and must be 10 characters long',
    validEmail:'Provided email is not valid',
    alreadyUser:'User with same email already exist try Loggin in or use different email!',
    nameLength:'Name must be at least 3 characters long',
    passwordLength:'Password must be at least 5 characters long',
    logout:'You have successfully logged out',
    notAllowed:"You can not perform this action without login",
    //Product edit
    addProduct:'Product was added successfully',
    editProduct:'Product was edited successfully',
    deleteProduct:'Product was deleted successfully',
    noProduct:'Product is Not found',
    descLength:'Description must be at least 10 characters long',
    imgUrl:'Please provide a valid url of image',
    //cart
    deletecart:"Product was deleted from cart",
    addcart:"Product was added into cart successfully",
    

}

const ResCodes = {
    unAuth : 401,
    notFound : 404,
    conflict:409
}

module.exports.constants={
    Dependencies,
    Messages,
    ResCodes
}