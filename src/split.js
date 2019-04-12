"use strict";
(function() {
  const split = str => {
    const data = {
      segments: [],

      // Segments in progress
      wordStack: [],
      numberStack: [],
      stringStack: []
    };

    const flags = {
      numberFlags: {
        haveSeenPeriod: false
      }
    };

    for (let i = 0; i < str.length; i++) {
      switch (true) {
        case data.wordStack.length > 0: // a word is underway
          inWordStack(str[i], i, data, flags);
          break;
        case data.numberStack.length > 0: // a number is underway
          inNumberStack(str[i], i, data, flags);
          break;
        case data.stringStack.length > 0: // a string is underway
          inStringStack(str[i], i, data, flags);
          break;
        default:
          emptyStacks(str[i], i, data, flags);
      }
    }

    if (data.wordStack.length > 0) {
      data.segments.push(data.wordStack.join(""));
    }
    console.log(str, data.segments);
    return data.segments;
  };

  const inWordStack = (char, i, data, flags) => {
    const { wordStack, segments } = data;
    switch (true) {
      case /[\w$]/.test(char): // letter, _, $, or digit
        wordStack.push(char);
        break;
      case /['"]/.test(char):
        segments.push(wordStack.join(""));
        wordStack.length = 0;
        stringStack.push(char);
        break;
      default:
        segments.push(wordStack.join(""));
        wordStack.length = 0;
        segments.push(char);
        break;
    }
  };

  const inNumberStack = (char, i, data, flags) => {
    const { wordStack, numberStack, stringStack, segments } = data;
    switch (true) {
      case /[\d]/.test(char):
        numberStack.push(char);
        break;
      case /\./.test(char):
        if (flags.numberFlags.haveSeenPeriod) {
          // there's already a period
          segments.push(numberStack.join(""));
          numberStack.length = 0;
        }
        numberStack.push(char);
        flags.numberFlags.haveSeenPeriod = !flags.numberFlags.haveSeenPeriod;
        break;
      case /[\w$]/.test(char):
        segments.push(numberStack.join(""));
        numberStack.length = 0;
        wordStack.push(char);
        break;
      case /['"]/.test(char):
        segments.push(numberStack.join(""));
        numberStack.length = 0;
        stringStack.push(char);
        break;
      default:
        segments.push(numberStack.join(""));
        numberStack.length = 0;
        segments.push(char);
        break;
    }
  };

  const inStringStack = (char, i, data, flags) => {
    const { wordStack, numberStack, stringStack, segments } = data;
    switch (true) {
      case stringStack[0] === char:
        stringStack.push(char);
        segments.push(stringStack.join(""));
        stringStack.length = 0;
        break;
      default:
        stringStack.push(char);
        break;
    }
  };

  const emptyStacks = (char, i, data, flags) => {
    const { wordStack, numberStack, stringStack, segments } = data;
    switch (true) {
      case /(?=[\w$])(?=[^\d])/.test(char): // word character or _ or $ but not digit
        wordStack.push(char);
        break;
      case /[\d\.]/.test(char): // starts a number (int or float)
        numberStack.push(char);
        if (char === ".") flags.numberFlags.haveSeenPeriod = true;
        break;
      case /['"]/.test(char): // starts a string
        stringStack.push(char);
        break;
      default:
        segments.push(char); // starts no stack
        break;
    }
  };

  module.exports = split;
})();
