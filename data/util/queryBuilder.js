const _ = require('lodash');
const MongoQS = require('mongo-querystring');
const qs = new MongoQS();

module.exports = async function build(queryString, entity){
    const populateOptions = []
    let limit, page;
    let orderBy;
    Object.keys(queryString).forEach(key => {
        if (_.isEqual(key, 'populate')){
            populateOptions.push(queryString[key]);
            delete queryString[key];
            return;
        }

        if (_.isEqual(key, 'limit')){
            limit = parseInt(queryString[key]); 
            delete queryString[key];
            return;
        }

        if (_.isEqual(key, 'page')){
            page = parseInt(queryString[key]);
            delete queryString[key];
            return;
        }

        if (_.isEqual(key, 'orderBy')){
            orderBy = queryString[key];
            delete queryString[key];
        }
    });

    const parsedQuery = qs.parse(queryString);
    const countDocuments = await entity.find(qs.parse(queryString)).countDocuments();

    let query = entity.find(parsedQuery);

    if (populateOptions){
        _.forEach(populateOptions, option =>{
            query = query.populate(option);
        });
    }

    if (!_.isUndefined(page)){
        query = query.skip(page > 0 ? (page * limit) : 0)
    }

    if (!_.isUndefined(limit)){
        query = query.limit(limit);
    }

    if (!_.isUndefined(orderBy)){
        let orderByValue;
        if (orderBy.indexOf('desc') >= 0){
            orderBy = orderBy.replace('desc', '').trim();
            orderByValue = JSON.parse(`{"${orderBy}":-1}`);
        } else {
            orderBy = orderBy.replace('asc', '').trim();
            orderByValue = JSON.parse(`{"${orderBy}":1}`);
        }
        query = query.sort(orderByValue);
    }

    return { query, countDocuments };
};