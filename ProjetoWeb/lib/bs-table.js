﻿"use strict";

/*
BsTable - http://bs-table.com
Licensed under the MIT license

Copyright (c) 2014 Jan Holinka

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

angular.module("bsTable", [])
    .directive("bsTable", function () {
        return {
            restrict: "A",
            scope: true,
            compile: function (tElement, tAttrs) {
                var totalCols = 0,
                    tBody = tElement.find("tbody:first"),
                    tBodyRow = tBody.find("tr:first"),
                    ngRepeatExtension = " | bsTableSkip:bsTablePagination.skipAt | limitTo:bsTablePagination.pageSize";

                if (!tBody.is("[ng-repeat]") && !tBody.is("[data-ng-repeat]") &&
                    !tBodyRow.is("[ng-repeat]") && !tBodyRow.is("[data-ng-repeat]")) {
                    console.warn("BsTable directive: ng-repeat attribute not found!");
                    return;
                }

                // get ng-repeat attribute name
                var ngRepeatAttrName = tBody.is("[ng-repeat]") || tBodyRow.is("[ng-repeat]") ?
                    "ng-repeat" :
                    "data-ng-repeat";

                // set ng-repeat attribute value
                var ngRepeatAttrValue = tBody.is("[" + ngRepeatAttrName + "]") ?
                    tBody.attr(ngRepeatAttrName) :
                    tBodyRow.attr(ngRepeatAttrName);

                // set value and extension to element
                tBody.is("[" + ngRepeatAttrName + "]") ?
                    tBody.attr(ngRepeatAttrName, ngRepeatAttrValue + ngRepeatExtension) :
                    tBodyRow.attr(ngRepeatAttrName, ngRepeatAttrValue + ngRepeatExtension);

                // get total cols
                totalCols = tBodyRow.children("td").size();

                // create tfoot for table
                var footer = "<tfoot>" +
                                "<tr><td colspan=\"" + totalCols + "\">" +
                                    "<ul class=\"pagination\"></ul>" +
                                        "<select ng-model=\"bsTablePagination.pageSize\" class=\"form-control select-page-size\" convert-to-number>" +
                                            "<option value=\"5\">5</option>" +
                                            "<option value=\"10\">10</option>" +
                                            "<option value=\"20\">20</option>" +
                                            "<option value=\"40\">40</option>" +
                                        "</select>" +
                                    "</td>" +
                                "</tr>" +
                             "</tfoot>";

                // add tfoot to table
                tElement.append(footer);

                // return link function
                return function (scope, linkElement) {
                    // get and set scope model
                    var grid = scope.bsTablePagination = {};

                    // create pagination for table
                    var pager = linkElement.find("td"),
                        collectionName = ngRepeatAttrValue.match(/^\s*(.+)\s+in\s+(.*)\s*$/)[2],
                        collection = scope.$eval(collectionName),
                        totalRows = collection.length;

                    // watch changes with collection
                    scope.$watchCollection(collectionName, function () {
                        // get total totalRows of rows
                        totalRows = scope.$eval(collectionName).length;

                        // update grid properties
                        grid.lastPage = Math.ceil(totalRows / grid.pageSize);
           
                        if(grid.lastPage !== 0 && grid.lastPage < grid.page) {
                            grid.page = 1;
                            grid.skipAt = (grid.page - 1) * grid.pageSize;
                        }

                        // recreate pagination
                        RenderPagination();
                    });

                    // watch changes with grid pageSize
                    scope.$watch("bsTablePagination.pageSize", function () {
                        // recreate pagination
                        RenderPagination();
                    });

                    // set grid properties
                    grid.pageSize = 5;
                    grid.lastPage = Math.ceil(totalRows / grid.pageSize);
                    grid.page = 1;
                    grid.skipAt = (grid.page - 1) * grid.pageSize;

                    // on page size change
                    pager.children(".select-page-size").change(function () {
                        // get current element
                        var gridLimit = parseInt($(this).val());

                        // update grid properties
                        grid.lastPage = Math.ceil(totalRows / gridLimit);
                        grid.page = 1;
                        grid.skipAt = (grid.page - 1) * gridLimit;

                        // process all $watch(es)
                        scope.$digest();
                    });

                    // render pagination function
                    function RenderPagination() {
                        // prepare empty string
                        var paging = "";

                        // create list items
                        for (var i = 0; i < Math.ceil(totalRows / scope.bsTablePagination.pageSize) ; i++) {
                            paging += "<li " + (grid.page == (i + 1) ? "class=\"active\"" : "") + "><a ng-href=\"#\">" + (i + 1) + "</a></li>";
                        }

                        // add paging to tfoot of table
                        linkElement.find(".pagination").html(paging);

                        // add event to each list item
                        linkElement.find(".pagination").find("li").bind("click", ListenerPagination);
                    }

                    // pagination on click
                    function ListenerPagination() {
                        // get clicked value
                        var index = parseInt($(this).find("a").text());

                        // remove active class from all elements
                        $(this).parent().find("li").removeClass("active");

                        // add active class to clicked element
                        $(this).addClass("active");

                        // update grid properties
                        grid.page = index;
                        grid.skipAt = (grid.page - 1) * grid.pageSize;

                        // process all $watch(es)
                        scope.$digest();
                    }
                }
            }
        };
    })
    .directive("convertToNumber", function () {
        return {
            require: "ngModel",
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (val) {
                    return val ? parseInt(val, 10) : null;
                });

                ngModel.$formatters.push(function (val) {
                    return val ? "" + val : null;
                });
            }
        };
    })
    .filter("bsTableSkip", function () {
        return function (array, skipAt) {
            return array.slice(skipAt);
        };
    });