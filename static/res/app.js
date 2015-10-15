//
// BACKEND 
//

//fritzify('challenge')
//fritzend.restore() 
//fritzend.restore('user')
//fritzend.restore('challenges')


//syncs GUI with controllers
var goTo = function(l1,l2){
  $('.nav li').removeClass('active')
  $('#div_subnav ul').hide()
  
  if (l1 != ''){
    $('.nav #li_'+l1).addClass('active')
    if (l2 != ''){
      $('#div_subnav #li_'+l1+'_'+l2).addClass('active')
      $('#div_subnav').show()
      $('#div_subnav ul').hide()
      $('#div_subnav #ul_'+l1).show()
    } else  {
      $('#div_subnav').hide()
    }
  }
}


// ----------- //
// APPLICATION //
// ----------- //

var app = angular.module('app',['widgets','fritzmod','ui.directives','ui.bootstrap']).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:MainCtrl, templateUrl:'tmpl/main.tmpl.htm'}).
      when('/show', {controller:ShowCtrl, templateUrl:'tmpl/show.tmpl.htm'}).
      when('/app/:id', {controller:AppCtrl, templateUrl:'tmpl/app.tmpl.htm'}).
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


app.directive('tagInput', function(){
  return {
    restrict: 'E',
    template: '<input type="hidden" style="width:300px" placeholder="placeholder...">',
    replace: true,
    require: '?ngModel',
    link: function ( scope, element, attrs, ngModel ){
     
      var drivenByModel = false;
      
      $(element).select2({
        tags: ["AngularJS","Bootstrap","jQuery","jQueryUI","AngularUI","PhoneGap","JavaScript","HTML5","CCS3","AppEngine","APIs"],
        tokenSeparators: [",", " "],
        formatNoMatches: function(){ return '';} 
      }).on('change', function(e){
          if (!drivenByModel) { 
            ngModel.$setViewValue(e.val);
            scope.$apply();
          } else {
          }
         drivenByModel = false;
       });
      
      
      ngModel.$render = function(){
        drivenByModel = true;
        var data = ngModel.$viewValue;
        $(element).val(data).trigger('change');
      };
    }
  };
});


app.run(function($rootScope, $http, $location) {
  var baseURL = '/sfss/data/'

  var json2app = function(data){
    c = data
    //if (typeof c == "string") c = JSON.parse(data)
    if (typeof c.dateCreated== "string") c.dateCreated= new Date(c.dateCreated)
    if (typeof c.dateUpdated== "string") c.dateUpdated= new Date(c.dateUpdated)
    if (typeof c.dateEnded== "string") c.dateEnded= new Date(c.dateEnded)
    return c
  }

  // -------- //
  // SAVE APP //
  // -------- //
  $rootScope.saveApp = function(id,data,callback){

    //delete temporary properties
    delete data.showMore 

    //default values for Filter
    if (typeof data.isProd == "undefined") data.isProd = false
    if (typeof data.isPrivate== "undefined") data.isPrivate= false



    var cb = callback
    var gid = id
    var gdata = data
    //data = JSON.stringify(data)

    $http({method: 'PUT', data, //
      url:baseURL + id + '.json'}).
    success(function(data, status) {
      console.log(data,status)
      cb(gid)
      //$rootScope.saveAppBackup(gid,gdata)
    }).
    error(function(data, status) {
     
    });  
  }


  // --------------- //
  // SAVE APP BACKUP //
  // --------------- //
  $rootScope.saveAppBackup = function(id,data){
    var gid = id
    data = JSON.stringify(data)
    $http({method: 'POST',  data:$.param({'data':data}), //
      url:baseURL + 'backup-'+id+'/'+new Date().getTime()}).
    success(function(data, status) {
      console.log('saveAppBackup',data,status)
    }).
    error(function(data, status) {
     
    });  
  }

  // -------- //
  // GET APPS //
  // -------- //
  $rootScope.getApps = function(cb){
    $rootScope.getList(baseURL,cb)
  }

  // ------- //
  // GET APP //
  // ------- //
  $rootScope.getApp = function(id,callback){
    var cb = callback

    $http({method: 'GET',
      url:baseURL +id + '.json'}).
    success(function(data, status) {
      console.log('getApp',data.data,status)
      data = json2app(data.data) 
      cb(data)
    }).
    error(function(data, status) {
     
    }); 


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
        for (var i=0,ii=data.data.length;i<ii;i+=1){
          var c = json2app(data.data[i])


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
// MAIN CONTROLLER //
// --------------- //
function MainCtrl($scope, $location) {
  goTo('home','')
  $scope.sortReverse = true
  $scope.sort = 'dateCreated'
  $scope.filterStatus = "!notavailable"
  $scope.apps = []
  $scope.loading = true

  $scope.getPlatform = function(text){
    var dict = {
      "WebApp":"cloud",
      "Android":"mobile-phone",
      "AppEngine":"cogs",
      "Website":"desktop"
    }
    return dict[text]
  }

  $scope.addApp = function(){
    if (typeof $scope.newapp != "undefined" && $scope.newapp != ''){
      //TODO check if app already exists
      var id = $scope.newapp
      var data = {"_id":id}

      $scope.saveApp(id,data,function(id){
        $scope.refresh()
        $scope.newapp = ''
      })
    }
  }

  $scope.refresh = function(){
    $scope.loading = true
    $scope.getApps(function(data){
      $scope.apps = data
      $scope.loading = false
    })
  }

  $scope.changeView = function(id){
    $location.path('/app/'+id)
  }
  
  //init
  $scope.refresh()
}


// --------------- //
// SHOW CONTROLLER //
// --------------- //
function ShowCtrl($scope, $location) {
  goTo('show','')
  //filters
  $scope.filterProjectInWork = true
  $scope.filterProjectPaused = true
  $scope.filterProjectAbandoned = false
  $scope.filterProjectCompleted = true


  $scope.loading = true
  $scope.getApps(function(data){
    console.log('ShowCtrl.getApps', data)
    $scope.apps = data
    $scope.loading = false
  })

  $scope.isFiltered = function(rec){
    r = false
    if (rec.devStatus == 'In work' && $scope.filterProjectInWork ) r = true
    if (rec.devStatus == 'Paused' && $scope.filterProjectPaused ) r = true
    if (rec.devStatus == 'Abandoned' && $scope.filterProjectAbandoned ) r = true
    if (rec.devStatus == 'Completed' && $scope.filterProjectCompleted ) r = true
    
    //TODO show also apps without images if (typeof rec.imgDemo == "undefined"){r=false}
    if (rec.isPrivate){r=false}
    return r
  }

}

// ------------------------- //
// CHALLENGE HOME CONTROLLER //
// ------------------------- //
function AppCtrl($scope, $location, $routeParams ) {
  goTo('','')
  var self = this;
  $scope.loading = true
  $scope.saved = false
  $scope.newFeatureTitle = {'title':''}
  $scope.id=$routeParams.id
  $scope.app={}

  $scope.isClean = function() {
    return angular.equals(self.original, $scope.app);
  }

  $scope.getApp($scope.id,function(data){
    $scope.app = data
    self.original =  angular.copy(data)
    $scope.loading = false
  })

  $scope.save = function(){
    if (!$scope.loading){
      $scope.app.dateUpdated = new Date()
      $scope.saveApp($scope.id,$scope.app,function(){
        $scope.saved = true
      })
      self.original = angular.copy($scope.app)
    }
  }

  $scope.addSS = function(){
    if (typeof $scope.app.screenshots == "undefined") $scope.app.screenshots = []
    var url = ''
    if ($scope.app.imgDemo != ""){
      iMax = $scope.app.screenshots.length
      url = $scope.app.imgDemo.replace('1.',(iMax+1)+'.')
    }
    $scope.app.screenshots.push({'title':'Screenshot','url':url})
  }

  $scope.addLink = function(){
    if (typeof $scope.app.links == "undefined") $scope.app.links = []
    $scope.app.links.push({'title':'','url':''})
  }

  $scope.addFeature = function(){
    if (typeof $scope.app.features == "undefined") {$scope.app.features = []}
    desc = $scope.newFeatureTitle.title
    console.log('newFeature','"'+desc+'"',$scope)
    if (desc != ''){
      console.log('newFeature',desc )
      $scope.app.features.push({'title':desc  })
      $scope.newFeatureTitle.title = ''
    }
  }  

 
}