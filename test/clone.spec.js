import ConfigMask from './../src/';


describe('clone', function () {

  it('should create exact copy of the object', function () {
    const a = new ConfigMask({type: 'boolean:strict', default: true});
    const b = a.clone();
    expect(a.sanitize()).toEqual(true);
    expect(b.sanitize()).toEqual(true);
    expect(b.sanitize(false)).toEqual(false);
  });

  it('should update options from parameter', function () {
    const a = new ConfigMask({type: 'boolean:strict', default: true});
    const b = a.clone({default: false});
    expect(b.sanitize()).toEqual(false);
    expect(b.sanitize(true)).toEqual(true);
  });

  it('should not mutate original object', function () {
    const a = new ConfigMask({type: 'boolean:strict', default: true});
    const b = a.clone({default: false});
    expect(a.sanitize()).toEqual(true);
    expect(b.sanitize()).toEqual(false);
  });

});
