'use strict';

angular.module('247App')
    .directive('typing', function($timeout) {
        return {
            restrict: 'A',
            scope: {
                typing: '='
            },
            link: (scope, element)=> {
                element.typing({
                    start: ()=> {
                        $timeout(()=>scope.typing=true);
                    },
                    stop: ()=>{
                        $timeout(()=>scope.typing=false);
                    },
                    delay: 400
                });
            }
        };
    });
