/**
 * ShopController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// const jwt = require('jsonwebtoken')
const ResCodes = sails.config.constants.ResCodes;
const { messages } = sails.config.constants.Dependencies;

module.exports = {
  //Home page
  getHome: async (req, res) => {
    try {
      //default page
      let page = 1;
      //gettting page from query
      if (req.query.page) {
        //setting page as req.query.page
        page = req.query.page;
      }
      //searching query
      let query = {};

      if (req.query.search) {
        const search = req.query.search;
        //searching using title or category
        query = {
          or: [
            { title: { contains: search } },
            { category: { contains: search } },
          ],
        };
      }
      let isLoggedIn = false;
      let isAdmin = false;
      console.log("User", req.user);
      if (req.user) {
        (isLoggedIn = true),
          //Checking if user is an admin or not
          (isAdmin = req.user.superUser);
      }
      console.log("Admin", isAdmin);
      //checking for JWTtoken avability in cookie
      console.log("Login", isLoggedIn);
      //limit of products per page
      let limit = 5;
      //total products in database
      const count = await Shop.count();
      //
      const shop = await Shop.find(query)
        .meta({ makeLikeModifierCaseInsensitive: true })
        .limit(limit)
        .skip((page - 1) * limit);
      // res.view('shop/home',{
      //     shopProducts : shop,
      //     isAuthenticated:isLoggedIn,
      //     isUser:req.user,
      //     path:'/',
      //     currentpage:page,
      //     totalpage:Math.ceil(count/limit),
      //     isAdmin:isAdmin
      // })
      return res.json(shop);
    } catch (error) {
      console.log(error);
      return res.serverError(error.message);
    }
  },

  //Products page
  getProducts: async (req, res) => {
    try {
      let page = 1;
      if (req.query.page) {
        page = req.query.page;
      }
      let query = {};
      let search = ''
      if (req.query.search) {
        search = req.query.search;
        query = {
          or: [
            { title: { contains: search } },
            { category: { contains: search } },
          ],
        };
      }
      let isLoggedIn = false;
      let isAdmin = false;
      if (req.user) {
        (isLoggedIn = true), (isAdmin = req.user.superUser);
      }
      //.meta({ makeLikeModifierCaseInsensitive: true })
      let limit = 5;
      const count = await Shop.count();
      const products = await Shop.find({
        or: [
            { title: { contains: search } },
            { category: { contains: search } }
        ]
    }).limit(limit).skip((page - 1) * limit);
      // res.view('shop/products',{
      //     shopProducts : products,
      //     isAuthenticated:isLoggedIn,
      //     path:'/',
      //     currentpage:page,
      //     totalpage:Math.ceil(count/limit),
      //     isAdmin:isAdmin
      // })
      return res.send(products);
    } catch (error) {
      return res.serverError(error.message);
    }
  },

  //Deatils of a single Product
  getProduct: async (req, res) => {
    try {
      //geting product id from params
      const productid = req.params.id;
      const product = await Shop.findOne({ id: productid });
      let isAdmin = false;
      if (req.user) {
        // isLoggedIn = true,
        isAdmin = req.user.superUser;
      }
      if(!product){
        return res.status(ResCodes.notFound).send({error:messages.noProduct})
      }
      // console.log(product)
      // res.send(product)
      // let isLoggedIn = false
      // res.view("shop/product-details", {
      //   product: product,
      //   path: "/product/:id",
      //   isAuthenticated: isLoggedIn,
      //   isAdmin: isAdmin,
      // });
      return res.send(product)
    } catch (error) {
      return res.serverError(error.message);
    }
  },

  //Add to cart or update the quantity
  postAddCart: async (req, res) => {
    try {
      console.log(req.user);
      if (!req.user) {
        return res.status(ResCodes.unAuth).send({ error: messages.notAllowed });
      }
      //const decodedToken = await jwt.verify(req.cookies.JWTtoken,process.env.SESSION_SECRET)
      //getting user id
      const userId = req.user.id;
      //getting product id
      const productId = req.body.productId;
      const product = await Shop.findOne({ id: productId });

      //finding product in cart
      const findproductincart = await CartItem.findOne({
        user: userId,
        shop: productId,
      });

      //if product is in cart
      if (findproductincart) {
        //increment the quantity
        const newQuant = findproductincart.quantity + 1;
        await CartItem.update({ shop: productId }, { quantity: newQuant });
      }
      //add to cart(if product is not available in cart)
      else {
        const cartItem = await CartItem.create({
          user: userId,
          shop: productId,
          quantity: 1,
        }).fetch();
        const userCart = await User.addToCollection(userId, "cart").members([
          cartItem.id,
        ]);
      }
      const user = await User.findOne(userId).populate("cart");
      return res.ok(messages.addcart);
    } catch (error) {
      return res.serverError(error.message);
    }
  },

  //cart page
  getCart: async (req, res) => {
    try {
      let isLoggedIn = false;
      let isAdmin = false;
      if (req.user) {
        (isLoggedIn = true), (isAdmin = req.user.superUser);
        const userCart = await CartItem.find({ user: req.user.id }).populate(
          "shop"
        );
        return res.ok(userCart);
      }
      // res.view('shop/cart',{
      //     product:userCart,
      //     path:'/cart',
      //     isAuthenticated:isLoggedIn,
      //     isAdmin:isAdmin
      // })
      return res.badRequest({ error: messages.notAllowed });
    } catch (error) {
      return res.serverError(error.message);
    }
  },

  //delete from cart
  postDeletecart: async (req, res) => {
    try {
      const product = await CartItem.findOne({ id: req.body.productId });
      if (!product) {
        return res.status(ResCodes.notFound).send({error:messages.noProduct});
      }
      await CartItem.destroy({ id: req.body.productId });
      return res.ok({error:messages.deletecart});
    } catch (error) {
      return res.serverError(error.message);
    }
  },

  //checkout page
  getCheckout: async (req, res) => {
    try {
      console.log(req.user);
      if (req.user) {
        const products = await CartItem.find({ user: req.user.id }).populate(
          "shop"
        );
        console.log(products);
        let sum = 0;
        let totalSum = 0;
        for (prods of products) {
          console.log("Prods", prods);
          console.log("q", prods.quantity);
          console.log("p", prods.shop.price);
          sum = prods.quantity * prods.shop.price;
          totalSum += sum;
        }
        //deleting items from the cart after buying it
        await CartItem.destroy({ user: req.user.id });
        // res.view('shop/checkout',{
        //     total:totalSum,
        //     product:products
        // })
        return res.ok({ TotalPay: totalSum });
      }
      return res.badRequest({ error: messages.notAllowed });
    } catch (error) {
      console.log(error);
      return res.serverError(error.message);
    }
  },
};
