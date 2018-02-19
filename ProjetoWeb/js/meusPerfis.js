angular.module("meusPerfilsApp", [])

.controller("meusPerfilsCtrl",function ($scope, $state, $http, $location, $window, $rootScope) {
    this.count = 0;
    this.increment = function (){
        this.count = this.count + 1;
    }
	
	$scope.init = function () {
		var teste = this;
	}
});