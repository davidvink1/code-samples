/**
 * @file Ping Route
 * @module Interface_Ping
 */
const settings = require('../../models/v1/settings');
const transaction = require('../../models/v1/transaction');
const utils = require('./utils');

/**
 * Ping checks the read and write databases and via a ping request, very basic health check type deal.
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @param {function} next - (optional) callback function
 * @return {Promise|void} - returns promise if callback is not passed in, void if it is.
 */
exports.run = async (req, res, next) => {
  try {
    let can_write = await Promise.race([transaction.check_transactions(), utils.timeout(15000, 'WRITE PING TIMEOUT')]);
    let can_read = await Promise.race([settings.getByName('bypass'), utils.timeout(15000, 'READ PING TIMEOUT')]);

    if (!!can_read && !!can_write) {
      return res.status(200).send('pong');
    } else {
      return res.status(400).send('pong');
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send('pong');
  }
};
