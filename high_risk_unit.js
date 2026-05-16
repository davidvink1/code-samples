/**
 * @file High Risk Unit interface
 * @module API_HighRiskUnit
 */
const _ = require('lodash');
const high_risk_unit = require('../../models/v1/high_risk_unit');
const moment = require('moment');

module.exports = exports = {
  /**
   * Searches our High Risk Unit database table for matches, and computes the last seen reference.
   * @param {object} req - the request object
   * @param {object} res - the response object
   * @param {function} callback - (optional) callback function
   * @return {Promise|void} - returns promise if callback is not passed in, void if it is.
   */
  request: async (req, res, next) => {
    if (!_.has(req.data, 'transaction.shipTo.unit')) return next();
    let address = _.at(req.data, 'transaction.shipTo.addressNormalShort')[0];
    let number = _.at(req.data, 'transaction.shipTo.unit')[0];

    let result;

    try {
      let unit = await high_risk_unit.findUnit(address, number);
      if (unit.length == 0) throw 'No High Risk Data Found at this Address and Unit';
      let diff = moment() - moment(_.at(unit[0], 'updated_at')[0]);
      let days = Math.floor(moment.duration(diff).asDays()) || 1;

      result = {
        address: _.at(req.data, 'transaction.shipTo.addressNormalShort')[0],
        number: _.at(req.data, 'transaction.shipTo.unit')[0],
        last_seen: days,
      };
    } catch (err) {
      console.error(err);
    } finally {
      if (next instanceof Function) {
        req.data['high_risk_unit'] = result;
        return next();
      } else {
        return { high_risk_unit: result };
      }
    }
  },
};
