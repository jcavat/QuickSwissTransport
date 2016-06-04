angular.module('starter')
    .controller('SearchController', function($scope, $http, Transport){
        
        $scope.origin = Transport.defaultOrigin;

        var departures = function(origin) {
            $scope.departures = Transport.getDeparturesFrom(origin)
                .then(function (data) {
                    $scope.departures = data;    
                })
                .catch(function () { 
                    console.log("failed");}
                );
        }

        $scope.departures = departures($scope.origin);
            
        $scope.textChanged = function(text) { 
            $scope.departures = departures(text);
        }

        $scope.onRefresh = function(text){
            $scope.departures = departures(text);
            $scope.$broadcast('scroll.refreshComplete');
        }

    });
