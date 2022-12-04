const toInteger = (value) => value && parseInt(value, 10);

const toDate = (value) => value && new Date(value);

const keepString = (value) => value;

const HOURS_SERIALIZER = {
  'fromDate' : toDate,
  'toDate' : toDate,
  'fromTime' : keepString,
  'toTime' : keepString,
  'event' : toInteger,
  'duration' : toInteger,
};

const SERIALIZERS = {
  'hours' : HOURS_SERIALIZER,
};

const serialize = (obj, request) => (
  Object
    .keys(SERIALIZERS[request])
    .reduce((result, name) => {
      const value = obj[name];
      result[name] = SERIALIZERS[request][name](value);

      return result;
    }, {})
);

module.exports = { serialize };