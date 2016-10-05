import ConfigMask from './../src/';


describe('type: custom', function () {

  const array_of_strings = new ConfigMask({
    type: {
      string: (input) => [input],
      array: (input) => input.map(item => item.toString())
    },
    default: []
  });

  it('should handle custom coertor', function () {
    expect(array_of_strings.sanitize()).toEqual([]);
    expect(array_of_strings.sanitize('aaa')).toEqual(['aaa']);
    expect(array_of_strings.sanitize(['aaa', 'bbb'])).toEqual(['aaa', 'bbb']);
  });

});
