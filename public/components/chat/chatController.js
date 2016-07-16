fragileApp.controller('chatController',["$scope",'$rootScope', '$mdSidenav','$q', '$timeout','$mdDialog', '$mdMedia','Socket','projectService', function($scope,$rootScope, $mdSidenav,$q, $timeout,$mdDialog, $mdMedia,Socket,projectService) {
  var socket = Socket($scope);

  $scope.room=null;
  $scope.id='';
  $scope.projects=$rootScope.projects;
  $scope.openLeftMenu = function(prj) {
    $scope.project=prj;
    $mdSidenav('left').toggle();
    projectService.getMembers(prj._id).success(function(response) {
      console.log(response);
      response.memberList.forEach(function(data) {
        data.fullName = data.firstName + " " + data.lastName;
      })
      $scope.projMemberList = response.memberList;
    });

  };
  $scope.messages=[];
  var indices=[];


  $scope.channels=[{"prId":"","id":"","name":"general"},{"prId":"","id":"","name":"random"}];
  $scope.click = function() {
    $scope.boolChangeClass = !$scope.boolChangeClass;
    $scope.$apply();
  }


  function DialogController($scope, $mdDialog,data) {
    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
    $scope.project=data;
  }

  function DialogController2($scope, $mdDialog,data) {
    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
    $scope.project=data;
  }




  $scope.createGroup = function(ev,project) {
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;

    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'dialog1.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: useFullScreen,
      locals:{data:project}
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });



    $scope.$watch(function() {
      return $mdMedia('xs') || $mdMedia('sm');
    }, function(wantsFullScreen) {
      $scope.customFullscreen = (wantsFullScreen === true);
    });

  };

  //new member

  $scope.inviteUser = function(ev,project) {
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;

    $mdDialog.show({
      controller: DialogController2,
      templateUrl: 'dialog2.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: useFullScreen,
      locals:{data:project}
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });



    $scope.$watch(function() {
      return $mdMedia('xs') || $mdMedia('sm');
    }, function(wantsFullScreen) {
      $scope.customFullscreen = (wantsFullScreen === true);
    });

  };

  //new member dialog ends here
  //chat functionality starts from here
  var userId='user1';

  $scope.chatRoom=function(group){
    $scope.room=group;
  }
  var roomData={};

  $scope.topic="";

  //selecting member
  $scope.chat=function(member,projectId){
    $scope.room=member.fullName;
    var emitData={
      'message':  {'command':'generateUUID'},
      'details':{'member':member._id,'projectId':projectId,'userId':$rootScope.currentUserID}
    }
    projectService.getUuid(projectId,member).success(function(response){
      if(response.object!==undefined){
        console.log(response);
        $scope.topic=response.object;
        var historyData={
          'message':{'command':'retrieveHistory','content':$scope.topic}
        }

        //socket.emit('history',historyData);
      }
      else
      {console.log("no data");
      console.log(response);
      socket.emit('subscribe',emitData);}
    })

  }


  //sending message
  $scope.send=function(){
    var message={
      'message':{'text':$scope.message,"sentBy":$rootScope.user.fullName,"content":$scope.topic,'command':'sendMessage'}, //topic to be saved
      'command':"sendMessage"
    }
    $scope.message="";
    socket.emit('chatMsg',message);
  }


  socket.on('room:chatMessages',function(data){
    // if($scope.roomId==data.chatRoomId)
    {
      console.log(data);
      //{_id: "578a160234527ed96dd07624", relation: "chatOver", object: "3c7ef0b9-1e0a-4336-973a-232ccb4e1fca", projectId: "5789e1593a46322768eaffc9", __v: 0…}
      //   var flag=false;
      //   $scope.messages=[];
      //   var myArray=[];
      //     if(flag==false){
      //       var obj={};
      //       obj[data.content]=myArray.push(data);
      //       $scope.messages.push(obj);
      //       flag=true;
      //     }else {
      //         $scope.messages.filter(function(obj){
      //           obj.
      //         })
      //
      //       }
      //   $scope.messages[data.content].push(data);
      // $scope.messages.push({data.content:data})
      // console.log($scope.messages);
      $scope.messages.push(data)
      if(indices.indexOf(data.content)==-1){
        indices.push(data.content);
        var obj={};
        var myArray=[];
        obj[data.content]=myArray.push(data);
console.log($scope.messages[data.content]);
        $scope.messages.push(obj)
      }
      else{
        $scope.messages[data.content].push(data);
      }



    }
  })











}])
.config(function($mdIconProvider) {
  $mdIconProvider
  .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
  .defaultIconSet('img/icons/sets/core-icons.svg', 24);
});
