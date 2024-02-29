/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const validator = require('validator')
const jwt = require('jsonwebtoken')

module.exports = {
    
    //add products form page
    getAddProduct: async(req,res)=>{
        try {
            let isLoggedIn = false
            let isAdmin = false
            if(req.cookies.JWTtoken){
                decodedToken = await jwt.verify(req.cookies.JWTtoken,process.env.SESSION_SECRET)
                if(decodedToken){
                        isLoggedIn = true
                        isAdmin = decodedToken.superUser
                    }
                }
            res.view('admin/edit-products',{
                editing:false,
                isAuthenticated :isLoggedIn,
                isAdmin:isAdmin,
                path: "/admin/add-product"
            })
        } catch (error) {
            res.badRequest('Internal server error')
        }
    },

    //update product form page
    getEditProduct:async(req,res)=>{
        try {
            let isLoggedIn = false
            let isAdmin = false
            if(req.cookies.JWTtoken){
                decodedToken = await jwt.verify(req.cookies.JWTtoken,process.env.SESSION_SECRET)
                if(decodedToken){
                        isLoggedIn = true
                        isAdmin = decodedToken.superUser
                    }
                }
            const product = await Shop.findOne({id:req.params.id})
            res.view('admin/edit-products',{
                editing:true,
                isAuthenticated:isLoggedIn,
                isAdmin:isAdmin,
                path:'/admin/edit-product',
                product:product
            })
        } catch (error) {
            return res.badRequest('Internal server error')
        }
    },


    //adding new peoducts
    PostAddProduct: async(req,res)=>{
        try {
            //description validation
            if(!validator.isLength(req.body.description,{min:10})){
                req.addFlash('error','Description must be at least 10 characters long')
                return res.redirect('/admin/add-product')
            }
            //image url validation
            if(!validator.isURL(req.body.imageUrl)){
                req.addFlash('error','Please provide a valid url of image')
                return res.redirect('/admin/add-product')
            }
            //creating new product
            const shop = await Shop.create({
                title:req.body.title,
                imageUrl:req.body.imageUrl,
                price:req.body.price,
                description:req.body.description,
                category:req.body.category
            }).fetch()
            res.redirect('/')
        } catch (error) {
            res.badRequest('Internal server error')
        }
    },

    //updating products
    postEditProduct:async(req,res)=>{
        try {
            //description validation
            if(!validator.isLength(req.body.description,{min:10})){
                req.addFlash('error','Description must be at least 10 characters long')
                return res.redirect(`/admin/edit-product/:${req.params.id}`)
            }
            //image url validation
            if(!validator.isURL(req.body.imageUrl)){
                req.addFlash('error','Please provide a valid url of image')
                return res.redirect('/admin/edit-product')
            }
            const product = await Shop.findOne({id:req.body.productId})
            if(!product){
                return res.status(400).send('Product Not found')
            }
            await Shop.update({id:product.id},{
                title:req.body.title,
                imageUrl:req.body.imageUrl,
                description:req.body.description,
                price:req.body.price,
                category:req.body.category
            })
            res.redirect('/')
        } catch (error) {
            res.badRequest('Internal server error')
        }
    },

    //deleting proucts
    PostDeleteProduct: async(req,res)=>{
        try {
            const product = await Shop.findOne({id:req.body.productId})
            if(!product){
                return res.status(400).send('Product Not found')
            }
            await Shop.destroy({id:product.id})
            //console.log('after:',product)
            await CartItem.destroy({shop:product.id})
            res.redirect('/')
        } catch (error) {
            res.badRequest('Internal server error')
        }
    },   


};

