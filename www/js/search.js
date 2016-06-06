angular.module('starter')
    .controller('SearchController', function($scope, $http, Transport){
        
        $scope.origin = Transport.defaultOrigin;

        var findDestinationsByOriginId = function(id){
            var departuresFromId = _.filter($scope.departures.departures, {'idOrigin' : id });
            return _.map(departuresFromId, function(d){ return { 'id': d.idDestination, 'name': d.nameDestination}; });
        }
        var findOriginsByDestinationId = function(id){
            var departuresToId = _.filter($scope.departures.departures, {'idDestination' : id });
            return _.map(departuresToId, function(d){ return { 'id': d.idOrigin, 'name': d.nameOrigin }; });
        }

        var isActive = function(id, collection){
            return _.some(collection, {'id': id, 'active': true});
        }
        var isActiveOrigin = function(id){
            return isActive(id, $scope.departures.stationsFrom);
        }
        var isActiveDestination = function(id){
            return isActive(id, $scope.departures.stationsTo);
        }

        var findOriginById = function(id){
            return _.find($scope.departures.stationsTo, { 'id': id });
        }
        var findDestinationById = function(id){
            return _.find($scope.departures.stationsFrom, { 'id': id });
        }

        var disable = function(station, findOpposed, findOthers, findById, isActiveStation) {
            var opposited = findOpposed(station.id);
            var matrix = _.map(opposited, function(d){ return findOthers(d.id); });
            var zip = _.zip(opposited, matrix);
            console.log(zip);

            // For each origin, desactivate the destination if all origins aren't active
            _.forEach(zip, function(elem) {
                var station = findById(elem[0].id);
                if(_.every(elem[1], function(stationOpposite){ return !isActiveStation(stationOpposite.id);})){
                    station.active = false;
                }else{
                    station.active = true;
                }
            });
        }

        var disableDestinations = function(origin){
            disable(origin, findDestinationsByOriginId, findOriginsByDestinationId, findOriginById, isActiveOrigin);
        }

        var disableOrigins = function(origin){
            disable(origin, findOriginsByDestinationId, findDestinationsByOriginId, findDestinationById, isActiveDestination);
        }

        var departures = function(origin) {

            //Transport.getDeparturesWithAddress("Genève, rue schaub 12").then(function(data){console.log(data);});

            $scope.departures = Transport.getDeparturesFrom("station=" + origin)
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

        $scope.onClickOrigin = function(station){
            station.active = !station.active;
            disableDestinations(station);
        }

        $scope.onClickDestination = function(station){
            station.active = !station.active;
            disableOrigins(station);
        }

        $scope.onClickTransport = function(transport){
            transport.active = !transport.active;
        }

        $scope.isActive = function(idOrigin, idDestination){
            return isActiveOrigin(idOrigin) && isActiveDestination(idDestination);
        }
    });
