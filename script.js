(function () {

    var app = angular.module("app", []);

    app.value("Physics", Physics);

    app.directive("physicsCanvas", function (Physics) {
        return {
          restrict: "E",
          transclude: true,
          template: "<canvas width={{width}} height={{height}}></canvas><div ng-transclude></div>",
          scope: {
              width: "@",
              height: "@",
              init: "&"
          },
          controller: function() {
            var me = this;
            
            me.world = Physics();
            me.world.on("step", function () {
                me.world.render();
            });

            var start = function () {
                Physics.util.ticker.on(function (time) {
                    me.world.step(time);
                });
                Physics.util.ticker.start()
            };
            me.ticker = {
                start: start
            };
          },
          compile: function(element, attributes) {
            return {
              pre: function(scope, element, attrs, ctrl) {
              },
              post: function(scope, element, attrs, ctrl) {
                var canvas = element.find("canvas");
                var renderer = Physics.renderer('canvas', {
                    el: canvas[0],
                    width: scope.width,
                    height: scope.height
                });
                ctrl.world.add(renderer);
                canvas.attr("style", "");
                if (scope.init) {
                  scope.init({ "world": ctrl.world});
                }
                ctrl.ticker.start();
              }
            };
          }
        };
    });

    app.directive("physicsEdgeDetection", function (Physics) {
        return {
            restrict: "E",
            require: '^physicsCanvas',
            scope: {
                minX: "@",
                minY: "@",
                maxX: "@",
                maxY: "@",
                restitution: "@"
            },
            link: function (scope, elements, attrs, canvasCtrl) {
                var bounds = Physics.aabb(parseInt(scope.minX),
                    parseInt(scope.minY),
                    parseInt(scope.maxX),
                    parseInt(scope.maxY));
                canvasCtrl.world.add(Physics.behavior('edge-collision-detection', {
                    aabb: bounds,
                    restitution: parseFloat(scope.restitution)
                }));
            }
        };
    });

    app.directive("physicsBehavior", function (Physics) {
        return {
            restrict: "E",
            require: '^physicsCanvas',
            scope: {
                name: "@"
            },
            link: function (scope, elements, attrs, canvasCtrl) {
                canvasCtrl.world.add(Physics.behavior(scope.name));
            }
        };
    });

    app.directive("physicsBody", function (Physics) {
        return {
            restrict: "E",
            require: '^physicsCanvas',
            scope: {
                options: "=",
                body: "=",
                type: "@"
            },
            link: function (scope, elements, attrs, canvasCtrl) {
                scope.body = Physics.body(scope.type, scope.options);
                canvasCtrl.world.add(scope.body);
            }
        };
    });

    app.controller("mainController", function (Physics) {
        var model = this;

        model.box1 = null;
        model.box2 = null;

        model.kick1 = function () {
            model.box1.applyForce({x: 0.1, y: -0.2});
            model.box2.applyForce({x: -0.1, y: -0.2});
        };

        model.kick2 = function () {
            model.box3.applyForce({x: 0.1, y: -0.2});
            model.box4.applyForce({x: -0.1, y: -0.2});
        };
        
        model.init1 = function(world) {
          var square = Physics.body('rectangle', {
              x: 250,
              y: 250,
              vx: 0.01,
              width: 50,
              height: 50
          });
          world.add(square);
  
          world.add(Physics.body('convex-polygon', {
              x: 250,
              y: 50,
              vx: 0.05,
              vertices: [
                  {x: 0, y: 80},
                  {x: 60, y: 40},
                  {x: 60, y: -40},
                  {x: 0, y: -80}
              ]
          }));
  
          world.add(Physics.body('convex-polygon', {
              x: 400,
              y: 200,
              vx: -0.02,
              vertices: [
                  {x: 0, y: 80},
                  {x: 80, y: 0},
                  {x: 0, y: -80},
                  {x: -30, y: -30},
                  {x: -30, y: 30}
              ]
          }));
        };

        model.init2 = function(world) {
          var square = Physics.body('rectangle', {
              x: 250,
              y: 250,
              vx: 0.01,
              width: 50,
              height: 50
          });
          world.add(square);
  
          world.add(Physics.body('convex-polygon', {
              x: 250,
              y: 50,
              vx: 0.05,
              vertices: [
                  {x: 0, y: 80},
                  {x: 60, y: 40},
                  {x: 60, y: -40},
                  {x: 0, y: -80}
              ]
          }));
  
          world.add(Physics.body('convex-polygon', {
              x: 400,
              y: 200,
              vx: -0.02,
              vertices: [
                  {x: 0, y: 80},
                  {x: 80, y: 0},
                  {x: 0, y: -80},
                  {x: -30, y: -30},
                  {x: -30, y: 30}
              ]
          }));
        };

        model.grow = function () {
            model.box1.geometry.width *= 1.5;
            model.box1.geometry.height *= 1.5;
            model.box1.mass *= 1.5;
            model.box1.view = null;
            model.box1.recalc();
        };
    });
}());