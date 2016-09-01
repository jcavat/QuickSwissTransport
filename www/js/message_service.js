angular.module('starter').factory('Message', function ( $ionicLoading, $cordovaToast ) {
    return {
        startLoading: function() {
            $ionicLoading.show({ 
                noBackdrop: true,
                template: '<ion-spinner on-click="$scope.stopLoading()" icon="circles" class="spinner-calm"/>' /*,
                scope: $scope */
            });
        },
        stopLoading: function() {
            $ionicLoading.hide();
        }, 
        toast: function( message ) {
           $cordovaToast.show(message, 'long', 'center'); 
        },
        stopLoadingWithError: function( message ) {
            this.stopLoading();
            this.toast( message );
        } 
    };
});
