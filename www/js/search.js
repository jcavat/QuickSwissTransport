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
        var findDeparturesByStationOrigin = function(station){
            return _.filter($scope.departures.departures, {'idOrigin': station.id });
        }
        var findDeparturesByStationDestination = function(station){
            return _.filter($scope.departures.departures, {'idDestination': station.id });
        }
        var findDeparturesByTransport = function(transport){
            return _.filter($scope.departures.departures, {'transport': transport.name});
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
        var isTransportActive = function(name){
            return _.some($scope.departures.transports, { 'name': name, 'active': true });
        }

        var findOriginById = function(id){
            return _.find($scope.departures.stationsFrom, { 'id': id });
        }
        var findDestinationById = function(id){
            return _.find($scope.departures.stationsTo, { 'id': id });
        }

        var disable = function(station, findOpposed, findOthers, findById, isActiveStation) {
            var opposited = findOpposed(station.id);
            var matrix = _.map(opposited, function(d){ return findOthers(d.id); });
            var zip = _.zip(opposited, matrix);

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
            disable(origin, findDestinationsByOriginId, findOriginsByDestinationId, findDestinationById, isActiveOrigin);
        }

        var disableOrigins = function(destination){
            disable(destination, findOriginsByDestinationId, findDestinationsByOriginId, findOriginById, isActiveDestination);
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

            console.log(transport.active);

            transport.active = !transport.active;

            console.log(transport.active);
            

            if(transport.active){

               var ors =  
                   _.chain($scope.departures.departures)
                    .filter({'transport': transport.name})
                    .map(function(d){ return findOriginById(d.idOrigin); }).value();

               ors.forEach(function(station){ station.active = true; });

               var ors =  
                   _.chain($scope.departures.departures)
                    .filter({'transport': transport.name})
                    .map(function(d){ return findDestinationById(d.idDestination); }).value();

               ors.forEach(function(station){ station.active = true; });

            }
        }

        $scope.isActive = function(departure){
            return isTransportActive(departure.transport) && isActiveOrigin(departure.idOrigin) && isActiveDestination(departure.idDestination);
        } 

        $scope.isActiveTransport = function(transport){

            var allOriginsInActive = _.chain($scope.departures.departures).filter({'transport': transport.name}).every(function(d){ return !isActiveOrigin(d.idOrigin); }).value();
            var allDestinationsInActive = _.chain($scope.departures.departures).filter({'transport': transport.name}).every(function(d){ return !isActiveDestination(d.idDestination); }).value();

            transport.active = isTransportActive(transport.name) && !(allOriginsInActive || allDestinationsInActive);
            return transport.active;
        }

        $scope.isActiveStationOrigin = function(station){

            var departures = findDeparturesByStationOrigin(station);
            var inActiveTransport = _.filter($scope.departures.transports , {'active': false} );
            
            console.log(departures);
            console.log(inActiveTransport);
            var toto = _.every(departures, function(d){ console.log(d.number);return _.some(inActiveTransport, {'name': d.number}); });
            return !toto;
            console.log(toto);
            




            return station.active;
        }
        $scope.isActiveStationDestination = function(station){
            return station.active;
        }
    });
