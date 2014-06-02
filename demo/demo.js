/**
 * Created by Vasilisa on 29.05.2014.
 */
angular.module('app', ['validation'])
.controller('HomeCtrl', function($scope) {
        window.scope = $scope;
        $scope.fio = 'kavabanga';

    });