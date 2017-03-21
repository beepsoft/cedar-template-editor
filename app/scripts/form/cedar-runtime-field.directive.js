'use strict';

define([
  'angular'
], function (angular) {
  angular.module('cedar.templateEditor.form.cedarRuntimeField', [])
      .directive('cedarRuntimeField', cedarRuntimeField);


  cedarRuntimeField.$inject = ["$rootScope", "$sce", "$document", "$translate", "$filter", "$location",
                               "$window", '$timeout',
                               "SpreadsheetService",
                               "DataManipulationService"];

  function cedarRuntimeField($rootScope, $sce, $document, $translate, $filter, $location, $window,
                             $timeout, SpreadsheetService, DataManipulationService) {


    var linker = function ($scope, $element, attrs) {

      $scope.directory = 'runtime';
      $scope.midnight = $translate.instant('GENERIC.midnight');
      $scope.uuid = DataManipulationService.generateTempGUID();
      $scope.data = {
        model: null
      };
      $scope.multipleStates = ['expanded', 'paged'];
      $scope.multipleState = 'paged';
      $scope.index = 0;
      $scope.pageMin = 0;
      $scope.pageMax = 0;
      $scope.pageRange = 6;

      // get the field title
      $scope.getTitle = function (field) {
        return DataManipulationService.getTitle(field);
      };

      // get the field description
      $scope.getDescription = function () {
        return DataManipulationService.getDescription($scope.field);
      };

      // get the field id?
      $scope.getId = function () {
        return DataManipulationService.getId($scope.field);
      };

      // what type?  static, field or element
      $scope.getType = function (field) {
        return DataManipulationService.getId($scope.field);
      };

      // what is the content
      $scope.getContent = function (field) {
        return DataManipulationService.getContent(field);
      };

      // does this field have a value constraint?
      $scope.hasValueConstraint = function () {
        return DataManipulationService.hasValueConstraint($scope.field);
      };

      // get the value constraint literal values
      $scope.getLiterals = function () {
        return DataManipulationService.getLiterals($scope.field);
      };

      // Retrieve appropriate field template file
      $scope.getFieldUrl = function () {
        return 'scripts/form/runtime-field' + '/' + DataManipulationService.getInputType($scope.field) + '.html';
      };

      // what kind of field is this?
      $scope.getInputType = function () {
        return DataManipulationService.getInputType($scope.field);
      };

      $scope.isMultipleChoice = function () {
        return DataManipulationService.isMultipleChoice($scope.field);
      };

      // is the field multiple cardinality?
      $scope.isMultipleCardinality = function () {
        return DataManipulationService.isMultipleCardinality($scope.field);
      };

      // is this field required?
      $scope.isRequired = function () {
        return DataManipulationService.isRequired($scope.field);
      };

      // is this a checkbox, radio or list question?
      $scope.isMultiAnswer = function () {
        return DataManipulationService.isMultiAnswer($scope.field);
      };

      // what is the dom id for this field?
      $scope.getLocator = function (index) {
        return DataManipulationService.getLocator($scope.field, index, $scope.path);
      };

      // is this field actively being edited?
      $scope.isActive = function (index) {
        return DataManipulationService.isActive(DataManipulationService.getLocator($scope.field, index, $scope.path));
      };

      $scope.isInactive = function (index) {
        return DataManipulationService.isInactive(DataManipulationService.getLocator($scope.field, index, $scope.path));
      };

      // is this a youTube field?
      $scope.isYouTube = function (field) {
        return DataManipulationService.isYouTube(field);
      };

      // is this richText?
      $scope.isRichText = function (field) {
        return DataManipulationService.isRichText(field);
      };

      // is this a static image?
      $scope.isImage = function (field) {
        return DataManipulationService.isImage(field);
      };

      // is the previous field static?
      $scope.isPreviousStatic = function () {
        return $scope.previous && DataManipulationService.isStaticField($scope.previous);
      };

      // is the previous field static?
      $scope.isDateRange = function () {
        return DataManipulationService.isDateRange($scope.field);
      };

      // This function initializes the value field (or fields) to null (either @id or @value) if it has not been initialized yet.
      // It also initializes optionsUI
      $scope.initializeValue = function (field) {
        if ($rootScope.isRuntime()) {
          if (!$scope.hasBeenInitialized) {
            $scope.model = DataManipulationService.initializeModel(field, $scope.model, false);
            // If we are creating a new instance, the model is still completely empty. If there are any default values,
            // we set them. It's important to do this only if the model is empty to avoid overriding values of existing
            // instances with default values
            if (DataManipulationService.isMultiAnswer(field)) {
              $scope.optionsUI = {};
              if (field._ui.inputType == 'checkbox') {
                if (!$scope.model || $scope.model.length == 0) {
                  $scope.defaultOptionsToUI(field);
                  $scope.updateModelFromUI(field);
                }
              }
              else if (field._ui.inputType == 'radio') {
                if (!$scope.model || angular.equals($scope.model, {})) {
                  $scope.optionsUI.radioOption = null;
                  $scope.optionsUI.radioPreviousOption = null;
                  $scope.defaultOptionsToUI(field);
                  $scope.updateModelFromUI(field);
                }
              }
              else if (field._ui.inputType == 'list') {
                if (DataManipulationService.isMultipleChoice(field)) {
                  if (!$scope.model || $scope.model.length == 0) {
                    $scope.defaultOptionsToUI(field);
                    $scope.updateModelFromUI(field);
                  }
                }
                else {
                  if (!$scope.model || angular.equals($scope.model, {})) {
                    $scope.defaultOptionsToUI(field);
                    $scope.updateModelFromUI(field);
                  }
                }
              }
            }
            // Initialize values to store null, if the model has not been initialized yet by setting default values
            DataManipulationService.initializeValue(field, $scope.model);
            if (DataManipulationService.isMultiAnswer(field)) {
              // Load selected values from the model to the UI, if any
              $scope.updateUIFromModel(field);
            }
          }
          $scope.hasBeenInitialized = true;
        }
      };

      // Sets UI selections based on the default options
      $scope.defaultOptionsToUI = function (field) {
        if (DataManipulationService.isMultiAnswer(field)) {
          $scope.optionsUI = {};
          var literals = DataManipulationService.getLiterals(field);
        }
        if (field._ui.inputType == 'checkbox') {
          for (var i = 0; i < literals.length; i++) {
            if (literals[i].selectedByDefault) {
              var value = literals[i].label;
              $scope.optionsUI[value] = value;
            }
          }
        }
        else if (field._ui.inputType == 'radio') {
          for (var i = 0; i < literals.length; i++) {
            if (literals[i].selectedByDefault) {
              var value = literals[i].label;
              $scope.optionsUI.radioOption = value;
            }
          }
        }
        else if (field._ui.inputType == 'list') {
          // Multiple-choice list
          if (DataManipulationService.isMultipleChoice(field)) {
            $scope.optionsUI.listMultiSelect=[];
            for (var i = 0; i < literals.length; i++) {
              if (literals[i].selectedByDefault) {
                $scope.optionsUI.listMultiSelect.push(literals[i].label);
              }
            }
          }
          // Single-choice list
          else {
            for (var i = 0; i < literals.length; i++) {
              if (literals[i].selectedByDefault) {
                $scope.optionsUI.listSingleSelect = literals[i].label;
                // break for loop
                break;
              }
            }
          }
        }
      };

      // This function is used to uncheck radio buttons
      $scope.uncheck = function (field, label) {
        if (field._ui.inputType == 'radio') {
          if ($scope.optionsUI.radioPreviousOption == label) {
            // Uncheck
            $scope.optionsUI.radioOption = null;
            $scope.optionsUI.radioPreviousOption = null;
            $scope.updateModelFromUI(field);
          }
          else {
            $scope.optionsUI.radioPreviousOption = label;
          }
        }
      };

      // Sets the instance @value fields based on the options selected at the UI
      $scope.updateModelFromUI = function (field) {
        var fieldValue = DataManipulationService.getFieldValue(field);

        if (DataManipulationService.isMultiAnswer(field)) {
          // Reset model
          $scope.model = DataManipulationService.initializeModel(field, $scope.model, true);

          if (field._ui.inputType == 'checkbox') {
            // Insert the value at the right position in the model. optionsUI is an object, not an array,
            // so the right order in the model is not ensured.
            // The following lines ensure that each option is inserted into the right place
            var orderedOptions = DataManipulationService.getLiterals(field);
            for (var i = 0; i < orderedOptions.length; i++) {
              var option = orderedOptions[i].label;
              if ($scope.optionsUI[option]) {
                var newValue = {};
                newValue[fieldValue] = $scope.optionsUI[option];
                $scope.model.push(newValue);
              }
            }
            // Default value
            if ($scope.model.length == 0) {
              DataManipulationService.initializeValue(field, $scope.model);
            }
          }
          else if (field._ui.inputType == 'radio') {
            $scope.model[fieldValue] = $scope.optionsUI.radioOption;
          }
          else if (field._ui.inputType == 'list') {
            // Multiple-choice list
            if (DataManipulationService.isMultipleChoice(field)) {
              for (var i = 0; i < $scope.optionsUI.listMultiSelect.length; i++) {
                var newValue = {};
                newValue[fieldValue] = $scope.optionsUI.listMultiSelect[i];
                $scope.model.push(newValue);
              }
            }
            // Single-choice list
            else {
              var newValue = {};
              $scope.model[fieldValue] = $scope.optionsUI.listSingleSelect;
            }
            // Remove the empty string created by the "Nothing selected" option (if it exists)
            DataManipulationService.removeEmptyStrings(field, $scope.model);
            // If the model is empty, set default value
            DataManipulationService.initializeValue(field, $scope.model);
          }
        }
      };

      // Set the UI with the values from the model
      $scope.updateUIFromModel = function (field) {
        if (DataManipulationService.isMultiAnswer(field)) {
          var fieldValue = DataManipulationService.getFieldValue(field);
          $scope.optionsUI = {};
        }
        if (field._ui.inputType == 'checkbox') {
          for (var i=0; i<$scope.model.length; i++) {
            var value = $scope.model[i][fieldValue];
            $scope.optionsUI[value] = value;
          }
        }
        else if (field._ui.inputType == 'radio') {
          // For this field type only one selected option is possible
          if ($scope.model) {
            $scope.optionsUI.radioOption = $scope.model[fieldValue];
          }
        }
        else if (field._ui.inputType == 'list') {
          // Multi-choice list
          if (DataManipulationService.isMultipleChoice(field)) {
            $scope.optionsUI.listMultiSelect=[];
            for (var i=0; i<$scope.model.length; i++) {
              $scope.optionsUI.listMultiSelect.push($scope.model[i][fieldValue]);
            }
          }
          // Single-choice list
          else {
            // For this field type only one selected option is possible
            if ($scope.model.length > 0) {
              $scope.optionsUI.listSingleSelect = $scope.model[0][fieldValue];
            }
          }
        }
      };

      // This function initializes the value @type field if it has not been initialized yet
      $scope.initializeValueType = function(field) {
        DataManipulationService.initializeValueType(field, $scope.model);
      };

      // add more instances to a multiple cardinality field if possible
      $scope.addMoreInput = function () {

        var maxItems = DataManipulationService.getMaxItems($scope.field);
        if ((!maxItems || $scope.model.length < maxItems)) {

          // add another instance in the model
          $scope.model.push({'@value': null});

          // activate the new instance
          $timeout($scope.setActive($scope.model.length - 1, true), 100);
        }
      };

      $scope.pageMinMax = function () {
        $scope.pageMax = Math.min($scope.valueArray.length, $scope.index + $scope.pageRange);
        $scope.pageMin = Math.max(0, $scope.pageMax - $scope.pageRange);
      };

      $scope.selectPage = function (i) {

        $scope.onSubmit($scope.index, i);
      };

      // remove the value of field at index
      $scope.removeInput = function (index) {
        var minItems = DataManipulationService.getMinItems($scope.field) || 0;
        if ($scope.model.length > minItems) {
          $scope.model.splice(index, 1);
        }
      };

      $scope.isExpandable = function () {
        return false;
      };

      $scope.isField = function () {
        return true;
      };

      $scope.isElement = function () {
        return false;
      };

      $scope.expandAll = function () {
      };

      // show this field as a spreadsheet
      $scope.switchToSpreadsheet = function () {

        SpreadsheetService.switchToSpreadsheetField($scope, $element);
      };

      // look for errors
      $scope.checkFieldConditions = function (field) {
        field = $rootScope.schemaOf(field);

        var unmetConditions = [],
            extraConditionInputs = ['checkbox', 'radio', 'list'];

        // Field title is required, if it's empty create error message
        if (!field._ui.title) {
          unmetConditions.push('"Enter Field Title" input cannot be left empty.');
        }

        // If field is within multiple choice field types
        if (extraConditionInputs.indexOf($scope.getInputType()) !== -1) {
          var optionMessage = '"Enter Option" input cannot be left empty.';
          angular.forEach(field._valueConstraints.literals, function (value, index) {
            // If any 'option' title text is left empty, create error message
            if (!value.label.length && unmetConditions.indexOf(optionMessage) == -1) {
              unmetConditions.push(optionMessage);
            }
          });
        }
        // If field type is 'radio' or 'pick from a list' there must be more than one option created
        if (($scope.getInputType() == 'radio' || $scope.getInputType() == 'list') && field._valueConstraints.literals && (field._valueConstraints.literals.length <= 1)) {
          unmetConditions.push('Multiple Choice fields must have at least two possible options');
        }
        // Return array of error messages
        return unmetConditions;
      };

      $scope.getYouTubeEmbedFrame = function (field) {

        var width = 560;
        var height = 315;
        var content = $rootScope.propertiesOf(field)._content.replace(/<(?:.|\n)*?>/gm, '');

        if ($rootScope.propertiesOf(field)._size && $rootScope.propertiesOf(field)._size.width && Number.isInteger($rootScope.propertiesOf(field)._size.width)) {
          width = $rootScope.propertiesOf(field)._size.width;
        }
        if ($rootScope.propertiesOf(field)._size && $rootScope.propertiesOf(field)._size.height && Number.isInteger($rootScope.propertiesOf(field)._size.height)) {
          height = $rootScope.propertiesOf(field)._size.height;
        }

        // if I say trust as html, then better make sure it is safe first
        return $sce.trustAsHtml('<iframe width="' + width + '" height="' + height + '" src="https://www.youtube.com/embed/' + content + '" frameborder="0" allowfullscreen></iframe>');

      };

      // string together the values for a checkbox, list or radio item
      $scope.getValueString = function (valueElement) {
        var result = '';
        if (valueElement) {
          for (var i = 0; i < valueElement.length; i++) {
            var fieldValueLabel = null;
            if (valueElement[i]['@value'] && valueElement[i]['@value'] != null) {
              fieldValueLabel = '@value';
            }
            else if (valueElement[i]['@id'] && valueElement[i]['@id'] != null) {
              fieldValueLabel = '_valueLabel';
            }
            if (fieldValueLabel != null) {
              result += valueElement[i][fieldValueLabel];
              if (i < valueElement.length - 1) {
                result += ', ';
              }
            }
          }
          result = result.trim().replace(/,\s*$/, "");
        }
        return result;
      };

      // watch for a request to set this field active
      $scope.$on('setActive', function (event, args) {
        var id = args[0];
        var index = args[1];
        var path = args[2];
        var value = args[3];

        if (id === $scope.getId() && path == $scope.path) {
          $scope.setActive(index, value);
        }
      });

      $scope.setInactive = function (index) {
        $scope.setActive(index, false);
      };

      $scope.setActiveMaybe = function (index) {
        if (!$scope.isActive(index)) {
          $scope.setActive(index, true);
        }
      };



      // set this field and index active
      $scope.setActive = function (index, value) {

        // off or on
        var active = (typeof value === "undefined") ? true : value;
        var locator = $scope.getLocator(index);
        var current = DataManipulationService.isActive(locator);

        if (active !== current) {

          // if zero cardinality,  add a new item
          if (active && $scope.isMultipleCardinality() && $scope.model.length <= 0) {
            $scope.addMoreInput();
          }

          // set it active or inactive
          DataManipulationService.setActive($scope.field, index, $scope.path, active);

          if (active) {

            $scope.index = index;
            $scope.pageMinMax();


            // scroll it into the center of the screen and listen for shift-enter
            $scope.scrollToLocator(locator, ' .select');
            $document.unbind('keypress');
            $document.bind('keypress', function (e) {
              $scope.isSubmit(e, index);
            });
            $document.unbind('keyup');
            $document.bind('keyup', function (e) {
              $scope.isSubmit(e, index);
            });

          } else {
            // set blur and force a redraw
            jQuery("#" + locator).blur();

            setTimeout(function () {
              $scope.$apply();
            }, 0);

          }
        }
      };

      // scroll within the template to the field with the locator, focus and select the tag
      $scope.scrollToLocator = function (locator, tag) {

        $scope.setHeight = function () {


          // apply any changes first before examining dom elements
          $scope.$apply();

          var window = angular.element($window);
          var windowHeight = $(window).height();
          var target = jQuery("#" + locator);
          if (target) {
            // console.log('scrollToLocator found target' + locator + ' ' + tag);

            var targetTop = target.offset().top;
            var targetHeight = target.outerHeight(true);
            var scrollTop = jQuery('.template-container').scrollTop();
            var newTop = scrollTop + targetTop - ( windowHeight - targetHeight ) / 2;


            // console.log('scroll from ' + scrollTop + ' to ' + newTop);
            // console.log('targetHeight ' + targetHeight + ' targetTop ' + targetTop +  ' windowHeight ' + windowHeight) ;

            jQuery('.template-container').animate({scrollTop: newTop}, 'fast');

            // focus and maybe select the tag
            if (tag) {
              var e = jQuery("#" + locator + ' ' + tag);
              if (e.length) {
                e[0].focus();
                if (!e.is('select')) {
                  e[0].select();
                }
              }
            }
          }
        };

        $timeout($scope.setHeight, 100);

      };

      $scope.getPageWidth = function () {
        var result = '100%';
        var e = jQuery('.right-body');
        if (e.length > 0) {
          result = e[0].clientWidth + 'px';
        }
        return result;
      };

      // how deeply is this this field nested in the template?
      $scope.getNestingCount = function () {

        var path = $scope.path || '';
        var arr = path.split('-');
        return arr.length;
      };

      // turn the nesting into a px amount
      $scope.getNestingStyle = function () {
        return (-16 * ($scope.getNestingCount() - 2) - 1) + 'px';
      };

      // submit this edit
      $scope.onSubmit = function (index, next) {

        if ($scope.isActive(index)) {

          DataManipulationService.setActive($scope.field, index, $scope.path, false);

          // is there a next one to set active, go to the next index,  or go to parent's next field
          if ($scope.isMultipleCardinality()) {
            if (next != null) {
              $scope.setActive(next, true);
            } else {
              if (index + 1 < $scope.model.length) {
                $scope.setActive(index + 1, true);
              }
            }
          } else {
            $scope.$parent.nextChild($scope.field, index, $scope.path);

          }
        } else {
          //console.log("error: not active");
        }
      };

      // is this a submit?  shift-enter qualifies as a submit for any field
      $scope.isSubmit = function (keyEvent, index) {
        if (keyEvent.type === 'keypress' && keyEvent.which === 13 && keyEvent.ctrlKey) {
          $scope.onSubmit(index);
        }
        if (keyEvent.type === 'keyup' && keyEvent.which === 9) {
          keyEvent.preventDefault();
          $scope.onSubmit(index);
        }
      };

      // an array of model values
      $scope.valueArray;
      $scope.setValueArray = function () {
        $scope.valueArray = [];
        if ($scope.isMultiAnswer()) {
          $scope.valueArray.push($scope.model);
        } else if ($scope.model instanceof Array) {
          $scope.valueArray = $scope.model;
        } else {
          if (!$scope.model) {
            $scope.model = {};
          }
          $scope.valueArray = [];
          $scope.valueArray.push($scope.model);
        }
      };
      $scope.setValueArray();

      $scope.showMultiple = function (state) {
        return ($scope.multipleState === state);
      };

      $scope.cardinalityString = function () {
        return DataManipulationService.cardinalityString($scope.field);
      };

      $scope.toggleMultiple = function () {
        var index = $scope.multipleStates.indexOf($scope.multipleState);
        index = (index + 1) % $scope.multipleStates.length;
        $scope.multipleState = $scope.multipleStates[index];
        if ($scope.multipleState === 'spreadsheet') {
          setTimeout(function () {
            $scope.switchToSpreadsheet();
          }, 0);
        }
        return $scope.multipleState;
      };

      $scope.isRecommended = function () {
        return $rootScope.vrs.getIsValueRecommendationEnabled($rootScope.schemaOf($scope.field));
      };

      $scope.isConstrained = function () {
        return $scope.hasValueConstraint() && !$scope.isRecommended();
      };

      $scope.isRegular = function () {
        return !$scope.isConstrained() && !$scope.isRecommended();
      };

      // strip midnight off the date time string
      $scope.formatDateTime = function (value) {

        var result = value;
        if (value) {

          var index = value.indexOf($scope.midnight);
          if (index != -1) {
            result = value.substring(0, index);
          }
        }
        return result;
      };

      // form has been submitted, look for errors
      $scope.$on('submitForm', function (event) {

        // If field is required and is empty, emit failed emptyRequiredField event
        if ($rootScope.schemaOf($scope.field)._valueConstraints && $rootScope.schemaOf($scope.field)._valueConstraints.requiredValue) {
          var allRequiredFieldsAreFilledIn = true;
          var min = $scope.field.minItems || 0;

          if (angular.isArray($scope.model)) {
            if ($scope.model.length < min) {
              allRequiredFieldsAreFilledIn = false;
            } else {
              angular.forEach($scope.model, function (valueElement) {
                if (!valueElement || !valueElement['@value']) {
                  allRequiredFieldsAreFilledIn = false;
                } else if (angular.isArray(valueElement['@value'])) {
                  var hasValue = false;
                  angular.forEach(valueElement['@value'], function (ve) {
                    hasValue = hasValue || !!ve;
                  });

                  if (!hasValue) {
                    allRequiredFieldsAreFilledIn = false;
                  }
                } else if (angular.isObject(valueElement['@value'])) {
                  if ($rootScope.isEmpty(valueElement['@value'])) {
                    allRequiredFieldsAreFilledIn = false;
                  } else if (DataManipulationService.getFieldSchema($scope.field)._ui.dateType == "date-range") {
                    if (!valueElement['@value'].start || !valueElement['@value'].end) {
                      allRequiredFieldsAreFilledIn = false;
                    }
                  } else {
                    // Require at least one checkbox is checked.
                    var hasValue = false;
                    angular.forEach(valueElement['@value'], function (value, key) {
                      hasValue = hasValue || value;
                    });

                    if (!hasValue) {
                      allRequiredFieldsAreFilledIn = false;
                    }
                  }
                }
              });
            }
          } else {
            // allRequiredFieldsAreFilledIn = false;
            if (!$scope.model || !$scope.model['@value']) {
              allRequiredFieldsAreFilledIn = false;
            } else if (angular.isArray($scope.model['@value'])) {
              var hasValue = false;
              angular.forEach($scope.model['@value'], function (ve) {
                hasValue = hasValue || !!ve;
              });

              if (!hasValue) {
                allRequiredFieldsAreFilledIn = false;
              }
            } else if (angular.isObject($scope.model['@value'])) {
              if ($rootScope.isEmpty($scope.model['@value'])) {
                allRequiredFieldsAreFilledIn = false;
              } else if (DataManipulationService.getFieldSchema($scope.field)._ui.dateType == "date-range") {
                if (!$scope.model['@value'].start || !$scope.model['@value'].end) {
                  allRequiredFieldsAreFilledIn = false;
                }
              } else {
                // Require at least one checkbox is checked.
                var hasValue = false;
                angular.forEach($scope.model['@value'], function (value, key) {
                  hasValue = hasValue || value;
                });

                if (!hasValue) {
                  allRequiredFieldsAreFilledIn = false;
                }
              }
            }
          }

          if (!allRequiredFieldsAreFilledIn) {
            // add this field instance the the emptyRequiredField array
            $scope.$emit('emptyRequiredField',
                ['add', DataManipulationService.getFieldSchema($scope.field)._ui.title, $scope.uuid]);
          }
        }

        // If field is required and is not empty, check to see if it needs to be removed from empty fields array
        if ($rootScope.schemaOf($scope.field)._valueConstraints &&
            $rootScope.schemaOf($scope.field)._valueConstraints.requiredValue && allRequiredFieldsAreFilledIn) {
          //remove from emptyRequiredField array
          $scope.$emit('emptyRequiredField',
              ['remove', $scope.getTitle($scope.field), $scope.uuid]);
        }


        var allFieldsAreValid = true;
        if (angular.isArray($scope.model)) {
          for (var i = 0; i < $scope.model.length; i++) {
            if (!DataManipulationService.isValidPattern($scope.field, i)) {
              $scope.model[i]['@value'] = DataManipulationService.getDomValue($scope.field, i);
              allFieldsAreValid = false;
            }
          }

        } else {
          if (!DataManipulationService.isValidPattern($scope.field, 0)) {
            $scope.model['@value'] = DataManipulationService.getDomValue($scope.field, 0);
            allFieldsAreValid = false;

          }
        }

        if ($rootScope.hasValueConstraint($rootScope.schemaOf($scope.field)._valueConstraints)) {

          if (angular.isArray($scope.model)) {
            angular.forEach($scope.model, function (valueElement) {
              if (angular.isArray(valueElement['@value'])) {
                angular.forEach(valueElement['@value'], function (ve) {
                  if (!$rootScope.isValueConformedToConstraint(ve, $scope.field["@id"],
                          $rootScope.schemaOf($scope.field)._valueConstraints)) {
                    allFieldsAreValid = false;
                  }
                });
              } else if (angular.isObject(valueElement['@value'])) {
                if (!$rootScope.isValueConformedToConstraint(valueElement['@value'], $scope.field["@id"],
                        $rootScope.schemaOf($scope.field)._valueConstraints)) {
                  allFieldsAreValid = false;
                }
              }
            });
          } else {
            if (angular.isArray($scope.model['@value'])) {
              angular.forEach($scope.model['@value'], function (ve) {
                if (!$rootScope.isValueConformedToConstraint(ve, $scope.field["@id"],
                        $rootScope.schemaOf($scope.field)._valueConstraints)) {
                  allFieldsAreValid = false;
                }
              });
            } else if (angular.isObject($scope.model['@value'])) {
              if (!$rootScope.isValueConformedToConstraint($scope.model['@value'], $scope.field["@id"],
                      $rootScope.schemaOf($scope.field)._valueConstraints)) {
                allFieldsAreValid = false;
              }
            }
          }
        }

        $scope.$emit('invalidFieldValues',
            [allFieldsAreValid ? 'remove' : 'add', DataManipulationService.getFieldSchema($scope.field)._ui.title,
             $scope.uuid]);

      });

      // form has been saved, look for errors
      $scope.$on("saveForm", function () {

        var id = DataManipulationService.getId($scope.field);
        var title = DataManipulationService.getTitle($scope.field);
        var action = ($scope.isEditState() && !$scope.canDeselect($scope.field)) ? 'add' : 'remove';

        $scope.$emit("invalidFieldState", [action, title, id]);

      });


    };

    return {
      templateUrl: 'scripts/form/cedar-runtime-field.directive.html',
      restrict   : 'EA',
      scope      : {
        field         : '=',
        model         : '=',
        renameChildKey: "=",
        preview       : "=",
        delete        : '&',
        ngDisabled    : "=",
        path          : '=',
        previous      : '='

      },
      controller : function ($scope, $element) {
        var addPopover = function ($scope) {
          //Initializing Bootstrap Popover fn for each item loaded
          setTimeout(function () {
            if ($element.find('#field-value-tooltip').length > 0) {
              $element.find('#field-value-tooltip').popover();
            } else if ($element.find('[data-toggle="popover"]').length > 0) {
              $element.find('[data-toggle="popover"]').popover();
            }
          }, 1000);
        };

        addPopover($scope);

      },
      replace    : true,
      link       : linker
    };

  }

});