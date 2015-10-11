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
          templateUrl:'tmpl/tmpl.tour.htm',
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