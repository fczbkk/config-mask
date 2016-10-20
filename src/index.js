import constructCoertor from '@inlinemanual/coerce';
import arrayReduce from 'array-reduce-prototypejs-fix';


/**
 * ConfigMask's configuration object.
 * @typedef {Object} Configuration
 * @property {string|Object} [type] - Identifier of item type (e.g. "number", "array") or custom config for Coerce object (https://github.com/InlineManual/coerce/).
 * @property {*} [default] - Default value to be used when input is invalid or missing.
 * @property {Array} [values] - If `type` is "set", this is the list of valid values.
 * @property {Object} [properties] - If `type` is "object", this is the list of its properties. The values should be `Configuration` objects.
 * @property {Array.<Configuration|ConfigMask>} [submasks] - List of sub-masks to be used when type is set to "combined". Sub-masks are evaluated in given order. First one that returns non-null value is used.
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

      case 'list': {
        // convert single-value input to array
        if (!Array.isArray(input)) {input = [input];}
        // filter out invalid values
        result = input.filter(
          item => this._options.values.indexOf(item) !== -1
        );
        break;
      }

      case 'combined': {
        const submasks = this._options.submasks.map(getConfigMask);
        result = arrayReduce(submasks, function (previous, current) {
          return previous === null
            ? current.sanitize(input)
            : previous;
        }, null);
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

  const properties_config = normalizePropertiesList(config.properties);

  if (typeof properties_config === 'undefined') {
    return input;
  } else {
    const result = {};

    Object.keys(properties_config).forEach((key) => {
      const val = properties_config[key];
      const sub_mask = getConfigMask(val);
      result[key] = sub_mask.sanitize(input[key]);
    });

    return result;
  }
}


/**
 * Transform array of properties to config object, if necessary.
 * @param {Object|Array} properties
 * @returns {Object}
 * @ignore
 */
function normalizePropertiesList (properties) {
  if (Array.isArray(properties)) {
    return arrayReduce(properties, function (previous, current) {
      previous[current] = {type: 'any'};
      return previous;
    }, {});
  }
  return properties;
}


/**
 * Selects default value based on type.
 * @param {Object} options
 * @returns {*}
 * @ignore
 */
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


/**
 * Accepts either config object or ConfigMask. Makes sure to return ConfigMask.
 * @param {Object|ConfigMask} input
 * @returns {ConfigMask}
 * @ignore
 */
function getConfigMask (input) {
  if (typeof input === 'string') {
    input = {
      type: constructStrictCoercer(input),
      default: null
    };
  }

  return (input instanceof ConfigMask)
    ? input
    : new ConfigMask(input);
}


const non_coercer = {
  null: null,
  array: null,
  string: null,
  number: null,
  undefined: null,
  boolean: null,
  object: null,
  function: null
};


function constructStrictCoercer (type) {
  const overwrite = {};
  overwrite[type] = (input) => input;
  return Object.assign({}, non_coercer, overwrite);
}
