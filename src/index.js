import constructCoertor from '@inlinemanual/coerce';
import arrayReduce from 'array-reduce-prototypejs-fix';


/**
 * ConfigMask's configuration object.
 * @typedef {Object} Configuration
 * @property {string} [type] - Identifier of item type (e.g. "number", "array").
 * @property {*} [default] - Default value to be used when input is invalid or missing.
 * @property {Array} [values] - If `type` is "set", this is the list of valid values.
 * @property {Object} [properties] - If `type` is "object", this is the list of its properties. The values should be `Configuration` objects.
 * @property {Function} [parse] - If set, it will be used to transform input before it is being sanitized.
 * @property {Function} [validate] - When sanitizing, passes parsed input through validator. If it does not pass, default value is used instead.
 */


/**
 * Class representing ConfigMask.
 */
export default class ConfigMask {

  /**
   * Create ConfigMask.
   * @param {Configuration} config
   */
  constructor (config = {}) {
    this._options = {};
    this.setOptions(config);
  }

  /**
   * Sets object's options.
   * @param {Configuration} config
   */
  setOptions (config) {
    this._options = config;
  }

  /**
   * Adds new properties and replaces existing properties in object's options.
   * @param {Configuration} config
   */
  updateOptions (config) {
    Object.assign(this._options, config);
  }

  /**
   * Applies config mask to input and returns sanitized value.
   * @param {*} [input]
   * @returns {*}
   */
  sanitize (input) {
    const default_value = getDefaultValue(this._options);
    let result = null;

    input = this.parse(input);

    // ignore input if it is not valid, default value will be used
    if (!this.validate(input)) {
      input = default_value;
    }

    switch (this._options.type) {

      case 'any': {
        result = typeof input === 'undefined' ? default_value : input;
        break;
      }

      case 'object': {
        result = handleObjectType(input, this._options);
        break;
      }

      case 'set': {
        result = (this._options.values.indexOf(input) === -1)
          ? default_value
          : input;
        break;
      }

      default: {
        const coerce = constructCoertor(this._options.type);
        result = coerce(input);
        break;
      }

    }

    return (result === null) ? default_value : result;
  }

  /**
   * Apply parse function on input, return unchanged input if not set.
   * @param input
   * @returns {*}
   *
   * @example <caption>Add prefix to all texts.</caption>
   * var prefixed_text = new ConfigMask({
   *   type: 'text',
   *   parse: function (input) {return 'bbb' + input;}
   * });
   * prefixed_text.sanitize('aaa'); // 'aaabbb'
   */
  parse (input) {
    return (typeof this._options.parse === 'function')
      ? this._options.parse(input)
      : input;
  }

  /**
   * Validates input. Used to check parsed input before being used in sanitation.
   * @param input
   * @returns {boolean}
   *
   * @example <caption>Limit maximum length of input.</caption>
   * var max_three_characters = new ConfigMask({
   *   type: 'text',
   *   validate: function (input) {return input.length <= 3;}
   * });
   * max_three_characters.sanitize('aaa'); // 'aaa'
   * max_three_characters.sanitize('aaabbb'); // ''
   */
  validate (input) {
    return (typeof this._options.validate === 'function')
      ? !!this._options.validate(input)
      : true;
  }

}


/**
 * Checks whether input is Object (not `null` or `Array`, etc.).
 * @param {*} input
 * @returns {boolean}
 * @ignore
 */
function isObject (input) {
  return Object.prototype.toString.call(input) === '[object Object]';
}


/**
 * Sanitizes input of type "object". Goes through all properties and sets their value.
 * @param {*} input
 * @param {Configuration} config
 * @returns {Object}
 * @ignore
 */
function handleObjectType (input, config) {
  if (!isObject(input)) {
    input = {};
  }

  // if properties is an array, convert it to object of any types
  // TODO refactor
  if (Array.isArray(config.properties)) {
    config.properties = arrayReduce(config.properties, function (previous, current) {
      previous[current] = {type: 'any'};
      return previous;
    }, {});
  }

  if (typeof config.properties === 'undefined') {
    return input;
  } else {
    const result = {};

    Object.keys(config.properties).forEach((key) => {
      const val = config.properties[key];
      const sub_mask = (val instanceof ConfigMask)
        ? val
        : new ConfigMask(val);
      result[key] = sub_mask.sanitize(input[key]);
    });

    return result;
  }
}


function getDefaultValue (options = {}) {
  switch (options.type) {

    case 'set':
      // if default value is not set, use first available value
      return (typeof options.default === 'undefined')
        ? options.values[0]
        : options.default;

    default:
      return options.default;

  }
}
