// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
        .state('tabs', {
            url: '/tabs',
            abstract: true,
            templateUrl: 'view/home/home.html'
        })
        .state('tabs.home', {
            url: '/home',
            views: {
                'home-tab':{
                    templateUrl: 'view/search/search.html',
                    controller: 'SearchController'
                }
            }
        })
        .state('tabs.connection', {
            url: '/connection',
            views: {
                'connection-tab': {
                    templateUrl: 'view/search/connection.html',
                    controller: 'ConnectionController'
                }
            }
        })
        ; 
        
        
    $urlRouterProvider.otherwise('/tabs/home');
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

});



var convertToHoursMinutes = function(date){
    var d = new Date(date);
    return (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
}

var convertToDayMonthYear = function(date){
    var d = new Date(date);
    return d.getDate() + "." + ( d.getMonth()+1 ) + "." + d.getFullYear();
}

var convertDurationToMinutes = function(date){
    var d = parseInt(date.split("d")[0]);
    var h = parseInt(date.split("d")[1].split(":")[0]);
    var m = parseInt(date.split("d")[1].split(":")[1]);
    return 24 * d + h + ":" + (m < 10 ? "0" + m : m);
}

var departureTimeFromNow = function (date) {
    var dep = new Date(date);
    var now = new Date();
    var diff = Math.floor((dep - now)/(1000*60));
    return diff;
}


angular.module('starter').factory('Transport', function ($http) {
    return {
        defaultOrigin: "Genève",
        getDeparturesFrom: function (text) {

            var departures = [];
            var stationsFrom = [];
            var stationsTo = [];

            return $http.get('http://transport.opendata.ch/v1/stationboard?station=' + text + '&limit=20')
                .then(function (response) {

                    angular.forEach(response.data.stationboard, function(data){
                        // Origin and destination stations list
                        stationsFrom.push({id: data.stop.station.id, name: data.stop.station.name});
                        stationsTo.push({id: data.passList[data.passList.length - 1].station.id, name: data.passList[data.passList.length - 1].station.name});

                        // details about transportation
                        var diff = departureTimeFromNow(data.stop.departure);
                        if(diff >= 0){
                            departures.push({ from: data.stop.station.name, transport: data.name, to: data.to, departure: (diff == 0) ? "< 1 min" : diff + " min"});
                        }
                    });
                    
                    stationsFrom = _.uniqBy(stationsFrom, 'id');
                    stationsTo = _.uniqBy(stationsTo, 'id');
                    console.log(stationsFrom);
                    
                    return {departures: departures, stationsFrom: stationsFrom, stationsTo: stationsTo };
                });


        },
        getConnections: function (from, to, successCallback) {
            lstJourney = [];
            $http.get('http://transport.opendata.ch/v1/connections?from=' + from + '&to=' + to)
                .success(function (data) {
                    angular.forEach(data.connections, function(connection) { 

                        // configure a journey
                        var journey = { 
                            fromstation: connection.from.station.name,
                            tostation: connection.to.station.name,
                            duration: convertDurationToMinutes(connection.duration),
                            date: convertToDayMonthYear(connection.from.departure),
                            departure: convertToHoursMinutes(connection.from.departure),
                            arrival: convertToHoursMinutes(connection.to.arrival),
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
                                    departure: convertToHoursMinutes(section.departure.departure),
                                    arrival: convertToHoursMinutes(section.arrival.arrival),
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
//this.getNearestStations('genève, hopitaux');
//this.getNearestStations('genève, rue schaub 12');
            return lstJourney;
        },

        getNearestStations: function(address){
            lstStations = [];
            
            $http.get('http://transport.opendata.ch/v1/locations?query=' + address)
                .success(function (data) {

                    var x = data.stations[0].coordinate.x;
                    var y = data.stations[0].coordinate.y;

                    $http.get('http://transport.opendata.ch/v1/locations?x=' + x + '&y=' + y)
                        .success(function (data) {
                            angular.forEach(data.stations, function (station) {
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
                            
                        })
                        .error(function (error) {
                            console.log(error);
                        });
                })
                .error(function (error) {
                    console.log(error);
                });

            return lstStations;
        }

    }
 });
