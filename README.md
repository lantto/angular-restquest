angular-restquest
=================

REST client which calls a resource and returns a promise produced by $http.

# Basic usage

```javascript
var app = angular.module('myApp', ['restquest']);

app.config(function(RqProvider) {
    RqProvider.setBaseUrl('http://example.com/');

    RqProvider.addResource('articles');
    RqProvider.addResource('users', ['comments', 'points']);
});

app.controller('MyCtrl', function($scope, Rq) {
    Rq.articles.get().success(function(data) { 
        // GET articles from http://example.com/articles
    });

    Rq.articles.post({title: 'A title'}); // POST article to http://example.com/articles

    Rq.users.id(123).get().success(function(data) { 
        // GET user from http://example.com/users/123
    });

    Rq.users.id(123).comments.get({limit: 10}).success(function(data) { 
        // GET user comments from http://example.com/users/123/comments?limit=10
    });
});
```


