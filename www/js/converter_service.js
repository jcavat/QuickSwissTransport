angular.module('starter').factory('ConverterHelper', function () {
    return {

        convertToHoursMinutes: function( date ){
            var d = new Date(date)
            return (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
        },
        convertToDayMonthYear: function( date ){
            var d = new Date(date);
            return d.getDate() + "." + ( d.getMonth()+1 ) + "." + d.getFullYear();
        },
        convertDurationToMinutes: function( date ){
            var d = parseInt(date.split("d")[0]);
            var h = parseInt(date.split("d")[1].split(":")[0]);
            var m = parseInt(date.split("d")[1].split(":")[1]);
            return 24 * d + h + ":" + (m < 10 ? "0" + m : m);
        },
        departureTimeFromNow: function( date ) {
            var dep = new Date(date);
            var now = new Date();
            return Math.floor((dep - now)/(1000*60));
        }
    };
});
