
/**
*
*
**/
var myApp=angular.module('MUHCApp');
myApp.controller('PatientPortalController',function(UpdateUI, $rootScope, UserAuthorizationInfo,$location,$anchorScroll,$timeout,$scope,UserMessages){
 function loadInfo(){
           var dataVal= UpdateUI.UpdateUserFields();
           dataVal.then(function(data){
                $timeout(function(){
                  $scope.messages=UserMessages.getUserMessages();
                  $scope.conversation=$scope.messages[$scope.selectedIndex].Messages;
                });
}, function(error){console.log(error);});

        };


         $scope.load = function($done) {
          $timeout(function() {
            loadInfo();
                $done();
                
          }, 1000);
};
 $scope.messages=UserMessages.getUserMessages();
 console.log($scope.messages);
    var FirebaseLink=new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName+'/Messages/0');
    FirebaseLink.on('child_changed',function(snapshot,prevChild){
      console.log(prevChild);
      console.log(snapshot.val());
    },function(error){
      console.log('error');
    });

$scope.personClicked=function(index){
    var conversation=$scope.messages[index].Messages;
    $timeout(function(){
      $scope.glue=false;
      $scope.person.selected='';
      $scope.selectedIndex=index;
      $scope.conversation=conversation;
      $scope.glue=true;
      });
  };
$scope.$watch('person.selected', function(){
  $timeout(function(){
    $scope.glue=false;
    if($scope.person.selected!==undefined){
      var index=$scope.person.selected.index;
      var conversation=$scope.messages[index].Messages;
      $scope.selectedIndex=index;
      $scope.conversation=conversation;
      $scope.glue=true;
  }
  });
 
});
  $scope.person = {};

  $scope.people = [];
  for(var i=0;i<$scope.messages.length;i++){
    var tmp={};
    tmp.name=$scope.messages[i].MessageRecipient;

    tmp.Role=$scope.messages[i].Role;
    tmp.index=i;
    $scope.people.push(tmp);
  }
  $timeout(function(){
    $scope.selectedIndex=0;
    $scope.conversation=$scope.messages[0].Messages;
    $scope.glue=true;
  })
$scope.submitMessage=function(){
  console.log($scope.newMessage);
  var messageTmp={};
  messageTmp.Role='1';
  messageTmp.MessageContent=$scope.newMessage;
  messageTmp.Date=new Date();
  UserMessages.addNewMessageToConversation($scope.selectedIndex, messageTmp.Role, messageTmp.MessageContent, messageTmp.Date);
  console.log($scope.messages);
  $scope.newMessage=''; 

}
/*var firebaseLink=new Firebase("https://blazing-inferno-1723.firebaseio.com/");
 firebaseLink.child('Updates').once('value', function (snapshot) {
        $timeout(function () {
            $scope.updates = snapshot.val();
            $scope.currentTime=new Date();
        
            $scope.arrayUpdates = Object.keys($scope.updates);
        });
    }, function (error) {
        console.log(error);
    });*/

});
myApp.controller('ListOfConversationMobileController',['UpdateUI', '$rootScope', 'UserAuthorizationInfo','$location','$anchorScroll','$timeout','$scope','UserMessages',
  function(UpdateUI, $rootScope, UserAuthorizationInfo,$location,$anchorScroll,$timeout,$scope,UserMessages){
     $scope.$watch('person.selected', function(){
        if($scope.person.selected!==undefined){
          $timeout(function(){
            var index=$scope.person.selected.index;
            $scope.person.selected=undefined;
            myNavigatorMessages.pushPage("pageMessage.html", { param: index }, {animation:'slide'});
          })
        }
    });

     $scope.messages=UserMessages.getUserMessages();    
     $scope.person = {};
     $scope.people = [];
      for(var i=0;i<$scope.messages.length;i++){
        var tmp={};
        tmp.name=$scope.messages[i].MessageRecipient;
        tmp.Role=$scope.messages[i].Role;
        tmp.index=i;
        $scope.people.push(tmp);
        if(i===$scope.messages.length-1){
          $scope.initialized=true;
        }
      }


        $scope.personClicked=function(index){
          $scope.person.selected=undefined;
          myNavigatorMessages.pushPage("pageMessage.html", { param: index }, {animation:'slide'});
        };
    



  }]);


myApp.controller('MessagePageController',function(UserMessages,UpdateUI,$timeout,$scope){
//Loading Functionality
 function loadInfo(){
           var dataVal= UpdateUI.UpdateUserFields();
           dataVal.then(function(data){
                $timeout(function(){
                  $scope.messages=UserMessages.getUserMessages();
                  $scope.conversation=$scope.messages[$scope.selectedIndex].Messages;
                });
}, function(error){console.log(error);});

        };


         $scope.load2 = function($done) {
          $timeout(function() {
            loadInfo();
                $done();
                
          }, 1000);
};

 
//Obtaining Index of current message
 var page = myNavigatorMessages.getCurrentPage();
 var parameters=page.options.param;
//Setting the scroll to last message, and initializing the conversation parameters
 $scope.glue=false;
 $scope.selectedIndex=parameters;
 $scope.messages=UserMessages.getUserMessages();
 $scope.conversation=$scope.messages[$scope.selectedIndex].Messages;
 $scope.glue=true;

//Individual sent message function, saves message via service to firebase and to user's object
 $scope.submitMessage=function(){
  console.log($scope.newMessage);
  var messageTmp={};
  messageTmp.Role='1';
  messageTmp.MessageContent=$scope.newMessage;
  messageTmp.Date=new Date();
  UserMessages.addNewMessageToConversation($scope.selectedIndex, messageTmp.Role, messageTmp.MessageContent, messageTmp.Date);
  console.log($scope.messages);
  $scope.newMessage=''; 
}
});





