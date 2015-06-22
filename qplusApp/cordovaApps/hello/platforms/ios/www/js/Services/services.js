var myApp=angular.module('app');
//Factory service made to transport the firebase link as a dependency
myApp.factory("Auth", ["$firebaseAuth",

function ($firebaseAuth) {
    var ref = new Firebase("https://luminous-heat-8715.firebaseio.com");
    return $firebaseAuth(ref);
}]);
myApp.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
});


//This service will have the user preferences for language and sent sms feature. To be used in account settings.
myApp.service('UserPreferences', function(){
    return{
        setLanguage:function(lan){
            if(lan!=='EN'||lan!=='FR'){
                return;
            }else{
                this.Language=lan;
            }

        },
        setSMS:function(smsPreference){
            if(smsPreference==='Enabled'){
                this.SMS=smsPreference;
            }else if(smsPreference==='Disabled'){
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
            if(smsPreference==='Enabled'){
                this.SMS=smsPreference;
            }else if(smsPreference==='Disabled'){
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






//This is our main object where we will define the user data and all the appropiate variables
myApp.service('UserDataMutable', function () {

   /* this.data = {
        this.FirstName:' ',
        this.LastName:' ',
        this.Pictures:' ',
        this.TelNum:' ',
        this.Email:' '
    };*/

    return {
        getData: function () {
            return this.Data;
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
        setData: function (firstName, lastName, pictures, telNum, email) {
            this.FirstName = firstName;
            this.LastName = lastName;
            this.Pictures = pictures;
            this.TelNum = telNum;
            this.Email = email;
            
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
        }

    };
});
//Defines the authorization parameters for the user serssion
myApp.service('UserAuthorizationInfo', function () {


    return {
        setUserAuthData: function (username, token, userPathFirebase, authorize) {
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

        }
    };
});
//This is the main service that grabs the information for the user from firebase and binds it to a service object called UserData. 
//This instance of the service can then be used accross scopes and controllers as a dependency
myApp.service('UserInformation',['$state',function($state){
	
	return {
        setUserInformation: function (firstName, lastName, email, telNum,pictures,goHomeBoolean) {
        	//console.log("Im updating!")
            this.FirstName = firstName;
           // console.log(this.FirstName);
            this.LastName = lastName;
          //  console.log(this.LastName);
            this.Email = email;
            this.TelNum = telNum;
            this.Pictures=pictures;
            //console.log("Ive updated");
            if(goHomeBoolean){
            	$state.go('Home');
            }
        },
        getUserInformation: function () {
            return {
            	FirstName:this.FirstName,
            	LastName:this.LastName,
            	Email:this.Email,
            	TelNum:this.TelNum,
            	Pictures:this.Pictures


            };

        }
    };


}]);
myApp.service('UserData', ['UserAuthorizationInfo', function (UserAuthorizationInfo) {
    var FirstName;
    var LastName;
    var Email;
    var TelNum;
    this.userAuthorized = UserAuthorizationInfo.authorization;
    var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName + '/fields');

    firebaseLink.on('value', function (snapshot) {
        var newPost = snapshot.val();
        snapshot.forEach(function (data) {
             firebaseUserInformation(data.key(), data.val());

            function firebaseUserInformation(nameOfFirebaseField, stringFirebaseValueContent) {
                if (nameOfFirebaseField !== "logged") {
                    if (nameOfFirebaseField === "picture") {
                        this.image = stringFirebaseValueContent;
                    } else if (nameOfFirebaseField === "FirstName") {
                        this.FirstName = stringFirebaseValueContent;
                        //console.log(this.FirstName);

                    } else if (nameOfFirebaseField === "LastName") {
                        this.LastName = stringFirebaseValueContent;
                        //console.log(this.LastName);

                    } else if (nameOfFirebaseField === "Email") {
                        this.Email = stringFirebaseValueContent;

                    } else if (nameOfFirebaseField === "TelNum") {
                        this.TelNum = stringFirebaseValueContent;
                    }
                }
            }

        });

    });
    return;






}]);