angular.module('starter')
    .controller('SearchController', function($scope, $http, Transport){
        
        $scope.origin = Transport.defaultOrigin;
        $scope.choice = "station";
        $scope.error = "no";

        var findDeparturesByStationOrigin = function(station){
            return _.filter($scope.departures.departures, {'idOrigin': station.id });
        }
        var findDeparturesByStationDestination = function(station){
            return _.filter($scope.departures.departures, {'idDestination': station.id });
        }
        var findDeparturesByTransport = function(transport){
            return _.filter($scope.departures.departures, {'transport': transport.name});
        }

        var departures = function(origin) {

            if($scope.choice === "station"){
                        $scope.error = "station en cours";
                Transport.getDeparturesFrom("station=" + origin, 20, $scope)
                    .then(function (data) {
                        $scope.error = "en cours";
                        $scope.departures = data;    
                    })
                    .catch(function (error) { 
                        scope.error = "failed" + error;
                        console.log("failed");}
                    );
            }else{
                Transport.getDeparturesWithAddress(origin)
                    .then(function(data){
                        $scope.error = "en cours address";
                        $scope.departures = data;
                    })
                    .catch(function (error) { 
                        scope.error = "failed address" + error;
                        console.log("failed address");}
                    );
            }
        }

        $scope.departures = departures($scope.origin);
            
        $scope.textChanged = function(text) { 
            $scope.departures = departures(text);
        }

        $scope.onRefresh = function(text){
            $scope.departures = departures(text);
            $scope.$broadcast('scroll.refreshComplete');
        }

        $scope.onClickOrigin = function(station){
            station.active = !station.active;
            _.forEach(findDeparturesByStationOrigin(station), function(d) { d.active = station.active; });
        }
        $scope.onClickDestination = function(station){
            station.active = !station.active;
            _.forEach(findDeparturesByStationDestination(station), function(d) { d.active = station.active; });
        }
        $scope.onClickTransport = function(transport){
            transport.active = !transport.active;
            _.forEach(findDeparturesByTransport(transport), function(dep) { dep.active = transport.active; });
        }

        $scope.isActive = function(departure){
            return departure.active;
        } 
        $scope.isActiveTransport = function(transport){
            transport.active = _.some($scope.departures.departures, {'transport': transport.name, 'active': true });
            return transport.active;
        }

        $scope.isActiveStationOrigin = function(station){
            station.active = _.some($scope.departures.departures, {'idOrigin': station.id, 'active': true });
            return station.active;
        }
        $scope.isActiveStationDestination = function(station){
            station.active = _.some($scope.departures.departures, {'idDestination': station.id, 'active': true });
            return station.active;
        }
    });












