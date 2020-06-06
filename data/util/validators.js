const _ = require('lodash');

function isNumber(number) {
    return !isNaN(_.toNumber(number));
}

function isAllNumbers(numbers) {
    return _.isUndefined(_.find(numbers, n => !isNumber(n.value)));
}

module.exports = {
    isNumber,
    isAllNumbers 
}