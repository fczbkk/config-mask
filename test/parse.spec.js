import ConfigMask from './../src/';


describe('parse', function () {

  it('should return unchanged value if not set', function () {
    const x = new ConfigMask({
      type: 'text'
    });
    expect(x.sanitize('aaa')).toEqual('aaa');
  });

  it('should return changed value if set', function () {
    const x = new ConfigMask({
      type: 'text',
      parse: function (input) {return input + 'bbb';}
    });
    expect(x.sanitize('aaa')).toEqual('aaabbb');
  });

});
