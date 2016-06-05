angular.module('starter')
    .controller('SearchController', function($scope, $http, Transport){
        
        $scope.origin = Transport.defaultOrigin;

        var lstDestinations = function(id){
            var departuresFromId = _.filter($scope.departures.departures, {'idFrom' : id });
            return _.map(departuresFromId, function(d){ return { 'id': d.idTo, 'name': d.to }; });
        }
        var origins = function(id){
            var departuresToId = _.filter($scope.departures.departures, {'idTo' : id });
            return _.map(departuresToId, function(d){ return { 'id': d.idFrom, 'name': d.from }; });
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

        var stationOriginById = function(id){
            return _.find($scope.departures.stationsTo, { 'id': id });
        }
        var stationDestinationById = function(id){
            return _.find($scope.departures.stationsFrom, { 'id': id });
        }

        var desactiveDestinations = function(id){
            var dest = lstDestinations(id);
            
            var orig = _.map(dest, function(d){ return origins(d.id); });
            var zip = _.zip(dest, orig);

            _.forEach(zip, function(elem) {
                if(_.every(elem[1], function(stationFrom){ return !isActiveOrigin(stationFrom.id);})){
                    var station = _.find($scope.departures.stationsTo, { 'id': elem[0].id });
                    station.active = false;
                }else{
                    var station = _.find($scope.departures.stationsTo, { 'id': elem[0].id });
                    station.active = true;
                }
            });
        }

        var departures = function(origin) {

            //Transport.getDeparturesWithAddress("Genève, rue schaub 12").then(function(data){console.log(data);});

            $scope.departures = Transport.getDeparturesFrom("station=" +origin)
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

        $scope.desactivateOriginStationId = function(id){
            var station = _.find($scope.departures.stationsFrom, { 'id': id });
            station.active = !station.active;

            console.log(station);
            desactiveDestinations(id);

        }

        $scope.desactivateDestinationStationId = function(id){
            var station = _.find($scope.departures.stationsTo, { 'id': id });
            station.active = !station.active;
            origins(id);
        }
        $scope.isActive = function(idFrom, idTo){
            stationFrom = _.some($scope.departures.stationsFrom, {'id': idFrom, 'active': false});
            stationTo = _.some($scope.departures.stationsTo, {'id': idTo, 'active': false});

            return !stationFrom && !stationTo;
        }
    });
