import ConfigMask from './../src/';


describe('type: object', function () {

  it('should handle predefined property types', function () {
    const x = new ConfigMask({
      type: 'object',
      properties: {
        aaa: {type: 'text'}
      }
    });
    expect(x.sanitize()).toEqual({aaa: ''});
  });

  it('should handle property list', function () {
    const x = new ConfigMask({
      type: 'object',
      properties: ['aaa', 'bbb']
    });
    expect(x.sanitize({aaa: 'bbb', ccc: 'ddd'}))
      .toEqual({aaa: 'bbb', bbb: undefined});
  });

  it('should handle object with free properties', function () {
    const x = new ConfigMask({
      type: 'object'
    });
    const data = {aaa: 'bbb', ccc: 'ddd'};
    expect(x.sanitize(data)).toEqual(data);
  });

});
