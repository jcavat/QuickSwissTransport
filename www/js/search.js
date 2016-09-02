angular.module('starter')
    .controller('SearchController', function($scope, Transport, Message) {

        $scope.formData = {origin: Transport.defaultOrigin};

        $scope.onReset = function(){
            $scope.formData.origin = Transport.defaultOrigin;
        };

        $scope.onSearchPosition = function(){
            Message.startLoading();
            navigator.geolocation
                .getCurrentPosition(
                    function (position) {
                        var lat  = position.coords.latitude;
                        var long = position.coords.longitude;

                        Transport.getDeparturesByCoordinates(lat, long)
                            .then(function (data) {
                                $scope.departures = data;
                                $scope.formData.origin = Transport.defaultOrigin;
                                $scope.option.choice = 2;
                                Message.stopLoading();
                            });
                    }, 
                    function(err) {
                        Message.stopLoadingWithError( "Position non trouvée ou GPS inactif" );
                    },
                    { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
                );
        };

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

            if(origin === "") {
                return;
            }

            Message.startLoading();

            if($scope.option.choice === 0){
                Transport.getDeparturesFrom("station=" + origin, 30)
                    .then(function (data) {
                        $scope.departures = data;    
                        Message.stopLoading();
                    })
                    .catch(function (error) { 
                        Message.stopLoadingWithError( "Requête réseau non aboutie" );
                    });
            }else if ($scope.option.choice === 1){
                Transport.getDeparturesWithAddress(origin)
                    .then(function(data){
                        $scope.departures = data;
                        Message.stopLoading();
                    })
                    .catch(function (error) { 
                        Message.stopLoading( "Requête réseau non aboutie" );
                    });
            }else{
                $scope.onSearchPosition();
            }
        }

        $scope.departures = departures($scope.formData.origin);
            
        $scope.textChanged = function() { 
            if ($scope.formData.origin !== "") {
                $scope.departures = departures($scope.formData.origin);
            }
        }

        $scope.onRefresh = function(){
            if($scope.option.choice === 2){
                $scope.onSearchPosition();
            } else {
                $scope.departures = departures($scope.formData.origin);
            }
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












