import ConfigMask from './../src/';


describe('Config Mask', function () {

  let x = new ConfigMask({
    type: 'set',
    values: ['aaa', 'bbb'],
    default: 'bbb'
  });

  it('use default value', function () {
    expect(x.sanitize()).toEqual('bbb');
  });

  it('use valid value', function () {
    expect(x.sanitize('aaa')).toEqual('aaa');
  });

  it('use default value on invalid input', function () {
    expect(x.sanitize('xxx')).toEqual('bbb');
  });

  it('should use first value as default if not defined', function () {
    x = new ConfigMask({
      type: 'set',
      values: ['aaa', 'bbb']
    });
    expect(x.sanitize()).toEqual('aaa');
  });

});
