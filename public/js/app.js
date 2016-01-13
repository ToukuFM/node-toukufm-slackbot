/* global angular */

var app = angular.module('toukuApp', ['ngMaterial', 'ng-mfb']);

app.config(['$mdThemingProvider', function($mdThemingProvider) {
    var toukuTheme = $mdThemingProvider.extendPalette('orange', {
        '600': '#ef6c00',
        'contrastDefaultColor': 'light'
    });

    $mdThemingProvider.definePalette('toukuTheme', toukuTheme);

    $mdThemingProvider.theme('default')
        .primaryPalette('toukuTheme', {
            'default': '600'
        })
        .accentPalette('blue');
}]);

// Directives ================================================================ #

// Only submit on enter, not shift-enter
app.directive('enterSubmit', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {

            elem.bind('keydown', function(event) {
                var code = event.keyCode || event.which;

                if (code === 13) {
                    if (!event.shiftKey) {
                        event.preventDefault();
                        scope.$apply(attrs.enterSubmit);
                    }
                }
            });
        }
    }
});

// Services ================================================================== #

app.service('itemService', ['$http', function($http) {
    // Return requests with promises
    this.items = function() {
        return $http.get('/api/roundup/items/');
    };
    this.categories = function() {
        return $http.get('/api/roundup/categories/');
    };

}]);

// Controllers =============================================================== #

app.controller('appCtrl', ['$scope', '$timeout', '$mdSidenav', '$log', function($scope, $timeout, $mdSidenav, $log) {
    $scope.toggleLeft = (function buildToggler() {
        return function() {
            $mdSidenav('sidenav')
                .toggle()
                .then(function() {
                    $log.debug("toggle left is done");
                });
        };
    })();
}]);

app.controller('sidenavCtrl', ['$scope', '$timeout', '$mdSidenav', '$log', function($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function() {
        $mdSidenav('sidenav').close();
    };
}]);

app.controller('roundupCtrl', ['$scope', '$timeout', '$mdSidenav', '$mdToast', '$log', 'itemService', function($scope, $timeout, $mdSidenav, $mdToast, $log, itemService) {

    $scope.amountNew = 0;
    $scope.lastShownAmount = 0;

    $scope.showActionToast = function(amount) {
        if (amount == $scope.lastShownAmount) return;

        var toast = $mdToast.simple()
            .textContent(amount + ' new')
            .action('DISMISS')
            .highlightAction(false)
            .position('top right')
            .hideDelay(5000);

        $scope.lastShownAmount = amount;

        $mdToast.show(toast).then(function(response) {
            if (response == 'ok') {
                $scope.amountNew = 0;
            }
        });

    };

    $scope.refresh = function(ignore) {
        $scope.itemService = itemService.items()
            .success(function(data) {
                try {
                    for (var item in data[Object.keys(data)[0]]) {
                        if (data[Object.keys(data)[0]][item]._id == $scope.items[Object.keys($scope.items)[0]][0]._id) {
                            break;
                        }
                        $scope.amountNew++;
                    }
                }
                catch (err) {

                }
                if ($scope.amountNew > 0 && !ignore) {
                    $scope.ignoreNew = false;
                    $scope.showActionToast($scope.amountNew);
                }
                $scope.items = data;
            });
    };

    (function tick() {
        $scope.refresh(false);
        $timeout(tick, 30000);
    })();

    $scope.$on('refreshRoundup', function() {
        $scope.refresh(true);
    });
}]);

// Dialog management ========================================================= #

app.controller('fabCtrl', ['$scope', '$mdDialog', '$mdMedia', '$log', '$rootScope', function($scope, $mdDialog, $mdMedia, $log, $rootScope) {
    $scope.openDialog = function() {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
                controller: 'formCtrl',
                templateUrl: '/dialog',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            })
            .then(function(succeeded) {
                if (succeeded) {
                    $rootScope.$broadcast('refreshRoundup');
                }
                else
                    $log.error('Failed to save item.');
            });

        $scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
            $scope.customFullscreen = (wantsFullScreen === true);
        });
    };
}]);

app.controller('formCtrl', ['$scope', '$mdDialog', '$http', '$log', 'itemService', function($scope, $mdDialog, $http, $log, itemService) {

    itemService.categories()
        .success(function(data) {
            $scope.categories = data;
        });

    $scope.showSpinner = false;
    $scope.showButton = true;
    $scope.ifError = false;

    $scope.submit = function(isValid) {
        if (isValid) {
            $scope.ifError = false;
            $scope.error = "";
            $scope.buttonToggle();
            $http.post('/api/roundup/items/', $scope.form, {})
                .then(function(response) {
                    if (response.status == 200 && response.statusText == "OK")
                        $mdDialog.hide(true);
                    else
                        $scope.showError(response);
                }, $scope.showError);
        }
    };

    $scope.showError = function(err) {
        $scope.ifError = true;
        $scope.error = err.data;
        $scope.buttonToggle();
    };

    $scope.buttonToggle = function() {
        $scope.showButton = $scope.showButton ? false : true;
        $scope.showSpinner = $scope.showSpinner ? false : true;
    };

    $scope.hide = function() {
        $mdDialog.hide(false);
    };
}]);
