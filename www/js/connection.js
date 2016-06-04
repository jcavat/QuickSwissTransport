angular.module('starter')
    .controller('ConnectionController', function($scope, $http, Transport){

        $scope.from = 'Genève';
        $scope.to = 'Yverdon';

        /*
        $scope.connections = function (from, to) {
            return Transport.getConnections(from, to);
        };
       */

        $scope.onClick = function (from, to) {
            $scope.connections = Transport.getConnections(from, to);
        };

        $scope.change = function (from, to) {
            $scope.from = to;
            $scope.to = from;
        };


    });
