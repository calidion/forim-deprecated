var isLogin = require('../../policies/isLogin');

module.exports = {
  urls: ['/message/remove'],
  routers: {
    post: function (req, res) {
      var user = req.session.user;
      var extracted = req.extracted.body;
      var InstantMessage = req.models.InstantMessage;

      InstantMessage.findOne({
        id: extracted.id,
        sender: user.id
      }).then(function (found) {
        if (!found) {
          return res.errorize(res.errors.MessageNotFound);
        }
        InstantMessage.destroy({
          id: found.id
        }).then(function () {
          res.errorize(res.errors.Success, found);
        }).fail(res.onError);
      }).fail(res.onError);
    }
  },
  policies: {
    post: isLogin
  },
  validations: {
    post: {
      body: {
        id: {
          type: 'string',
          required: true
        },
        text: {
          type: 'text',
          required: true
        }
      }
    }
  },
  failures: {
    validation: function (err, req, res) {
      console.error(err);
      console.error('validation error, please verify your input:');
      console.error(req.body);
      res.errorize(res.errors.InputInvalid);
    }
  }
};