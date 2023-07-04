'use strict';

/**
 * Utility methods
 */
class Util {
  constructor() {
      throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
  }
  
  /**
   * Format phone number.
   * @param {String} number Default properties
   * @returns {String}
   * @private
   */
  static formatPhoneNumber(number) {
    const numberDDI = number.substr(0, 2);
    const numberDDD = number.substr(2, 2);
    const numberUser = number.substr(-8, 8);
    
    if (numberDDI !== "55") {
      number = number + "@c.us";
    }
    else if (numberDDI === "55" && parseInt(numberDDD) <= 30) {
      number = "55" + numberDDD + "9" + numberUser + "@c.us";
    }
    else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
      number = "55" + numberDDD + numberUser + "@c.us";
    }
      
    return number;
  }
  
}
module.exports = Util;