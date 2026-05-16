var async = require('async');
var moment = require('moment');
var _ = require('lodash');

var request = require('./request').request;
var exchange_db = require('./db_mysql').exchange;

var use_test_data = true;
var is_test = process.env.NODE_ENV != 'production';
var exchange_processing = false;

var api_key = require('./config').API_KEY_EXCHANGE;

exports.onTick = () => {
  if (exchange_processing) {
    console.log('Exchange Rate Job already running.');
    return;
  }
  console.log('Exchange Rate Operation Started at ' + moment().format('YYYY-MM-DD HH:mm:ss.SSS'));
  exchange_processing = true;
  async.waterfall(
    [
      next => {
        var options = {
          use_http: true,
          method: 'GET',
          host: 'www.apilayer.net',
          path: '/api/live?access_key=' + api_key,
          headers: {
            accepts: 'application/json',
          },
        };

        if (is_test) console.log(JSON.stringify(options, null, 2));

        request('', options, (err, response) => next(err, response));
      },
      (data, next) => {
        if (is_test) {
          console.log('Got Exchange Rate data');
        }

        if (!data) {
          return next('Failed to get exchange rate data. CurrencyLayer API is down or credentials are bad.');
        }

        try {
          data = JSON.parse(data);
          if (is_test) console.log(JSON.stringify(data, null, 2));
        } catch (err) {
          return next(err);
        } finally {
          if (!data.success) {
            return next(data.error);
          }
          return next(null, parseRateData(data.quotes));
        }
      },
      (data, next) => {
        if (is_test) console.log(JSON.stringify(data, null, 2));
        exchange_db.start((err, connection) => next(err, connection, data));
      },
      (connection, data, next) => {
        async.eachSeries(
          data,
          (rate, eNext) => {
            exchange_db.insert(connection, rate, err => eNext(err));
          },
          err => {
            if (err) {
              exchange_db.rollback(connection);
            }
            return next(err, connection);
          }
        );
      },
      (connection, next) => {
        exchange_db.commit(connection, err => next(err));
      },
    ],
    err => {
      if (err) {
        console.error(err);
      }
      console.log('EXCHANGE RATE JOB COMPLETE');
      exchange_processing = false;
    }
  );
};

function parseRateData(rates) {
  if (!rates) return;

  let keys = Object.keys(rates),
    values = Object.values(rates),
    result = [];

  keys.forEach((k, index) => {
    result.push({
      symbol: k.substr(3),
      rate: values[index],
    });
  });
  return result;
}
