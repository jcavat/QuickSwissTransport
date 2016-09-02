angular.module('starter').factory('Transport', function ($http, $q, ConverterHelper) {
    return {
        defaultOrigin: "",
        defaultDestination: "",
        getDeparturesFrom: function (text, limit) {
            limit = limit === undefined ? 20 : limit;

            var departures = [];
            var stationsFrom = [];
            var stationsTo = [];

            return $http.get('http://transport.opendata.ch/v1/stationboard?' + text + '&limit=' + limit)
                .then(function (response) {

                    angular.forEach(response.data.stationboard, function(data){
                        // details about transportation
                        var diff = ConverterHelper.departureTimeFromNow(data.stop.departure);
                        if(diff >= 0){
                            // Origin and destination stations list
                            stationsFrom.push({id: data.stop.station.id, name: data.stop.station.name, active: true});
                            stationsTo.push({id: data.passList[data.passList.length - 1].station.id, name: data.passList[data.passList.length - 1].station.name, active: true});

                            departures.push({
                                nameOrigin: data.stop.station.name,
                                idOrigin: data.stop.station.id,
                                transport: data.name,
                                nameDestination: data.to,
                                idDestination: data.passList[data.passList.length -1].station.id,
                                number: data.name,
                                active: true,
                                departure: (diff == 0) ? "< 1 min" : diff + " min",
                                departureTime: data.stop.departure }
                            );
                        }
                    });

                    stationsFrom = _.uniqBy(stationsFrom, 'id');
                    stationsTo = _.uniqBy(stationsTo, 'id');
                    var transports = _.chain(departures).map(function (d) { return {'name': d.number, 'active': true }; } ).uniqBy('name').value();

                    return { departures: _.sortBy(departures, 'departureTime'), stationsFrom: stationsFrom, stationsTo: stationsTo, transports: transports };
                });

        },
        getConnections: function (from, to) {
            var lstJourney = [];
            $http.get('http://transport.opendata.ch/v1/connections?from=' + from + '&to=' + to)
                .success(function (data) {
                    angular.forEach(data.connections, function(connection) {

                        // configure a journey
                        var journey = {
                            fromstation: connection.from.station.name,
                            tostation: connection.to.station.name,
                            duration: ConverterHelper.convertDurationToMinutes(connection.duration),
                            date: ConverterHelper.convertToDayMonthYear(connection.from.departure),
                            departure: ConverterHelper.convertToHoursMinutes(connection.from.departure),
                            arrival: ConverterHelper.convertToHoursMinutes(connection.to.arrival),
                            transfers: connection.transfers + " transf.",
                            connections: []
                        };

                        // a journey could have many connections
                        // add intermediate connections
                        angular.forEach(journey.sections, function (section) {
                            journey.connections.push(
                                {
                                    fromstation: section.departure.station.name,
                                    tostation: section.arrival.station.name,
                                    departure: ConverterHelper.convertToHoursMinutes(section.departure.departure),
                                    arrival: ConverterHelper.convertToHoursMinutes(section.arrival.arrival),
                                    typename: section.journey == null ? "marche" : section.journey.category,
                                    walktime: section.walk == null ? "" : "marche: " + section.walk.duration
                                });
                        });

                        lstJourney.push(journey);

                    });
                })
                .error(function (error) {
                    console.log(error);
                });
            return lstJourney;
        },

        getNearestStations: function(address){
            var lstStations = [];

            return $http.get('http://transport.opendata.ch/v1/locations?query=' + address)
            //return $http.get('https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=' + address + '&type=locations&limit=1')
                .then(function (response) {

                    var x = response.data.stations[0].coordinate.x;
                    var y = response.data.stations[0].coordinate.y;

                    //var x = response.data.results[0].attrs.lat;
                    //var y = response.data.results[0].attrs.lon;

                    return $http.get('http://transport.opendata.ch/v1/locations?x=' + x + '&y=' + y)
                        .then(function (data) {
                            angular.forEach(data.data.stations, function (station) {
                                lstStations.push( {name: station.name, id: station.id, distance: station.distance} );
                            });

                            lstStations = lstStations.sort(
                                function (s1,s2) {
                                    return s1.distance - s2.distance;
                                }
                            );

                            if(lstStations.length > 0){
                                var firstDistance = lstStations[0].distance;
                                lstStations = lstStations.filter(
                                    function (s) {
                                        return s.distance < firstDistance + 200;
                                    }
                                );
                            }

                            return lstStations;

                        });
                },function(error){ console.log(error);});
        },

        getNearestStationsByCoordinates: function(x, y){
            lstStations = [];

            return $http.get('http://transport.opendata.ch/v1/locations?x=' + x + '&y=' + y)
                .then(function (data) {
                    angular.forEach(data.data.stations, function (station) {
                        lstStations.push( {name: station.name, id: station.id, distance: station.distance} );
                    });

                    lstStations = lstStations.sort(
                        function (s1,s2) {
                            return s1.distance - s2.distance;
                        }
                    );

                    if(lstStations.length > 0){
                        var firstDistance = lstStations[0].distance;
                        lstStations = lstStations.filter(
                            function (s) {
                                return s.distance < firstDistance + 200;
                            }
                        );
                    }

                    return lstStations;

                });
        },
        getDeparturesWithAddress: function (address) {

                var _this = this;
                var departures = [];
                var stationsFrom = [];
                var stationsTo = [];
                var transports = [];

                var defer = $q.defer();

                _this.getNearestStations(address).then( function(lstStations) {

                    var promises = [];

                    angular.forEach(lstStations, function(station){
                        promises.push(_this.getDeparturesFrom('id=' + station.id, 20));
                    });

                    $q.all(promises)
                        .then(function(results){
                            angular.forEach(results, function (result) {
                                departures = departures.concat(result.departures);
                                stationsFrom = stationsFrom.concat(result.stationsFrom);
                                stationsTo = stationsTo.concat(result.stationsTo);
                                transports = transports.concat(result.transports);
                            });
                            stationsFrom = _.uniqBy(stationsFrom, 'id');
                            stationsTo = _.uniqBy(stationsTo, 'id');
                            transports = _.uniqBy(transports, 'name');
                            defer.resolve({departures: _.sortBy(departures, 'departureTime'), stationsFrom: stationsFrom, stationsTo: stationsTo, transports: transports });
                        });
                });

                return defer.promise;
        },

        getDeparturesByCoordinates : function (x, y) {

                var _this = this;
                var departures = [];
                var stationsFrom = [];
                var stationsTo = [];
                var transports = [];

                var defer = $q.defer();

                _this.getNearestStationsByCoordinates(x, y).then( function(lstStations) {

                    var promises = [];

                    angular.forEach(lstStations, function(station){
                        promises.push(_this.getDeparturesFrom('id=' + station.id, 10));
                    });

                    $q.all(promises)
                        .then(function(results){
                            angular.forEach(results, function (result) {
                                departures = departures.concat(result.departures);
                                stationsFrom = stationsFrom.concat(result.stationsFrom);
                                stationsTo = stationsTo.concat(result.stationsTo);
                                transports = transports.concat(result.transports);
                            });
                            stationsFrom = _.uniqBy(stationsFrom, 'id');
                            stationsTo = _.uniqBy(stationsTo, 'id');
                            transports = _.uniqBy(transports, 'name');
                            defer.resolve({departures: _.sortBy(departures, 'departureTime'), stationsFrom: stationsFrom, stationsTo: stationsTo, transports: transports });
                        });
                });

                return defer.promise;
        }
    }
 });
