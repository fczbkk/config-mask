import ConfigMask from './../src/';


describe('type: dual', function () {

  const array_config = new ConfigMask({
    type: 'array',
    default: null
  });

  const navigation_controls_config = {
    type: 'set',
    values: ['previous', 'current', 'next'],
    default: null
  };

  const x = new ConfigMask({
    type: 'combined',
    submasks: [navigation_controls_config, array_config],
    default: 'aaa'
  });

  it('should use default value in empty input', function () {
    const empty_test_config = new ConfigMask({
      type: 'combined',
      submasks: [navigation_controls_config],
      default: 'aaa'
    });

    expect(empty_test_config.sanitize()).toEqual('aaa');
  });

  it('should use default value', function () {
    expect(x.sanitize(123)).toEqual('aaa');
    expect(x.sanitize('xxx')).toEqual('aaa');
  });

  it('should detect types in order, handle first that matches', function () {
    expect(x.sanitize('next')).toEqual('next');
    expect(x.sanitize(['aaa', 'bbb'])).toEqual(['aaa', 'bbb']);
  });

  it('should treat array of types as list of strict types', function () {
    const mask = new ConfigMask({
      type: 'combined',
      submasks: ['function', 'string']
    });
    const fn = function () {};
    expect(mask.sanitize(fn)).toEqual(fn);
    expect(mask.sanitize('aaa')).toEqual('aaa');
  });

});
