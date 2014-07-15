(function() {

var module = angular.module('restquest', []);
    
module.provider('Rq', function() {
    var baseUrl         = '',
        resources       = [],
        defaultParams   = {};

    this.setBaseUrl = function(url) {
        baseUrl = url;
    }

    this.addResource = function(resource, subresources) {
        if (subresources) {
            resources.push({resource: resource, subresources: subresources});
            return;
        }

        resources.push({resource: resource});
    }

    this.$get = ['$http', function($http) {
        function Resource(url, http) {
            this._id = null;
            
            this.url = url;
            this.http = http;
        }
        
        Resource.prototype.id = function(id) {
            if (this.subresource) {
                this.subresource.id = id;
                return this;
            }
            
            this._id = id;
            
            return this;
        }

        Resource.prototype._buildParams = function(query) {
            var params = query || {};

            for (var prop in defaultParams) {
                if (defaultParams.hasOwnProperty(prop)) {
                    params[prop] = defaultParams[prop];
                }
            }

            return params;
        }

        function Subresource(subresource) {
            this.subresource = subresource;
        }

        Resource.prototype.addSubresources = function(subresources) {
            Subresource.prototype = this;
            
            for (var i = subresources.length - 1; i >= 0; i--) {
                var subresourcesUrl = subresources[i];
                this[subresourcesUrl] = new Subresource({id: null, url: subresourcesUrl});
            };
        }
        
        Resource.prototype._http = function(method, query, data) {
            var config = {method: method, params: this._buildParams(query)};
            
            if (data) {
                config.data = data;
            }
            
            var url;
            
            if (!this._id) {
                // /resource
                config.url = baseUrl + this.url;
            } else if (!this.subresource) {
                // /resource/123
                config.url = baseUrl + this.url + '/' + this._id;
            } else if (!this.subresource.id) {
                // /resource/123/subresource
                config.url = baseUrl + this.url + '/' + this._id + '/' + this.subresource.url;
            } else {
                // /resource/123/subresource/456
                config.url = baseUrl + this.url + '/' + this._id + '/' + this.subresource.url + '/' + this.subresource.id;
            }

            return this._finalize(this.http(config));
        }

        Resource.prototype.get = function(query) {
            return this._http('GET', query);
        }

        Resource.prototype.post = function(data, query) {
            return this._http('POST', query, data);
        }
        
        Resource.prototype._finalize = function(resource) {
            //  Saving IDs between requests will have many dire consequences
            Subresource.prototype._id = null;
            
            if (this.subresource) {
                this.subresource.id = null;
            }
            
            delete this._id;
            
            return resource;
        }

        var Rq = {};

        for (var i = resources.length - 1; i >= 0; i--) {
            Rq[resources[i].resource] = new Resource(resources[i].resource, $http);

            if (resources[i].subresources) {
                Rq[resources[i].resource].addSubresources(resources[i].subresources);
            }
        };

        Rq.setDefaultParams = function(params) {
            defaultParams = params;
        };
        
        Rq.addDefaultParams = function(params) {
            for (var prop in params) {
                defaultParams[prop] = params[prop];
            }
        };

        return Rq;
    }];
});

})();