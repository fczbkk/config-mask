import ConfigMask from './../src/';


describe('validate', function () {

  it('should return `true` if not set', function () {
    const x = new ConfigMask({
      type: 'text'
    });
    expect(x.validate('aaa')).toEqual(true);
  });

  it('should return `true` if valid', function () {
    const x = new ConfigMask({
      type: 'text',
      validate: function (input) {return input === 'aaa';}
    });
    expect(x.validate('aaa')).toEqual(true);
  });

  it('should return `false` if invalid', function () {
    const x = new ConfigMask({
      type: 'text',
      validate: function (input) {return input === 'aaa';}
    });
    expect(x.validate('xxx')).toEqual(false);
  });

  it('should be applied in sanitation after being parsed', function () {
    const x = new ConfigMask({
      type: 'text',
      default: 'bbb',
      validate: function (input) {return input.length === 6;}
    });
    expect(x.sanitize('aaa')).toEqual('bbb');

    x.updateOptions({
      parse: function (input) {return input + 'bbb'}
    });
    expect(x.sanitize('aaa')).toEqual('aaabbb');
  });

});

describe('validate after', function () {

  it('should be applied in sanitation after being sanitized', function () {
    const x = new ConfigMask({
      type: 'text',
      validate_after: function () {return false;},
      default: null
    });
    expect(x.sanitize('aaa')).toEqual(null);
  });

});
