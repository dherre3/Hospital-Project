//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
/**
*@ngdoc controller
*@name MUHCApp.controller:HomeController
*@scope
*@requires $scope
*@requires $timeout
*@requires $filter
*@requires $cordovaNetwork
*@requires MUHCApp.services.UserDataMutable
*@requires MUHCApp.services.UpdateUI
*@requires MUHCApp.services.UserTaskAndAppointments
*@element textarea
*@description
*Manages the logic of the home screen after log in, instatiates 
*/
var myApp = angular.module('MUHCApp');
myApp.controller('homeController', ['$scope', 'UserDataMutable','UpdateUI', '$timeout','$filter','$cordovaNetwork','UserTasksAndAppointments',function ($scope, UserDataMutable,UpdateUI,$timeout,$filter,$cordovaNetwork,UserTasksAndAppointments) {
    var updatedField=null;
       /**
        * @ngdoc method
        * @name load
        * @methodOf MUHCApp.controller:HomeController
        * @callback MUHCApp.controller:HomeController.loadInfo
        * @description
        * Pull to refresh functionality, calls {@link MUHCApp.service:UpdateUI} service through the callback to update all the fields, then using 
        * the {@link MUHCApp.service:UpdateUI} callback it updates the scope of the HomeController. 
        *
        *
        */

        function loadInfo(){
           var dataVal= UpdateUI.UpdateUserFields();
           dataVal.then(function(data){
                setTimeout(function(){
                    $scope.$apply(function(){
                        $scope.NextAppointment=UserTasksAndAppointments.getCurrentTaskOrAppointment().Date;
                        $scope.FirstName = UserDataMutable.getFirstName();
                        $scope.LastName = UserDataMutable.getLastName();
                        $scope.TelNum = UserDataMutable.getTelNum();
                        $scope.Email = UserDataMutable.getEmail();
                        $scope.picture = UserDataMutable.getPictures();
                        

                    });
                },20)}, function(error){console.log(error);});

        };


         $scope.load = function($done) {
          $timeout(function() {
            loadInfo();
                $done();
                
          }, 1000);
        };

//Sets all the variables in the view. 
    
    $scope.dateToday=new Date();
    //Next appointment fields
    $scope.NextAppointmentDate=UserTasksAndAppointments.getCurrentTaskOrAppointment().Date;
    $scope.NextAppointmentType=UserTasksAndAppointments.getCurrentTaskOrAppointment().Name;
    if($scope.NextAppointmentDate-$scope.dateToday>0) { $timeout(function(){$scope.showNextAppointment=true})}else{ $timeout(function(){$scope.showNextAppointment=false})};
    
    $scope.FirstName = UserDataMutable.getFirstName();
    $scope.LastName = UserDataMutable.getLastName();
    $scope.TelNum = UserDataMutable.getTelNum();
    $scope.Email = UserDataMutable.getEmail();
    $scope.picture = UserDataMutable.getPictures();
    $scope.primaryPhysician=UserDataMutable.getPrimaryPhysician();
    $scope.oncologist=UserDataMutable.getOncologist();


    
/**
 * @ngdoc method
 * @scope
 * @name $scope.goContact
 * @methodOf MUHCApp.controller:HomeController
 * @description
 * Method sets the contact for the {@link MUHCApp.controller:ContactDoctorController ContactDoctorController} by passing object {param:type} in the pushPage Onsen Method
 * 
 *
 * @param {string} type Specifies the contact page the view going to. Either 'Oncologist', or 'Physician'.
 * @returns {void} Does not return anything
 */
    $scope.goContact=function(type){
        myNavigator.pushPage('page2.html', {param:type},{ animation : 'slide' } );
    };

}]);
/**
* @ngdoc controller
* @scope
* @name MUHCApp.controller:ContactDoctorController
* @requires $scope
* @description Controller manages the logic for the contact page of the doctor, the user is directed here through
* the {@link MUHCApp.controller:HomeController HomeController} view.
*
**/
myApp.controller('ContactDoctorController',['$scope',function($scope){
 
 var page = myNavigator.getCurrentPage();
 var parameters=page.options.param;
 $scope.header=parameters;
 $scope.$watch('header',function(){
    $scope.valueData=page.options.param;
     console.log(page);

 });
 var page = myNavigator.getCurrentPage();
    console.log(page.options.param);
    console.log("adas");



}]);