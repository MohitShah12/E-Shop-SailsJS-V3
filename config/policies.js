/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

  //For authentication of user
  ShopController:{
    'getHome':'isLoggedIn',
    'getProduct':'isLoggedIn',
    'getProducts':'isLoggedIn',
    'getCart':'isLoggedIn',
    'getCheckout':'isLoggedIn',
    'postAddCart':'isLoggedIn'
  },

  //checking superUser for adding/editing products
  AdminController:{
    'getAddProduct':'isLoggedIn',
    'getEditProduct':'isLoggedIn',
  },



};
