"use strict";

function inWordStack(char, i, data) {
  const { segments, wordStack, numberStack, stringStack } = data;
  switch (true) {
    case /[\w$]/.test(char): // letter, _, $, or digit
      data.wordStack.push(char);
      break;
    case /['"]/.test(char):
      segments.push(wordStack.join(""));
      data.wordStack = [];
      stringStack.push(char);
      break;
    default:
      segments.push(wordStack.join(""));
      data.wordStack = [];
      segments.push(char);
      break;
  }
}

function inNumberStack(char, i, data) {
  const { segments, wordStack, numberStack, stringStack } = data;
  switch (true) {
    case /[\d]/.test(char):
      numberStack.push(char);
      break;
    case /[\w$]/.test(char):
      segments.push(numberStack.join(""));
      data.numberStack = [];
      wordStack.push(char);
      break;
    case /['"]/.test(char):
      segments.push(numberStack.join(""));
      data.numberStack = [];
      stringStack.push(char);
      break;
    default:
      segments.push(numberStack.join(""));
      data.numberStack = [];
      segments.push(char);
      break;
  }
}

function emptyStacks(char, i, data) {
  const { segments, wordStack, numberStack, stringStack } = data;
  switch (true) {
    case /(?=[\w$])(?=[^\d])/.test(char): // word character or _ or $ but not digit
      wordStack.push(char);
      break;
    case /[\d]/.test(char): // digit
      numberStack.push(char);
      break;
    case /['"]/.test(char): // starts a string
      stringStack.push(char);
      break;
    default:
      segments.push(char); // starts no stack
      break;
  }
}

function Main() {}

Main.prototype.$split = str => {
  const data = {
    segments: [],
    wordStack: [],
    numberStack: [],
    stringStack: []
  };

  for (let i = 0; i < str.length; i++) {
    switch (true) {
      case data.wordStack.length > 0: // a word is underway
        inWordStack(str[i], i, data);
        break;
      case data.numberStack.length > 0: // a number is underway
        inNumberStack(str[i], i, data);
        break;
      default:
        emptyStacks(str[i], i, data);
    }
  }

  if (data.wordStack.length > 0) {
    data.segments.push(data.wordStack.join(""));
  }
  console.log(data.segments);
  return data.segments;
};

// Main.prototype.split = function(str) {
//   let split = [];
//   let word = "";
//   let number = "";
//   let string = "";
//   for (let i = 0; i < str.length; i++) {
//     if(word.length > 0) {
//       switch (true) {
//         case /[\w$]/.test(str[i]):
//           word += str[i];
//           break;
//         case /[\d]/.test(str[i]):
//           split.push(word);
//           word = "";
//           number += str[i];
//           break;
//         case /['"]/.test(str[i]):
//           split.push(word);
//           word = "";
//           string += str[i];
//           break;
//         default:
//           split.push(word);
//           word = "";
//           split.push(str[i]);
//           break;
//       }
//     }else if(number.length > 0) {
//       switch (true) {
//         case /[\d]/.test(str[i]):
//           number += str[i];
//           break;
//         case /[\w$]/.test(str[i]):
//           split.push(number);
//           number = "";
//           word += str[i];
//           break;
//         case /['"]/.test(str[i]):
//           split.push(number);
//           number = "";
//           string += str[i];
//           break;
//         default:
//           split.push(number);
//           number = "";
//           split.push(str[i]);
//           break;
//       }
//     }else if(string.length > 0) {
//       switch (true) {
//         case (string[0] === str[i]):
//           string += str[i];
//           split.push(string)
//           string = "";
//           break;
//         default:
//           string += str[i];
//           break;
//       }
//     }else {
//       switch (true) {
//         case /[\w$]/.test(str[i]):
//           word += str[i];
//           break;
//         case /[\d]/.test(str[i]):
//           number += str[i];
//           break;
//         case /['"]/.test(str[i]):
//           string += str[i];
//           break;
//         default:
//           split.push(str[i]);
//           break;
//       }
//     }
//   }
//   // console.log('W', word, 'N', number, 'S', string);
//   split.push(word + number + string);
//   return split;
// };

// Main.prototype.getWords = function(array) {
//   let keywords = {};
//   let declaredVariables = {};

//   let dotOperatorFlag;
//   let variableDeclarationFlag;
//   for(let i=0; i<array.length; i++) {
//     if(/\./.test(array[i])) {
//       dotOperatorFlag = true;
//     }else if(["let","const","var","function"].includes(array[i])) {
//       // console.log('VARIABLE', array[i]);
//       variableDeclarationFlag = true;
//       if(!keywords[array[i]]) {
//         keywords[array[i]] = [i];
//       }else{
//         keywords[array[i]].push(i);
//       }
//     }else if(/^[a-zA-Z_$]+[\w$]*/.test(array[i])) { // Includes hyphens for wiki variables: /^[A-z_$]+[\w$-]*/
//       if(!dotOperatorFlag && !variableDeclarationFlag) {
//         if(declaredVariables[array[i]]) {
//           declaredVariables[array[i]].push(i);
//         }else if(!keywords[array[i]]) {
//           keywords[array[i]] = [i];
//         }else{
//           keywords[array[i]].push(i);
//         }
//       }else if(variableDeclarationFlag) {
//         if(!keywords[array[i]]) {
//           declaredVariables[array[i]] = [i];
//         }else{
//           this.errors.push(`"${array[i]}" redeclared or used prior to declaration`)
//         }
//         variableDeclarationFlag = false;
//       }else{
//         dotOperatorFlag = false;
//       }
//     }
//   }
//   // console.log(keywords);
//   // console.log(declaredVariables)
//   return {
//     keywords: keywords,
//     declaredVariables: declaredVariables
//   }
// };

// Main.prototype.checkAgainstSafeWords = function(words) {
//   const passedSafeCheck = [];
//   const failedSafeCheck = [];
//   Object.keys(words).forEach(word => {
//     if(this.safeWords.includes(word)) {
//       passedSafeCheck.push(word);
//     } else {
//       failedSafeCheck.push(word);
//     }
//   })
//   return {
//     passedSafeCheck: passedSafeCheck,
//     failedSafeCheck: failedSafeCheck
//   }
// };

// Main.prototype.checkAgainstWikiVariables = function(words) {
//   const wikiVariables = {};
//   words.forEach(word => {
//     const value = this.getVariable(word);
//     if(value) {
//       wikiVariables[word] = value;
//     } else {
//       this.errors.push(`"${word}" doesn't appear in whitelist or wiki variables`);
//     }
//   });
//   return wikiVariables;
// };

// Main.prototype.constructWikiVariableString = function(wikiVariables) {
//   let wikiVariableString = "";
//   Object.keys(wikiVariables).forEach(key => {
//     const variableDeclaration = `let ${key} = ${JSON.stringify(wikiVariables[key])}; `;
//     wikiVariableString += variableDeclaration;
//   });
//   return wikiVariableString;
// };

// /* May or may not be worth doing.
// Change wiki variable format "tv-wiki-link" to tvWikiLink.
// Main.prototype.javascriptifyVariableName = function(variableName) {
//   const variableArray = variableName.split("");
//   for(let i=0; i<variableArray.length; i++) {
//     if(variableArray[i] === "-") {
//       variableArray[i+1] = variableArray[i+1].toUpperCase();
//     }
//   }
//   return variableArray.join('').replace(/[-]/g, "");
// };
// */

// /*
// Main.prototype.getWords = function(str) {
//   // var re = new RegExp('[A-z]+[\w$]*', 'g');
// 	var re = new RegExp('[A-z]+[\w$]*', 'g');
//     let words = {};
//     let word;
//     while(word = re.exec(str)) {
//         if(!words[word[0]]) {
//         	words[word[0]] = [word.index];
//         }else {
//         	words[word[0]].push(word.index);
//         }
//     }
//     // console.log(Object.keys(words));
//     // console.log(words);
//     return words;
// };
// */

// Main.prototype.replaceWords = function(str, words, replacements) {
// 	for(let key of replacements) {
//     	if(words[key]) {
//         	let wordLength = replacements[key].length;
//             //words[key].forEach
//         }
//     }
// };

// /* Selectively refreshes this widget if needed and returns
//  * true if either this widget itself or one of its children
//  * needs to be re-rendered.
//  */
// Main.prototype.refresh = function(changedTiddlers) {
//   var changedAttributes = this.computeAttributes(),
//       hasChangedAttributes = $tw.utils.count(changedAttributes) > 0;
//   if (hasChangedAttributes) {
//       /* ... */
//   }
//   return this.refreshChildren(changedTiddlers) || hasChangedAttributes;
// };

Main.prototype.declareSafeWords = () => {
  this.safeWords = [
    "do",
    "if",
    "in",
    "for",
    "let",
    "new",
    "try",
    "var",
    "case",
    "else",
    "enum",
    "null",
    "true",
    "void",
    "with",
    "await",
    "break",
    "catch",
    "class",
    "const",
    "false",
    "super",
    "throw",
    "while",
    "yield",
    "delete",
    "export",
    "import",
    "public",
    "return",
    "static",
    "switch",
    "typeof",
    "default",
    "extends",
    "finally",
    "package",
    "private",
    "continue",
    "debugger",
    "function",
    "arguments",
    "interface",
    "protected",
    "implements",
    "instanceof",
    "undefined",
    "NaN",
    "Math",
    "Number",
    "Object",
    "Array",
    "Set",
    "Map",
    "Date",
    "alert",
    "console",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",
    "JSON",
    "parseFloat",
    "parseInt",
    "prototype",
    "String",
    "setTimeout",
    "setInterval",
    "isPrototypeOf",
    "isNaN",
    "toString",
    "of",
    "Boolean",
    "RegExp",
    "Infinity",
    "isFinite",
    "Function",
    "Symbol",
    "Error",
    "BigInt",
    "Generator",
    "GeneratorFunction",
    "Promise",
    "async",
    "await",
    "AsyncFunction"
  ];
};

// /*
// const reservedWords = [
//   'do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 'eval', 'null', 'true', 'this', 'void', 'with', 'await', 'break', 'catch', 'class', 'const', 'false', 'super', 'throw', 'while', 'yield', 'delete', 'export', 'import', 'public', 'return', 'static', 'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private', 'continue', 'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 'instanceof',
//   'undefined', 'NaN', 'Math', 'Number', 'Object', 'Array', 'Set', 'Map', 'Date', 'alert', 'console', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'JSON', 'parseFloat', 'parseInt', 'prototype', 'String', 'setTimeout', 'setInterval', 'isPrototypeOf', 'isNaN', 'toString', 'of', 'Boolean', 'RegExp', 'Infinity', 'isFinite', 'Function', 'Symbol', 'Error', 'BigInt', 'Generator', 'GeneratorFunction', 'Promise', 'async', 'await', 'AsyncFunction'
// ]
// */

module.exports = Main;
