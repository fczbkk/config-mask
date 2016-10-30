import ConfigMask from './../src/';


describe('strict type', function () {

  const x = new ConfigMask({
    type: 'string:strict',
    default: 'bbb'
  });

  it('should work with correct type', function () {
    expect(x.sanitize('aaa')).toEqual('aaa');
  });

  it('should not coerce any other type', function () {
    expect(x.sanitize(123)).toEqual('bbb');
  });

});
