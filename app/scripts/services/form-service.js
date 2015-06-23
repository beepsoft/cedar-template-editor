'use strict';

angularApp.service('FormService', function FormService($http) {

  return {
    // ELEMENTS OPERATIONS
    element: function(id) {
      //return $http.get('/static-data/elements/'+id+'.json').then(function(response) {
      return $http.get('http://localhost:9000/template_elements/'+id).then(function (response) {
        return response.data;
      }).catch(function(err) {
        console.log(err);
      });
    },
    saveElement: function(element) {
      return $http.post('http://localhost:9000/template_elements', angular.toJson(element));
    },
    elementList: function() {
      //return $http.get('/static-data/dashboard/template-elements.json').then(function(response) {
      return $http.get('http://localhost:9000/template_elements').then(function(response) {
        return response.data;
      }).catch(function(err) {
        console.log(err);
      });
    },
    // TEMPLATES OPERATIONS
    form: function (id) {
      // $http returns a promise, which has a then function, which also returns a promise
      //return $http.get('/static-data/forms/'+id+'.json').then(function (response) {
      return $http.get('http://localhost:9000/templates/'+id).then(function (response) {
        // The return value gets picked up by the then fn in the controller.
        return response.data;
      }).catch(function(err) {
        console.log(err);
      });
    },
    saveTemplate: function(template) {
      return $http.post('http://localhost:9000/templates', angular.toJson(template));
    },
    formList: function() {
      //return $http.get('/static-data/dashboard/metadata-templates.json').then(function(response) {
      return $http.get('http://localhost:9000/templates').then(function(response) {
        return response.data;
      }).catch(function(err) {
        console.log(err);
      });
    },
    // POPULATED TEMPLATES OPERATIONS
    populatedTemplate: function (id) {
      return $http.get('http://localhost:9000/template_instances/'+id).then(function (response) {
        return response.data;
      }).catch(function(err) {
        console.log(err);
      });
    },
    savePopulatedTemplate: function(populatedTemplate) {
      return $http.post('http://localhost:9000/template_instances', angular.toJson(populatedTemplate));
    },
    populatedTemplatesList: function() {
      //return $http.get('/static-data/dashboard/metadata-templates.json').then(function(response) {
      return $http.get('http://localhost:9000/template_instances').then(function(response) {
        return response.data;
      }).catch(function(err) {
        console.log(err);
      });
    },
  };
});
