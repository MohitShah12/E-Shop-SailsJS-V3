/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {validator} = sails.config.constants.Dependencies
const Messages = sails.config.constants.Messages
const ResCode = sails.config.constants.ResCodes

// const validator = require('validator')
// const jwt = require('jsonwebtoken')

module.exports = {
    
    //add products form page
    getAddProduct: async(req,res)=>{
        try {
            let isLoggedIn = false
            let isAdmin = false
            if(req.user){
                isLoggedIn = true
                isAdmin = req.user.superUser
            }
            res.view('admin/edit-products',{
                editing:false,
                isAuthenticated :isLoggedIn,
                isAdmin:isAdmin,
                path: "/admin/add-product"
            })
        } catch (error) {
             return res.serverError(error.message)
        }
    },

    //update product form page
    getEditProduct:async(req,res)=>{
        try {
            let isLoggedIn = false
            let isAdmin = false
            if(req.user){
                   isLoggedIn = true
                    isAdmin = req.user.superUser
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
            return res.serverError(error.message)
        }
    },


    //adding new peoducts
    PostAddProduct: async(req,res)=>{
        try {
            //description validation
            if(!validator.isLength(req.body.description,{min:10})){
                return res.badRequest(Messages.descLength)
                //return res.redirect('/admin/add-product')
            }
            //image url validation
            if(!validator.isURL(req.body.imageUrl)){
                return res.badRequest(Messages.imgUrl)
                //return res.redirect('/admin/add-product')
            }
            //creating new product
            const shop = await Shop.create({
                title:req.body.title,
                imageUrl:req.body.imageUrl,
                price:req.body.price,
                description:req.body.description,
                category:req.body.category
            }).fetch()
            return res.ok(Messages.addProduct)
        } catch (error) {
             return res.serverError(error.message)
        }
    },

    //updating products
    postEditProduct:async(req,res)=>{
        try {
            //description validation
            if(!validator.isLength(req.body.description,{min:10})){
                return res.badRequest(Messages.descLength)
                //return res.redirect(`/admin/edit-product/:${req.params.id}`)
            }
            //image url validation
            if(!validator.isURL(req.body.imageUrl)){
                return res.badRequest(Messages.imgUrl)
                //return res.redirect('/admin/edit-product')
            }
            const product = await Shop.findOne({id:req.body.productId})
            if(!product){
                return res.status(400).send(Messages.noProduct)
            }
            await Shop.update({id:product.id},{
                title:req.body.title,
                imageUrl:req.body.imageUrl,
                description:req.body.description,
                price:req.body.price,
                category:req.body.category
            })
            return res.ok(Messages.editProduct)
        } catch (error) {
             return res.serverError(error.message)
        }
    },

    //deleting proucts
    PostDeleteProduct: async(req,res)=>{
        try {
            console.log('hdbc')
            const product = await Shop.findOne({id:req.body.productId})
            console.log(req.body.productId)
            if(!product){
                return res.status(ResCode.notFound).send(Messages.noProduct)
            }
            await Shop.destroy({id:product.id})
            //console.log('after:',product)
            await CartItem.destroy({shop:product.id})
            return res.ok(Messages.deleteProduct)
        } catch (error) {
             return res.serverError(error.message)
        }
    },   


};

