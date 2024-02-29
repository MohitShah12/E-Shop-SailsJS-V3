/**
 * ShopController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const jwt = require('jsonwebtoken')

module.exports = {
    //Home page
    getHome: async(req,res)=>{
        try {
            
            //default page
            let page = 1;
            //gettting page from query
            if(req.query.page){
                //setting page as req.query.page
                page=req.query.page
            }
            //searching query
            let query = {}
            if(req.query.search){
                const search = req.query.search
                //searching using title or category
                query = {or:[
                    {title:{contains:search}},
                    {category:{contains:search}}
                ]}
            }
    
            let isLoggedIn = false
            let isAdmin = false
            let decodedToken
            //checking for JWTtoken avability in cookie
            if(req.cookies.JWTtoken){
                //decoding jwt token
                decodedToken = await jwt.verify(req.cookies.JWTtoken,process.env.SESSION_SECRET)
            if(decodedToken){
                //authenticating user
                isLoggedIn = true
                //checking for superUser(Admin)
                isAdmin = decodedToken.superUser
            }
         }
    
            //limit of products per page
            let limit = 5;
            //total products in database
            const count = await Shop.count()
            const shop = await Shop.find(query).meta({makeLikeModifierCaseInsensitive:true}).limit(limit).skip((page - 1)*limit)
            res.view('shop/home',{
                shopProducts : shop,
                isAuthenticated:isLoggedIn,
                isUser:decodedToken,
                path:'/',
                currentpage:page,
                totalpage:Math.ceil(count/limit),
                isAdmin:isAdmin
            })
        } catch (error) {
             return res.badRequest("there was some error with the server")
        }
    },

    //Products page
    getProducts:async(req,res)=>{
        try {
            
            let page = 1;
            if(req.query.page){
                page=req.query.page
            }
            let query = {}
            if(req.query.search){
                const search = req.query.search
                query = {or:[
                    {title:{contains:search}},
                    {category:{contains:search}}
                ]}
            }
            let isLoggedIn = false
            let isAdmin = false
            let decodedToken
            if(req.cookies.JWTtoken){
            decodedToken = await jwt.verify(req.cookies.JWTtoken,process.env.SESSION_SECRET)
            if(decodedToken){
                    isLoggedIn = true
                    isAdmin = decodedToken.superUser
                }
            }
            let limit = 5;
            const count = await Shop.count()
            const products = await Shop.find(query).meta({makeLikeModifierCaseInsensitive:true}).limit(limit).skip((page - 1)*limit)
            res.view('shop/products',{
                shopProducts : products,
                isAuthenticated:isLoggedIn,
                path:'/',
                currentpage:page,
                totalpage:Math.ceil(count/limit),
                isAdmin:isAdmin
            })
        } catch (error) {
            return res.badRequest("there was some error with the server")
        }

    },

    //Deatils of a single Product
    getProduct:async(req,res)=>{
        try {
            //geting product id from params
            const productid = req.params.id 
            const product = await Shop.findOne({id:productid})
            // console.log(product)
            // res.send(product)
            let isLoggedIn = false
            let isAdmin = false
            if(req.cookies.JWTtoken){
                decodedToken = await jwt.verify(req.cookies.JWTtoken,process.env.SESSION_SECRET)
                if(decodedToken){
                        isLoggedIn = true
                        isAdmin = decodedToken.superUser
                    }
                }
            res.view('shop/product-details',{
                product:product,
                path:'/product/:id',
                isAuthenticated:isLoggedIn,
                isAdmin:isAdmin
            })
        } catch (error) {
            return res.status(500).send('Internal Sever error')
        }
    },

    
    //Add to cart or update the quantity
    postAddCart: async(req,res)=>{
        try {
    
            if(!req.cookies.JWTtoken){
                return res.redirect('/login')
            }
            const decodedToken = await jwt.verify(req.cookies.JWTtoken,process.env.SESSION_SECRET)
            //getting user id
            const userId = decodedToken.id
            //getting product id
            const productId = req.body.productId
            const product = await Shop.findOne({id:productId})
            
            //finding product in cart 
            const findproductincart = await CartItem.findOne({user:userId,shop:productId})
            //if product is in cart
            if(findproductincart){
                //increment the quantity
                const newQuant = findproductincart.quantity + 1;
                await CartItem.update({shop:productId},{quantity:newQuant})
            } 
            //add to cart(if product is not available in cart)
            else{
                const cartItem = await CartItem.create({
                    user:userId,
                    shop:productId,
                    quantity:1
                }).fetch()
                const userCart=await User.addToCollection(userId,'cart').members([cartItem.id])
            }
            const user = await User.findOne(userId).populate('cart');
            res.redirect('/cart')
        } catch (error) {
             return res.badRequest("there was some error with the server")
        }
    },

    //cart page
    getCart:async(req,res)=>{
        try {
            const decodedToken = await jwt.verify(req.cookies.JWTtoken,process.env.SESSION_SECRET)
            const userId= decodedToken.id
            if(decodedToken){
                isLoggedIn = true
                isAdmin = decodedToken.superUser
            }
            const userCart = await CartItem.find({user:userId}).populate('shop')
            res.view('shop/cart',{
                product:userCart,
                path:'/cart',
                isAuthenticated:isLoggedIn,
                isAdmin:isAdmin
            })
        } catch (error) {
             return res.badRequest("there was some error with the server")
        }
    },

    //delete from cart
    postDeletecart:async(req,res)=>{
        try {
            const product = await CartItem.findOne({id:req.body.productId})
            if(!product){
                return res.status(400).send('Product not found!')
            }
            await CartItem.destroy({id:req.body.productId})
            res.redirect('/cart')
        } catch (error) {
             return res.badRequest("there was some error with the server")
        }
    },

    //checkout page
    getCheckout:async(req,res)=>{
        try {
            const decodedToken = await jwt.verify(req.cookies.JWTtoken,process.env.SESSION_SECRET)
            const userId= decodedToken.id
            const products = await CartItem.find({user:userId}).populate('shop')
            let sum = 0
            let totalSum = 0;
            for(prods of products){
                sum = prods.quantity * prods.shop.price
                totalSum += sum;
            }
            //deleting items from the cart after buying it
            await CartItem.destroy({user:userId})
            res.view('shop/checkout',{
                total:totalSum,
                product:products
            })
        } catch (error) {
            return res.badRequest("there was some error with the server") 
        }
    }

};

