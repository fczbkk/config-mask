# Config Mask

Helper that takes care of validating, sanitizing and coercing of complex config objects.

[![npm](https://img.shields.io/npm/v/@fczbkk/config-mask.svg?maxAge=2592000)](https://www.npmjs.com/package/@fczbkk/config-mask)
[![npm](https://img.shields.io/github/license/fczbkk/config-mask.svg?maxAge=2592000)](https://github.com/fczbkk/config-mask/blob/master/LICENSE)
[![David](https://img.shields.io/david/fczbkk/config-mask.svg?maxAge=2592000)](https://david-dm.org/fczbkk/config-mask)
[![Travis](https://img.shields.io/travis/fczbkk/config-mask.svg?maxAge=2592000)](https://travis-ci.org/fczbkk/config-mask)

## How to use

Install the library via NPM:

```shell
npm install @fczbkk/config-mask --save
```

Then use in your project like this:

```javascript
import ConfigMask from '@fczbkk/config-mask';
```

### Simple value

The simplest use is a coercion of input value.

```javascript
var numeric_value = new ConfigMask({
  type: 'number',
  default: 0
});

// use default value when input is missing
numeric_value.sanitze();  // 0

// use default value when input is invalid
numeric_value.sanitize('xxx');  // 0

// use valid value
numeric_value.sanitize(100);  // 100

// convert value to expected type if possible
numeric_value.sanitize('100');  // 100
```

### Any value

You can use type `any` to accept any type of input. It will not check the type nor sanitize it to any specific type.

```javascript
var any_value = new ConfigMask({
  type: 'any'
});

any_value.sanitize(); // undefined
any_value.sanitize('aaa') // 'aaa'
any_value.sanitize(123) // '123'
```

You can still use any other options. For example default value, which will be used when input is undefined:

```javascript
var any_value = new ConfigMask({
  type: 'any',
  default: 'n/a'
});

any_value.sanitize(); // 'n/a'
any_value.sanitize('aaa') // 'aaa'
```

Or you can use parser to transform input value:

```javascript
var any_value = new ConfigMask({
  type: 'any',
  parse: function (input) {return typeof input;}
});

any_value.sanitize(); // 'undefined'
any_value.sanitize('aaa') // 'string'
```

### Set

You can define set of valid values that can be used.

```javascript
var set_value = new ConfigMask({
  type: 'set',
  values: ['aaa', 'bbb'],
  default: 'aaa'
});

// use valid value
set_value.sanitize('aaa'); // 'aaa'

// use default value on missing or invalid input
set_value.sanitize(); // 'aaa'
set_value.sanitize('xxx'); // 'aaa'
```

If you don't set default value, first of the valid values will be used:

```javascript
var set_value = new ConfigMask({
  type: 'set',
  values: ['aaa', 'bbb']
});

set_value.sanitize(); // 'aaa'
```

### List

Same as `set`, but for lists of values from defined set.

```javascript
var list_value = new ConfigMask({
  type: 'list',
  values: ['aaa', 'bbb']
});

// valid values are fine, invalid ones are filtered out
list_value.sanitize(['aaa', 'xxx', 'bbb']); // ['aaa', 'bbb']

// single value is converted to array
list_value.sanitize('aaa'); // ['aaa']

// default value is always empty array
list_value.sanitize(); // []
```

### List of...

Type `list_of` will produce an array with values of specific type.

-   You can use `subtype` property to define type of values in array.
-   You can use `submask` property to define ConfigMask that will be applied to values in array.
-   If both `subtype` and `submask` properties are defined, `submask` will be used.
-   If neither `subtype` nor `submask` property is defined, the array will accept values of any types.

```javascript
var list_of_strings = new ConfigMask({
  type: 'list_of',
  subtype: 'text'
});
list_of_strings.sanitize(['aaa', null, 123]); // ['aaa', '', '123']

var list_of_objects = new ConfigMask({
  type: 'list_of',
  submask: {
    type: 'object',
    properties: {
      value: 'number',
      unit: 'text'
    },
    default: {
      value: 0,
      unit: 'px'
    }
  }
});
list_of_objects.sanitize([{value: 10, unit: 'cm'}, 'xxx']);
// [{value: 10, unit: 'cm'}, {value: 0, unit: 'px'}]
```

You can use `filter` property to define function for filtering out unwanted values.

```javascript
var list_of_short_strings = new ConfigMask({
  type: 'list_of',
  subtype: 'text',
  filter: function (input) {return input.length <= 3;}
});
list_of_short_strings.sanitize(['aaa', 'abcdefgh', 'bbb']); // ['aaa', 'bbb']
```

### Custom value types

You can write your own value types, using [Coerce](https://github.com/InlineManual/coerce/).

```javascript
var array_of_strings = new ConfigMask({
  type: {
    string: function (input) {
      return [input];
    },
    array: function (input) {
      return input.map(function (item) {
        return item.toString();
      })
    }
  },
  default: []
});

array_of_strings.sanitize(); // []
array_of_strings.sanitize('aaa'); // ['aaa']
array_of_strings.sanitize(['aaa', 'bbb']); // ['aaa', 'bbb']
```

### Custom validation

You can create masks with very specific rules using custom validation method.

```javascript
var positive_number = new ConfigMask({
  type: 'number',
  validate: function (input) {return number > 0;},
  default: 1
});
positive_number.sanitize(10); // 10
positive_number.sanitize(-10); // 1 (default value)
```

To simplify debugging or error reporting, you can use `on_invalid` method. It will be called when sanitizing the input and it will receive the input as parameter.

```javascript
var positive_number = new ConfigMask({
  type: 'number',
  validate: function (input) {return number > 0;},
  on_invalid: function (input) {
    console.log('Only positive numbers allowed. You have used ' + input + '.');
  },
  default: 1
});
```

In some cases, it may be helpful to validate the result after it has been sanitized. For example when dealing with complex objects with various sub-properties, where the end result of sanitation may depend on results of sanitation of properties.

```javascript
var value_with_unit = ConfigMask({
  type: 'object',
  properties: {
    value: {type: 'number'},
    unit: {type: 'string'}
  },
  default: null,
  validate_after: function (input) {
    // if either `value` or `unit` is not set, sanitize to `nul` (default value)
    return input.value !== 0 && value.unit !== '';
  }
});
```

### Simple objects

You can simply set the value to be an object:

```javascript
var my_object = new ConfigMask({
  type: 'object'
});

my_object.sanitize(); // {}
my_object.sanitize('aaa'); // {}
my_object.sanitize({aaa: 'bbb'}); // {aaa: 'bbb'}
```

You can define a list of properties that the resulting object should have. Properties not on the list will be ignored. Missing properties will be added with `undefined` value:

```javascript
var person_name = new ConfigMask({
  type: 'object',
  properties: ['first_name', 'last_name']
});

var sanitized_name = person_name.sanitize({
  first_name: 'John',
  occupation: 'programmer'
});

sanitized_name.first_name; // 'John'
sanitized_name.last_name; // undefined
sanitized_name.occupation; // undefined (ignored)
```

### Complex objects

This is why I created ConfigMask. Sanitize complex configuration objects without going through all the properties and checking them manually.

```javascript
var value_config = {
  type: 'number',
  default: 0
};

var unit_config = {
  type: 'set',
  values: ['px', '%'],
  default: 'px'
};

var size_config = new ConfigMask({
  type: 'object',
  properties: {
    value: value_config,
    unit: unit_config
  }
});

// use default values when input is missing
size_config.sanitize(); // {value: 0, unit: 'px'}

// add missing properties
size_config.sanitize({value: 100}); // {value: 100, unit: 'px'}

// ignore unknown properties
size_config.sanitize({xxx: 'yyy'}); // {value: 0, unit: 'px'}
```

#### Keep properties

By default, all undefined properties will be removed:

```javascript
var my_config = {
  type: 'object',
  properties: {
    aaa: 'text'
  }
}

// property `ccc` will be removed
my_config.sanitize({aaa: 'bbb', ccc: 'ddd'}); // {aaa: 'bbb'}
```

If you want to keep undefined properties intact, add `keep_property` to config with truthy value:

```javascript
var my_config = {
  type: 'object',
  properties: {
    aaa: 'text'
  },
  keep_properties: true
}

// property `ccc` will remain unchanged
my_config.sanitize({aaa: 'bbb', ccc: 'ddd'}); // {aaa: 'bbb', ccc: 'ddd'}
```

### Nesting

You can nest ConfigMask objects together, creating very complex and interconnected types.

```javascript
// Both of these objects work as standalone config mask...

var value_config = new ConfigMask({
  type: 'number',
  default: 0
});

var unit_config = new ConfigMask({
  type: 'set',
  values: ['px', '%'],
  default: 'px'
});

// ... but they are also used in this config mask to create more complex type.

var size_config = new ConfigMask({
  type: 'object',
  properties: {
    value: value_config,
    unit: unit_config
  }
});
```

### Combined configs

If you need to accept various input types in configs, you can use "combined" type. It will sanitize input value through all the submasks and use first non-null result.

```javascript
var navigation_config = {
  type: 'set',
  values: ['previous', 'next'],
  default: null
};

var index_config = {
  type: 'number',
  default: 0
}

var combined_config = new ConfigMask({
  type: 'combined',
  submasks: [navigation_config, index_config]
});

combined_config.sanitize('previous'); // 'previous'
combined_config.sanitize(123);        // 123
combined_config.sanitize('xxx');      // 0
```

### Cloning to make variations

Sometimes you want to create a variation of existing ConfigMask. For example, you want the same config, but different default value. The easy way to do this is to use `clone()` method.

```javascript
var person_age = new ConfigMask({
  type: 'number',
  default: 0
});
var old_person_age = person_age.clone({default: 60});

person_age.sanitize('xxx');     // 0
old_person_age.sanitize('xxx'); // 60
```

## Documentation

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Configuration

ConfigMask's configuration object.

**Properties**

-   `type` **\[([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))]** Identifier of item type (e.g. "number", "array") or custom config for Coerce object (<https://github.com/InlineManual/coerce/>).
-   `default` **\[any]** Default value to be used when input is invalid or missing.
-   `values` **\[[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)]** If `type` is "set", this is the list of valid values.
-   `properties` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** If `type` is "object", this is the list of its properties. The values should be `Configuration` objects.
-   `keep_properties` **\[[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)]** If type is "object" and "properties" are defined, unspecified properties of the object will not be removed.
-   `submasks` **\[[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;([Configuration](#configuration) \| [ConfigMask](#configmask))>]** List of sub-masks to be used when type is set to "combined". Sub-masks are evaluated in given order. First one that returns non-null value is used.
-   `submask` **\[([Configuration](#configuration) \| [ConfigMask](#configmask))]** Mask to be used when type is set to `list_of`. This property has priority over `subtype`
-   `subtype` **\[([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))]** Type of value allowed to be used when type is set to `list_of`.
-   `parse` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** If set, it will be used to transform input before it is being sanitized.
-   `validate` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** When sanitizing, passes parsed input through validator. If it does not pass, default value is used instead.
-   `validate_after` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** Same as `validate`, but applied after the sanitation is done. This is useful for complex object types, where end result of sanitation may depend on result of sanitation of some of the properties.
-   `on_invalid` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** Called when input is evaluated as invalid when sanitizing.
-   `filter` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** If set, it will be used by `list_of` type to filter out values from result.

### ConfigMask

Class representing ConfigMask.

#### constructor

Create ConfigMask.

**Parameters**

-   `config` **\[[Configuration](#configuration)](default {})** 

#### setOptions

Sets object's options.

**Parameters**

-   `config` **[Configuration](#configuration)** 

#### updateOptions

Adds new properties and replaces existing properties in object's options.

**Parameters**

-   `config` **[Configuration](#configuration)** 

#### sanitize

Applies config mask to input and returns sanitized value.

**Parameters**

-   `input` **\[any]** 
-   `param` **\[any]** Parameter that will be added to all subsequent calls of `sanitize()`, `parse()` and `validate()`.

Returns **any** 

#### parse

Apply parse function on input, return unchanged input if not set.

**Parameters**

-   `input`  
-   `param` **any** Will be passed as second parameter to the parse function.

**Examples**

_Add prefix to all texts._

```javascript
var prefixed_text = new ConfigMask({
  type: 'text',
  parse: function (input) {return 'bbb' + input;}
});
prefixed_text.sanitize('aaa'); // 'aaabbb'
```

Returns **any** 

#### validate

Validates input. Used to check parsed input before being used in sanitation.

**Parameters**

-   `input`  
-   `param` **any** Will be passed as second parameter to the validate function.
-   `validation_function` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)](default this.\_options.validate)** Function to be used to validate input.

**Examples**

_Limit maximum length of input._

```javascript
var max_three_characters = new ConfigMask({
  type: 'text',
  validate: function (input) {return input.length <= 3;}
});
max_three_characters.sanitize('aaa'); // 'aaa'
max_three_characters.sanitize('aaabbb'); // ''
```

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

#### clone

Creates exact copy of original object, updates the options with new ones.

**Parameters**

-   `config` **\[[Configuration](#configuration)](default {})** 

Returns **[ConfigMask](#configmask)** 

### ensureArray

Makes sure that input is an array. If input is undefined, an empty array is returned.

**Parameters**

-   `input` **any** 

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

### applyFilter

If filter function is defined, applies it to data. Otherwise returns data unchanged.

**Parameters**

-   `data` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 
-   `filter_function` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** 

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

## Bug reports, feature requests and contact

If you found any bugs, if you have feature requests or any questions, please, either [file an issue at GitHub](https://github.com/fczbkk/config-mask/issues) or send me an e-mail at <a href="mailto:riki@fczbkk.com">riki@fczbkk.com</a>.

## License

Config Mask is published under the [MIT license](https://github.com/fczbkk/config-mask/blob/master/LICENSE).
