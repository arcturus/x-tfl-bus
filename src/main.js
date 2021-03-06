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
    var url = URL.replace('%STOP%', component.stopId);
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
    currentData[component.stopId] = result.query && result.query.results &&
       result.query.results.json || {};
    _displayData(component);
  }

  // Builds a HTML list with the next buses for the given stop identifier.
  // Also checks the extra info from the component to display correctly the
  // number of next services and additional information.
  function _displayData(component) {
    if (!currentData[component.stopId] ||
     !Array.isArray(currentData[component.stopId].arrivals)) {
      return;
    }

    var data = currentData[component.stopId];
    var ul = component.getElementsByTagName('ul')[0];

    ul.innerHTML = '';

    if (component.getAttribute('hidden')) {
      return;
    }

    data.arrivals.slice(0, component.maxArrivals).forEach(
      function (arrival, index) {
      ul.innerHTML += '<li data-stop-position="' + index + '">' +
       arrival.routeName + ' to ' + arrival.destination +
       ' (' + arrival.estimatedWait + ')' + '</li>';
    });
    if (component.showExtra) {
      ul.innerHTML += '<li>Last update ' + data.lastUpdated + '</li>';
    }

    component.appendChild(ul);
  }

  xtag.register('x-tfl-bus', {
    lifecycle: {
      created: function () {
        // Get basic information or default values and fetch the data.
        this.xtag.stopId = this.getAttribute('stopId') || '57096';
        this.xtag.maxArrivals = parseInt(this.getAttribute('maxArrivals')) || 3;
        this.xtag.showExtra = this.getAttribute('showExtra') === 'true';

        this.innerHTML = '<ul></ul>';

        this.refresh();
      }
    },
    events: {
      'click': function (e) {
        var pos = e.target.dataset.stopPosition;
        var info = currentData[this.xtag.stopId].arrivals[pos];
        if (info) {
          xtag.fireEvent(this, 'serviceClicked', {
            bubbles: false,
            cancelable: true,
            detail: info
          });
        }
      }
    },
    accessors: {
      // Bus stop number
      stopId: {
        get: function () {
          return this.xtag.stopId;
        },
        set: function (value) {
          this.xtag.stopId = value;
          this.refresh();
        }
      },
      // Maximun number of services to display
      maxArrivals: {
        get: function () {
          return this.xtag.maxArrivals;
        },
        set: function (n) {
          this.xtag.maxArrivals = parseInt(n);
          this.refresh();
        }
      },
      // Parsed data getter
      data: {
        get: function () {
          return currentData[this.xtag.stopId] || null;
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
          this.refresh();
        }
      },
      // Display a line containing extra information like last time data loaded
      showExtra: {
        get: function () {
          return this.xtag.showExtra;
        },
        set: function (value) {
          this.xtag.showExtra = !!value;
          this.refresh();
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
        // TODO: better error handling ;)
        console.log('Error type: ' + type);
      }
    }
  });



})();
