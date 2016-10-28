import ConfigMask from './../src/';


describe('Config Mask', function () {

  let x = new ConfigMask();

  const value_config = {
    type: 'number',
    default: 0
  };

  const unit_config = {
    type: 'set',
    values: ['px', '%'],
    default: 'px'
  };

  const size_config = {
    type: 'object',
    properties: {
      value: value_config,
      unit: unit_config
    }
  };

  it('should exist', function () {
    expect(ConfigMask).toBeDefined();
  });

  it('should handle basic config', function () {
    x.setOptions(value_config);
    expect(x.sanitize()).toEqual(0);
    expect(x.sanitize(100)).toEqual(100);
    expect(x.sanitize('100')).toEqual(100);
    expect(x.sanitize('xxx')).toEqual(0);
  });

  it('should handle complex config', function () {
    x.setOptions(size_config);
    expect(x.sanitize()).toEqual({value: 0, unit: 'px'});
    expect(x.sanitize('xxx')).toEqual({value: 0, unit: 'px'});
    expect(x.sanitize({value: 100})).toEqual({value: 100, unit: 'px'});
    expect(x.sanitize({value: 100, unit: '%'})).toEqual({value: 100, unit: '%'});
  });

  it('should handle nested config', function () {
    const value_mask = new ConfigMask(value_config);
    const unit_mask = new ConfigMask(unit_config);
    const size_mask = new ConfigMask({
      type: 'object',
      properties: {
        value: value_mask,
        unit: unit_mask
      }
    });
    expect(size_mask.sanitize()).toEqual({value: 0, unit: 'px'});
    expect(size_mask.sanitize('xxx')).toEqual({value: 0, unit: 'px'});
    expect(size_mask.sanitize({value: 100})).toEqual({value: 100, unit: 'px'});
    expect(size_mask.sanitize({value: 100, unit: '%'})).toEqual({value: 100, unit: '%'});
  });

  it('should handle boolean config', function () {
    x.setOptions({type: 'boolean', default: false});

    expect(x.sanitize()).toEqual(false, 'default');
    expect(x.sanitize(false)).toEqual(false, 'false');
    expect(x.sanitize(true)).toEqual(true, 'true');
    expect(x.sanitize('aaa')).toEqual(true, 'string');
  });

  it('should call `on_invalid` when input is invalid', function () {
    const mask = new ConfigMask({
      type: 'text',
      validate: function () {return false;},
      on_invalid: jasmine.createSpy('on_invalid')
    });
    mask.sanitize('aaa');
    expect(mask._options.on_invalid).toHaveBeenCalledWith('aaa');
  });

});
