var http = require('supertest');
var assert = require('assert');
var shared = require('../shared');
var server = require('../app');
var app;

describe('v2 user#login', function () {
  var username = shared.user.username;
  var email = shared.user.email;
  var password = shared.user.password;
  var id = 1;
  var cookies;

  before(function (done) {
    server(function (data) {
      app = data;
      done();
    });
  });

  it('should 200 when get /search_pass', function (done) {
    var req = http(app);
    req.get('/search_pass')
      .expect(200, function (err, res) {
        res.text.should.containEql('找回密码');
        done(err);
      });
  });

  it('should 200 when get /search_pass', function (done) {
    var req = http(app);
    req.get('/v2/password/retrieve')
      .expect(200, function (err, res) {
        res.text.should.containEql('找回密码');
        done(err);
      });
  });

  it('should update search pass', function (done) {
    var req = http(app);
    req.post('/search_pass')
      .send({
        email: email
      })
      .expect(200, function (err, res) {
        res.text.should.containEql('我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。');
        done(err);
      });
  });

  it('should 200 when get /reset_pass', function (done) {
    app.models.User.findOne({
      username: username
    }).then(function (found) {
      var req = http(app);
      req.get('/reset_pass')
        .query({
          key: found.passwordRetrieveKey,
          username: username
        })
        .expect(200, function (err, res) {
          res.text.should.containEql('重置密码');
          done(err);
        });
    });
  });
  it('should 403 get /reset_pass when with wrong resetKey', function (done) {
    var req = http(app);
    req.get('/reset_pass')
      .query({
        key: 'wrongkey',
        username: username
      })
      .expect(200, function (err, res) {
        res.text.should.containEql('信息不匹配或者存在错误，请重新请求！');
        done(err);
      });
  });

  it('should update password', function (done) {
    app.models.User.findOne({
      username: username
    }).then(function (found) {
      var req = http(app);
      shared.user.password = 'jkljkljkl';
      req.post('/reset_pass')
        .send({
          password: shared.user.password,
          confirm: shared.user.password,
          key: found.passwordRetrieveKey,
          username: username
        })
        .expect(200, function (err, res) {
          res.text.should.containEql('你的密码已重置。');
          done(err);
        });
    });
  });
});