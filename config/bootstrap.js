/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

const bcrypt = require('bcrypt')
var dotenv = require('dotenv').config();
// const {bcrypt,dotenv} = sails.config.constants



module.exports.bootstrap = async function() {

  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)
  // if (await User.count() > 0) {
  //   return;
  // }
  //
  // await User.createEach([
  //   { emailAddress: 'ry@example.com', fullName: 'Ryan Dahl', },
  //   { emailAddress: 'rachael@example.com', fullName: 'Rachael Shaw', },
  //   // etc.
  // ]);
  // ```
  const user = await User.findOne({email:process.env.ADMIN_EMAIL})
  if(!user){
    const hashPassword = await bcrypt.hash(process.env.ADMIN_PASS,12)
    console.log('hashpassword',hashPassword)
    await User.create({
      email:process.env.ADMIN_EMAIL,
      password:hashPassword,
      name:process.env.ADMIN_NAME,
      mobileno:process.env.ADMIN_MOBILE,
      address:process.env.ADMIN_ADDRESS,
      superUser:true
    })
  }

};
