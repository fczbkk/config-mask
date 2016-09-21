import constructCoertor from '@inlinemanual/coerce';


/**
 * ConfigMask's configuration object.
 * @typedef {Object} Configuration
 * @property {string} [type] - Identifier of item type (e.g. "number", "array").
 * @property {*} [default] - Default value to be used when input is invalid or missing.
 * @property {Array} [values] - If `type` is "set", this is the list of valid values.
 * @property {Object} [properties] - If `type` is "object", this is the list of its properties. The values should be `Configuration` objects.
 * @property {Function} [parse] - If set, it will be used to transform input before it is being sanitized.
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
    let result = null;

    input = this.parse(input);

    switch (this._options.type) {

      case 'object': {
        result = handleObjectType(input, this._options);
        break;
      }

      case 'set': {
        // if default value is not set, use first available value
        const default_value = (typeof this._options.default === 'undefined')
          ? this._options.values[0]
          : this._options.default;
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

    return (result === null) ? this._options.default : result;
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
