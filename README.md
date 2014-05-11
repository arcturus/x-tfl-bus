# About x-tfl-bus
This is a webcomponent that displays information of London bus stops. It's concept is based in the great work done by Martí Planellas andhis [TFL tube web component](https://github.com/beldar/tfl-status), but this case uses [x-tags](https://github.com/beldar/tfl-status) as the core technology to build this component.

The number associated for the bus stops is the unique number each stop has, you can find more about this in the [TFL Open Data](http://www.tfl.gov.uk/info-for/open-data-users/) web, or simply looking at [urls](http://m.countdown.tfl.gov.uk/stopsNearPostcode/wc2)

# Example

```
<x-tfl-bus stopId="76213"></x-tfl-bus>
```

```
var xBus = document.getElementsByTagName('x-tfl-bus')[0];
xBus.refresh();
```

# Demo

http://arcturus.github.io/x-tfl-bus/demo/

# Download it


# Dev Setup

```
Fork this repo, rename it, then clone it.

$ npm install	// install bower tasks
$ bower install	// install components
$ grunt build   // build
$ grunt bump-push  // bump the version number, tag it and push to origin master

```



# Links

[Yeoman X-Tag Generator](https://github.com/x-tag/x-tag-generator)

[X-Tags Docs](http://x-tags.org/docs)

[Guide for creating X-Tag Components](https://github.com/x-tag/core/wiki/Creating-X-Tag-Components)

[Using X-Tag components in your applications](https://github.com/x-tag/core/wiki/Using-our-Web-Components-in-Your-Application)
