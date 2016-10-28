import ConfigMask from './../src/';


describe('type: list_of', function () {

  describe('general', function () {

    it('should use subtype:any if subtype and mask are not defined', function () {
      const mask = new ConfigMask({
        type: 'list_of'
      });
      expect(mask.sanitize('aaa')).toEqual(['aaa']);
    });

    it('should use mask if both subtype and mask are defined', function () {
      const mask = new ConfigMask({
        type: 'list_of',
        subtype: 'number',
        submask: {type: 'text'}
      });
      expect(mask.sanitize(123)).toEqual(['123']);
    });

  });

  describe('type', function () {

    let x = new ConfigMask({
      type: 'list_of',
      subtype: 'text'
    });

    it('should use empty array as default value', function () {
      expect(x.sanitize()).toEqual([]);
    });

    it('should allow valid values', function () {
      expect(x.sanitize(['aaa', 'bbb'])).toEqual(['aaa', 'bbb']);
    });

    it('should allow coerce values', function () {
      expect(x.sanitize([123])).toEqual(['123']);
    });

    it('should convert single valid value input to array', function () {
      expect(x.sanitize('aaa')).toEqual(['aaa']);
    });

    it('should filter out invalid values', function () {
      const mask = new ConfigMask({
        type: 'list_of',
        subtype: 'text',
        filter: (input) => input !== ''
      });
      expect(mask.sanitize(['aaa', null, 'bbb'])).toEqual(['aaa', 'bbb']);
    });

  });


  describe('mask', function () {

    let x = new ConfigMask({
      type: 'list_of',
      submask: {type: 'text'}
    });

    it('should use empty array as default value', function () {
      expect(x.sanitize()).toEqual([]);
    });

    it('should allow valid values', function () {
      expect(x.sanitize(['aaa', 'bbb'])).toEqual(['aaa', 'bbb']);
    });

    it('should allow coerce values', function () {
      expect(x.sanitize([123])).toEqual(['123']);
    });

    it('should convert single valid value input to array', function () {
      expect(x.sanitize('aaa')).toEqual(['aaa']);
    });

    it('should filter out invalid values', function () {
      const mask = new ConfigMask({
        type: 'list_of',
        submask: {type: 'text'},
        filter: (input) => input !== ''
      });
      expect(mask.sanitize(['aaa', null, 'bbb'])).toEqual(['aaa', 'bbb']);
    });

  });

});


