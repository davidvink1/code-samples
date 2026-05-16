var nodemailer = require('nodemailer');
var async = require('async');
var _ = require('lodash');
var moment = require('moment');
var config = require('./config');

var email_sent_recently = false;

var email_flip_bool = () => {
  email_sent_recently = false;
};

var email_control_interval = setInterval(email_flip_bool, 2 * 60 * 1000); //2m

module.exports = exports = {
  send_error_email: (err, next) => {
    if (_.isUndefined(next)) {
      next = (err, info) => {
        if (err) {
          console.error(err);
        }
      };
    }

    if (!config.mail_config.enabled) {
      return next();
    }

    async.waterfall(
      [
        next2 => {
          server_name(name => next2(null, name));
        },
        (box_name, next2) => {
          try {
            var transport = nodemailer.createTransport('SMTP', {
              service: 'Gmail',
              auth: {
                user: config.mail_config.username,
                pass: config.mail_config.password,
              },
            });
            return next2(null, box_name, transport);
          } catch (err) {
            return next2(err);
          }
        },
        (box_name, transport, next2) => {
          var mail_options = {
            from: config.mail_config.username,
            to: config.mail_config.toWhom,
            subject: '[' + box_name + '] ERROR at ' + new Date().toString(),
            text: err + '\n\n' + err.stack,
          };

          if (!email_sent_recently) {
            email_sent_recently = true;
            clearInterval(email_control_interval);
            email_control_interval = setInterval(email_flip_bool, 2 * 60 * 1000); //reset the timer.
            transport.sendMail(mail_options, next2);
          } else {
            return next2();
          }
        },
      ],
      function (err, data) {
        return next(err, data);
      }
    );
  },
};

var _server_name = null;
var server_name = function (callback) {
  if (!_server_name) {
    //var sys = require('sys');
    var exec = require('child_process').exec;
    exec('/bin/hostname', function (err, stdout, stderr) {
      _server_name = stdout;
      return callback(_server_name);
    });
  } else {
    return callback(_server_name);
  }
};
