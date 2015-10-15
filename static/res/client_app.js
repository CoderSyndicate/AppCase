// ----------- //
// APPLICATION //
// ----------- //

angular.module('widgets', []).directive('app', function(){
    return {
      restrict: 'E',
      // This HTML will replace the zippy directive.
      replace: true,
      transclude: true,
      scope: { },
      templateUrl: 'tmpl/tmpl.app.tmpl.htm',
      controller:function($scope,$dialog){
        $scope.app= $scope.$parent.app    

        $scope.opts = {
          backdrop: true,
          keyboard: true,
          backdropClick: true,
          templateUrl:'tmpl/tour.tmpl.htm',
          controller: 'TourDialogController',
          resolve:       {app: function() {return angular.copy($scope.app);}}
        }

        $scope.startTour = function(){
           console.log('screeny','Start tour' )

           var d = $dialog.dialog($scope.opts);  
           d.open()
        }
      }
    }
  });


// ---- //
// TOUR //
// ---- //
function TourDialogController($scope, dialog, app){
  $scope.app= app    
  console.log('TestDialog',$scope)
  $scope.close = function(result){
    dialog.close(result);
  };
}


var app = angular.module('app',['widgets','fritzmod','ui.directives','ui.bootstrap']).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:ShowCtrl, templateUrl:'tmpl/show.tmpl.htm'}).
      otherwise({redirectTo:'/'});
  });
 
app.config(function($compileProvider){
  $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|javascript):/);
});

app.config(function($httpProvider){
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
});


app.filter('truncate', function () {
        return function (text, length, end) {
            if (typeof text != "undefined"){
            if (isNaN(length))
                length = 10;

            if (end === undefined)
                end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }
            } else {return ""}

        };
    });


app.filter('newline', function () {
        return function (text) {
            if (typeof text != "undefined"){
              return text.replace(/\n/g, '<br/>')
            } else {return ""}
        };
    });


app.run(function($rootScope, $http, $location) {
  var baseURL = 'data'

  var json2app = function(data){
    c = data
    if (typeof c == "string") c = JSON.parse(data)
    if (typeof c.dateCreated== "string") c.dateCreated= new Date(c.dateCreated)
    if (typeof c.dateUpdated== "string") c.dateUpdated= new Date(c.dateUpdated)
    if (typeof c.dateEnded== "string") c.dateEnded= new Date(c.dateEnded)
    return c
  }

  // -------- //
  // GET APPS //
  // -------- //
  $rootScope.getApps = function(cb){
    $rootScope.getList('data/demo.json',cb)
  }


  // ----------------- //
  // GET LIST OF ITEMS //
  // ----------------- //
  $rootScope.getList = function(uri,callback){
    var cb = callback
    $http({method: 'GET', url:  uri}).
    success(function(data, status) {

      if (typeof data != 'string'){
        var a = [] 
        for (var i=0,ii=data.values.length;i<ii;i+=1){
          var c = json2app(data.values[i].value)


          a.push(c)
        }
      }
      if (typeof a == "undefined") a = []
      console.log('getList:',a)
      cb(a)
    }).
    error(function(data, status) {
    });    
  }

  $rootScope.getObjectList = function(uri,callback){
    var cb = callback
    $http({method: 'GET', url:  uri}).
    success(function(data, status) {

      if (typeof data != 'string'){
        var a = {} 
        for (var i=0,ii=data.values.length;i<ii;i+=1){
          var c = data.values[i]
          a[c.name] = {'name':c.name,'value':c.value}
        }
      }
      if (typeof a == "undefined") a = {}

      console.log('getObjectList:',a)
      cb(a)
    }).
    error(function(data, status) {
    });    
  }

  console.log('root initialized');
});


// --------------- //
// SHOW CONTROLLER //
// --------------- //
function ShowCtrl($scope, $location) {
  //filters
  $scope.filterProjectInWork = true
  $scope.filterProjectPaused = true
  $scope.filterProjectAbandoned = false
  $scope.filterProjectCompleted = true


  $scope.loading = true
  $scope.getApps(function(data){
    $scope.apps = data
    $scope.loading = false
  })

  $scope.isFiltered = function(rec){
    r = false
    if (rec.devStatus == 'In work' && $scope.filterProjectInWork ) r = true
    if (rec.devStatus == 'Paused' && $scope.filterProjectPaused ) r = true
    if (rec.devStatus == 'Abandoned' && $scope.filterProjectAbandoned ) r = true
    if (rec.devStatus == 'Completed' && $scope.filterProjectCompleted ) r = true
    
    if (typeof rec.imgDemo == "undefined"){r=false}
    if (rec.isPrivate){r=false}
    return r
  }

}