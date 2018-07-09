'use strict';

define([
      'angular',
      'cedar/template-editor/service/cedar-user',
    ], function (angular) {
      angular.module('cedar.templateEditor.searchBrowse.cedarSearchBrowsePickerDirective', [
        'cedar.templateEditor.service.cedarUser'
      ]).directive('cedarSearchBrowsePicker', cedarSearchBrowsePickerDirective);

      cedarSearchBrowsePickerDirective.$inject = ['CedarUser', 'DataManipulationService'];

      function cedarSearchBrowsePickerDirective(CedarUser, DataManipulationService) {

        var directive = {
          bindToController: {
            selectResourceCallback: '=',
            pickResourceCallback  : '=',
            mode                  : '='
          },
          controller      : cedarSearchBrowsePickerController,
          controllerAs    : 'dc',
          restrict        : 'E',
          scope           : {},
          templateUrl     : 'scripts/search-browse/cedar-search-browse-picker.directive.html'
        };

        return directive;

        cedarSearchBrowsePickerController.$inject = [
          '$location',
          '$timeout',
          '$scope',
          '$window',
          '$translate',
          'CedarUser',
          'resourceService',
          'UIMessageService',
          'UISettingsService',
          'QueryParamUtilsService',
          'AuthorizedBackendService',
          'FrontendUrlService',
          'UIProgressService',
          'CONST',
          'MessagingService'
        ];

        function cedarSearchBrowsePickerController($location, $timeout, $scope, $window, $translate, CedarUser,
                                                   resourceService,
                                                   UIMessageService, UISettingsService, QueryParamUtilsService,
                                                   AuthorizedBackendService,
                                                   FrontendUrlService,
                                                   UIProgressService, CONST, MessagingService) {
          var vm = this;

          vm.breadcrumbName = breadcrumbName;
          vm.currentPath = "";
          vm.currentFolderId = "";
          vm.offset = 0;
          vm.requestLimit = UISettingsService.getRequestLimit();

          vm.totalCount = null;
          vm.deleteResource = deleteResource;
          vm.doSearch = doSearch;
          vm.editResource = editResource;
          vm.facets = {};
          vm.forms = [];


          // modals
          vm.showMoveModal = showMoveModal;
          vm.showCopyModal = showCopyModal;
          vm.showShareModal = showShareModal;
          vm.showRenameModal = showRenameModal;
          vm.showNewFolderModal = showNewFolderModal;
          vm.showFlowModal = showFlowModal;
          vm.copyModalVisible = false;
          vm.moveModalVisible = false;
          vm.shareModalVisible = false;
          vm.renameModalVisible = false;
          vm.newFolderModalVisible = false;
          vm.flowModalVisible = false;

          vm.getFacets = getFacets;
          vm.getForms = getForms;
          vm.getCurrentFolderSummary = getCurrentFolderSummary;
          vm.getFolderContentsById = getFolderContentsById;
          vm.getSelectedNode = getSelectedNode;
          vm.getResourceIconClass = getResourceIconClass;
          vm.getResourceTypeClass = getResourceTypeClass;
          vm.canBeVersioned = canBeVersioned;
          vm.goToResource = goToResource;
          vm.goToFolder = goToFolder;
          vm.isResourceTypeActive = isResourceTypeActive;
          vm.isSearching = false;
          vm.launchInstance = launchInstance;
          vm.copyToWorkspace = copyToWorkspace;
          vm.copyResource = copyResource;
          vm.publishResource = publishResource;
          vm.createDraftResource = createDraftResource;

          vm.onDashboard = onDashboard;
          vm.narrowContent = narrowContent;
          vm.pathInfo = [];
          vm.params = $location.search();
          vm.hash = $location.hash();
          vm.resources = [];
          vm.selectedResource = null;
          vm.canNotWrite = false;
          vm.canNotShare = false;
          vm.canNotPopulate = false;
          vm.canNotPublish = false;
          vm.canNotCreateDraft = false;
          vm.canNotDelete = false;
          vm.currentFolder = null;
          vm.hasSelection = hasSelection;
          vm.getSelection = getSelection;
          vm.hasUnreadMessages = hasUnreadMessages;
          vm.getUnreadMessageCount = getUnreadMessageCount;
          vm.openMessaging = openMessaging;
          vm.isPublished = isPublished;
          vm.createVersion = createVersion;


          vm.showFilters = true;
          vm.filterShowing = filterShowing;
          vm.resetFilters = resetFilters;
          vm.resetFiltersEnabled = resetFiltersEnabled;
          vm.filterSections = {};
          vm.isFilterSection = isFilterSection;

          vm.getArrowIcon = getArrowIcon;
          vm.showFloatingMenu = false;

          vm.showOrHide = showOrHide;
          vm.toggleFavorites = toggleFavorites;
          vm.toggleFilters = toggleFilters;
          vm.workspaceClass = workspaceClass;

          vm.isResourcePublicationStatusActive = isResourcePublicationStatusActive;
          vm.setResourcePublicationStatus = setResourcePublicationStatus;
          vm.setPublication = setPublication;
          vm.getPublication = getPublication;
          vm.setResourceVersion = setResourceVersion;


          vm.getPublicationVersion = getPublicationVersion;
          vm.setPublicationVersion = setPublicationVersion;


          vm.getPublicationStatus = getPublicationStatus;
          vm.setPublicationStatus = setPublicationStatus;

          vm.isResourceVersionActive = isResourceVersionActive;

          vm.toggleResourceVersion = toggleResourceVersion;
          vm.getVersionIcon = getVersionIcon;


          vm.isGridView = isGridView;
          vm.isListView = isListView;
          vm.toggleView = toggleView;

          vm.setSortByName = setSortByName;
          vm.setSortByCreated = setSortByCreated;
          vm.setSortByUpdated = setSortByUpdated;
          vm.updateSort = updateSort;
          vm.isSort = isSort;
          vm.sortName = sortName;
          vm.sortCreated = sortCreated;
          vm.sortUpdated = sortUpdated;

          vm.isInfoOpen = isInfoOpen;
          vm.toggleInfo = toggleInfo;

          vm.toggleResourceType = toggleResourceType;

          vm.isTemplate = isTemplate;
          vm.isElement = isElement;
          vm.isFolder = isFolder;
          vm.isMeta = isMeta;
          vm.buildBreadcrumbTitle = buildBreadcrumbTitle;
          vm.canPublish = canPublish;
          vm.canPublishStatic = canPublishStatic;
          vm.canCreateDraft = canCreateDraft;
          vm.canCreateDraftStatic = canCreateDraftStatic;

          vm.editingDescription = false;
          vm.editingDescriptionSelection = null;
          vm.editingDescriptionInitialValue = null;

          vm.isSharedMode = isSharedMode;
          vm.isSearchMode = isSearchMode;
          vm.isHomeMode = isHomeMode;
          vm.nodeListQueryType = null;
          vm.breadcrumbTitle = null;
          vm.forms = null;

          vm.getId = function (node, label) {
            return DataManipulationService.getId(node) + label;
          };

          vm.hideModal = function (visible) {
            visible = false;
          };

          vm.cancelDescriptionEditing = function () {
          };

          // adjust the position of the context menu
          vm.toggledCedarDropdownMenu = function ($event, resource) {

              var centerPanel = document.getElementById('center-panel');
              var row = document.getElementById(vm.getId(resource, 'row'));
              var menu = document.getElementById(vm.getId(resource, 'menu'));

              if (centerPanel && row && menu) {

                var centerRect = centerPanel.getBoundingClientRect();
                var rowRect = row.getBoundingClientRect();

                menu.style.setProperty("left", ($event.pageX - rowRect.left - 200) + "px");
                menu.style.setProperty("top", ($event.pageY - centerRect.top - 20) + "px");
              }
          };

          vm.toggleDescriptionEditing = function () {
            if (vm.getSelection()) {
              vm.editingDescription = !vm.editingDescription;

              if (vm.editingDescription) {
                vm.editingDescriptionSelection = vm.getSelection();
                vm.editingDescriptionInitialValue = vm.selectedResource['schema:description'];

                $timeout(function () {
                  var jqDescriptionField = $('#edit-description');
                  if (jqDescriptionField) {
                    jqDescriptionField.focus();
                    if (jqDescriptionField.val()) {
                      var l = jqDescriptionField.val().length;
                      jqDescriptionField[0].setSelectionRange(0, l);
                    }
                  }

                  $window.onclick = function (event) {
                    // make sure we are hitting something else
                    if (event.target.id != 'edit-description') {
                      vm.editingDescription = false;

                      var jqDescriptionField = $('#edit-description');
                      if (jqDescriptionField) {
                        jqDescriptionField.blur();
                      }
                      if (vm.editingDescriptionInitialValue != vm.editingDescriptionSelection['schema:description']) {
                        vm.updateDescription();
                      }
                      $window.onclick = null;
                      $scope.$apply();
                    }
                  };
                });
              } else {
                $window.onclick = null;
                $scope.$apply();

              }
            }
          };

          vm.selectResource = function (resource) {
            vm.editingDescription = false;
            vm.selectedResource = resource;
            //TODO: hide the write/read/share boolean vars in the info panel

            $timeout(function () {
              vm.getResourceDetails(resource);
              if (typeof vm.selectResourceCallback === 'function') {
                vm.selectResourceCallback(resource);
              }
            }, 0);
          };

          // show the info panel with this resource or find one
          vm.showInfoPanel = function () {
            if (vm.isSharedMode()) {
              resetSelected();
            } else if (!vm.selectedResource) {
              if (vm.currentPath) {
                vm.selectResource(vm.currentPath);
              } else {
                if (vm.folder) {
                  vm.selectResource(vm.folder);
                }
              }
            }

            //vm.setResourceInfoVisibility(true);
          };

          vm.isResourceSelected = function (resource) {
            if (resource == null || vm.selectedResource == null) {
              return false;
            } else {
              return vm.selectedResource['@id'] == resource['@id'];
            }
          };

          vm.canSubmit = function () {
            return vm.selectedResource && vm.selectedResource.nodeType === "instance" && vm.selectedResource["schema:isBasedOn"] === "Baszd meg!";
          };


          // toggle the info panel with this resource or find one
          vm.toggleDirection = function () {
            return (vm.showResourceInfo ? 'Hide' : 'Show') + ' details';
          };


          vm.getResourceDetails = function (resource) {
            if (!resource && vm.hasSelection()) {
              resource = vm.getSelection();
            }
            var id = resource['@id'];
            vm.canNotPopulate = !vm.isTemplate();
            vm.canNotPublish = !vm.canPublishStatic();
            vm.canNotCreateDraft = !vm.canCreateDraftStatic();
            resourceService.getResourceDetail(
                resource,
                function (response) {
                  if (vm.selectedResource == null || vm.selectedResource['@id'] == response['@id']) {
                    vm.selectedResource = response;
                    vm.canNotWrite = !vm.canWrite();
                    vm.canNotShare = !vm.canShare();
                    vm.canNotDelete = vm.isPublished();
                    vm.canNotPopulate = !vm.isTemplate();
                    vm.canNotPublish = !vm.canPublish();
                    vm.canNotCreateDraft = !vm.canCreateDraft();
                  }
                },
                function (error) {
                  UIMessageService.showBackendError('SERVER.' + resource.nodeType.toUpperCase() + '.load.error', error);
                }
            );
          };

          vm.canRead = function () {
            return resourceService.canRead(vm.getSelectedNode());
          };

          vm.canWrite = function () {
            return resourceService.canWrite(vm.getSelectedNode());
          };

          vm.canChangeOwner = function () {
            return resourceService.canChangeOwner(vm.getSelectedNode());
          };

          vm.canShare = function () {
            return resourceService.canShare(vm.getSelectedNode());
          };

          vm.canWriteToCurrentFolder = function () {
            return resourceService.canWrite(vm.currentFolder);
          };

          vm.getResourceVersion = function (resource) {
            if (resource != null) {
              return resource['pav:version'];
            }
          };

          vm.getNextResourceVersion = function (resource) {
            var currentVersion = vm.getResourceVersion(resource);
            var parts = currentVersion.split(".");
            if (parts.length == 3) {
              parts[2] = parseInt(parts[2]) + 1;
              return parts.join(".");
            }
            return null;
          }

          vm.getResourcePublicationStatus = function () {
            var resource = vm.getSelection();
            if (resource != null) {
              return resource['bibo:status'];
            }
          };

          vm.updateDescription = function () {

            var resource = vm.editingDescriptionSelection;
            if (resource != null) {

              var postData = {};
              var id = resource['@id'];
              var nodeType = resource.nodeType;
              var description = resource['schema:description'];

              if (nodeType == 'instance') {
                AuthorizedBackendService.doCall(
                    resourceService.renameNode(id, null, description),
                    function (response) {
                      UIMessageService.flashSuccess('SERVER.INSTANCE.update.success', null, 'GENERIC.Updated');
                    },
                    function (err) {
                      UIMessageService.showBackendError('SERVER.INSTANCE.update.error', err);
                    }
                );
              } else if (nodeType == 'field') {
                AuthorizedBackendService.doCall(
                    resourceService.renameNode(id, null, description),
                    function (response) {

                      var title = DataManipulationService.getTitle(response.data);
                      UIMessageService.flashSuccess('SERVER.FIELD.update.success', {"title": title},
                          'GENERIC.Updated');
                    },
                    function (err) {
                      UIMessageService.showBackendError('SERVER.field.update.error', err);
                    }
                );
              } else if (nodeType == 'element') {
                AuthorizedBackendService.doCall(
                    resourceService.renameNode(id, null, description),
                    function (response) {

                      var title = DataManipulationService.getTitle(response.data);
                      UIMessageService.flashSuccess('SERVER.ELEMENT.update.success', {"title": title},
                          'GENERIC.Updated');
                    },
                    function (err) {
                      UIMessageService.showBackendError('SERVER.ELEMENT.update.error', err);
                    }
                );
              } else if (nodeType == 'template') {
                AuthorizedBackendService.doCall(
                    resourceService.renameNode(id, null, description),
                    function (response) {

                      $scope.form = response.data;
                      var title = DataManipulationService.getTitle(response.data);
                      UIMessageService.flashSuccess('SERVER.TEMPLATE.update.success',
                          {"title": title}, 'GENERIC.Updated');
                    },
                    function (err) {
                      UIMessageService.showBackendError('SERVER.TEMPLATE.update.error', err);
                    }
                );
              } else if (nodeType == 'folder') {
                AuthorizedBackendService.doCall(
                    resourceService.renameNode(id, null, description),
                    function (response) {
                      UIMessageService.flashSuccess('SERVER.FOLDER.update.success', {"title": vm.selectedResource.name},
                          'GENERIC.Updated');
                    },
                    function (response) {
                      UIMessageService.showBackendError('SERVER.FOLDER.update.error', response);
                    }
                );
              }
            }
          };

          // callback to load more resources for the current folder
          vm.loadMore = function () {

            if (vm.isSearching) {
              vm.searchMore();
            } else {

              var limit = UISettingsService.getRequestLimit();
              var offset = vm.offset;
              offset += limit;

              var folderId = vm.currentFolderId;
              var resourceTypes = activeResourceTypes();

              // are there more?
              if (offset < vm.totalCount) {

                if (resourceTypes.length > 0) {
                  return resourceService.getResources(
                      {
                        folderId     : folderId,
                        resourceTypes: resourceTypes,
                        sort         : sortField(),
                        limit        : limit,
                        offset       : offset
                      },
                      function (response) {
                        vm.resources = vm.resources.concat(response.resources);
                        vm.offset = offset;
                      },
                      function (error) {
                        UIMessageService.showBackendError('SERVER.FOLDER.load.error', error);
                      }
                  );
                } else {
                  vm.resources = [];
                }
              }
            }
          };

          vm.refreshWorkspace = function (resource) {
            vm.params = $location.search();
            vm.hash = $location.hash();
            init();
            if (resource) {
              $scope.selectResourceById(resource['@id']);
            }
          };


          // callback to load more resources for the current folder
          vm.searchMore = function () {

            var limit = UISettingsService.getRequestLimit();
            var offset = vm.offset;
            offset += limit;
            var term = vm.searchTerm;
            var resourceTypes = activeResourceTypes();

            // Temporary fix to load more results if the totalCount can't be computed by the backend
            if (vm.totalCount == -1) {
              // Search for more results
              vm.totalCount = Number.MAX_VALUE;
            }
            else if (vm.totalCount == 0) {
              // No more results available. Stop searching
              vm.totalCount = -2;
            }

            // are there more?
            if (offset < vm.totalCount) {
              return resourceService.searchResources(term,
                  {
                    resourceTypes: resourceTypes,
                    sort         : sortField(),
                    limit        : limit,
                    offset       : offset
                  },
                  function (response) {
                    vm.resources = vm.resources.concat(response.resources);
                    vm.totalCount = response.totalCount;
                    vm.offset = offset;
                  },
                  function (error) {
                    UIMessageService.showBackendError('SERVER.SEARCH.error', error);
                  }
              );
            }
          };


          //*********** ENTRY POINT

          getPreferences();
          init();


          function getPreferences() {
            var uip = CedarUser.getUIPreferences();

            vm.resourceTypes = {
              element : uip.resourceTypeFilters.element,
              field   : uip.resourceTypeFilters.field,
              instance: uip.resourceTypeFilters.instance,
              template: uip.resourceTypeFilters.template
            };
            vm.filterSections = {
              type   : true,
              version: true
            };
            vm.resourcePublicationStatusFilterValue = uip.resourcePublicationStatusFilter.publicationStatus == null ? "all" : uip.resourcePublicationStatusFilter.publicationStatus;
            vm.resourceVersionFilterValue = uip.resourceVersionFilter.version == null ? "latest" : uip.resourceVersionFilter.version;
          }

          function init() {
            vm.isSearching = false;
            if (vm.params.sharing) {
              if (vm.params.sharing == 'shared-with-me') {
                vm.isSearching = true;
                if (vm.showFavorites) {
                  vm.showFavorites = false;
                  updateFavorites();
                }
                // TODO: DO WE NEED THIS??
                getFacets();
                doSharedWithMe();
              }
            } else if (vm.params.search) {
              vm.isSearching = true;
              if (vm.showFavorites) {
                vm.showFavorites = false;
                updateFavorites();
              }
              getFacets();
              doSearch(vm.params.search);
            } else if (vm.params.folderId) {
              vm.selectedResource = null;
              getFacets();
              var currentFolderId = decodeURIComponent(vm.params.folderId);
              getFolderContentsById(currentFolderId, vm.hash);
              getCurrentFolderSummary(currentFolderId);
            } else {
              //goToFolder(CedarUser.getHomeFolderId());
              goToHomeFolder(vm.hash);
            }
            if (vm.showFavorites) {
              getForms();
            }
            updateFavorites(false);
          }

          function breadcrumbName(folderName) {
            if (folderName == '/') {
              return 'All';
            }
            return folderName;
          }

          function buildBreadcrumbTitle(searchTerm) {
            if (vm.nodeListQueryType == 'view-shared-with-me') {
              return $translate.instant("BreadcrumbTitle.sharedWithMe");
            } else if (vm.nodeListQueryType == 'folder-content') {
              return $translate.instant("BreadcrumbTitle.viewAll");
            } else if (vm.nodeListQueryType == 'search-term') {
              return $translate.instant("BreadcrumbTitle.searchResult", {searchTerm: searchTerm});
            } else {
              return "";
            }
          }

          function isSharedMode() {
            return (vm.nodeListQueryType === 'view-shared-with-me');
          }

          function isSearchMode() {
            return (vm.nodeListQueryType === 'search-term');
          }


          function isHomeMode() {
            return (vm.nodeListQueryType === 'folder-content');
          }

          function doSearch(term) {
            var resourceTypes = activeResourceTypes();
            var limit = UISettingsService.getRequestLimit();
            vm.offset = 0;
            var offset = vm.offset;
            resourceService.searchResources(
                term,
                {
                  resourceTypes    : resourceTypes,
                  sort             : sortField(),
                  limit            : limit,
                  offset           : offset,
                  version          : vm.resourceVersionFilterValue,
                  publicationStatus: vm.resourcePublicationStatusFilterValue
                },
                function (response) {
                  vm.searchTerm = term;
                  vm.isSearching = true;
                  vm.resources = response.resources;
                  vm.totalCount = response.totalCount;
                  vm.nodeListQueryType = response.nodeListQueryType;
                  vm.breadcrumbTitle = vm.buildBreadcrumbTitle(response.request.q);
                  UIProgressService.complete();
                },
                function (error) {
                  UIMessageService.showBackendError('SERVER.SEARCH.error', error);
                }
            );
          }

          function doSharedWithMe() {
            var resourceTypes = activeResourceTypes();
            var limit = UISettingsService.getRequestLimit();
            vm.offset = 0;
            var offset = vm.offset;
            resourceService.sharedWithMeResources(
                {
                  resourceTypes    : resourceTypes,
                  sort             : sortField(),
                  limit            : limit,
                  offset           : offset,
                  version          : vm.resourceVersionFilterValue,
                  publicationStatus: vm.resourcePublicationStatusFilterValue
                },
                function (response) {
                  vm.isSearching = true;
                  vm.resources = response.resources;
                  vm.totalCount = response.totalCount;
                  vm.nodeListQueryType = response.nodeListQueryType;
                  vm.breadcrumbTitle = vm.buildBreadcrumbTitle();
                },
                function (error) {
                  UIMessageService.showBackendError('SERVER.SEARCH.error', error);
                }
            );
          }

          function copyToWorkspace(resource) {
            if (!resource) {
              resource = getSelection();
            }
            var newTitle = $translate.instant('GENERIC.CopyOfTitle', {"title": resource.name});

            resourceService.copyResourceToWorkspace(
                resource, newTitle,
                function (response) {

                  UIMessageService.flashSuccess('SERVER.RESOURCE.copyToWorkspace.success', {"title": resource.name},
                      'GENERIC.Copied');

                  vm.refreshWorkspace(resource);
                },
                function (response) {
                  UIMessageService.showBackendError('SERVER.RESOURCE.copyToWorkspace.error', response);
                }
            );
          }

          function copyResource(resource) {
            if (!resource) {
              resource = getSelection();
            }
            var newTitle = $translate.instant('GENERIC.CopyOfTitle', {"title": resource.name});
            var folderId = vm.currentFolderId;
            if (!folderId) {
              folderId = CedarUser.getHomeFolderId();
            }
            resourceService.copyResource(
                resource, folderId, newTitle,
                function (response) {

                  UIMessageService.flashSuccess('SERVER.RESOURCE.copyResource.success', {"title": resource.name},
                      'GENERIC.Copied');

                  vm.refreshWorkspace(resource);

                },
                function (response) {
                  UIMessageService.showBackendError('SERVER.RESOURCE.copyResource.error', response);
                }
            );
          }


          function publishResource(resource) {
            if (!resource) {
              resource = getSelection();
            }
            var newVersion = vm.getResourceVersion(resource);
            resourceService.publishResource(
                resource,
                newVersion,
                function (response) {
                  var title = DataManipulationService.getTitle(resource);
                  UIMessageService.flashSuccess('SERVER.RESOURCE.publishResource.success', {"title": title},
                      'GENERIC.Published');
                  vm.refreshWorkspace(resource);
                },
                function (response) {
                  UIMessageService.showBackendError('SERVER.RESOURCE.publishResource.error', response);
                }
            );
          }

          function createVersion(value) {

            var resource = value || vm.selectedResource;

            var canCreateDraft =
                (resource.nodeType == CONST.resourceType.TEMPLATE ||
                resource.nodeType == CONST.resourceType.ELEMENT) &&
                resource['bibo:status'] == 'bibo:published' &&
                resource.isLatestVersion;

            var canPublish = (resource.nodeType == CONST.resourceType.TEMPLATE ||
                resource.nodeType == CONST.resourceType.ELEMENT) &&
                resource['bibo:status'] == 'bibo:draft';


            if (canCreateDraft) {
              vm.createDraftResource(resource);
            } else {
              if (canPublish) {
                vm.publishResource(resource);
              }
            }

          }

          function createDraftResource(resource) {
            if (!resource) {
              resource = getSelection();
            }
            var folderId = vm.currentFolderId;
            if (!folderId) {
              folderId = CedarUser.getHomeFolderId();
            }
            var newVersion = vm.getNextResourceVersion(resource);
            var propagateSharing = true;
            resourceService.createDraftResource(
                resource,
                folderId,
                newVersion,
                propagateSharing,
                function (response) {
                  var title = DataManipulationService.getTitle(resource);
                  UIMessageService.flashSuccess('SERVER.RESOURCE.createDraftResource.success', {"title": title},
                      'GENERIC.CreatedDraft');
                  vm.refreshWorkspace(resource);
                },
                function (response) {
                  UIMessageService.showBackendError('SERVER.RESOURCE.createDraftResource.error', response);
                }
            );
          }

          function launchInstance(resource) {

            if (!resource) {
              resource = getSelection();
            }

            var url = FrontendUrlService.getInstanceCreate(resource['@id'], vm.getFolderId());
            $location.url(url);
          }


          function goToResource(value, action) {

            var resource = value || vm.selectedResource;
            if (resource) {
              if (resource.nodeType === 'folder') {
                if (action !== 'populate') {
                  goToFolder(resource['@id']);
                }
              } else {
                if (resource.nodeType === 'template' && action === 'populate') {
                  launchInstance(resource);
                } else {
                  editResource(resource, vm.canNotWrite);
                }
              }
            }
          }

          function editResource(value, canNotWrite) {

            var resource = value || vm.selectedResource;
            if (resource) {
              var id = resource['@id'];
              if (typeof vm.pickResourceCallback === 'function') {
                vm.pickResourceCallback(resource);
              }
              switch (resource.nodeType) {
                case CONST.resourceType.TEMPLATE:
                  $location.path(FrontendUrlService.getTemplateEdit(id));
                  break;
                case CONST.resourceType.ELEMENT:
                  if (vm.onDashboard()) {
                    $location.path(FrontendUrlService.getElementEdit(id));
                  }
                  break;
                case CONST.resourceType.INSTANCE:
                  $location.path(FrontendUrlService.getInstanceEdit(id));
                  break;
                case CONST.resourceType.FIELD:
                  $location.path(FrontendUrlService.getFieldEdit(id));
                  break;
                case CONST.resourceType.LINK:
                  $location.path(scope.href);
                  break;
                  //case CONST.resourceType.FOLDER:
                  //  vm.showEditFolder(r);
                  //  break;
              }
            }
          }

          function removeResource(resource) {

            // remove resource from list
            var index;
            for (var i = 0, len = vm.resources.length; i < len; i++) {
              if (vm.resources[i]['@id'] === resource['@id']) {
                index = i;
                break;
              }
            }
            if (i > -1) {
              vm.resources.splice(index, 1);
            }
            // remove current selection
            vm.selectedResource = null;

            //reset total count
            vm.totalCount--;
          }


          function deleteResource(resource) {
            if (!resource && hasSelection()) {
              resource = getSelection();
            }
            if (vm.canWrite(resource)) {

              UIMessageService.confirmedExecution(
                  function () {
                    resourceService.deleteResource(
                        resource,
                        function (response) {

                          UIMessageService.flashSuccess('SERVER.' + resource.nodeType.toUpperCase() + '.delete.success',
                              {"title": resource.nodeType},
                              'GENERIC.Deleted');
                          removeResource(resource);
                        },
                        function (error) {
                          UIMessageService.showBackendError('SERVER.' + resource.nodeType.toUpperCase() + '.delete.error',
                              error);
                        }
                    );
                  },
                  'GENERIC.AreYouSure',
                  'DASHBOARD.delete.confirm.' + resource.nodeType,
                  'GENERIC.YesDeleteIt'
              );
            }
          }

          function getFacets() {
            resourceService.getFacets(
                function (response) {
                  vm.facets = response.facets;
                },
                function (error) {
                }
            );
          }

          function getForms() {
            return resourceService.searchResources(
                null,
                {resourceTypes: ['template'], sort: '-lastUpdatedOnTS', limit: 4, offset: 0},
                function (response) {
                  vm.forms = response.resources;
                },
                function (error) {
                  UIMessageService.showBackendError('SERVER.SEARCH.error', error);
                }
            );
          }


          function getFolderContentsById(folderId, resourceId) {

            var resourceTypes = activeResourceTypes();
            vm.offset = 0;
            var offset = vm.offset;
            // var limit = vm.limit;
            var limit = UISettingsService.getRequestLimit();

            if (resourceTypes.length > 0) {
              return resourceService.getResources(
                  {
                    folderId         : folderId,
                    resourceTypes    : resourceTypes,
                    sort             : sortField(),
                    limit            : limit,
                    offset           : offset,
                    version          : vm.resourceVersionFilterValue,
                    publicationStatus: vm.resourcePublicationStatusFilterValue
                  },
                  function (response) {
                    vm.currentFolderId = folderId;
                    vm.resources = response.resources;
                    vm.pathInfo = response.pathInfo;
                    vm.currentPath = vm.pathInfo.pop();
                    vm.totalCount = response.totalCount;
                    vm.nodeListQueryType = response.nodeListQueryType;
                    vm.breadcrumbTitle = vm.buildBreadcrumbTitle();
                    $scope.selectResourceById(resourceId);
                  },
                  function (error) {
                    UIMessageService.showBackendError('SERVER.FOLDER.load.error', error);
                  }
              );
            } else {
              vm.resources = [];
            }
          }

          function getCurrentFolderSummary(folderId) {
            var params = {
              '@id'     : folderId,
              'nodeType': CONST.resourceType.FOLDER
            };
            resourceService.getResourceDetail(
                params,
                function (response) {
                  vm.currentFolder = response;
                },
                function (error) {
                  UIMessageService.showBackendError('SERVER.FOLDER.load.error', error);
                }
            );
          }

          function getSelectedNode() {
            var result = null;
            if (vm.selectedResource == null && (vm.isSharedMode() || vm.isSearchMode())) {
              // nothing selected in share or search mode
            } else {
              if (vm.selectedResource == null) {
                result = vm.currentFolder;
              } else {
                result = vm.selectedResource;
              }
            }
            return result;
          }

          function getNodeType(resource) {
            return resource ? resource.nodeType : '';
          }

          function getResourceIconClass(resource) {
            var result = "";
            if (resource) {
              result += resource.nodeType + " ";

              switch (resource.nodeType) {
                case CONST.resourceType.FOLDER:
                  result += CONST.resourceIcon.FOLDER;
                  break;
                case CONST.resourceType.TEMPLATE:
                  result += CONST.resourceIcon.TEMPLATE;
                  break;
                case CONST.resourceType.INSTANCE:
                  result += CONST.resourceIcon.INSTANCE;
                  break;
                case CONST.resourceType.ELEMENT:
                  result += CONST.resourceIcon.ELEMENT;
                  break;
                case CONST.resourceType.FIELD:
                  result += CONST.resourceIcon.FIELD;
                  break;
              }
            }
            return result;
          }

          function getResourceTypeClass(resource) {
            var result = '';
            if (resource) {
              switch (resource.nodeType) {
                case CONST.resourceType.FOLDER:
                  result += "folder";
                  break;
                case CONST.resourceType.TEMPLATE:
                  result += "template";
                  break;
                case CONST.resourceType.METADATA:
                  result += "metadata";
                  break;
                case CONST.resourceType.INSTANCE:
                  result += "metadata";
                  break;
                case CONST.resourceType.ELEMENT:
                  result += "element";
                  break;
                case CONST.resourceType.FIELD:
                  result += "field";
                  break;
              }

            }
            return result;
          }

          function canBeVersioned(resource) {
            if (resource) {
              switch (resource.nodeType) {
                case CONST.resourceType.TEMPLATE:
                  return true;
                case CONST.resourceType.ELEMENT:
                  return true;
              }
            }
            return false;
          }

          function canPublish(value) {
            var resource = value || vm.selectedResource;
            return resourceService.canPublish(resource);
          };

          function canCreateDraft(value) {
            var resource = value || vm.selectedResource;
            return resourceService.canCreateDraft(resource);
          };

          function canPublishStatic() {
            return (hasSelection() &&
            (vm.selectedResource.nodeType == CONST.resourceType.TEMPLATE ||
            vm.selectedResource.nodeType == CONST.resourceType.ELEMENT) &&
            vm.selectedResource['bibo:status'] == 'bibo:draft');
          }

          function isPublished(resource) {
            var node = resource || vm.selectedResource;
            return node && (node['bibo:status'] == 'bibo:published');
          };

          function canCreateDraftStatic() {
            return (hasSelection() &&
            (vm.selectedResource.nodeType == CONST.resourceType.TEMPLATE ||
            vm.selectedResource.nodeType == CONST.resourceType.ELEMENT) &&
            vm.selectedResource['bibo:status'] == 'bibo:published');
          }

          function isTemplate() {
            return (hasSelection() && (vm.selectedResource.nodeType == CONST.resourceType.TEMPLATE));
          }

          function isElement() {
            return (hasSelection() && (vm.selectedResource.nodeType == CONST.resourceType.ELEMENT));
          }

          function isFolder(resource) {
            var result = false;
            if (resource) {
              result = (resource.nodeType == CONST.resourceType.FOLDER);
            } else {
              result = (hasSelection() && (vm.selectedResource.nodeType == CONST.resourceType.FOLDER))
            }
            return result;
          }

          function isMeta() {
            return (hasSelection() && (vm.selectedResource.nodeType == CONST.resourceType.INSTANCE));
          }

          function goToHomeFolder(resourceId) {
            goToFolder(CedarUser.getHomeFolderId(), resourceId);
          }


          function goToFolder(folderId) {
            if (vm.onDashboard()) {
              $location.url(FrontendUrlService.getFolderContents(folderId));
            } else {
              vm.params.folderId = folderId;
              init();
            }
          }

          function isResourceTypeActive(type) {
            return vm.resourceTypes[type];
          }

          function isResourcePublicationStatusActive(publicationStatus) {
            return vm.resourcePublicationStatusFilterValue == publicationStatus || vm.resourcePublicationStatusFilterValue == 'all';
          }

          function isResourceVersionActive(version) {
            return vm.resourceVersionFilterValue == version;
          }

          function showOrHide(type) {
            return $translate.instant(isResourceTypeActive(type) ? 'GENERIC.Hide' : 'GENERIC.Show');
          }

          function onDashboard() {
            return vm.mode == 'dashboard';
          }

          function hasUnreadMessages() {
            return MessagingService.unreadCount > 0;
          }

          function getUnreadMessageCount() {
            return Math.min(MessagingService.unreadCount, 9);
          }

          function openMessaging() {
            $location.url(FrontendUrlService.getMessaging(vm.getFolderId()));
          }

          function filterShowing() {
            return vm.showFilters && onDashboard();
          }

          // is something changed by the filters?  for now, just look at the resource types
          function resetFiltersEnabled() {
            var notLatest = vm.resourceVersionFilterValue != "latest";
            var notPublishedAndDraft = vm.resourcePublicationStatusFilterValue != "all";
            var typeHidden = Object.values(vm.resourceTypes).indexOf(false) > -1
            return typeHidden || notLatest || notPublishedAndDraft;
          }

          function resetFilters() {
            var updates = {};
            for (var nodeType in vm.resourceTypes) {
              vm.resourceTypes[nodeType] = true;
              var key = 'resourceTypeFilters.' + nodeType;
              updates[key] = true;
            }
            vm.resourcePublicationStatusFilterValue = "all";
            vm.resourceVersionFilterValue = "latest";
            updates['resourcePublicationStatusFilter.publicationStatus'] = vm.resourcePublicationStatusFilterValue;
            updates['resourceVersionFilter.version'] = vm.resourceVersionFilterValue;

            UISettingsService.saveUIPreferences(updates);
            init();
          }

          function infoShowing() {
            return vm.showResourceInfo && onDashboard();
          }

          function narrowContent() {
            return vm.showFilters || vm.showResourceInfo || !onDashboard();
          }


          function setInfo(value) {
            CedarUser.setInfo(value);
            UISettingsService.saveInfo(value);
          }


          function toggleFavorites() {
            vm.showFavorites = !vm.showFavorites;
            updateFavorites();
          }

          // toggle the faceted filter panel and the various sections within it
          function toggleFilters(section) {
            if (!section) {
              vm.showFilters = !vm.showFilters;
            } else {
              if (vm.filterSections.hasOwnProperty(section)) {
                vm.filterSections[section] = !vm.filterSections[section];
              }
            }
          }

          function workspaceClass() {
            var width = 12;
            if (vm.onDashboard()) {
              if (vm.showFilters) {
                width = width - 2;
              }
              if (vm.showResourceInfo) {
                width = width - 3;
              }
            }
            return 'col-sm-' + width;
          }


          function getArrowIcon(value) {
            return value ? 'fa-caret-left' : 'fa-caret-down';
          }

          function isFilterSection(section) {
            var result = false;
            if (!section) {
              result = vm.showFilters;
            } else {
              if (vm.filterSections.hasOwnProperty(section)) {
                result = vm.filterSections[section];
              }
            }
            return result;
          }

          function toggleResourceType(type) {
            vm.resourceTypes[type] = !vm.resourceTypes[type];
            CedarUser.toggleResourceType(type);
            UISettingsService.saveResourceType(type, vm.resourceTypes[type]);
            init();
          }

          function getPublication(value) {
            var result = false;
            switch (value) {
              case 'bibo:draft':
                result = ((vm.resourcePublicationStatusFilterValue == 'bibo:draft' || vm.resourcePublicationStatusFilterValue == 'all'));
                break;
              case 'bibo:published':
                result = ((vm.resourcePublicationStatusFilterValue == 'bibo:published' || vm.resourcePublicationStatusFilterValue == 'all'));
                break;
              case 'latest':
                result = (vm.resourceVersionFilterValue == 'latest');
                break;
            }
            return result;
          }

          function getPublicationStatus(value) {
            var result = false;
            switch (value) {
              case 'bibo:draft':
                result = (vm.resourcePublicationStatusFilterValue == 'bibo:draft');
                break;
              case 'bibo:published':
                result = (vm.resourcePublicationStatusFilterValue == 'bibo:published');
                break;
              case 'all':
                result = (vm.resourcePublicationStatusFilterValue == 'all');
                break;
            }
            return result;
          }

          function getPublicationVersion(value) {
            var result = false;
            switch (value) {
              case 'all':
                result = (vm.resourceVersionFilterValue == 'all');
                break;
              case 'latest':
                result = (vm.resourceVersionFilterValue == 'latest');
                break;
            }
            return result;
          }

          function setPublicationStatus(value) {
            vm.setResourcePublicationStatus(value);
          }

          function setPublicationVersion(value) {
            vm.setResourceVersion(value);
          }


          function setPublication(value) {
            switch (value) {

              case 'bibo:draft':
                if (vm.resourcePublicationStatusFilterValue == 'bibo:published') {
                  vm.setResourcePublicationStatus('all');
                } else {
                  vm.setResourcePublicationStatus('bibo:draft');
                }
                break;
              case 'bibo:published':
                if (vm.resourcePublicationStatusFilterValue == 'bibo:draft') {
                  vm.setResourcePublicationStatus('all');
                } else {
                  vm.setResourcePublicationStatus('bibo:published');
                }
                break;
              case 'latest':
                vm.toggleResourceVersion();
                break;
            }
          }

          function setResourcePublicationStatus(publicationStatus) {
            vm.resourcePublicationStatusFilterValue = publicationStatus;
            UISettingsService.saveUIPreference('resourcePublicationStatusFilter.publicationStatus', publicationStatus);
            init();
          }


          function getVersionIcon(value) {
            var result;
            switch (value) {
              case 'bibo:draft':
                result = 'fa-pencil-square';
                break;
              case 'bibo:published':
                result = 'fa-check-square';
                break;
              case 'latest':
                result = 'fa-clock-o';
                break;
            }
            return result;
          }


          function toggleResourceVersion() {
            if (vm.resourceVersionFilterValue == 'latest') {
              setResourceVersion('all');
            } else {
              setResourceVersion('latest');
            }
          }

          function setResourceVersion(version) {
            vm.resourceVersionFilterValue = version;
            UISettingsService.saveUIPreference('resourceVersionFilter.version', version);
            init();
          }

          /**
           * Watch functions.
           */

          $scope.$on('$routeUpdate', function () {
            vm.params = $location.search();
            init();
          });

          $scope.selectResourceById = function (id) {
            if (id) {
              for (var i = 0; i < vm.resources.length; i++) {
                if (id === vm.resources[i]['@id']) {
                  var resource = vm.resources[i];
                  vm.cancelDescriptionEditing();
                  vm.selectedResource = resource;
                  vm.getResourceDetails(resource);
                  if (typeof vm.selectResourceCallback === 'function') {
                    vm.selectResourceCallback(resource);
                  }
                  break;
                }
              }
            }
          };

          $scope.$on('refreshWorkspace', function (event, args) {
            var selectedResource = args ? args[0] : null;
            vm.refreshWorkspace(selectedResource);
          });

          $scope.hideModal = function (id) {
            jQuery('#' + id).modal('hide');
          };


          /**
           * Private functions.
           */

          function activeResourceTypes() {
            var activeResourceTypes = [];
            angular.forEach(Object.keys(vm.resourceTypes), function (value, key) {
              if (vm.resourceTypes[value]) {
                if (!vm.onDashboard()) {
                  // just elements can be selected
                  if (value == 'element') {
                    activeResourceTypes.push(value);
                  }
                } else {
                  activeResourceTypes.push(value);
                }
              }
            });
            // always want to show folders
            activeResourceTypes.push('folder');
            return activeResourceTypes;
          }

          function resetSelected() {
            vm.selectedResource = null;
          }

          function getSelection() {
            return vm.selectedResource;
          }

          function hasSelection() {
            return vm.selectedResource != null;
          }


          function setSortByCreated() {
            UISettingsService.saveSortByCreated(CedarUser.setSortByCreated());
            init();
          }

          function setSortByName() {
            UISettingsService.saveSortByName(CedarUser.setSortByName());
            init();
          }

          function setSortByUpdated() {
            UISettingsService.saveSort(CedarUser.setSortByUpdated());
            init();
          }

          function isSort(value) {
            var result;
            switch (value) {
              case 'name':
                result = CedarUser.isSortByName();
                break;
              case 'createdOnTS':
                result = CedarUser.isSortByCreated();
                break;
              case 'lastUpdatedOnTS':
                result = CedarUser.isSortByUpdated();
                break;
            }
            return result;
          }

          function updateSort(value) {
            switch (value) {
              case 'name':
                setSortByName();
                break;
              case 'createdOnTS':
                setSortByCreated();
                break;
              case 'lastUpdatedOnTS':
                setSortByUpdated();
                break;
            }
          }

          function sortField() {
            return (CedarUser.isSortByName() ? '' : '-') + CedarUser.getSort();
          }

          function sortName() {
            return CedarUser.isSortByName() ? "" : 'invisible';
          }

          function sortCreated() {
            return CedarUser.isSortByCreated() ? "" : 'invisible';
          }

          function sortUpdated() {
            return CedarUser.isSortByUpdated() ? "" : 'invisible';
          }


          function updateFavorites(saveData) {
            $timeout(function () {
              if (vm.showFavorites) {
                angular.element('#favorites').collapse('show');
                getForms();
              } else {
                angular.element('#favorites').collapse('hide');
              }
            });
            if (saveData == null || saveData) {
              UISettingsService.saveUIPreference('populateATemplate.opened', vm.showFavorites);
            }
          }

          function isGridView() {
            return CedarUser.isGridView();
          }

          function isListView() {
            return CedarUser.isListView();
          }

          function toggleView() {
            UISettingsService.saveView(CedarUser.toggleView());
          }

          // is the info panel open or closed
          function isInfoOpen() {
            return CedarUser.isInfoOpen();
          }

          // toggle the state of the info panel
          function toggleInfo() {
            UISettingsService.saveInfo(CedarUser.toggleInfo());
          }

          // open the move modal
          function showCopyModal(value) {
            //var r = resource;
            //if (!r && vm.selectedResource) {
            //  r = vm.selectedResource;
            //}
            var resource = value || vm.selectedResource;
            var homeFolderId = CedarUser.getHomeFolderId();
            var folderId = vm.currentFolderId || homeFolderId;
            vm.copyModalVisible = true;
            $scope.$broadcast('copyModalVisible',
                [vm.copyModalVisible, resource, vm.currentPath, folderId, homeFolderId, vm.resourceTypes,
                 CedarUser.getSort()]);
          }

          // open the move modal
          function showMoveModal(resource) {

            var r = resource;
            if (!r && vm.selectedResource) {
              r = vm.selectedResource;
            }

            if (vm.canWrite(r)) {
              vm.moveModalVisible = true;
              var homeFolderId = CedarUser.getHomeFolderId();
              $scope.$broadcast('moveModalVisible',
                  [vm.moveModalVisible, r, vm.currentPath, vm.currentFolderId, homeFolderId, vm.resourceTypes,
                   CedarUser.getSort()]);
            }
          }


          function showFlowModal() {
            vm.flowModalVisible = true;
            var instanceId = null;
            var name = null;
            if (vm.selectedResource && vm.selectedResource.nodeType == CONST.resourceType.INSTANCE) {
              instanceId = vm.selectedResource['@id'];
              name = vm.selectedResource['schema:name'];
            }
            $scope.$broadcast('flowModalVisible', [vm.flowModalVisible, instanceId, name]);
          }

          // open the share modal
          function showShareModal(resource) {
            var r = resource;
            if (!r && vm.selectedResource) {
              r = vm.selectedResource;
            }
            vm.shareModalVisible = true;
            $scope.$broadcast('shareModalVisible', [vm.shareModalVisible, r]);
          }

          // open the rename modal
          function showRenameModal(resource) {

            var r = resource;
            if (!r && vm.selectedResource) {
              r = vm.selectedResource;
            }

            if (vm.canWrite(r)) {
              vm.renameModalVisible = true;
              $scope.$broadcast('renameModalVisible', [vm.renameModalVisible, r]);
            }
          }

          // open the new folder modal
          function showNewFolderModal() {
            vm.newFolderModalVisible = true;
            $scope.$broadcast('newFolderModalVisible', [vm.newFolderModalVisible, vm.getFolderId()]);
          }

          vm.getFolderId = function () {
            var folderId;
            var queryStringFolderId = QueryParamUtilsService.getFolderId();
            if (queryStringFolderId) {
              folderId = queryStringFolderId;
            } else {
              folderId = vm.currentFolderId;
            }
            return folderId;
          };

          vm.goToMyWorkspace = function () {
            var url = FrontendUrlService.getMyWorkspace();
            $location.url(url);
          };

          vm.goToSearchAll = function () {
            var url = FrontendUrlService.getSearchAll(vm.getFolderId());
            $location.url(url);
          };

          vm.goToSharedWithMe = function () {
            var url = FrontendUrlService.getSharedWithMe(vm.getFolderId());
            $location.url(url);
          };

          vm.getVisibleCount = function () {
            return Math.min(vm.offset + vm.requestLimit, vm.totalCount);
          };

          // should we show the resource count at the end of the workspace?
          vm.showResourceCount = function () {
            return vm.totalCount !== Number.MAX_VALUE && vm.totalCount > vm.requestLimit;
          };

          // do we have any resources to show?
          vm.hasResources = function () {
            return vm.totalCount > 0;
          };


        }
      }
    }
)
;
