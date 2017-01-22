/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	var i = __webpack_require__(2);
	var randomPoints_1 = __webpack_require__(3);
	var mouse_1 = __webpack_require__(4);
	var triangles_1 = __webpack_require__(5);
	var rotatingTriangle_1 = __webpack_require__(7);
	var timerAnimation_1 = __webpack_require__(8);
	var dots = __webpack_require__(9);
	var v = __webpack_require__(10);
	var penroseP2 = __webpack_require__(11);
	// ideally I'd enumerate these programmatically somehow
	var exampleList = [
	    new randomPoints_1.RandomPoints(),
	    new triangles_1.Triangles(),
	    new rotatingTriangle_1.RotatingTriangle(),
	    new timerAnimation_1.TimerAnimation(),
	    new mouse_1.Mouse(),
	    dots.example,
	    v.example,
	    penroseP2.example
	];
	var examples = exampleList
	    .reduce(function (acc, ex) { return acc.set(ex.slug, ex); }, i.Map());
	var defaultExample = examples.valueSeq().first();
	/**
	 * Return the value of `selected` from the query string, or undefined if we
	 * can"t figure it out.
	 */
	function getSelected(queryString) {
	    var r = new RegExp("selected=([^=/]*)");
	    var result = r.exec(queryString);
	    return result === null ? undefined : result[1];
	}
	var selected = getSelected(window.location.search) || "random-points";
	examples.get(selected, defaultExample).start();
	// Make a clickable list of examples
	d3.select("ul.examples-list").selectAll("li")
	    .data(examples.entrySeq().toArray())
	    .enter()
	    .append("li")
	    .append("a")
	    .text(function (_a) {
	    var v = _a[1];
	    return v.title;
	})
	    .attr("href", function (_a) {
	    var k = _a[0];
	    return "?selected=" + k;
	})
	    .filter(function (_a) {
	    var k = _a[0];
	    return k === selected;
	})
	    .attr("href", null);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = d3;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = Immutable;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	var RandomPoints = (function () {
	    function RandomPoints() {
	        this.svg = d3.select("svg");
	        this.width = +this.svg.attr("width");
	        this.height = +this.svg.attr("height");
	        this.xRandom = d3.randomUniform(0, this.width);
	        this.yRandom = d3.randomUniform(0, this.height);
	        this.slug = "random-points";
	        this.title = "animated random points";
	    }
	    RandomPoints.prototype.generatePoints = function () {
	        var _this = this;
	        return d3.range(Math.random() * 50)
	            .map(function () { return [_this.xRandom(), _this.yRandom()]; });
	    };
	    RandomPoints.prototype.update = function (points) {
	        var circles = this.svg.selectAll("circle").data(points);
	        // create any new circles
	        circles
	            .enter()
	            .append("circle")
	            .attr("cx", function (p) { return p[0]; })
	            .attr("cy", function (p) { return p[1]; })
	            .attr("fill", "steelblue")
	            .attr("stroke", "black")
	            .attr("r", "0")
	            .transition()
	            .attr("r", "7");
	        // update existing circle coords
	        circles
	            .transition()
	            .duration(2000)
	            .ease(d3.easeBounce)
	            .attr("cx", function (p) { return p[0]; })
	            .attr("cy", function (p) { return p[1]; });
	        // remove any circles that have left
	        circles
	            .exit()
	            .transition()
	            .attr("r", 0)
	            .remove();
	    };
	    RandomPoints.prototype.start = function () {
	        var _this = this;
	        this.update(this.generatePoints());
	        d3.interval(function () {
	            _this.update(_this.generatePoints());
	        }, 3000);
	    };
	    return RandomPoints;
	}());
	exports.RandomPoints = RandomPoints;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	var Mouse = (function () {
	    function Mouse() {
	        this.svg = d3.select("svg");
	        this.width = +this.svg.attr("width");
	        this.height = +this.svg.attr("height");
	        this.data = [];
	        // Track if we should be drawing right now (i.e. mousedown or touchstart)
	        this.drawing = false;
	        this.title = "Draw with the mouse our touching the screen";
	        this.slug = "mouse";
	    }
	    Mouse.prototype.render = function () {
	        var circles = this.svg.selectAll("circle")
	            .data(this.data, function (d) { return d.birthday.toString(); });
	        circles.enter()
	            .append("circle")
	            .attr("cx", function (d) { return d.point[0]; })
	            .attr("cy", function (d) { return d.point[1]; })
	            .attr("r", 20)
	            .transition()
	            .duration(2000)
	            .attr("r", 0)
	            .style("opacity", 0);
	        circles.exit()
	            .remove();
	    };
	    Mouse.prototype.drawCircle = function (coords) {
	        this.data.push({ point: coords, birthday: Date.now() });
	        this.render();
	    };
	    // delete data points that are too old
	    Mouse.prototype.reap = function () {
	        for (var i = this.data.length - 1; i >= 0; i--) {
	            var age = Date.now() - this.data[i].birthday;
	            if (age > 3000)
	                this.data.splice(i, 1);
	        }
	        this.render(); // make sure svg matches data
	    };
	    ;
	    Mouse.prototype.start = function () {
	        var _this = this;
	        this.svg.on("mousedown touchstart", function () {
	            d3.event.preventDefault(); // don't let the touch scroll the viewport on mobile
	            _this.drawing = true;
	            _this.drawCircle(d3.mouse(d3.event.currentTarget));
	        });
	        this.svg.on("mouseup touchend", function () {
	            _this.drawing = false;
	        });
	        this.svg.on("mousemove touchmove", function () {
	            if (_this.drawing) {
	                _this.drawCircle(d3.mouse(d3.event.currentTarget));
	            }
	        });
	        d3.interval(function () { return _this.reap(); }, 2000);
	    };
	    return Mouse;
	}());
	exports.Mouse = Mouse;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	var common_1 = __webpack_require__(6);
	var Triangles = (function () {
	    function Triangles() {
	        this.svg = d3.select("svg");
	        this.width = +this.svg.attr("width");
	        this.height = +this.svg.attr("height");
	        this.slug = "triangles";
	        this.title = "A bunch of triangles with a colour scale";
	    }
	    /**
	     * Given a seed shape, return a sequence of shapes that tile a width x height
	     * area. Yes, this could be done with svg:pattern ...
	     */
	    Triangles.prototype.tile = function (width, height, seed) {
	        // get the width and height of the bounding box of the seed shape (assume
	        // (0, 0) is the top-left of seed shape)
	        var seedW = d3.max(seed, function (p) { return p[0]; });
	        var seedH = d3.max(seed, function (p) { return p[1]; });
	        var result = [];
	        var _loop_1 = function (i) {
	            var _loop_2 = function (j) {
	                var copy = seed.map(function (_a) {
	                    var x = _a[0], y = _a[1];
	                    return [x + i * seedW, y + j * seedH];
	                });
	                result.push(copy);
	            };
	            for (var j = 0; j < Math.floor(height / seedH); j++) {
	                _loop_2(j);
	            }
	        };
	        for (var i = 0; i < Math.floor(width / seedW); i++) {
	            _loop_1(i);
	        }
	        return result;
	    };
	    Triangles.prototype.start = function () {
	        var blend = d3.interpolateRgb("steelblue", "orange");
	        var seed = [[10, 10], [60, 10], [10, 60]];
	        var shapes = this.tile(this.width, this.height, seed);
	        this.svg.selectAll("path")
	            .data(shapes)
	            .enter()
	            .append("path")
	            .attr("d", function (t) { return common_1.shapePathData(t); })
	            .attr("fill", function (_, i) { return blend(i / shapes.length); })
	            .attr("stroke", "black")
	            .attr("stroke-width", "3");
	    };
	    return Triangles;
	}());
	exports.Triangles = Triangles;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	var lineFn = d3.line()
	    .x(function (d) { return d[0]; })
	    .y(function (d) { return d[1]; });
	/**
	 * Return SVG path data for the given shape.
	 */
	function shapePathData(t) {
	    var result = lineFn(t);
	    if (result === null) {
	        throw "Expected string result";
	    }
	    return result + "Z"; // force close the path, d3 only does this if fill is non-none
	}
	exports.shapePathData = shapePathData;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	var common_1 = __webpack_require__(6);
	var RotatingTriangle = (function () {
	    function RotatingTriangle() {
	        this.svg = d3.select("svg");
	        this.width = +this.svg.attr("width");
	        this.height = +this.svg.attr("height");
	        this.centre = [Math.floor(this.width / 2), Math.floor(this.height / 2)];
	        this.offset = 100;
	        this.seed = [[0, this.offset], [0, 80 + this.offset], [-40, 80 + this.offset]];
	        this.rotateFn = function () { return d3.interpolateString("rotate(0, 0, 0)", "rotate(360, 0, 0)"); };
	        this.slug = "rotating-triangle";
	        this.title = "Rotating triangle using repeating transition";
	    }
	    RotatingTriangle.prototype.animate = function () {
	        var _this = this;
	        this.svg.select(".triangle")
	            .transition()
	            .duration(5000)
	            .ease(d3.easeLinear)
	            .attrTween("transform", this.rotateFn)
	            .on("end", function () { return _this.animate(); }); // restart the transition as soon as it ends
	    };
	    RotatingTriangle.prototype.start = function () {
	        d3.select("head").append("style").text("\n        .triangle {\n            fill: slategrey;\n            stroke: black;\n            stroke-width: 2;\n        }\n        ");
	        var svgGroup = this.svg
	            .append("g")
	            .attr("transform", "translate(" + this.centre[0] + ", " + this.centre[1] + ")"); // (0,0) in the middle
	        // mark the centre point
	        svgGroup.append("circle")
	            .attr("cx", 0)
	            .attr("cy", 0)
	            .attr("r", 2)
	            .style("fill", "#ccc");
	        svgGroup.append("path")
	            .attr("class", "triangle")
	            .attr("d", common_1.shapePathData(this.seed));
	        this.animate();
	    };
	    return RotatingTriangle;
	}());
	exports.RotatingTriangle = RotatingTriangle;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	var TimerAnimation = (function () {
	    function TimerAnimation() {
	        this.svg = d3.select("svg");
	        this.width = +this.svg.attr("width");
	        this.height = +this.svg.attr("height");
	        this.r = 50;
	        this.slug = "timer-animation";
	        this.title = "A circle moving around using d3.timer to animate";
	    }
	    TimerAnimation.prototype.start = function () {
	        var _this = this;
	        this.svg.append("circle")
	            .attr("cx", this.r)
	            .attr("cy", Math.floor(this.height / 2))
	            .attr("r", this.r)
	            .attr("fill", "darkorange");
	        var circle = this.svg.select("circle");
	        var move = function (elapsed) {
	            // y = -cos(x)/2 + 0.5 gives nice oscillating output on [0, 1]
	            var fraction = -Math.cos(elapsed / 1000) / 2 + 0.5;
	            circle.attr("cx", _this.r + (fraction * (_this.width - 2 * _this.r)));
	        };
	        d3.timer(move);
	    };
	    return TimerAnimation;
	}());
	exports.TimerAnimation = TimerAnimation;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	var svg = d3.select("svg");
	var height = +svg.attr("height");
	var width = +svg.attr("width");
	var n = 75;
	function initialData() {
	    var data = [];
	    var midY = Math.floor(height / 2);
	    for (var i = 0; i < n; i++) {
	        data.push([i * width / n, midY]);
	    }
	    return data;
	}
	function render(data) {
	    var dots = svg.selectAll("circle").data(data);
	    // newly arriving dots
	    dots.enter()
	        .append("circle")
	        .attr("cx", function (d) { return d[0]; })
	        .attr("cy", function (d) { return d[1]; })
	        .attr("r", 2);
	    // existing dots
	    dots.transition()
	        .duration(500)
	        .ease(d3.easeLinear)
	        .attr("cy", function (d) { return d[1]; });
	}
	var yrand = d3.randomUniform(-3, 3);
	function perturb(data) {
	    return data.map(function (p) {
	        p[1] = p[1] + yrand();
	        return p;
	    });
	}
	function main() {
	    var data = initialData();
	    render(data);
	    d3.interval(function () { return render(perturb(data)); }, 500);
	}
	exports.example = {
	    title: "Line of dots drifting randomly up and down",
	    slug: "dots",
	    start: function () { return main(); }
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	// Overly explainy comments in here since I'm trying to understand
	// d3.voronoi better.
	//
	// much borrowed from https://bl.ocks.org/mbostock/4060366
	var d3 = __webpack_require__(1);
	function main() {
	    d3.select("head").append("style").text("\n        .site {\n            fill: #333;\n        }\n        .polygon {\n            fill: none;\n            stroke: #ccc;\n            stroke-width: 2px;\n        }\n    ");
	    // apparently there's a "margin convention" for d3:
	    // http://bl.ocks.org/mbostock/3019563
	    var margin = { top: 20, right: 10, bottom: 20, left: 10 };
	    var svgElem = d3.select("svg");
	    var svg = svgElem
	        .append("g")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	    var width = +svgElem.attr("width") - margin.left - margin.right;
	    var height = +svgElem.attr("height") - margin.top - margin.bottom;
	    var n = 150;
	    var x = d3.scaleLinear().range([0, width - 1]);
	    var y = d3.scaleLinear().range([0, height - 1]);
	    var siteData = d3.range(n)
	        .map(function () { return [x(Math.random()), y(Math.random())]; });
	    // "site" is Voronoi lingo for one of the dots on the diagram
	    var drawSite = function (site) {
	        site
	            .attr("cx", function (d) { return d[0]; })
	            .attr("cy", function (d) { return d[1]; })
	            .attr("r", 2);
	    };
	    var drawPolygon = function (polygon) {
	        // nb: a polygon's data can be null if its site is coincident with an earlier
	        // polygon
	        polygon.attr("d", function (d) { return d ? "M" + d.join("L") + "Z" : null; });
	    };
	    // Create a VoronoiLayout that can be used to create a Voronoi diagram
	    // when given data. extent sets the clipping for the polygons in the diagram.
	    var layout = d3.voronoi()
	        .extent([[-1, -1], [width + 1, height + 1]]);
	    var sites = svg.append("g")
	        .selectAll("circle")
	        .data(siteData)
	        .enter()
	        .append("circle")
	        .classed("site", true)
	        .call(drawSite);
	    var polygons = svg.append("g")
	        .selectAll("path")
	        .data(layout.polygons(siteData))
	        .enter()
	        .append("path")
	        .classed("polygon", true)
	        .call(drawPolygon);
	    var rand = d3.randomUniform(-1, 1);
	    var perturb = function (data) {
	        return data.map(function (p) {
	            p[1] = p[1] + rand();
	            p[0] = p[0] + rand();
	            // clamp points within width x height
	            if (p[0] > width)
	                p[0] = width;
	            if (p[0] < 0)
	                p[0] = 0;
	            if (p[1] > height)
	                p[1] = height;
	            if (p[1] < 0)
	                p[1] = 0;
	            return p;
	        });
	    };
	    // Always make sure there is a site at the mouse location (looks cool)
	    svgElem.on("touchmove mousemove", function () {
	        var curPos = d3.mouse(d3.event.currentTarget);
	        curPos[0] -= margin.left;
	        curPos[1] -= margin.top;
	        siteData[0] = curPos;
	        update();
	    });
	    var update = function () {
	        // move the sites around randomly
	        siteData = perturb(siteData);
	        // regenerate the diagram using the updated site data (rendering of
	        // diagram not yet changed)
	        var diagram = layout(siteData);
	        // Update the polygons and sites we've already drawn using the data from the
	        // new diagram we just created.
	        polygons = polygons.data(diagram.polygons()).call(drawPolygon);
	        sites = sites.data(siteData).call(drawSite);
	    };
	    d3.timer(update);
	}
	exports.example = {
	    title: "Jittery Voronoi diagram with mouse interaction",
	    slug: "voronoi",
	    start: function () { return main(); }
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// Based on Preshing's approach http://preshing.com/20110831/penrose-tiling-explained/
	// He very cleverly uses complex numbers to do this, but I, less clever, am
	// going to do it with 2d real coordinates.
	"use strict";
	var d3 = __webpack_require__(1);
	function distance(a, b) {
	    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
	}
	/**
	 * Return a new point that is point p rotated deg degrees clockwise around the
	 * point about.
	 */
	function rotate(p, deg, about) {
	    // translate p so rotation is around origin, then rotate with the usual
	    // math, then translate result back so it's relative to about.
	    var rad = deg * Math.PI / 180;
	    var result = [0, 0];
	    result[0] = (p[0] - about[0]) * Math.cos(rad) - (p[1] - about[1]) * Math.sin(rad) + about[0];
	    result[1] = (p[1] - about[1]) * Math.cos(rad) + (p[0] - about[0]) * Math.sin(rad) + about[1];
	    return result;
	}
	// My model of isosceles triangles: (AB and AC are equal length)
	//
	//      A
	//     /ϴ\
	//    /   \
	//   B_____C
	//
	// Given points a and b defining one of the equal length sides of an isosceles
	// triangle, and deg, the degrees between the equal length sizes, return c,
	// the 3rd point of the triangle.
	function isosceles(a, b, degrees) {
	    // rotate negative degrees so point C matches our diagram (we're given A and B)
	    return [a, b, rotate(b, -degrees, a)];
	}
	// function redTriangle(a: Point, b: Point): PenroseTriangle {
	//     const t: any[] = isosceles(a, b, 36);
	//     t.push(Colour.Red);
	//     return <PenroseTriangle>t;
	// }
	function blueTriangle(a, b) {
	    var t = isosceles(a, b, 108);
	    t.push(1 /* Blue */);
	    return t;
	}
	// draw triangle, but don't stroke the base, since they'll combine into rhombi
	// once tiled
	function drawTriangle(t) {
	    t.attr("d", function (d) {
	        // bc is the triangle base, so we don't stroke that
	        var a = d[0], b = d[1], c = d[2];
	        return "M" + [b, a, c].join("L");
	    })
	        .classed("red", function (d) { return d[3] == 0 /* Red */; })
	        .classed("blue", function (d) { return d[3] == 1 /* Blue */; });
	}
	// Return a vector of length 1 starting at from in the direction of to.
	function unitVector(from, to) {
	    var d = distance(from, to);
	    return [(to[0] - from[0]) / d, (to[1] - from[1]) / d];
	}
	// multiply vector by scala, return new vector
	function multiply(vector, scalar) {
	    return [vector[0] * scalar, vector[1] * scalar];
	}
	// Return a new vector that is the sum of v1 and v2
	function sum(v1, v2) {
	    return [v1[0] + v2[0], v1[1] + v2[1]];
	}
	var phi = (1 + Math.sqrt(5)) / 2;
	// Split given triangle into two by adding a point p between a and b, s.t. it
	// divides ab in the golden ratio. Then return triangles pca and cpb
	function deflate(t) {
	    var a = t[0], b = t[1], c = t[2], colour = t[3];
	    var result = [];
	    if (colour == 0 /* Red */) {
	        var p = sum(a, multiply(unitVector(a, b), distance(a, b) / phi));
	        result.push([c, p, b, 0 /* Red */], [p, c, a, 1 /* Blue */]);
	    }
	    else {
	        var q = sum(b, multiply(unitVector(b, a), distance(b, a) / phi));
	        var r = sum(b, multiply(unitVector(b, c), distance(b, c) / phi));
	        result.push([q, r, b, 1 /* Blue */], [r, q, a, 0 /* Red */], [r, c, a, 1 /* Blue */]);
	    }
	    return result;
	}
	function deflateMany(ts) {
	    return [].concat.apply([], ts.map(deflate));
	}
	// Apply f to args, then take the result of that and apply f to it again. Do
	// this n times.
	function iterate(f, args, n) {
	    var result = args;
	    while (n > 0) {
	        result = f.call(null, result);
	        n--;
	    }
	    return result;
	}
	function main() {
	    d3.select("head").append("style").text("\n        .triangle {\n            stroke: #333;\n            stroke-width: 1px;\n        }\n        .red {\n            fill: darkorange;\n        }\n        .blue {\n            fill: steelblue;\n         }\n        path.fixup.red {\n            stroke: darkorange;\n            stroke-width: 2px;\n        }\n        path.fixup.blue {\n            stroke: steelblue;\n            stroke-width: 2px;\n        }\n    ");
	    var margin = { top: 20, right: 10, bottom: 20, left: 10 };
	    var svgElem = d3.select("svg");
	    var svg = svgElem
	        .append("g")
	        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
	    var width = +svgElem.attr("width") - margin.left - margin.right;
	    var height = +svgElem.attr("height") - margin.top - margin.bottom;
	    // TODO dumb: I'm drawing way more triangles than needed to fill the viewport
	    var triangles = iterate(deflateMany, [blueTriangle([800, -200], [-700, 100])], 10);
	    console.log("there are " + triangles.length + " triangles");
	    // hack, anti-aliasing causes there to be a tiny gap between filled shapes
	    // with no stroke along the adjaced edge... my work around is to draw a
	    // fat stroke along these edges "under" the main shapes, so the gaps
	    // appear to be filled in. Horrible, but works.
	    //
	    // "Horrible, but works." - All programmers on all software, ever.
	    for (var _i = 0, triangles_1 = triangles; _i < triangles_1.length; _i++) {
	        var t = triangles_1[_i];
	        var b = t[1], c = t[2], colour = t[3];
	        var d = "M" + [b, c].join("L");
	        svg.append("path")
	            .attr("d", d)
	            .classed("fixup", true)
	            .classed("red", colour == 0 /* Red */)
	            .classed("blue", colour == 1 /* Blue */);
	    }
	    svg.selectAll("path.triangles") // need a "path" query that won't select the fixup lines
	        .data(triangles)
	        .enter()
	        .append("path")
	        .classed("triangle", true)
	        .call(drawTriangle);
	}
	exports.example = {
	    title: "Simple Penrose P2 tiling",
	    slug: "penrose-p2",
	    start: function () { return main(); }
	};


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map