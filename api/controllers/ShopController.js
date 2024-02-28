/**
 * ShopController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //Home page
    getHome: async(req,res)=>{
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

        let limit = 5;
        const count = await Shop.count()
        const shop = await Shop.find(query).meta({makeLikeModifierCaseInsensitive:true}).limit(limit).skip((page - 1)*limit)
        res.view('shop/home',{
            shopProducts : shop,
            isAuthenticated:req.session.isLoggedIn,
            isUser:req.session.user,
            path:'/',
            currentpage:page,
            totalpage:Math.ceil(count/limit),
            isAdmin:req.session.isAdmin
        })
    },

    //Products page
    getProducts:async(req,res)=>{

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
        let limit = 5;
        const count = await Shop.count()
        const products = await Shop.find(query).meta({makeLikeModifierCaseInsensitive:true}).limit(limit).skip((page - 1)*limit)
        res.view('shop/products',{
            shopProducts : products,
            isAuthenticated:req.session.isLoggedIn,
            isUser:req.session.user,
            path:'/',
            currentpage:page,
            totalpage:Math.ceil(count/limit),
            isAdmin:req.session.isAdmin
        })
    },

    //Deatils of a single Product
    getProduct:async(req,res)=>{
        const productid = req.params.id 
        const product = await Shop.findOne({id:productid})
        // console.log(product)
        // res.send(product)
        res.view('shop/product-details',{
            product:product,
            path:'/product/:id',
            isAuthenticated:req.session.isLoggedIn,
            isAdmin:req.session.isAdmin

        })
    },

    
    //Add to cart or update the quantity
    postAddCart: async(req,res)=>{
        const userId = req.session.user.id
        const productId = req.body.productId
        const product = await Shop.findOne({id:productId})
        
        const findproductincart = await CartItem.findOne({user:userId,shop:productId})
        //if product is in cart
        if(findproductincart){
            const newQuant = findproductincart.quantity + 1;
            await CartItem.update({shop:productId},{quantity:newQuant})
            
        } 
        //add to cart
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
    },

    //cart
    getCart:async(req,res)=>{
        try {
            const userId= req.session.user.id
            const userCart = await CartItem.find({user:userId}).populate('shop')
            res.view('shop/cart',{
                product:userCart,
                path:'/cart',
                isAuthenticated:req.session.isLoggedIn,
                isAdmin:req.session.isAdmin
            })
        } catch (error) {
            console.log(error)
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
            console.log(error)
        }
    },

    //checkout page
    getCheckout:async(req,res)=>{
        const products = await CartItem.find({user:req.session.user.id}).populate('shop')
        let sum = 0
        let totalSum = 0;
        for(prods of products){
            sum = prods.quantity * prods.shop.price
            totalSum += sum;
        }
        res.view('shop/checkout',{
            total:totalSum,
            product:products
        })
    }

};

