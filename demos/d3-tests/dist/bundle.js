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
	var dots_1 = __webpack_require__(9);
	// ideally I'd enumerate these programmatically somehow
	var exampleList = [
	    new randomPoints_1.RandomPoints(),
	    new triangles_1.Triangles(),
	    new rotatingTriangle_1.RotatingTriangle(),
	    new timerAnimation_1.TimerAnimation(),
	    new mouse_1.Mouse(),
	    new dots_1.Dots()
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
	var Dots = (function () {
	    function Dots() {
	        this.title = "Line of dots drifting randomly up and down";
	        this.slug = "dots";
	    }
	    Dots.prototype.start = function () {
	        main();
	    };
	    return Dots;
	}());
	exports.Dots = Dots;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map