import ConfigMask from './../src/';


describe('type: object', function () {

  describe('regular properties', function () {

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

  describe('any properties', function () {

    it('should remove any unwanted properties by default', function () {
      const x = new ConfigMask({
        type: 'object',
        properties: {
          aaa: {type: 'text'}
        }
      });
      const result = x.sanitize({
        aaa: 'aaa',
        bbb: 'bbb'
      });
      expect(result.aaa).toEqual('aaa');
      expect(result.bbb).not.toBeDefined();
    });

    it('should remove any unwanted properties', function () {
      const x = new ConfigMask({
        type: 'object',
        properties: {
          aaa: {type: 'text'}
        },
        keep_properties: false
      });
      const result = x.sanitize({
        aaa: 'aaa',
        bbb: 'bbb'
      });
      expect(result.aaa).toEqual('aaa');
      expect(result.bbb).not.toBeDefined();
    });

    it('should keep all properties if asterisk property is defined', function () {
      const x = new ConfigMask({
        type: 'object',
        properties: {
          aaa: {type: 'text'}
        },
        keep_properties: true
      });
      const result = x.sanitize({
        aaa: 'bbb',
        ccc: 'ddd'
      });
      expect(result.aaa).toEqual('bbb');
      expect(result.ccc).toEqual('ddd');
    });

  });

});
