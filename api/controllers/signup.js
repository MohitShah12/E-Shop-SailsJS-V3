module.exports = {


  friendlyName: 'Signup',


  description: 'Signup something.',

  exits: {
    success: {
      viewTemplatePath: 'auth/signup',
    },
    redirect: {
      description: 'The requesting user is already logged in.',
      responseType: 'redirect'
    }
  },


  fn: async function () {

    throw{redirect: '/signup'}
    // return{};

  }


};
