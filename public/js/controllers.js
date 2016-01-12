/* global angular */

var app = angular.module('roundupApp', [ /*'ngMessages'*/ ]);


// Services ================================================================== #
app.service('roundupService', ['$http', function($http) {
    // Return requests with promises
    this.items = function() {
        return $http.get('/api/roundup/items/');
    };
    this.categories = function() {
        return $http.get('/api/roundup/categories/');
    };

}]);

// Controllers =============================================================== #
app.controller('RoundupListCtrl', ['$scope', '$http', '$timeout', 'roundupService', function($scope, $http, $timeout, roundupService) {

    $scope.refresh = function() {
        $scope.items = roundupService.items();
        $scope.items.success(function(data) {
            $scope.items = data;

            $timeout(function() {
                $('.collapsible').collapsible();
            }, 0);
        });
    };
    
    $scope.$on('refreshRoundup', $scope.refresh);
    $scope.refresh();
}]);

app.controller('ItemFormController', ['$scope', '$http', 'roundupService', function($scope, $http, roundupService) {

    $scope.Categories = roundupService.categories();
    $scope.Categories.success(function(data) {
        $scope.Categories = data;
    });

    $scope.submitForm = function(isValid) {
        if (isValid) {
            $http.post('/api/roundup/items/', $scope.item, {})
                .then(
                    function(response) {
                        
                        if (response.status == 200 && response.statusText == "OK") {
                            console.log('Saved successfully (200)');
                        }
                        else if (response.status == 400) {
                            console.log('Failed to process request (400)');
                        }
                        else {
                            console.log('Failed (' + response.status + ') ' + response.statusText);
                        }
                        
                        document.getElementById('formActiveItem').click();
                        $scope.item = {};
                        $scope.roundupForm.$setPristine();
                        $scope.$emit('refreshRoundup', undefined);
                    },
                    function(response) {
                        // failure callback
                    }
                );
        }

    };
}]);
