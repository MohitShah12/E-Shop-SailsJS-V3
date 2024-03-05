/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {validator} = sails.config.constants.Dependencies
const {messages} = sails.config.constants.Dependencies
const ResCode = sails.config.constants.ResCodes

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
             return res.serverError({error:error.message})
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
            return res.serverError({error:error.message})
        }
    },


    //adding new peoducts
    PostAddProduct: async(req,res)=>{
        try {
            console.log(req.user.superUser)
            if(req.user.superUser){
                //description validation
                if(!validator.isLength(req.body.description,{min:10})){
                    return res.badRequest({error:messages.descLength})
                    //return res.redirect('/admin/add-product')
                }
                //image url validation
                if(!validator.isURL(req.body.imageUrl)){
                    return res.badRequest({error:messages.imgUrl})
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
                return res.status(ResCode.ok).json({success:messages.addProduct,product:shop})
            }
            return res.badRequest({ error: messages.notAuthorized });
        } catch (error) {
             return res.serverError({error:error.message})
        }
    },

    //updating products
    postEditProduct:async(req,res)=>{
        try {
            //description validation
            if(req.user.superUser){

                if(!validator.isLength(req.body.description,{min:10})){
                    return res.badRequest(messages.descLength)
                    //return res.redirect(`/admin/edit-product/:${req.params.id}`)
                }
                //image url validation
                if(!validator.isURL(req.body.imageUrl)){
                    return res.badRequest(messages.imgUrl)
                    //return res.redirect('/admin/edit-product')
                }
                const product = await Shop.findOne({id:req.body.productId})
                if(!product){
                    return res.status(400).send({error:messages.noProduct})
                }
                await Shop.update({id:product.id},{
                    title:req.body.title,
                    imageUrl:req.body.imageUrl,
                    description:req.body.description,
                    price:req.body.price,
                    category:req.body.category
                })
                return res.status(ResCode.ok).json({success:messages.editProduct,product:shop})
            }
            return res.badRequest({ error: messages.notAuthorized });
        } catch (error) {
             return res.serverError({error:error.message})
        }
    },

    //deleting proucts
    PostDeleteProduct: async(req,res)=>{
        try {
            if(req.user.superUser){
                console.log('hdbc')
                const product = await Shop.findOne({id:req.body.productId})
                console.log(req.body.productId)
                if(!product){
                    return res.status(ResCode.notFound).send({error:messages.noProduct})
                }
                await Shop.destroy({id:product.id})
                //console.log('after:',product)
                await CartItem.destroy({shop:product.id})
                return res.ok(messages.deleteProduct)
            }
            return res.badRequest({ error: messages.notAuthorized });
        } catch (error) {
             return res.serverError({error:error.message})
        }
    },   


};

