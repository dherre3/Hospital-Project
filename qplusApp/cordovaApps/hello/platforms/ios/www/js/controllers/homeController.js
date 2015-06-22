//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//

var myApp=angular.module('app');
myApp.controller('homeController', ['$scope', '$state', '$firebaseObject', 'UserInformation', function ($scope, $state, $firebaseObject, UserInformation) {


    //setTimeout(function () {
    //    $scope.$apply(function () {
            $scope.FirstName = UserInformation.FirstName;
            $scope.LastName = UserInformation.LastName;
            $scope.TelNum = UserInformation.TelNum;
            $scope.Email = UserInformation.Email;
            //console.log(this.FirstName);
            if (!UserInformation.Email) {
                $scope.loaded = true;
            }
            $scope.picture = UserInformation.Pictures;
            //console.log($scope.picture);

       // });
    //}, 50);






}]);