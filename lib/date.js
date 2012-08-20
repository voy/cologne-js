var months, ordinal, strftime;

strftime = require('strftime').strftime;

months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

ordinal = function(number) {
  var _ref;
  number = parseInt(number, 10);
  if ((10 < (_ref = number % 100) && _ref < 14)) {
    return "" + number + "<sup>th</sup>";
  } else {
    switch (number % 10) {
      case 1:
        return "" + number + "<sup>st</sup>";
      case 2:
        return "" + number + "<sup>nd</sup>";
      case 3:
        return "" + number + "<sup>rd</sup>";
      default:
        return "" + number + "<sup>th</sup>";
    }
  }
};

exports.convert = function(year, month, day) {
  month = month - 1;
  return new Date(year, month, day);
};

exports.format = function(date, format) {
  var day, formattedDate;
  if (format == null) {
    format = "%d-%m-%Y";
  }
  formattedDate = strftime(format, date);
  if (/%o/.test(formattedDate)) {
    day = ordinal(date.getDate());
    formattedDate = formattedDate.replace(/%o/, day);
  }
  return formattedDate;
};
