import constructCoercer from '@inlinemanual/coerce';
import arrayReduce from 'array-reduce-prototypejs-fix';


/**
 * ConfigMask's configuration object.
 * @typedef {Object} Configuration
 * @property {string|Object} [type] - Identifier of item type (e.g. "number", "array") or custom config for Coerce object (https://github.com/InlineManual/coerce/).
 * @property {*} [default] - Default value to be used when input is invalid or missing.
 * @property {Array} [values] - If `type` is "set", this is the list of valid values.
 * @property {Object} [properties] - If `type` is "object", this is the list of its properties. The values should be `Configuration` objects.
 * @property {boolean} [keep_properties] - If type is "object" and "properties" are defined, unspecified properties of the object will not be removed.
 * @property {Array.<Configuration|ConfigMask>} [submasks] - List of sub-masks to be used when type is set to "combined". Sub-masks are evaluated in given order. First one that returns non-null value is used.
 * @property {Configuration|ConfigMask} [submask] - Mask to be used when type is set to `list_of`. This property has priority over `subtype`
 * @property {string|Object} [subtype] - Type of value allowed to be used when type is set to `list_of`.
 * @property {Function} [parse] - If set, it will be used to transform input before it is being sanitized.
 * @property {Function} [validate] - When sanitizing, passes parsed input through validator. If it does not pass, default value is used instead.
 * @property {Function} [validate_after] - Same as `validate`, but applied after the sanitation is done. This is useful for complex object types, where end result of sanitation may depend on result of sanitation of some of the properties.
 * @property {Function} [on_invalid] - Called when input is evaluated as invalid when sanitizing.
 * @property {Function} [filter] - If set, it will be used by `list_of` type to filter out values from result.
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
   * @param {*} [param] - Parameter that will be added to all subsequent calls of `sanitize()`, `parse()` and `validate()`.
   * @returns {*}
   */
  sanitize (input, param) {
    const default_value = getDefaultValue(this._options);
    let result = null;

    input = this.parse(input, param);

    // ignore input if it is not valid, default value will be used
    if (!this.validate(input, param)) {
      input = default_value;
    }

    switch (this._options.type) {

      case 'any': {
        result = (typeof input === 'undefined')
          ? default_value
          : input;
        break;
      }

      case 'object': {
        result = handleObjectType(input, this._options, param);
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
        input = ensureArray(input);
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
            ? current.sanitize(input, param)
            : previous;
        }, null);
        break;
      }

      case 'list_of': {
        result = handleListOfType(input, this._options, param);
        break;
      }

      default: {
        let coercer_config = this._options.type;

        // if type identifier is followed by ":strict", it should be strict
        if (typeof coercer_config === 'string') {
          const [type, strict] = coercer_config.split(':');
          coercer_config = (strict === 'strict')
            ? constructStrictCoercerConfig(type)
            : type;
        }

        const coerce = constructCoercer(coercer_config);

        result = coerce(input);
        break;
      }

    }

    if (!this.validate(result, param, this._options.validate_after)) {
      result = null;
    }

    return (result === null) ? default_value : result;
  }

  /**
   * Apply parse function on input, return unchanged input if not set.
   * @param input
   * @param {*} param - Will be passed as second parameter to the parse function.
   * @returns {*}
   *
   * @example <caption>Add prefix to all texts.</caption>
   * var prefixed_text = new ConfigMask({
   *   type: 'text',
   *   parse: function (input) {return 'bbb' + input;}
   * });
   * prefixed_text.sanitize('aaa'); // 'aaabbb'
   */
  parse (input, param) {
    return (typeof this._options.parse === 'function')
      ? this._options.parse(input, param)
      : input;
  }

  /**
   * Validates input. Used to check parsed input before being used in sanitation.
   * @param input
   * @param {*} param - Will be passed as second parameter to the validate function.
   * @param {Function} validation_function - Function to be used to validate input.
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
  validate (input, param, validation_function = this._options.validate) {
    const result = (typeof validation_function === 'function')
      ? !!validation_function(input, param)
      : true;

    if (result === false && typeof this._options.on_invalid === 'function') {
      this._options.on_invalid(input, param);
    }

    return result;
  }

  /**
   * Creates exact copy of original object, updates the options with new ones.
   * @param {Configuration} config
   * @returns {ConfigMask}
   */
  clone (config = {}) {
    return new ConfigMask(Object.assign({}, this._options, config));
  }

}


/**
 * Sanitizes input of type "list_of". Makes sure the result is a list containing only valid values.
 * @param {*} input
 * @param {Configuration} config
 * @param {*} param
 * @returns {Object}
 * @ignore
 */
function handleListOfType (input, config, param) {
  let {submask, subtype} = config;

  // convert single-value input to array
  let result = ensureArray(input);

  // if neither `submask` nor `subtype` is defined, pass through any value types
  if (typeof submask === 'undefined' && typeof subtype === 'undefined') {
    submask = {type: 'any'};
  }

  if (typeof submask !== 'undefined') {
    // submask
    const mask = getConfigMask(submask);
    result = result.map(item => mask.sanitize(item, param));
  } else {
    // subtype
    const coerce = constructCoercer(subtype);
    result = result.map(coerce);
  }

  return applyFilter(result, config.filter);
}


/**
 * Sanitizes input of type "object". Goes through all properties and sets their value.
 * @param {*} input
 * @param {Configuration} config
 * @param {*} param
 * @returns {Object}
 * @ignore
 */
function handleObjectType (input, config, param) {
  if (!isObject(input)) {
    input = {};
  }

  const properties_config = normalizePropertiesList(config.properties);

  if (typeof properties_config === 'undefined') {
    return input;
  } else {
    const result = (!!config.keep_properties === true)
      ? Object.assign({}, input)
      : {};

    Object.keys(properties_config).forEach((key) => {
      const val = properties_config[key];
      const sub_mask = getConfigMask(val);
      result[key] = sub_mask.sanitize(input[key], param);
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
 * @param {string|Object|ConfigMask} input
 * @returns {ConfigMask}
 * @ignore
 */
function getConfigMask (input) {
  if (typeof input === 'string') {
    input = {
      type: constructStrictCoercerConfig(input),
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


/**
 * Constructs coercer that only lets through selected type and returns `null` for any other type.
 * @param {string} type
 * @returns {*}
 * @ignore
 */
function constructStrictCoercerConfig (type) {
  const overwrite = {};
  overwrite[type] = (input) => input;
  return Object.assign({}, non_coercer, overwrite);
}


/**
 * Makes sure that input is an array. If input is undefined, an empty array is returned.
 * @param {*} input
 * @returns {Array}
 */
function ensureArray (input) {
  return (!Array.isArray(input))
    ? (typeof input === 'undefined' ? [] : [input])
    : input;
}


/**
 * If filter function is defined, applies it to data. Otherwise returns data unchanged.
 * @param {Array} data
 * @param {Function} filter_function
 * @returns {Array}
 */
function applyFilter (data, filter_function) {
  return (typeof filter_function === 'function')
    ? data.filter(filter_function)
    : data;
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
