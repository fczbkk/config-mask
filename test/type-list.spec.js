import ConfigMask from './../src/';


describe('type: list', function () {

  let x = new ConfigMask({
    type: 'list',
    values: ['aaa', 'bbb']
  });

  it('should use empty array as default value', function () {
    expect(x.sanitize()).toEqual([]);
  });

  it('should allow valid values', function () {
    expect(x.sanitize(['aaa', 'bbb'])).toEqual(['aaa', 'bbb']);
  });

  it('should reject invalid values', function () {
    expect(x.sanitize(['xxx', 'yyy'])).toEqual([]);
  });

  it('should pass valid values and filter out invalid values', function () {
    expect(x.sanitize(['aaa', 'xxx'])).toEqual(['aaa']);
  });

  it('should convert single valid value input to array', function () {
    expect(x.sanitize('aaa')).toEqual(['aaa']);
  });

  it('should convert single invalid value input to array', function () {
    expect(x.sanitize('xxx')).toEqual([]);
  });

});
