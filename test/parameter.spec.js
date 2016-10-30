import ConfigMask from './../src/';

describe('parameter', function () {

  let sub_object;

  beforeEach(function () {
    sub_object = new ConfigMask({
      type: 'object',
      properties: {
        aaa: {type: 'text'}
      }
    });

    spyOn(sub_object, 'sanitize').and.callThrough();
  });

  it('should pass to subsequent `sanitize` calls in `list_of` type', function () {
    const x = new ConfigMask({
      type: 'list_of',
      submask: sub_object
    });
    x.sanitize('aaa', 'bbb');
    expect(sub_object.sanitize).toHaveBeenCalledWith('aaa', 'bbb');
  });

  it('should pass to subsequent `sanitize` calls in `object` type', function () {
    const x = new ConfigMask({
      type: 'object',
      properties: {
        aaa: sub_object
      }
    });
    x.sanitize({aaa: 'bbb'}, 'ccc');
    expect(sub_object.sanitize).toHaveBeenCalledWith('bbb', 'ccc');
  });

  it('should pass to subsequent `sanitize` calls in `combined` type', function () {
    const x = new ConfigMask({
      type: 'combined',
      submasks: [sub_object]
    });
    x.sanitize('aaa', 'bbb');
    expect(sub_object.sanitize).toHaveBeenCalledWith('aaa', 'bbb');
  });

  it('should pass to `parse`', function () {
    const spy = jasmine.createSpy('parse');
    const x = new ConfigMask({
      type: 'text',
      parse: spy
    });
    x.sanitize('aaa', 'bbb');
    expect(spy).toHaveBeenCalledWith('aaa', 'bbb');
  });

  it('should pass to `validate`', function () {
    const spy = jasmine.createSpy('validate');
    const x = new ConfigMask({
      type: 'text',
      validate: spy
    });
    x.sanitize('aaa', 'bbb');
    expect(spy).toHaveBeenCalledWith('aaa', 'bbb');
  });

});
