angular.module('starter')
    .controller('SearchController', function($scope, $http, $ionicLoading, Transport){

        var startLoading = function(){
            $ionicLoading.show({ 
                noBackdrop: true,
                template: '<p><ion-spinner icon="circles" class="spinner-calm"/></p>'
            });
        }

        var stopLoading = function(){
            $ionicLoading.hide();
        }

        //var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $scope.onSearchPosition = function(){

            startLoading();
            navigator.geolocation
                .getCurrentPosition(
                    function (position) {
                        var lat  = position.coords.latitude;
                        var long = position.coords.longitude;

                        Transport.getDeparturesByCoordinates(lat, long)
                            .then(function (data) {
                                $scope.departures = data;
                                $scope.origin = "Ma position";
                                $scope.option.choice = 2;
                                stopLoading();
                            });
                    }, function(err) {
                        // error
                        stopLoading();
                    }
                    );
        }

        
        $scope.origin = Transport.defaultOrigin;
        $scope.option = {
            choices :[{'id': 0, 'name': "station"}, {'id': 1, 'name': "adresse"}, {'id': 2, 'name': "GPS"} ],
            choice: 0
        };

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
            startLoading();

            if($scope.option.choice === 0){
                Transport.getDeparturesFrom("station=" + origin, 20)
                    .then(function (data) {
                        $scope.departures = data;    
                        stopLoading();
                    })
                    .catch(function (error) { 
                        console.log("failed");
                        stopLoading();
                    });
            }else if ($scope.option.choice === 1){
                        $scope.error = origin;
                Transport.getDeparturesWithAddress(origin, $scope)
                    .then(function(data){
                        $scope.departures = data;
                        stopLoading();
                    })
                    .catch(function (error) { 
                        console.log("failed address");
                        $scope.error = " choice 1 ko ";
                        stopLoading();
                    });
            }else{
                $scope.onSearchPosition();
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












