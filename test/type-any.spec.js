import ConfigMask from './../src/';


describe('type: any', function () {

  it('should keep input unchanged', function () {
    const x = new ConfigMask({
      type: 'any'
    });

    expect(typeof x.sanitize()).toEqual('undefined');
    expect(x.sanitize('aaa')).toEqual('aaa');
    expect(x.sanitize(123)).toEqual(123);
    expect(x.sanitize(['aaa', 'bbb'])).toEqual(['aaa', 'bbb']);
    expect(x.sanitize({aaa: 'bbb'})).toEqual({aaa: 'bbb'});
  });

  it('should use default value if undefined', function () {
    const x = new ConfigMask({
      type: 'any',
      default: 'aaa'
    });

    expect(x.sanitize()).toEqual('aaa');
    expect(x.sanitize('bbb')).toEqual('bbb');
  });

  it('should apply parse function', function () {
    const x = new ConfigMask({
      type: 'any',
      parse: function (input) {return typeof input;}
    });

    expect(x.sanitize()).toEqual('undefined');
    expect(x.sanitize('bbb')).toEqual('string');
  });

});
