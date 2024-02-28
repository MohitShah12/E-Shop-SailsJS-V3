/**
 * CartItem.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user:{
      model:'User',
      required:true
    },
    shop:{
      model:'Shop',
      required:true
    },
    quantity:{
      type:'number'
    }
  },

};

