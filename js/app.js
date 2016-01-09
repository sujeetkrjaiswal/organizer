/**
 * Created by sujeet on 6/1/16.
 */
angular.module('toDoLS', ['ngRoute','ngAria','ngAnimate','ngMaterial'])
    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: './partials/home.html',
                controller: 'homeController'
            })
            .when('/boards', {
                templateUrl: './partials/boardList.html',
                controller: 'boardListController'
            })
            .when('/board/:boardIndex', {
                templateUrl: './partials/board.html',
                controller: 'boardController'
            })
            .when('/search', {
                templateUrl: './partials/search.html',
                controller: 'searchController'
            })
            .otherwise({
                redirectTo: '/'
            });

        // configure html5 to get links working on jsfiddle
        //$locationProvider.html5Mode(true);
    });