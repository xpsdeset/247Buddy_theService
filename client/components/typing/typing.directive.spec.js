'use strict';

describe('Directive: typing', function () {

  // load the directive's module
  beforeEach(module('compassionpotApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<typing></typing>');
    element = $compile(element)(scope);
    expect(element.text()).to.equal('this is the typing directive');
  }));
});
