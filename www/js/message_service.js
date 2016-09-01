angular.module('starter').factory('Message', function () {
    return {
        startLoading: function() {
            $ionicLoading.show({ 
                noBackdrop: true,
                template: '<ion-spinner on-click="$scope.stopLoading()" icon="circles" class="spinner-calm"/>',
                scope: $scope
            });
        },
        stopLoading: function() {
            $ionicLoading.hide();
        }, 
        stopLoadingWithError: function( message ) {
            this.stopLoading();
            this.toast( message );
        }, 
        toast: function( message ) {
           $cordovaToast.show(message, 'long', 'center'); 
        }
    };
});
