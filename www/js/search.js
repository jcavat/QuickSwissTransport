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

        var disableDestinations = function(id){
            var dest = findDestinationsByOriginId(id);
            
            var orig = _.map(dest, function(d){ return findOriginsByDestinationId(d.id); });
            var zip = _.zip(dest, orig);

            // For each origin, desactivate the destination if all origins aren't active
            _.forEach(zip, function(elem) {
                var station = findOriginById(elem[0].id);
                if(_.every(elem[1], function(stationFrom){ return !isActiveOrigin(stationFrom.id);})){
                    station.active = false;
                }else{
                    station.active = true;
                }
            });
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
            disableDestinations(station.id);
        }

        $scope.onClickDestination = function(station){
            station.active = !station.active;
            //findOriginsByDestinationId(station.id);
        }

        $scope.isActive = function(idOrigin, idDestination){
            return !isActiveOrigin(idOrigin) && !isActiveDestination(idDestination);
        }
    });
