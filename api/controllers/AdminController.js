/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const validator = require('validator')

module.exports = {
    getAddProduct: async(req,res)=>{
        res.view('admin/edit-products',{
            editing:false,
            isAuthenticated :req.session.isLoggedIn,
            isAdmin:req.session.isAdmin,
            path: "/admin/add-product"
        })
    },

    getEditProduct:async(req,res)=>{
        const product = await Shop.findOne({id:req.params.id})
        res.view('admin/edit-products',{
            editing:true,
            isAuthenticated:req.session.isLoggedIn,
            isAdmin:req.session.isAdmin,
            path:'/admin/edit-product',
            product:product
        })
    },

    PostAddProduct: async(req,res)=>{
        if(!validator.isLength(req.body.description,{min:10})){
            req.addFlash('error','Description must be at least 10 characters long')
            return res.redirect('/admin/add-product')
        }
        if(!validator.isURL(req.body.imageUrl)){
            req.addFlash('error','Please provide a valid url of image')
            return res.redirect('/admin/add-product')
        }
        const shop = await Shop.create({
            title:req.body.title,
            imageUrl:req.body.imageUrl,
            price:req.body.price,
            description:req.body.description,
            category:req.body.category
        }).fetch()
        res.redirect('/')
    },

    postEditProduct:async(req,res)=>{
        try {
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
            console.log(error)
        }
    },

    PostDeleteProduct: async(req,res)=>{
        try {
            const product = await Shop.findOne({id:req.body.productId})
            console.log('before:',product)
            if(!product){
                return res.status(400).send('Product Not found')
            }
            await Shop.destroy({id:product.id})
            //console.log('after:',product)
            await CartItem.destroy({shop:product.id})
            res.redirect('/')
        } catch (error) {
            console.log(error)
        }
    },   


};

