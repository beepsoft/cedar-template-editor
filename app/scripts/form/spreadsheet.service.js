'use strict';

define([
      'angular'
    ], function (angular) {
      angular.module('cedar.templateEditor.form.spreadsheetService', [])
          .service('SpreadsheetService', SpreadsheetService);

      SpreadsheetService.$inject = ['$rootScope', '$filter', 'DataManipulationService', 'DataUtilService'];

      function SpreadsheetService($rootScope, $filter, DataManipulationService, DataUtilService) {

        var service = {
          serviceId: "SpreadsheetService"
        };

        service.validators = function () {
          email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
        };

        service.customRendererCheckboxes = function (instance, td, row, col, prop, value, cellProperties) {
          var objValue = JSON.parse(value);
          var s = "";
          var sep = "";
          for (var name in objValue) {
            if (objValue[name]) {
              s += sep + name;
              sep = ", ";
            }
          }
          var escaped = Handsontable.helper.stringify(s);
          td.innerHTML = escaped;
          return td;
        };

        service.customRendererDeepObject = function (instance, td, row, col, prop, value, cellProperties) {
          var s = value + '<i class="cedar-svg-element inSpreadsheetCell"></i>';
          var escaped = Handsontable.helper.stringify(s);
          td.innerHTML = escaped;
          td.className = 'htDimmed';
          return td;
        };

        // Handsontable.renderers.registerRenderer('checkboxes', service.customRendererCheckBoxes);
        // Handsontable.renderers.registerRenderer('deepObject', service.customRendererDeepObject);

        // copy table data to source table
        var updateDataModel = function ($scope) {
          var sds = $scope.spreadsheetDataScope;
          for (var row in sds.tableData) {
            for (var col in sds.tableData[row]) {

              // do we have this row in the source?
              if (row >= sds.tableDataSource.length) {
                sds.tableDataSource.push([]);
                for (var i = 0; i < $scope.config.columns.length; i++) {
                  var obj = {};
                  obj['@value'] = '';
                  sds.tableDataSource[row].push(obj);
                }
              }

              var inputType = sds.columnDescriptors[col].type;
              var cedarType = sds.columnDescriptors[col].cedarType;
              if (inputType == 'dropdown') {
                var containerArray = [];
                containerArray.push(sds.tableData[row][col]);
                sds.tableDataSource[row][col]['@value'] = containerArray;
              } else if (cedarType == 'checkbox') {
                var valueObject = JSON.parse(sds.tableData[row][col]);
                var value = {};
                for (var key in valueObject) {
                  value[key] = true;
                }
                sds.tableDataSource[row][col]['@value'] = value;
              } else {
                sds.tableDataSource[row][col]['@value'] = sds.tableData[row][col];
              }
            }
          }
        };

        // get column headers for single field or element's fields
        var getColumnHeaderOrder = function (context, scopeElement) {
          var headerOrder = [];
          if (context.isField()) {
            headerOrder.push('value');
          } else {
            var itemOrder = DataManipulationService.getOrder(scopeElement);
            for (var i in itemOrder) {
              headerOrder.push(itemOrder[i]);
            }
          }
          return headerOrder;
        };

        // extract a list of option labels
        var extractOptionsForList = function (options) {
          var list = [];
          for (var i in options) {
            list.push(options[i].label);
          }
          return list;
        };

        // build a description of the cell data
        var getDescriptor = function(node) {
          var desc = {};
          var literals = DataManipulationService.getLiterals(node);
          var inputType = DataManipulationService.getInputType(node);
          desc.cedarType = inputType;

          if (inputType == 'date') {
            desc.type = 'date';
            desc.dateFormat = 'MM/DD/YYYY HH:mm';
            desc.correctFormat = true;
          } else if (inputType == 'email') {
            desc.allowInvalid = true;
            desc.validator = service.validators.email;
          } else if (inputType == 'numeric') {
            desc.type = 'numeric';
          } else if (inputType == 'list') {
            //if (valueConstraints.multipleChoice == false) {
            desc.type = 'dropdown';
            desc.source = extractOptionsForList(valueConstraints.literals);
            //}
          } else if (inputType == 'checkbox') {
            desc.type = 'checkboxes';
            desc.renderer = service.customRendererCheckboxes;
            desc.editor = 'checkboxes';//MultiCheckboxEditor;
            desc.source = service.extractOptionsForList(valueConstraints.literals);
          } else if (inputType == 'text') {
            desc.type = 'text';
          }
          return desc;
        };

        // build the data object descriptor for each column
        var getColumnDescriptors = function (context, node, columnHeaderOrder) {
          var colDescriptors = [];
          for (var i in columnHeaderOrder) {
            if (context.isField()) {
              colDescriptors.push(getDescriptor(node));
            } else {
              var key = columnHeaderOrder[i];
              var child = DataManipulationService.propertiesOf(node)[key];
              colDescriptors.push(getDescriptor(child));
            }
          }
          return colDescriptors;
        };

        // build the table for one row
        var extractAndStoreCellData = function (cellDataObject, rowData, columnDescriptor) {
          var inputType = columnDescriptor.type;
          var cedarType = columnDescriptor.cedarType;
          if (inputType == 'dropdown') {
            rowData.push(cellDataObject['@value']);
          } else if (cedarType == 'checkboxes') {
            rowData.push(JSON.stringify(cellDataObject['@value']));
          } else if (cedarType == 'deepObject') {
            rowData.push(columnDescriptor.cedarLabel);
          } else {
            rowData.push(cellDataObject._valueLabel || cellDataObject['@value']);
          }
        };

        // build the table of values
        var getTableData = function (context, $scope, headerOrder, columnDescriptors) {
          var tableData = [];
          if (angular.isArray($scope.model)) {
            for (var i in $scope.model) {
              if (!DataUtilService.isSpecialKey($scope.model[i])) {
                var row = $scope.model[i];
                var rowData = [];
                if (context.isField()) {
                  extractAndStoreCellData(row, rowData, columnDescriptors[0]);
                } else {
                  for (var col in headerOrder) {
                    var colName = headerOrder[col];
                    var cellDataObject = row[colName];
                    extractAndStoreCellData(cellDataObject, rowData, columnDescriptors[col]);
                  }
                }
                tableData.push(rowData);
              }
            }
            return tableData;
          }
        };

        var getTableDataSource = function (context, $scope, headerOrder) {
          var tableDataSource = [];
          for (var i in $scope.model) {
            var row = $scope.model[i];
            var rowDataSource = [];
            if (context.isField()) {
              rowDataSource.push(row);
            } else {
              for (var col in headerOrder) {
                var colName = headerOrder[col];
                var cellDataObject = row[colName];
                rowDataSource.push(cellDataObject);
              }
            }
            tableDataSource.push(rowDataSource);
          }
          return tableDataSource;
        };

        var getColHeaders = function(columnHeaderOrder) {
          var colHeaders = [];
          for (var i in columnHeaderOrder) {
            colHeaders.push($filter('keyToTitle')(columnHeaderOrder[i]));
          }
          return colHeaders;
        };

        var applyVisibility = function ($scope) {
          var context = $scope.spreadsheetContext;
          var ov = context.isOriginalContentVisible();
          jQuery(context.getOriginalContentContainer()).toggleClass("visible", ov);
          jQuery(context.getOriginalContentContainer()).toggleClass("hidden", !ov);
          jQuery(context.getSpreadsheetContainer()).toggleClass("visible", !ov);
        };

        // register the event hooks
        var registerHooks = function(hot, $scope, $element,columnHeaderOrder) {
          var $hooksList = $('#hooksList');
          var hooks = Handsontable.hooks.getRegistered();
          var example1_events = document.getElementById("spreadsheetViewLogs");
          var log_events = function (event, data) {
            if (document.getElementById('check_' + event).checked) {
              var now = (new Date()).getTime(),
                  diff = now - start,
                  vals, str, div, text;

              vals = [
                i,
                "@" + numbro(diff / 1000).format('0.000'),
                "[" + event + "]"
              ];

              for (var d = 0; d < data.length; d++) {
                try {
                  str = JSON.stringify(data[d]);
                }
                catch (e) {
                  str = data[d].toString(); // JSON.stringify breaks on circular reference to a HTML node
                }

                if (str === void 0) {
                  continue;
                }

                if (str.length > 20) {
                  str = Object.prototype.toString.call(data[d]);
                }
                if (d < data.length - 1) {
                  str += ',';
                }
                vals.push(str);
              }

              if (window.console) {
                console.log(i,
                    "@" + numbro(diff / 1000).format('0.000'),
                    "[" + event + "]",
                    data);
              }
              div = document.createElement("DIV");
              text = document.createTextNode(vals.join(" "));

              div.appendChild(text);
              example1_events.appendChild(div);

              var timer = setTimeout(function () {
                example1_events.scrollTop = example1_events.scrollHeight;
              }, 10);
              clearTimeout(timer);

              i++;
            }
          };

          hooks.forEach(function (hook) {
            var checked = '';
            if (hook === 'beforePaste' || hook === 'afterChange' || hook === 'afterSelection' || hook === 'afterCreateRow' || hook === 'afterRemoveRow' || hook === 'afterCreateRow' ||
                hook === 'afterCreateCol' || hook === 'afterRemoveCol') {
              checked = 'checked';
            }

            hot.addHook(hook, function () {

              if (hook === 'afterChange') {
                updateDataModel($scope, $element);
              }

              if (hook === 'afterCreateRow') {
                $scope.spreadsheetDataScope.addCallback();
                $scope.spreadsheetDataScope.tableDataSource = getTableDataSource($scope.spreadsheetContext, $scope,
                    columnHeaderOrder);
                updateDataModel($scope, $element);
                resize($scope);
              }

              if (hook === 'afterRemoveRow') {
                $scope.spreadsheetDataScope.removeCallback();
                $scope.spreadsheetDataScope.tableDataSource = getTableDataSource($scope.spreadsheetContext, $scope,
                    columnHeaderOrder);
                updateDataModel($scope, $element);
                resize($scope);
              }
            });
          });
        };

        // resize the container based on size of table
        var resize = function($scope) {
          var tableData = $scope.spreadsheetDataScope.tableData;
          var container = $scope.spreadsheetDataScope.container;
          var detectorElement = $scope.spreadsheetDataScope.detectorElement;

          // Compute size based on available width and number of rows
          var spreadsheetRowCount = tableData.length;
          var spreadsheetContainerHeight = Math.min(300, 30 + spreadsheetRowCount * 30 + 20);
          var spreadsheetContainerWidth = detectorElement.width() - 5;

          angular.element(container).css("height", spreadsheetContainerHeight + "px");
          angular.element(container).css("width", spreadsheetContainerWidth + "px");
        };

        // build the spreadsheet, stuff it into the dom, and make it visible
        var createSpreadsheet = function (context, $scope, $element, index, isField, addCallback, removeCallback) {

          $scope.spreadsheetContext = context;
          context.isField = isField;

          var columnHeaderOrder = getColumnHeaderOrder(context, $element);
          var columnDescriptors = getColumnDescriptors(context, $element, columnHeaderOrder);
          var tableData = getTableData(context, $scope, columnHeaderOrder, columnDescriptors);
          var tableDataSource = getTableDataSource(context, $scope, columnHeaderOrder);
          var colHeaders = getColHeaders(columnHeaderOrder);
          var minRows = DataManipulationService.getMinItems($element) || 0;
          var maxRows = DataManipulationService.getMaxItems($element) || Number.POSITIVE_INFINITY;
          var config = {
            data              : tableData,
            minSpareRows      : 1,
            autoWrapRow       : true,
            contextMenu       : true,
            minRows           : minRows,
            maxRows           : maxRows,
            rowHeaders        : true,
            stretchH          : 'last',
            trimWhitespace    : false,
            manualRowResize   : true,
            manualColumnResize: true,
            columns           : columnDescriptors,
            colHeaders        : colHeaders,
            colWidths         : 247,
            autoColumnSize    : {syncLimit: 300},
          };

          // detector and container elements
          var id = '#' + $scope.getLocator(index) + ' ';
          var detectorElement = angular.element(document.querySelector(id + '.spreadsheetViewDetector'),
              context.getPlaceholderContext());
          var container = angular.element(document.querySelector(id + '.spreadsheetViewContainer'),
              context.getPlaceholderContext())[0];

          // push spreadsheet data to parent scope
          $scope.spreadsheetDataScope = {
            tableData        : tableData,
            tableDataSource  : tableDataSource,
            columnDescriptors: columnDescriptors,
            addCallback      : addCallback,
            removeCallback   : removeCallback,
            detectorElement  : detectorElement,
            container        : container
          };
          $scope.config = config;


          // put the spreadsheet into the container
          context.setSpreadsheetContainer(container);
          resize($scope);

          context.setOriginalContentContainer(angular.element('.originalContent', context.getPlaceholderContext())[0]);
          context.switchVisibility();
          applyVisibility($scope);


          // build the handsontable
          var hot = new Handsontable(container, config);
          registerHooks(hot, $scope, $element, columnHeaderOrder);
          context.setTable(hot);
        };

        service.addRow = function($scope) {
          console.log('addRow');
          if ($scope.hasOwnProperty('spreadsheetContext')) {
            var context = $scope.spreadsheetContext;
            var hot = context.getTable();
            hot.alter('insert_row', 1);
          }
        };

        // destroy the handsontable spreadsheet and set the container empty
        service.destroySpreadsheet = function ($scope) {
          console.log('destroySpreadsheet');
          if ($scope.hasOwnProperty('spreadsheetContext')) {
            var context = $scope.spreadsheetContext;
            context.switchVisibility();
            if (context.isOriginalContentVisible()) {
              context.getTable().destroy();
              jQuery(context.getSpreadsheetContainer()).html("");
              applyVisibility($scope);
            } else {
              context.switchVisibility();
            }
          }
        };

        // create spreadsheet view using handsontable
        service.switchToSpreadsheet = function ($scope, $element, index, isField, addCallback, removeCallback) {
          console.log('switchToSpreadsheet');
          var type = isField() ? 'field' : 'element';
          var context = new SpreadsheetContext(type, $element);
          createSpreadsheet(context, $scope, $element, index, isField, addCallback, removeCallback);
        };

        return service;
      };

    }
);