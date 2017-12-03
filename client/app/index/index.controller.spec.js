'use strict';

describe('Component: IndexComponent', function () {

  // load the controller's module
  beforeEach(module('index'));

  var IndexComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    IndexComponent = $componentController('index', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
