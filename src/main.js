(function () {

  'use strict';

  // Dictionary that will hold all the parsed values for all the stops
  // (multiple x-tfl-bus) on a document.
  var currentData = {};

  // Url template to provide CORS by proxying the query through Yahoo! YQL
  var URL = 'https://query.yahooapis.com/v1/public/yql?' +
   'q=select%20*%20from%20json%20where%20url%3D%22' +
   'http%3A%2F%2Fcountdown.tfl.gov.uk%2FstopBoard%2F%STOP%' +
   '%2F%22&format=json&diagnostics=false';

  // Utility function to build the CORS request
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

  // Fetch the data for the given component. Will get the information
  // to query from it.
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
      xtag.fireEvent(component, 'dataReady');
      _parseData(component, xhr.responseText);
    };
    xhr.onerror = function () {
      xtag.fireEvent(component, 'dataError');
      component.error('data');
    };

    xhr.send(null);
    xtag.fireEvent(component, 'dataLoading');
  }

  // Parse TFL info
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

  // Builds a HTML list with the next buses for the given stop.
  // Also checks the extra info from the component to display correctly the
  // number of next services and additional information.
  function _displayData(component) {
    if (!currentData[component.stop] ||
     !Array.isArray(currentData[component.stop].arrivals)) {
      return;
    }

    var data = currentData[component.stop];

    component.innerHTML = '';

    if (component.getAttribute('hidden')) {
      return;
    }

    var ul = document.createElement('ul');
    data.arrivals.slice(0, component.maxArrivals).forEach(
      function (arrival) {
      ul.innerHTML += '<li>' + arrival.routeName + ' to ' +
       arrival.destination + ' (' + arrival.estimatedWait + ')' + '</li>';
    });
    ul.innerHTML += '<li>Last update ' + data.lastUpdated + '</li>';

    component.appendChild(ul);
  }

  xtag.register('x-tfl-bus', {
    lifecycle: {
      created: function () {
        // Get basic information or default values and fetch the data.
        this.xtag.stop = this.getAttribute('stop') || '57096';
        this.xtag.maxArrivals = parseInt(this.getAttribute('maxArrivals')) || 3;

        this.refresh();
      }
    },
    events: {},
    accessors: {
      // Bus stop number
      stop: {
        get: function () {
          return this.xtag.stop;
        },
        set: function (value) {
          this.xtag.stop = value;
          this.refresh();
        }
      },
      // Maximun number of services to display
      maxArrivals: {
        get: function () {
          return this.xtag.maxArrivals;
        },
        set: function (n) {
          this.xtag.maxArriavls = parseInt(n);
          this.refresh();
        }
      },
      // Parsed data getter
      data: {
        get: function () {
          return currentData[this.xtag.stop] || null;
        }
      },
      // Special treatment if the component is hidden, don't even build the
      // html in that case.
      hidden: {
        get: function () {
          return this.getAttribute('hidden') || false;
        },
        set: function (value) {
          this.setAttribute('hidden', !!value);
          refresh();
        }
      }
    },
    methods: {
      // Fetch the information and display it
      refresh: function () {
        _loadData(this);
      },
      // Error handling
      error: function (type) {
        // TODO: better error handlin ;)
        console.log('Error type: ' + type);
      }
    }
  });



})();
