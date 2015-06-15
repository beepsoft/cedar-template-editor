'use strict';

angularApp.directive('formDirective', function ($rootScope, $document, $timeout) {
  return {
    controller: function($scope){

      // Initializing the empty model to submit data to
      $scope.model = {
        "@context": {}
      };

      // $scope.formFields object to loop through to call field-directive
      $scope.formFields = {};
      // $scope.formFieldsOrder array to loop over for proper ordering of items/elements
      $scope.formFieldsOrder = [];

      $scope.addPopover = function() {
        //Initializing Bootstrap Popover fn for each item loaded
        $timeout(function() {
          angular.element('[data-toggle="popover"]').popover();
        }, 1000);
      };

      $document.on('click', function(e) {
        // Check if Popovers exist and close on click anywhere but the popover toggle icon
        if( angular.element(e.target).data('toggle') !== 'popover' && angular.element('.popover').length ) {
          angular.element('[data-toggle="popover"]').popover('hide');
        }
      });

      $scope.parseForm = function(form) {
        // Loop through form.properties object looking for Elements
        angular.forEach(form.properties, function(value, key) {
          if ($rootScope.ignoreKey(key)) {
            // Elements found marked as [key]
            $scope.model[key] = {};
            // The 'value' property is how we distinguish if this is a field level element or an embedded element
            if(value.properties.hasOwnProperty('value')) {
              // Field level reached, create new object in $scope.formFields;
              $scope.fieldLevelReached(key, value.properties.value);
            } else {
              // Not field level, loop through next set of properties looking for 'value' property
              angular.forEach(value.properties, function(subvalue, subkey) {
                if ($rootScope.ignoreKey(subkey)) {
                  // Elements found marked as [subkey], embedding within existing [key] paramter
                  $scope.model[key][subkey] = {};
                  // Check if we've found field level properties object
                  if(subvalue.properties.hasOwnProperty('value')) {
                    // Field level reached, create new object in $scope.formFields;
                    $scope.fieldLevelReached(subkey, subvalue.properties.value, key);
                  } else {
                    // Case for element with embedded elements - third level of nesting 
                    angular.forEach(subvalue.properties, function(tertiaryValue, tertiaryKey) {
                      if ($rootScope.ignoreKey(tertiaryKey)) {
                        // Elements found marked as [tertiaryKey], embedding within existing [parentKey]
                        // and [key] paramters
                        $scope.model[key][subkey][tertiaryKey] = {};
                        // Check if we've found field level properties object
                        if (tertiaryValue.properties.hasOwnProperty('value')) {
                          // Field level reached, create new object in $scope.formFields;
                          $scope.fieldLevelReached(tertiaryKey, tertiaryValue.properties.value, subkey);
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        });
      };

      $scope.fieldLevelReached = function(key, params, parentKey) {
        
        if (parentKey !== undefined) {
          // If these are nested fields the parent key will be the element they belong to,
          // this element key is needed for proper grouping in the rendering preview
          $scope.formFields[parentKey] = $scope.formFields[parentKey] || {};
          $scope.formFields[parentKey][key] = params;

          // Binding $scope.model to local model for output serialization with proper element nesting
          $scope.model[parentKey][key] = params.model;

          // $scope.formFieldsOrder will be used for sorting order of $scope.formFields
          if ($scope.formFieldsOrder.indexOf(parentKey) == -1) {
            $scope.formFieldsOrder.push(parentKey);
          }
        } else {
          // These are field level objects with no parent element grouping
          $scope.formFields[key] = $scope.formFields[key] || {};
          $scope.formFields[key] = params;

          // Binding $scope.model to local model for output serialization
          $scope.model[key] = params.model;

          // $scope.formFieldsOrder will be used for sorting order of $scope.formFields
          if ($scope.formFieldsOrder.indexOf(key) == -1) {
            $scope.formFieldsOrder.push(key);
          }
        }
      };

      // Using Angular's $watch function to call $scope.parseForm on form.properties initial population and on update
      $scope.$watch('form.properties', function () {
        $scope.parseForm($scope.form);
        $scope.addPopover();
      }, true);
    },
    templateUrl: './views/directive-templates/form-render.html',
    restrict: 'E',
    scope: {
        form:'='
    }
  };
});
