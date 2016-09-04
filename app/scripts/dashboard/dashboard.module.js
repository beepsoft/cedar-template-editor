'use strict';

define([
  'angular',
  'cedar/template-editor/dashboard/dashboard.routes',
  'cedar/template-editor/dashboard/dashboard.controller',
  'cedar/template-editor/search-browse/cedar-search-browse-picker.directive',
  'cedar/template-editor/search-browse/cedar-infinite-scroll.directive',
  'cedar/template-editor/search-browse/cedar-live-search.directive',
  'cedar/template-editor/search-browse/cedar-share-resource.directive',
], function(angular) {
  angular.module('cedar.templateEditor.dashboard', [
    'cedar.templateEditor.dashboard.routes',
    'cedar.templateEditor.dashboard.dashboardController',
    'cedar.templateEditor.searchBrowse.cedarSearchBrowsePickerDirective',
    'cedar.templateEditor.searchBrowse.cedarInfiniteScrollDirective',
    'cedar.templateEditor.searchBrowse.cedarLiveSearchDirective',
    'cedar.templateEditor.searchBrowse.cedarShareResourceDirective',
  ]);
});