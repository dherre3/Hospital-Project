var myApp = angular.module('MUHCApp');

/**
*@ngdoc controller
*@name MUHCApp.controller:ScheduleController
*@scope
*@requires $scope
*@requires $rootScope
*@requires $compile
*@requires MUHCApp.services.UserPreferences
*@requires MUHCApp.services.UserDataMutable
*@requires MUHCApp.services.UpdateUI
*@requires MUHCApp.services.UserTaskAndAppointments
*@requires MUHCApp.services.UserAppointments
*@description
*Controller manages the logic in the schedule appointment main view, it as as "child" controllers, 
*/
myApp.controller('ScheduleController', ['$rootScope', 'UserPreferences','$compile', 'UserAppointments','$scope', 'UserDataMutable', 'UserTasksAndAppointments',

function ($rootScope, UserPreferences, $compile, UserAppointments,$scope, UserDataMutable, UserTasksAndAppointments) {
    $scope.closeAlert = function () {
        $rootScope.showAlert = false;
    };
    addEventsToNativeCalendar();
    //var AppointmentSchedule=UserAppointments.getUserAppointments();
    
   
    /**
    *@ngdoc method
    *@name addEventsToCalendar
    *@methodOf MUHCApp.controller:ScheduleController
    *@description  If its a device checks to see if the user authorized access to calendar device feature, if the user has not 
                   defined it (first time), it prompts the user, otherwise it checks through the {@link UserAppointments.}whether it
                   they have been added. 
    **/

    function addEventsToNativeCalendar(){
          //Check for device or website
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
 
        if(app){
            var calendarEnable=UserPreferences.getNativeCalendarOption();
            if(!calendarEnable){
                 var message='Would you like these appointments to be saved as events in your device calendar?';
                navigator.notification.confirm(message, confirmCallback, 'Access Calendar', ["Don't allow",'Ok'] );
            }else if(calendarEnable===true){
                UserAppointments.checkAndAddAppointmentsToCalendar();
            }
        }else{
            console.log('website');
        }
    }
    function confirmCallback(index){
    if(index==1){
        console.log(index);
        UserPreferences.setNativeCalendarOption(false);
        flagNoAccess=1;
    }else if(index=2){
        console.log(index);
        UserPreferences.setNativeCalendarOption(true);
        UserAppointments.checkAndAddAppointmentsToCalendar();
    }
    }

    //Set up a watch in case appointments change
    $scope.$watch('appointments',
        function(){
            UserAppointments.checkAndAddAppointmentsToCalendar();
        }
    );
  
    
}]);

//Logic for the calendar controller view

myApp.controller('CalendarController', ['UserAppointments', '$scope','$timeout','$cordovaCalendar', function (UserAppointments, $scope,$timeout,$cordovaCalendar) {

    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.calendarDayAppointments=lookForCalendarDate($scope.dt);
    $scope.$watch('dt',function(){
        $timeout(function(){
             $scope.calendarDayAppointments=lookForCalendarDate($scope.dt,'day');
        });

    });
    //$scope.$watch('calendarMode',function(){});
    $scope.getStyle=function(index){
        var today=(new Date());
        var dateAppointment=$scope.calendarDayAppointments[index].Date;

        if(today.getDate()===dateAppointment.getDate()&&today.getMonth()===dateAppointment.getMonth()&&today.getFullYear()===dateAppointment.getFullYear()){
            return '#5CE68A';

        }else if(dateAppointment>today){
            return '#3399ff';


        }else{
            return '#F80000';
        }
    };

    function lookForCalendarDate(date,mode){
        if(mode==='day'){
            var year=date.getFullYear();
            var month=date.getMonth()+1;
            var day=date.getDate();
            var calendar=UserAppointments.getUserCalendar();
            if(calendar!==undefined&&calendar.hasOwnProperty(year)){
                var calendarYear=calendar[year];
                if(calendarYear.hasOwnProperty(month)){
                    var calendarMonth=calendarYear[month];
                    if(calendarMonth.hasOwnProperty(day)){
                        var calendarDay=calendarMonth[day];
                        return calendarDay;
                    }else{
                        $timeout(function(){
                    $scope.noAppointments=true;
               });
                        return null;
                    }

                }else{
                    $timeout(function(){
                    $scope.noAppointments=true;
               });
                    return null;
                }            
            }else{
                $timeout(function(){
                    $scope.noAppointments=true;
               });
                return null;
            }
            
            
        }else if(mode==='month'){
            var year=date.getFullYear();
            var month=date.getMonth()+1;
            var calendar=UserAppointments.getUserCalendar();
            if(calendar!==undefined&&calendar.hasOwnProperty(year)){
                var calendarYear=calendar[year];
                if(calendarYear.hasOwnProperty(month)){
                    var calendarMonth=calendarYear[month];
                    return calendarMonth;
                }else{
                    $timeout(function(){
                        $scope.noAppointments=true;
                    });
                    return null;
                }
            }else{
                $timeout(function(){
                    $scope.noAppointments=true;
               });
                return null;
            }
            



        }else if(mode==='year'){
            var year=date.getFullYear();
            var calendar=UserAppointments.getUserCalendar();
            if(calendar!==undefined&&calendar.hasOwnProperty(year)){

                var calendarYear=calendar[year];
                return calendarYear
            }else{
                 $timeout(function(){
                    $scope.noAppointments=true;
               });
                return null;
            }
        }

    }

    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];


    $scope.getDayClass = function (date, mode) {
        if (mode === 'day') {
            var dayToCheck = new Date(date);
            var today=(new Date());
            if(dayToCheck.setHours(0,0,0,0)===today.setHours(0,0,0,0)){//===today.getDate()&&dateToCheck.getMonth()===today.getMonth()&&dateToCheck.getFullYear()===today.getFullYear()){
                    return 'today';
            }else if(lookForCalendarDate(dayToCheck,mode)){            
                var dateAppointment=dayToCheck;
                 if(dateAppointment>today){
                    return 'full';
                 }else{
                    return 'partially';
                }
            }
        }else if(mode==='month'){
            return 'partially';
            var monthToCheck=new Date(date);
            if(lookForCalendarDate(monthToCheck,mode)){
                console.log('monthColorMe');
                return 'partially';
            }
        }else if(mode ==='year'){
            return 'partially';
            var yearToCheck=new Date(date);
            if(lookForCalendarDate(yearToCheck,mode)){
                console.log('yearColorMe');
                return 'partially';
            }
        }

        return '';
    };




}]);


myApp.controller('AppointmentListController', ['$scope','$timeout','UserDataMutable','UserAppointments', 'UserTasksAndAppointments',

function ($scope,$timeout, UserDataMutable, UserAppointments, UserTasksAndAppointments) {

    //Initializing choice
    $scope.radioModel = 'Today';

    //Today's date
    $scope.today=new Date();
   
    //Sets up appointments to display based on the user option selected
    $scope.$watch('radioModel',function(){
        $timeout(function(){
            selectAppointmentsToDisplay();
        });
        
    });

     //Function to select whether the today, past, or upming buttons are selected
    function selectAppointmentsToDisplay(){
        var selectionRadio=$scope.radioModel;
        if(selectionRadio==='Today'){
            $scope.appointments=UserAppointments.getTodaysAppointments();

        }else if(selectionRadio==='Upcoming'){
            $scope.appointments=UserAppointments.getFutureAppointments();
        }else if(selectionRadio==='Past'){
            $scope.appointments=UserAppointments.getPastAppointments();
        }else{
            $scope.appointments=UserAppointments.getUserAppointments();
        }
    }

    //Function to select the color of the appointment depending on whether the date has passed or not
    $scope.getStyle=function(index){
        var today=$scope.today;
        var dateAppointment=$scope.appointments[index].Date;

        if(today.getDate()===dateAppointment.getDate()&&today.getMonth()===dateAppointment.getMonth()&&today.getFullYear()===dateAppointment.getFullYear()){
            return '#5CE68A';

        }else if(dateAppointment>today){
            return '#3399ff';


        }else{
            return '#F80000';
        }
    };

}]);
myApp.controller('IndividualAppointmentController', ['$scope','$timeout', 'UserDataMutable', 'UserAppointments', 
    function ($scope, $timeout, UserDataMutable, UserAppointments) {
        $scope.alreadyCheckedIn=true;
        //Information of current appointment
        var page = myNavigatorAppointments.getCurrentPage();
        var parameters=page.options.param; 

        //Variables to show wheather the checkin is allowed for the day and whether there could be a change request
        var today=new Date();
        if(parameters.Date.getMonth()===today.getMonth()&&parameters.Date.getDate()===today.getDate()&&parameters.Date.getFullYear()===today.getFullYear()&&today>parameters.Date&&$scope.alreadyCheckedIn){
            //If User has not already been checked in, and if time is before appointment.
                $scope.appointmentToday=true;
        }else if(today>parameters.Date){
            $scope.futureAppointment=false;
        }else{
            $scope.futureAppointment=true;
        }

        //Once it gathers that it refreshes to view to get the right appointment information
        $timeout(function(){
            $scope.app=parameters;

        });
        
}]);
myApp.controller('AppointmentMapController',['$timeout', '$scope',function($timeout,$scope){
  var gesturableImg = new ImgTouchCanvas({
            canvas: document.getElementById('mycanvas1'),
            path: "./img/D2_Palliative_psychoncology_16June2015_en.png"
        });


  }]);


//Checking in the native calendar directly instead of the app service, userNativeCalendar

        /* var startDateMost=appointments[0].Date;
        var changeHourMost=startDateMost.getHours();
        var endDateMost = new Date(startDateMost.getTime());
        endDateMost.setHours(changeHourMost+1);
        var titleMost=appointments[0].Type;
        var locationMost=appointments[0].Location;
        var notesMost='Source: ' +appointments[0].Resource+', Description: '+ appointments[0].Description;
        $cordovaCalendar.findEvent({
            title: titleMost,
            location: locationMost,
            notes: notesMost,
            startDate: startDateMost,
            endDate: endDateMost
        }).then(function (result) {
            console.log(result);
            
        }, function (err) {
            

        });*/
            //loopAsychAppointments(0,appointments);
            //Checks whether the app is allowed to add the events by prompting the user, only asks for the first event trying to be added i.e.
            //flagAlreadyAddedEvents, flagNoAccess disallows the operation to continue at the next iteration. 
            /*function loopAsychAppointments(index,appointments){
                console.log(index);
                if(index>appointments.length-1){
                    return;
                }else{
                    var startDate=appointments[index].Date;
                    var changeHour=startDate.getHours();
                    var endDate = new Date(startDate.getTime());
                    endDate.setHours(changeHour+1);
                    var title=appointments[index].Type;
                    var location=appointments[index].Location;
                    var notes='Source: ' +appointments[index].Resource+', Description: '+ appointments[index].Description;
                    $cordovaCalendar.findEvent({
                            title: title,
                            location: location,
                            notes: notes,
                            startDate: startDate,
                            endDate: endDate
                        }).then(function (result) {
                            //console.log(result);
                            if(!result[0]){       
                                //console.log(appointments);
                                //console.log(index);
                                var startDate=appointments[index].Date;
                                var changeHour=startDate.getHours();
                                var endDate = new Date(startDate.getTime());
                                endDate.setHours(changeHour+1);
                                var title=appointments[index].Type;
                                var location=appointments[index].Location;
                                var notes='Source: ' +appointments[index].Resource+', Description: '+ appointments[index].Description;
                                $cordovaCalendar.createEvent({
                                title: title,
                                location: location,
                                notes: notes,
                                startDate: startDate,
                                endDate: endDate
                                }).then(function (result) {
                                    console.log('appointment added');
                                }, function (err) {
                                     navigator.notification.alert(
                                        'An error occured while adding your appointments',  // message
                                        alertDismissed,         // callback
                                        'Error',            // title
                                        'OK'                  // buttonName
                                    );
                              });
                        }
                        loopAsychAppointments(index+1,appointments);
                        return;
                        }, function (err) {
                            

                        });


                }


            }*/
            /*
            for (var i = 0; i < appointments.length; i++) {
                var startDate=appointments[i].Date;
                var changeHour=startDate.getHours();
                var endDate = new Date(startDate.getTime());
                endDate.setHours(changeHour+1);
                var title=appointments[i].Type;
                var location=appointments[i].Location;
                var notes='Source: ' +appointments[i].Resource+', Description: '+ appointments[i].Description;
                 
               /* $cordovaCalendar.findEvent({
                    title: title,
                    location: location,
                    notes: notes,
                    startDate: startDate,
                    endDate: endDate
                  }).then(function (result) {
                     console.log(result);
                     if(result.length===0){
                        console.log('I will try to add the appointment now!');
                        flagAlreadyAddedEvents++;
                        if(flagAlreadyAddedEvents==1){  
                            navigator.notification.confirm(message, confirmCallback, 'Access Calendar', ["Don't allow",'Ok'] );
                        }


                        $cordovaCalendar.createEvent({
                        title: title,
                        location: location,
                        notes: notes,
                        startDate: startDate,
                        endDate: endDate
                        }).then(function (result) {
                            appCalendarAdded++;
                        }, function (err) {
                             navigator.notification.alert(
                                'An error occured while adding your appointments',  // message
                                alertDismissed,         // callback
                                'Error',            // title
                                'OK'                  // buttonName
                            );
                      });
                     }else{
                         console.log('That Appointment has already been added!');
                     }
                  }, function (err) {
                        navigator.notification.alert(
                                'An error occured while adding your appointments',  // message
                                alertDismissed,         // callback
                                'Error',            // title
                                'OK'                  // buttonName
                            );
              
                  });
               
                };
                if(appCalendarAdded>0){
                            navigator.notification.alert(
                                'Appointment Events Successfully Added to Your Calendar!',  // message
                                alertDismissed,         // callback
                                'Appointment Events Added',            // title
                                'OK'                  // buttonName
                            );

                        }

        }*/