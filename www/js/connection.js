angular.module('starter')
    .controller('ConnectionController', function($scope, $http, Transport){

        $scope.from = Transport.defaultOrigin;
        $scope.to = Transport.defaultDestination;

        $scope.onClick = function (from, to) {
            $scope.connections = Transport.getConnections(from, to);
        };

        $scope.change = function (from, to) {
            $scope.from = to;
            $scope.to = from;
        };


    });
