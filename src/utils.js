"use strict";

(function() {
  const utils = {
    isEscaped: (i, str) => {
      // Check before str[i] for odd-number of consecutive backslashes
      let count = 0;
      while (count <= i) {
        if (str[i - 1 - count] === "\\") {
          count++;
        } else {
          if (count % 2 > 0) {
            return true;
          }
          return false;
        }
      }
    }
  };

  module.exports = utils;
})();
