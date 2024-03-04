/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name:{
      type:'string',
      required:true
    },
    email:{
      type:'string',
      required:true
    },
    password:{
      type:'string',
      required:true
    },
    address:{type:'string'},
    superUser:'boolean',  
    mobileno:{type:'string'},
    cart:{
      collection:'CartItem',
      via:'user'
    },
    token:{type:'string'}
  },
};

