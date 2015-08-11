
//Defines the module for the app services.
var myApp=angular.module('MUHCApp');


//Factory service made to transport the firebase link as a dependency
myApp.factory("Auth", ["$firebaseAuth",
function ($firebaseAuth) {
    var ref = new Firebase("https://luminous-heat-8715.firebaseio.com");
    return $firebaseAuth(ref);
}]);



/**
*@ngdoc service
*@name MUHCApp.run
*@description Service is in charge of checking that the user is authorized at every state change by checking the parameters stored
in the Firebase localstorage,  Check run service on angular {{link}}
**/
myApp.run(function ($rootScope, $state, $stateParams,$q) {

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
  // We can catch the error thrown when the $requireAuth promise is rejected
  // and redirect the user back to the home page
  $state.go('logIn');
  console.log('listening');
  if (error === "AUTH_REQUIRED") {
    /**
    *@ngdoc method
    *@name redirectPage
    *@methodOf MUHCApp.run
    *@returns {void} Returns a promise to perform an synch refresh page right after redirecting to the login state.
    *@description Using the angularfire, $firebaseAuth, service, it checks whether is authorized, if its not
    *it redirects the user to the logIn page, by using the login state and reloads the page.
    */
    function redirectPage(){
            var r=$q.defer();
            $state.go('logIn');
            r.resolve;
            return r.promise;
        }

        var redirect=redirectPage();
        redirect.then(setTimeout(function(){location.reload()},100));
        
}
});
});



/**
*@ngdoc service
*@name MUHCApp.services:UserMessages
*@requires $fitler
*@requires MUHCApp.service:UserAuthorizationInfo
*@description Service deals with patient/doctor messaging portal, parses Firebase object into the appropiate format
*             and defines methods for sending messages back to Firebase.
**/
myApp.service('UserMessages', ['$filter', 'UserAuthorizationInfo', function($filter, UserAuthorizationInfo){
/**
*@ngdoc property
*@name  UserConversationsArray
*@propertyOf MUHCApp.services:UserMessages
*@description Contains all the conversations for the User, UserConversationsArray[0] contains the first conversation.
*
**/
/**
*@ngdoc property
*@name  UserMessagesLastUpdated
*@propertyOf MUHCApp.services:UserMessages
*@description Date of the last message.
*
**/
    UserMessagesObject={
        UserConversationArray:this.UserConversationsArray,
        LastUpdated:this.UserMessagesLastUpdated
    }
    return {
        /**
        *@ngdoc method
        *@name MUHCApp.UserMessages#setUserMessages
        *@methodOf MUHCApp.services:UserMessages
        *@description Parses message into right format, parses Date of messages to a Javascript date, organizes the messages in coversation in chronological order,
        then instatiates UserMessages property UserConversationsArray and lastly instiates UserMessages property
        *UserMessagesLastUpdated
        *@param {string} messages {@link MUHCApp.services:UpdateUI} calls setUserMessages with the object Message obtained from the Firebase user fields.
        **/
        setUserMessages:function(messages){

            //Initializing the array of conversations
             this.UserConversationsArray = [];             
             if (messages === undefined) return -1;
             this.UserMessagesLastUpdated=messages.LastUpdated;
             delete messages.LastUpdated;
            //Iterating through each conversation
            var keysArray = Object.keys(messages);
            for (var i = 0; i < keysArray.length; i++) {

                var conversation=messages[keysArray[i]];

                //setting conversation Parameters
                var PatientConversation={};
                PatientConversation.MessageRecipient=conversation.MessageRecipient;
                PatientConversation.MessageRecipientLoginId=conversation.MessageRecipientLoginId;
                PatientConversation.ConversationReadStatus=conversation.ConversationReadStatus;
                PatientConversation.Role=conversation.Role;
                PatientConversation.ConversationSerNum=keysArray[i];

                //Changing conversation date strings to javascript dates, ordering them chronologically 
                //Making an array of messages for that particular conversation
                delete conversation.MessageRecipient;
                delete conversation.MessageRecipientLoginId;
                delete conversation.Role;

                keysIndividualMessages=Object.keys(conversation);
                PatientConversation.Messages=[];
                for (var j = 0; j < keysIndividualMessages.length; j++) {
                    var messageDate=$filter('formatDate')(conversation[keysIndividualMessages[j]].Date);
                    conversation[keysIndividualMessages[j]].Date=messageDate;
                    PatientConversation.Messages.push(conversation[keysIndividualMessages[j]]);
                };
                PatientConversation.Messages = $filter('orderBy')(PatientConversation.Messages, 'Date', false);
                PatientConversation.DateOfLastMessage=PatientConversation.Messages[PatientConversation.Messages.length-1].Date;
                this.UserConversationsArray.push(PatientConversation);
            }
            //this.ConversationsObject.Conversations=UserConversationsArray;



        },
        /**
        *@ngdoc method
        *@name getUserMessages
        *@methodOf MUHCApp.services:UserMessages
        *@returns {Array} Returns the UserConversationsArray.
        **/
        getUserMessages:function(){

            return this.UserConversationsArray;
        },
        /**
        *@ngdoc method
        *@name getUserMessagesLastUpdated
        *@methodOf MUHCApp.services:UserMessages
        *@returns {Array} Returns the UserMessagesLastUpdated.
        **/
        getUserMessagesLastUpdated:function(){
            return this.UserMessagesLastUpdated;
        },
        /**
        *@ngdoc method
        *@name addNewMessageToConversation
        *@methodOf MUHCApp.services:UserMessages
        
        *@param {number} conversationIndex Index of conversation in the UserConversationsArray
        *@param {string} senderRole User or Doctor
        *@param {string} messageCotent Content of message
        *@param {Object} date Date of message
        *@description Sends the message to Firebase request fields.
        **/
        addNewMessageToConversation:function(conversationIndex, senderRole, messageContent, date)
        {
            //Adding Message To Service! and sending it to firebase storage


            //Initializing variables, and firebase link
            var firebaseLink=new Firebase('https://luminous-heat-8715.firebaseio.com/users/');
            var conversationSerNum=this.UserConversationsArray[conversationIndex].ConversationSerNum;
            var messageToService={};
           
            messageToService.Role=senderRole;
            messageToService.MessageContent=messageContent;
            messageToService.Date=date;
            

            //Adds message to conversation array message inside the message service and updating last message date
            this.UserConversationsArray[conversationIndex].Messages.push(messageToService);
            this.UserMessagesLastUpdated=date;

            //Updating the last message date in firebase!
            var firebaseDateString=$filter('formatDateToFirebaseString')(date);
             var messageToUser={};
            messageToUser.Role=senderRole;
            messageToUser.MessageContent=messageContent;
            messageToUser.Date=firebaseDateString;
            var usersPathLastUpdated=UserAuthorizationInfo.UserName+'/Messages';
            firebaseLink.child(usersPathLastUpdated).update({'LastUpdated':firebaseDateString});
            
            //Adding message to user's firebase messages
            var usersPathToConvo=UserAuthorizationInfo.UserName+'/Messages/'+conversationSerNum;
            var firebaseMessageObjectToUser={};
            firebaseMessageObjectToUser[this.UserConversationsArray[conversationIndex].Messages.length-1]=messageToUser;
            firebaseLink.child(usersPathToConvo).update(firebaseMessageObjectToUser);
    



            //Adding message to other user's firebase 
            var loginId=this.UserConversationsArray[conversationIndex].MessageRecipientLoginId;
             var otherUsersPathLastUpdated=loginId+'/Messages';
            firebaseLink.child(otherUsersPathLastUpdated).update({'LastUpdated':firebaseDateString});
            var otherUsersPathToConvo=loginId+'/Messages/'+conversationSerNum;
            var firebaseMessageObjectToOtherUser={};
            var messageToOtherUser={};
            messageToOtherUser.Role='0';
            messageToOtherUser.MessageContent=messageContent;
            messageToOtherUser.Date=firebaseDateString;
            firebaseMessageObjectToOtherUser[this.UserConversationsArray[conversationIndex].Messages.length-1]=messageToOtherUser;
            firebaseLink.child(otherUsersPathToConvo).update(firebaseMessageObjectToOtherUser);


            //Clearing firebaseLink variable
           // delete firebaseLink;

        }



    }
}]);

myApp.service('UserAppointments', ['$q','UserDataMutable', '$cordovaCalendar','UserAuthorizationInfo', '$filter', function ($q,UserDataMutable, $cordovaCalendar, UserAuthorizationInfo, $filter) {
    
    return {
        setUserAppointments: function (appointments) {
        //Initializing Variables
                this.UserAppointmentsInNativeCalendar=[];
                this.UserAppointmentsArray = [];
                this.TodayAppointments = [];
                this.FutureAppointments = [];
                this.PastAppointments = [];
                if (appointments === undefined) return -1;
                var keysArray = Object.keys(appointments);
                //Format date to javascript date
                for (var i = 0; i < keysArray.length; i++) {
                    var appointmentDate = $filter('formatDate')(appointments[keysArray[i]].Date);
                    appointments[keysArray[i]].Date = appointmentDate;
                    this.UserAppointmentsArray[i] = appointments[keysArray[i]];
                }
                //Sort Appointments chronologically most recent first
                this.UserAppointmentsArray = $filter('orderBy')(this.UserAppointmentsArray, 'Date', true);



                //Sort them by upcoming, past categories. Today's appointment array can be past or upcoming
                for (var i = 0; i < keysArray.length; i++) {
                    var today = new Date();
                    var todayDay = today.getDate();
                    var todayMonth = today.getMonth() + 1;
                    var todayYear = today.getFullYear();
                    var appointmentDate = (this.UserAppointmentsArray[i]).Date;

                    var appointmentDateDay = appointmentDate.getDate();
                    var appointmentDateMonth = appointmentDate.getMonth() + 1;
                    var appointmentDateYear = appointmentDate.getFullYear();

                    //Deciding the appointments for the day
                    if (todayDay === appointmentDateDay && todayMonth === appointmentDateMonth && todayYear === appointmentDateYear) {
                        this.TodayAppointments.push(this.UserAppointmentsArray[i]);
                    }

                    //Deciding whether they are future or past appointments
                    var dateDiff = (today - (this.UserAppointmentsArray[i].Date));
                    if (dateDiff < 0) {
                        this.FutureAppointments.push(this.UserAppointmentsArray[i]);
                    } else {
                        this.PastAppointments.push(this.UserAppointmentsArray[i]);
                    }

                }
                this.TodayAppointments=$filter('orderBy')(this.TodayAppointments, 'Date');
                this.FutureAppointments=$filter('orderBy')(this.FutureAppointments, 'Date');
        /*
            * Setting User Calendar
            //The rest of this function takes the results from the sorted by date appointments and organizes them into an object with
             //hierarchical structure year->month->day->appointments for the day, the dayly appointments are arrays.  

        */


        //Initializing local variables
        var year = -1;
        var month = -1;
        var day = -1;
        this.calendar = {};
        var calendarYear = {};
        var calendarMonth = {};
        //If there are not appointments return -1;
        if (this.UserAppointmentsArray === undefined) return -1;
        //Loop goes through all the appointments in the sorted array of appointments, remember this only works if ap
        //appointments are already sorted
        for (var i = 0; i < this.UserAppointmentsArray.length; i++) {

            //Gets year, month and day for appointment
            var tmpYear = (this.UserAppointmentsArray[i].Date).getFullYear();
            var tmpMonth = (this.UserAppointmentsArray[i].Date).getMonth() + 1;
            var tmpDay = (this.UserAppointmentsArray[i].Date).getDate();

            //if month has changed, since appointments in order, add the resulting appointments to for that month to the correspongding
            //calendar year. 
            if (month !== tmpMonth || (month === tmpMonth && year !== tmpYear)) {
                if (i > 0) {
                    calendarYear[month] = {};
                    calendarYear[month] = calendarMonth;
                    calendarMonth = {};
                }
                month = tmpMonth;
            }

            //if year has changed, add year to the calendar object and changed the year to the year it changed too
            if (year !== tmpYear) {
                if (i > 0) {
                    this.calendar[year] = {};
                    this.calendar[year] = calendarYear;
                    calendarYear = {};
                    calendarMonth = {};
                }
                year = tmpYear;

            }

            //If statement just to defined objects and prevent exception in case certain day does not
            //have any appointments yet. It then adds to the calendaMonth object for that day the 
            //appointment 
            if (calendarMonth[tmpDay] === undefined) calendarMonth[tmpDay] = [];
            calendarMonth[tmpDay].push(this.UserAppointmentsArray[i]);

        }
        //Last Month, of year
        calendarYear[month] = {};
        calendarYear[month] = calendarMonth;
        this.calendar[year] = {};
        this.calendar[year] = calendarYear;

        },
        getUserAppointments: function () {

            return this.UserAppointmentsArray;
        },
        getTodaysAppointments: function () {

            return this.TodayAppointments;
        },
        getFutureAppointments: function () {
            return this.FutureAppointments;
        },
        getPastAppointments: function () {
            return this.PastAppointments;
        },
        getUserCalendar:function(){
            return this.calendar;
        },
        checkAndAddAppointmentsToCalendar:function(){

            //Checks that the UserAppointmentsArray is defined as an array
            if(Object.prototype.toString.call( this.UserAppointmentsInNativeCalendar ) === '[object Array]'){
                var appointments=this.UserAppointmentsArray;
                for(var i=0;i<appointments.length;i++){
                    console.log(this.UserAppointmentsInNativeCalendar);
                    var added=findAppointmentInNativeCalendar(appointments[i],this.UserAppointmentsInNativeCalendar);
                    added.then(function(result){
                        if(!result){
                            this.UserAppointmentsInNativeCalendar.push(appointments[i]);
                            var startDate=appointments[i].Date;
                            var changeHour=startDate.getHours();
                            var endDate = new Date(startDate.getTime());
                            endDate.setHours(changeHour+1);
                            var title=appointments[i].Type;
                            var location=appointments[i].Location;
                            var notes='Source: ' +appointments[i].Resource+', Description: '+ appointments[i].Description;

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

                    })
                    
                }

                function findAppointmentInNativeCalendar(appointment,nativeCalendar){
                    var r=$q.defer();
                    if(nativeCalendar.length===0){
                        r.resolve(false)
                        return r.promise;
                    }
                    for(var i=0;i<this.nativeCalendar.length;i++){
                        if(nativeCalendar[i].Date===appointment.Date&&nativeCalendar[i].Location===appointment.Location&&nativeCalendar[i].Description===appointment.Description&&nativeCalendar[i].Type===appointment.Type){
                            r.resolve(true);
                            return r.promise;
                        }
                    }
                    r.resolve(false)
                    return r.promise;  
                }
            }
        }






    };




}]);
myApp.service('UserNotifications',['UserDataMutable','$rootScope',function(UserDataMutable,$rootScope){
    this.notifications={};
    return{
        setUserNotifications:function(object){

            var keys=Object.keys(object);
            
            if(this.firebaseNotificationNumber===undefined){
                this.notifications=object;
                this.NotificationNumber=keys.length;
            }else if(this.firebaseNotificationNumber!==keys.length){
                var newNot=keys.length-this.firebaseNotificationNumber;
                if(newNot>0){
                    $rootScope.Notifications=newNot;
                    $rootScope.showAlert=true;
                }
                this.notifications=object;
                this.NotificationNumber=keys.length;
            }
            this.firebaseNotificationNumber=keys.length;
        },
         getUserNotifications:function(){
            return this.notifications;
        },
        setNotificationReadStatus:function(notification,status){
            this.notifications[notification].ReadStatus=status;

        },
        getNotificationUnreadStatus:function(notification){
            return this.notifications[notification].ReadStatus;
        },
        addNotification:function(notification){

        },
        deleteNotification:function(index){

        },
        getNotificationsNumber:function(){
            return this.NotificationNumber;
        },
        setNotificationsNumber:function(number){
            this.NotificationNumber=number;
        },
        getNotificationsObjectArray:function(){
            return this.NotificationsObjectArray;
        },
        setNotificationsObjectArray:function(object){
            this.NotificationsObjectArray=object;
        },
        updateNotificationsFromFirebase:function(){

        }


    };

}]);

myApp.service('UserTasksAndAppointments',['$filter',function($filter){
    
    return{

        setUserTasksAndAppointments:function(tasksAndAppointments){
            this.TasksAndAppointmentsObject=[];
            var keysArray=Object.keys(tasksAndAppointments);
            var min=Infinity;
            var index=-1;
            for (var i=0;i<keysArray.length;i++) {

               //console.log(tasksAndAppointments[keysArray[i]]);
               var date=$filter('formatDate')(tasksAndAppointments[keysArray[i]]);
               //console.log(date.getDate());         
                var dateDiff=((new Date()) - date);
                if(dateDiff<0){
                    dateDiff=dateDiff*-1;
                }
                if((new Date())<date){
                    var sta='Future';
                    var tmp=min;
                    min=Math.min(min,dateDiff);  
                    if(tmp!==min){
                        index=i;
                    }   
               }else{
                    var sta='Past';
               }       
               (this.TasksAndAppointmentsObject).push({Name:keysArray[i],Date:date,Status:sta});

            };
            this.TasksAndAppointmentsObject=$filter('orderBy')(this.TasksAndAppointmentsObject,'Date');
            if(index!==-1){
                this.TasksAndAppointmentsObject[index].Status='Next';
                this.CurrentTaskOrAppointmentIndex=index;
            }else{
               this.CurrentTaskOrAppointmentIndex=keysArray.length-1; 
            }
            

            
        },
        getUserTasksAndAppointments:function(){
            return this.TasksAndAppointmentsObject;
        },
        getTimeBetweenAppointments:function(timeFrame){
            //if(this.TasksAndAppointmentsObject[1].Date instanceof Date) console.log(this.TasksAndAppointmentsObject);
            this.timeDiff=[];
            for (var i = 0;i<this.TasksAndAppointmentsObject.length-1;i++) {

                if(timeFrame==='Day'){
                    var dateDiff=(this.TasksAndAppointmentsObject[i+1].Date - this.TasksAndAppointmentsObject[i].Date)/(1000*60*60*24);
                    this.timeDiff[i]={Stages: this.TasksAndAppointmentsObject[i].Name +'-'+ this.TasksAndAppointmentsObject[i+1].Name, TimeDiffInDays:dateDiff};                
                }else if(timeFrame==='Hour'){
                     var dateDiff=(this.TasksAndAppointmentsObject[i+1].Date - this.TasksAndAppointmentsObject[i].Date)/(1000*60*60);
                    this.timeDiff[i]={Stages: this.TasksAndAppointmentsObject[i].Name +'-'+ this.TasksAndAppointmentsObject[i+1].Name, TimeDiffInDays:dateDiff};
                }
            };

            return this.timeDiff;
            
       },
       getCurrentTaskOrAppointment:function(){
        if(this.TasksAndAppointmentsObject){
            return this.TasksAndAppointmentsObject[this.CurrentTaskOrAppointmentIndex];
        }else{
            return {Name:"boom", Date:new Date()};
        }
        }
    };



}]);

//This service will have the user preferences for language and sent sms feature. To be used in account settings.
myApp.service('UserPreferences', function(){
    return{
        setNativeCalendarOption:function(calendarOption){
            if(calendarOption){
                this.calendarOption=calendarOption;
            }
        },
        getNativeCalendarOption:function(){
            return this.calendarOption;
        },
        setLanguage:function(lan){
            if(lan!=='EN'||lan!=='FR'){
                return;
            }else{
                this.Language=lan;
            }

        },
        setSMS:function(smsPreference){
            if(smsPreference==='Enable'){
                this.SMS=smsPreference;
            }else if(smsPreference==='Disable'){
                this.SMS=smsPreference;
            }
        },
        getLanguage:function(){
            return this.Language;

        },
        getSMS:function(){
            return this.SMS;
        },
        setUserPreferences:function(smsPreference, lan){
            if(smsPreference==='Enable'){
                this.SMS=smsPreference;
            }else if(smsPreference==='Disable'){
                this.SMS=smsPreference;
            }
            if(lan==='EN'||lan==='FR'){
                this.Language=lan;
                
            }else{
              return;
            }
            //console.log(this.SMS + this.Language);
        },
        getUserPreferences:function(){
            return {
                SMS: this.SMS,
                LAN: this.Language
            };
        }

    }



});



myApp.service('UpdateUI', ['UserAppointments','UserMessages','UserPreferences', 'UserDataMutable', 'UserAuthorizationInfo', '$q', 'UserNotifications', 'UserTasksAndAppointments', function (UserAppointments,UserMessages, UserPreferences, UserDataMutable, UserAuthorizationInfo, $q, UserNotifications, UserTasksAndAppointments) {
    return {
        UpdateUserFields: function () {
            //Firebase.goOnline();
            var count=0;
            var r = $q.defer();

            var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName);
            obtainDataLoop();
           function obtainDataLoop(){
            firebaseLink.once('value', function (snapshot) {
               
                var values = snapshot.val();
                if(values.fields.FirstName===undefined){
                    count++;
                    console.log(count);
                    firebaseLink.child('fields').update({logged:'true'});
                    obtainDataLoop();
                }else{
                    UserDataMutable.setData(values.fields.FirstName, values.fields.LastName, values.fields.picture, values.fields.TelNum, values.fields.Email, values.NextAppointment.CheckIn, values.NextAppointment.Date, values.images, values.fields.AppointmentsAndTasks, values.fields.Notifications, values.fields.PrimaryPhysician, values.fields.Oncologist);
                                    UserPreferences.setUserPreferences(values.UserPreferences.EnableSMS, values.UserPreferences.Language);
                                    UserNotifications.setUserNotifications(values.Notifications);
                                    UserTasksAndAppointments.setUserTasksAndAppointments(values.AppointmentsAndTasks);
                                    UserAppointments.setUserAppointments(values.Appointments);
                                    UserMessages.setUserMessages(values.Messages);
                                    var dataValues = {
                                        FirstName: values.fields.FirstName,
                                        LastName: values.fields.LastName,
                                        Picture: values.fields.picture,
                                        Email: values.fields.Email,
                                        TelNum: values.fields.TelNum,
                                        NextAppointment: values.NextAppointment.Date,
                                        CheckIn: values.NextAppointment.CheckIn,
                                        Photos: values.images,
                                        Appointments:values.Appointments,

                                        AppointmentsAndTasks: values.AppointmentsAndTasks,
                                        EnableSMS: values.UserPreferences.EnableSMS,
                                        Language: values.UserPreferences.Language,
                                        Notifications: values.Notifications

                                    };
                                    r.resolve(dataValues);
            

                }
            
        },function(error){

            r.reject(error);
            
            });

    
    }
    return r.promise;
}
};
}]);

//This is our main object where we will define the user data and all the appropiate variables
myApp.service('UserDataMutable', ['UserPreferences','UserAuthorizationInfo','$q',function (UserPreferences, UserAuthorizationInfo,$q) {
    return {

        //This function obtains any field for the patient from firebase, type specifies the type of field, so update, check in, or image, or 
        //simply user fields, while the field is the actual name.
        getFirebaseField:function(type,field){
            var r=$q.defer();
            if(field===undefined&&type!==undefined){
                var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName +'/' +type);
                firebaseLink.once('value',function(snapshot){
                    console.log(snapshot.val());
                    r.resolve(snapshot.val());
                    
                },function(error){r.reject(error)});
                return r.promise;
            }else if(type!==undefined&&field!==undefined){
                var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName +'/' +type+'/'+field);
                firebaseLink.once('value',function(snapshot){
                    r.resolve(snapshot.val());
                    //return snapshot.val();
                },function(error){r.reject(error)});
                return r.promise;
            }else{
            r.reject('Not Good Enough');
            return r.promise;
            }
        },
        setFirebaseField:function(type,value,field){
        //Example: UserDataMutable.setFirebaseField('Update','LastName'); Here the field was undefined, so it will update Update:FistName, check firebase
        //for structure of database. 
        //UserDataMutable.setFirebaseField('fields','FirstName','Andrew'); Here it will go into fields and update the FirstName field to Andrew.
        //Notice how only allowed values will be updated. 
            if(value===undefined) return;
            if(field===undefined&&type!==undefined){
                var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName);
                if(type==='Update') firebaseLink.update({'Update':value});
                if(type==='NextAppointment') firebaseLink.update({'NextAppointment':value});
                if(type==='CheckIn') {

                    //firebaseLink.update({'CheckIn':value});
                    var firebaseLink2 = new Firebase('https://luminous-heat-8715.firebaseio.com/PatientActivity/' + UserAuthorizationInfo.UserName);
                    var toFirebase={CheckIn:true};
                    firebaseLink2.update(toFirebase);
                }

            }else if(type!==undefined&&field!==undefined){
                var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName +'/' +type);
                if(field==='FirstName') firebaseLink.update({'FirstName':value});
                if(field==='LastName') firebaseLink.update({'LastName':value});
                if(field==='Email') firebaseLink.update({'Email':value});
                if(field==='TelNum') firebaseLink.update({'TelNum':value});
                if(field==='picture') firebaseLink.update({'picture':value});
                if(field==='Date') firebaseLink.update({'Date':value});
                if(field==='NextAppointment') firebaseLink.update({'NextAppointment':value});

            }
        },
        getAppointmentsAndTasks:function(){
            return this.AppointmentsAndTasks;
        },
        getUserNotifications:function(){
            return this.UserNotifications;
        },
        getPhotos:function(){
            return this.Photos;
        },
        getData: function () {
            return this.Data;
        },
        getCheckInField:function(){
            return this.CheckIn;
        },
        getNextAppointment:function(){
            return this.NextAppointment;
        },
        getFirstName: function () {
            return this.FirstName;
        },
        getLastName: function () {
            return this.LastName;
        },
        getEmail: function () {
            
            return this.Email;
        },
        getPictures: function () {
            return this.Pictures;
        },
        getTelNum: function () {
            return this.TelNum;
        },
          getPrimaryPhysician: function () {
            return this.PrimaryPhysician;
        },
          getOncologist: function () {
            return this.Oncologist;
        },
        setData: function (firstName, lastName, pictures, telNum, email,checkin,nextappointment,images,appointmentsAndtasks,usernotifications, primaryPhysician, Oncologist) {
            var r=$q.defer();
            this.FirstName = firstName;
            this.LastName = lastName;
            this.Pictures = pictures;
            this.Photos=images;
            this.TelNum = telNum;
            this.Email = email;
            this.CheckIn = checkin;
            this.NextAppointment=nextappointment;
            this.AppointmentsAndTasks=appointmentsAndtasks;
            this.UserNotifications=usernotifications;
            this.PrimaryPhysician=primaryPhysician;
            this.Oncologist=Oncologist;     
            r.resolve;
            return r.promise;
        },
        setPhotos:function(photos){
            this.Photos=photos;
        },
         setCheckInField:function(checkin){
            this.CheckIn=checkin;
        },
        setNextAppointment:function(nextappointment){
            this.NextAppointment=nextappointment;
        },
        setFirstName: function (firstName) {
            this.FirstName = firstName;
        },
        setLastName: function (lastName) {
            this.LastName = lastName;
        },
        setEmail: function (email) {
            this.Email = email;
        },
        setPictures: function (pictures) {
            this.Pictures = pictures;
        },
        setTelNum: function (telNum) {
            this.TelNum = telNum;
        },
        setAppointmentsAndTasks:function(object){
            this.AppointmentsAndTasks=object;
        },
        setUserNotifications:function(object){
            this.UserNotifications=object;
        }

    };
}]);
//Defines the authorization parameters for the user serssion
myApp.service('UserAuthorizationInfo',['$q','$state', function ($q) {


    return {
        setUserAuthData: function (username, token, authorize) {
            this.UserName = username;
            this.UserToken = token;
            this.authorization = authorize;
        },
        getUserAuthData: function () {
            return {
                UserName: this.UserName,
                Token: this.UserToken,
                AuthorizationData: this.authorization


            };
        },
        authorizeUser:function(){
            var q=$q.defer()
            if(this.authorization===undefined){
                q.reject('boom');
            }else{
                q.resolve('goHome');
            }
            return q.promise;
        }

}

}]);