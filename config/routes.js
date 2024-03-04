/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
    //User authentication
    'POST /signup' : 'UserController.postSignup',
    'POST /login' : 'UserController.postLogin',
    'GET /signup' : 'UserController.getSingup',
    'GET /login' : 'UserController.getLogin',
    'POST /logout' : 'UserController.postLogout',
    'POST /user' : 'UserController.getUser',

    //Main pages
    'GET /' :'ShopController.getHome',
    'GET /products':'ShopController.getProducts',

    //edit produts
    'GET /admin/add-product': 'AdminController.getAddProduct',
    'GET /admin/edit-product/:id':'AdminController.getEditProduct',
    'POST /admin/add-product' : 'AdminController.postAddProduct',
    'POST /admin/edit-product' : 'AdminController.postEditproduct',
    'GET /admin/edit-product' : 'AdminController.postEditproduct',
    'POST /admin/delete-product':'AdminController.postDeleteProduct',


    //Cart
    'POST /cart' : 'ShopController.postAddCart',
    'GET /cart' : 'ShopController.getCart',
    'GET /products/:id' : 'ShopController.getProduct',
    'POST /deletecart' : 'ShopController.postDeleteCart',  

    //Checkout
    'Get /checkout':'ShopController.getCheckout'
    
};
