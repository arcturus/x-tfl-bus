(function () {

  'use strict';

  var currentData = {};

  var URL = 'https://query.yahooapis.com/v1/public/yql?' +
   'q=select%20*%20from%20json%20where%20url%3D%22' +
   'http%3A%2F%2Fcountdown.tfl.gov.uk%2FstopBoard%2F%STOP%' +
   '%2F%22&format=json&diagnostics=false';

  function _createCORSRequest(url) {
    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
      xhr.open('GET', url, true);
    } else if (typeof XDomainRequest !== 'undefined') {
      xhr = new XDomainRequest();
      xhr.open('GET', url);
    } else {
      return null;
    }

    return xhr;
  }

  function _loadData(component) {
    var url = URL.replace('%STOP%', component.stop);
    var xhr = _createCORSRequest(url);
    if (!xhr) {
      // Fallback to jsonp ?
      // So far display error
      component.error('data');
      return;
    }

    xhr.onload = function () {
      _parseData(component, xhr.responseText);
    };
    xhr.onerror = function () {
      component.error('data');
    };

    xhr.send(null);
  }

  function _parseData(component, data) {
    if (!data) {
      component.error('data');
      return;
    }

    var result = JSON.parse(data);
    currentData[component.stop] = result.query && result.query.results &&
       result.query.results.json || {};
    _displayData(component);
  }

  function _displayData(component) {
    if (!currentData[component.stop] ||
     !Array.isArray(currentData[component.stop].arrivals)) {
      return;
    }

    var data = currentData[component.stop];

    component.innerHTML = '';
    var ul = document.createElement('ul');
    data.arrivals.slice(0, component.maxArrivals).forEach(
      function (arrival) {
      ul.innerHTML += '<li>' + arrival.routeName + ' to ' + arrival.destination + ' (' + arrival.estimatedWait + ')' + '</li>';
    });
    ul.innerHTML += '<li>Last update ' + data.lastUpdated + '</li>';

    component.appendChild(ul);
  }

  xtag.register('x-tfl-bus', {
    lifecycle: {
      created: function () {
        this.xtag.stop = this.getAttribute('stop') || '57096';
        this.xtag.maxArrivals = parseInt(this.getAttribute('maxArrivals')) || 3;

        this.xtag.data = null;

        this.refresh();
      }
    },
    events: {},
    accessors: {
      stop: {
        get: function () {
          return this.xtag.stop;
        },
        set: function (value) {
          this.xtag.stop = value;
          this.refresh();
        }
      },
      maxArrivals: {
        get: function () {
          return this.xtag.maxArrivals;
        },
        set: function (n) {
          this.xtag.maxArriavls = parseInt(n);
          this.refresh();
        }
      },
      data: {
        get: function () {
          return currentData[this.xtag.stop] || null;
        }
      }
    },
    methods: {
      refresh: function () {
        _loadData(this);
      },
      error: function (type) {
        console.log('Error type: ' + type);
      }
    }
  });



})();
