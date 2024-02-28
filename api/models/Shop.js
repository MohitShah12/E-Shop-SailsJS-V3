/**
 * Shop.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    title:{
      type:'string',
      required:true
    },
    imageUrl:{
      type:'string',
      required:true
    },
    price:{
      type:'number',
      required:true
    },
    description:{
      type:'string',
      required:true
    },
    category:{
      type:'string',
      required:true
    }
  }

};

