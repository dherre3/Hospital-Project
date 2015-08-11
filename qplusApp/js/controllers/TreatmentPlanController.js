var myApp=angular.module('MUHCApp');
myApp.controller('TreatmentPlanController',['$rootScope','$scope','UserTasksAndAppointments',function($rootScope,$scope,UserTasksAndAppointments){
	//This is not a highcharts object. It just looks a little like one!
  
   $scope.closeAlert = function () {	
        $rootScope.showAlert=false;
    };
    $scope.finishedTreatment=false;
    var appoint=UserTasksAndAppointments.getUserTasksAndAppointments();
    $scope.appointments=appoint;
    console.log(appoint);
    $scope.timeBetweenAppointments=UserTasksAndAppointments.getTimeBetweenAppointments('Day');
    $scope.today=new Date();
     $scope.currentStage=appoint[UserTasksAndAppointments.CurrentTaskOrAppointmentIndex].Name;
 if(appoint[UserTasksAndAppointments.CurrentTaskOrAppointmentIndex].Date>$scope.today){
      $scope.lastFinished=appoint[UserTasksAndAppointments.CurrentTaskOrAppointmentIndex-1].Name;  
    $scope.dynamic=Math.floor(100*((UserTasksAndAppointments.CurrentTaskOrAppointmentIndex+1)/appoint.length));
    $scope.message=(UserTasksAndAppointments.CurrentTaskOrAppointmentIndex+1)+' out of '+appoint.length;
  }else{
    $scope.finishedTreatment=true;
    $scope.dynamic=100;
    $scope.message=appoint.length+' out of '+appoint.length;
  }
    
   
    

    console.log($scope.appointments);

    $scope.getStyle=function($index){
    	if(appoint[$index].Status==='Next'){
    		return '#5CE68A';
    	}else if(appoint[$index].Status==='Past'){
    		return '#3399ff';
    	}else{
    		return '#ccc';
    	}

    };

}]);