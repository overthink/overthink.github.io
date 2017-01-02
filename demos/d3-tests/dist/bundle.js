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
	var immutable = __webpack_require__(2);
	var rp = __webpack_require__(3);
	var tri = __webpack_require__(4);
	var rt = __webpack_require__(6);
	var ta = __webpack_require__(7);
	// ideally I'd enumerate these programmatically
	var examples = immutable.Map({
	    "random-points": { title: "Random points", run: rp.main },
	    "triangles": { title: "Triangles", run: tri.main },
	    "rotating-triangle": { title: "Rotating Triangle", run: rt.main },
	    "timer-animation": { title: "Use d3.timer() to animate", run: ta.main }
	});
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
	examples.get(selected, defaultExample).run();
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
	function main() {
	    var svg = d3.select("svg");
	    var width = +svg.attr("width");
	    var height = +svg.attr("height");
	    var xRandom = d3.randomUniform(0, width);
	    var yRandom = d3.randomUniform(0, height);
	    function generatePoints() {
	        return d3.range(Math.random() * 50)
	            .map(function () { return [xRandom(), yRandom()]; });
	    }
	    function update(points) {
	        var circles = svg.selectAll("circle").data(points);
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
	    }
	    update(generatePoints());
	    d3.interval(function () {
	        update(generatePoints());
	    }, 3000);
	}
	exports.main = main;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	var common_1 = __webpack_require__(5);
	function main() {
	    var svg = d3.select("svg");
	    var width = +svg.attr("width");
	    var height = +svg.attr("height");
	    /**
	     * Given a seed shape, return a sequence of shapes that tile a width x height
	     * area. Yes, this could be done with svg:pattern ...
	     */
	    function tile(width, height, seed) {
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
	    }
	    var blend = d3.interpolateRgb("steelblue", "orange");
	    var seed = [[10, 10], [60, 10], [10, 60]];
	    var shapes = tile(width, height, seed);
	    svg.selectAll("path")
	        .data(shapes)
	        .enter()
	        .append("path")
	        .attr("d", function (t) { return common_1.shapePathData(t); })
	        .attr("fill", function (_, i) { return blend(i / shapes.length); })
	        .attr("stroke", "black")
	        .attr("stroke-width", "3");
	}
	exports.main = main;


/***/ },
/* 5 */
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
	    return result + ",Z"; // force close the path, d3 only does this if fill is non-none
	}
	exports.shapePathData = shapePathData;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	var common_1 = __webpack_require__(5);
	function main() {
	    d3.select("head").append("style").text("\n    .triangle {\n        fill: slategrey;\n        stroke: black;\n        stroke-width: 2;\n    }\n    ");
	    var svg = d3.select("svg");
	    var width = +svg.attr("width");
	    var height = +svg.attr("height");
	    var centre = [Math.floor(width / 2), Math.floor(height / 2)];
	    var svgGroup = svg
	        .append("g")
	        .attr("transform", "translate(" + centre[0] + ", " + centre[1] + ")"); // (0,0) in the middle
	    // mark the centre point
	    svgGroup.append("circle")
	        .attr("cx", 0)
	        .attr("cy", 0)
	        .attr("r", 2)
	        .style("fill", "#ccc");
	    console.log("in rotatingTriangle.ts");
	    var offset = 100;
	    var seed = [[0, offset], [0, 80 + offset], [-40, 80 + offset]];
	    var rotateFn = function () { return d3.interpolateString("rotate(0, 0, 0)", "rotate(360, 0, 0)"); };
	    var triangle = svgGroup.append("path")
	        .attr("class", "triangle")
	        .attr("d", common_1.shapePathData(seed));
	    function repeat() {
	        triangle
	            .transition()
	            .duration(5000)
	            .ease(d3.easeLinear)
	            .attrTween("transform", rotateFn)
	            .on("end", repeat); // restart the transition as soon as it ends
	    }
	    repeat();
	}
	exports.main = main;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var d3 = __webpack_require__(1);
	function main() {
	    var svg = d3.select("svg");
	    var width = +svg.attr("width");
	    var height = +svg.attr("height");
	    var r = 50;
	    svg.append("circle")
	        .attr("cx", r)
	        .attr("cy", Math.floor(height / 2))
	        .attr("r", r)
	        .attr("fill", "darkorange");
	    var x = d3.scaleLinear().domain([-1, 1]).range([r, width - r]);
	    var start = 0;
	    function move() {
	        var circle = svg.select("circle");
	        start += 0.02;
	        circle.attr("cx", x(-Math.cos(start)));
	    }
	    // const t = d3.timer(e => {
	    //     move(e);
	    //     if (e > 30000) t.stop();
	    // });
	    d3.timer(move);
	}
	exports.main = main;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map