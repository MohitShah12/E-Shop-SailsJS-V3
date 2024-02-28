/**
 * ShopController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    getHome: async(req,res)=>{
        let page = 1;
        if(req.query.page){
            page=req.query.page
            console.log(req.query.page)
            console.log('page',page)
        }
        //console.log('query: ',req.query.page)
        let query = {}
        if(req.query.search){
            const search = req.query.search
            query = {or:[
                {title:{contains:search}},
                {category:{contains:search}}
            ]}
            console.log(search)
        }

        console.log(query)
        let limit = 5;
        const count = await Shop.count()
        const shop = await Shop.find(query).meta({makeLikeModifierCaseInsensitive:true}).limit(limit).skip((page - 1)*limit)
        // console.log(count)
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

    getProducts:async(req,res)=>{

         let page = 1;
        if(req.query.page){
            page=req.query.page
            console.log(req.query.page)
            console.log('page',page)
        }
        //console.log('query: ',req.query.page)
        let query = {}
        if(req.query.search){
            const search = req.query.search
            query = {or:[
                {title:{contains:search}},
                {category:{contains:search}}
            ]}
            console.log(search)
        }

        console.log(query)
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

    

    postAddCart: async(req,res)=>{
        const userId = req.session.user.id
        //console.log(userId)
        const productId = req.body.productId
        //console.log(productId)
        const product = await Shop.findOne({id:productId})
        //console.log(product)
        
        const findproductincart = await CartItem.findOne({user:userId,shop:productId})
        if(findproductincart){
            const newQuant = findproductincart.quantity + 1;
            console.log(newQuant)
            await CartItem.update({shop:productId},{quantity:newQuant})
            
        } 
        else{
            const cartItem = await CartItem.create({
                user:userId,
                shop:productId,
                quantity:1
            }).fetch()
            console.log(cartItem);
            const userCart=await User.addToCollection(userId,'cart').members([cartItem.id])
            console.log(userCart)
        }
        const user = await User.findOne(userId).populate('cart');
        res.redirect('/cart')
        //console.log(user.cart);
    },
    getCart:async(req,res)=>{
        try {
            const userId= req.session.user.id
            const userCart = await CartItem.find({user:userId}).populate('shop')
            //console.log('User Cart : ',userCart)
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

    getCheckout:async(req,res)=>{
        // console.log(req.session.user.id)
        const products = await CartItem.find({user:req.session.user.id}).populate('shop')
        let sum = 0
        let totalSum = 0;
        for(prods of products){
            // console.log(prods.quantity)
            sum = prods.quantity * prods.shop.price
            // console.log(sum)
            totalSum += sum;
        }
        // console.log(totalSum)
        res.view('shop/checkout',{
            total:totalSum,
            product:products
        })
        // console.log(products)
    }

};

