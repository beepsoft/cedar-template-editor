angularApp.run(['$rootScope', function($rootScope) {

  // Define global pageTitle variable for use
  //$rootScope.pageTitle;

  // Templates, Template Elements and Instances base paths
  $rootScope.idBasePath = "https://repo.metadatacenter.org/";

  // Schemas (classes and properties) base path
  // Classes use Pascal casing (e.g. StudyType)
  // Properties use Camel casing (e.g. hasName)
  $rootScope.schemasBase = "https://metadatacenter.org/schemas/";

  $rootScope.defaultPropertiesBase = $rootScope.schemasBase;

  // Global utility functions

  // Simple function to check if an object is empty
  $rootScope.isEmpty = function(obj) {
    return Object.keys(obj).length;
  };

  // Tranform string to become object key
  $rootScope.underscoreText = function(string) {
    return string
      .replace(/'|"|(|)/g, '')
      .replace(/ +/g, "_")
      .toLowerCase();
  };

  // Transform string to Pascal case
  $rootScope.toCamelCase = function(string) {
    return string.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
      return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
  }

  // Capitalize first letter
  $rootScope.capitalizeFirst = function(string) {
    string = string.toLowerCase();
    return string.substring(0,1).toUpperCase() + string.substring(1);
  }

  // Returning true if the object key value in the properties object is of json-ld type '@' or if it corresponds to any of the reserved fields
  $rootScope.ignoreKey = function(key) {
    //var pattern = /^@/i,
    var pattern = /(^@)|(^info$)|(^template_id$)/i,
      result = pattern.test(key);

    return result;
  };

  // Generating a RFC4122 version 4 compliant GUID
  $rootScope.generateGUID = function() {
    var d = Date.now();
    var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return guid;
  };

  // Sorting function that moves boolean values with true to the front of the sort
  $rootScope.sortBoolean = function(array, bool) {
    return array.sort(function(a, b) {
      var x = a[bool],
        y = b[bool];
      return ((x == y) ? -1 : ((x === true) ? -1 : 1));
    });
  };

  // Function that generates a basic field definition
  $rootScope.generateField = function(fieldType) {
    var valueType = "string";
    if (fieldType == "numeric") {
      valueType = "number";
    }
    else if (fieldType == "checkbox") {
      valueType = "boolean";
    }
    else if (fieldType == "list") {
      valueType = "array";
    }
    var field = {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "@id": $rootScope.idBasePath + $rootScope.generateGUID(),
      "type": "object",
      "properties": {
        "@type": {
          "type": "string",
          "format" : "uri"
          //"enum": [""]
        },
        "info": {
          "title": "",
          //"id": $rootScope.generateGUID(),
          "description": "",
          "input_type": fieldType,
          "required_value": false,
          "created_at": Date.now()
        },
        "value": {
          "type": valueType,
        }
      },
      "required": [
        "value"
      ],
      "additionalProperties": false
    };
    return field;
  };

}]);