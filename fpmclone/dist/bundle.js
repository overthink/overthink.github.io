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
/***/ function(module, exports) {

	// Disclaimer: I'm not a game developer and I'm just learning TypeScript, so
	// treat this code with extra suspicion.
	var FMPDemo;
	(function (FMPDemo) {
	    /** Input from a client. Gets sent to the server. */
	    var Input = (function () {
	        function Input(seqNum, pressTime, entityId) {
	            this.seqNum = seqNum;
	            this.pressTime = pressTime;
	            this.entityId = entityId;
	        }
	        return Input;
	    }());
	    /**
	     * I don't know the gamedev meaning of this, but here's how I'm viewing it
	     * here:  Each client and the server have their own entity objects for
	     * everything that is rendered on screen.  The server sends WorldState
	     * messages to everyone containing state for all the entities.
	     */
	    var Entity = (function () {
	        function Entity(id, color) {
	            this.x = 0;
	            this.speed = 2;
	            this.id = id;
	            this.color = color;
	        }
	        Entity.prototype.applyInput = function (input) {
	            this.x += input.pressTime * this.speed;
	        };
	        /** Return a copy of this entity. */
	        Entity.prototype.copy = function () {
	            var e = new Entity(this.id, this.color);
	            e.x = this.x;
	            e.speed = this.speed;
	            return e;
	        };
	        return Entity;
	    }());
	    var WorldState = (function () {
	        function WorldState(seqNum, entities, lastProcessedInputSeqNums) {
	            this.seqNum = seqNum;
	            this.entities = entities;
	            this.lastProcessedInputSeqNums = lastProcessedInputSeqNums;
	        }
	        return WorldState;
	    }());
	    var SavedWorldState = (function () {
	        function SavedWorldState(processedTs, value) {
	            this.processedTs = processedTs;
	            this.value = value;
	        }
	        return SavedWorldState;
	    }());
	    /** Represents a message that has been received by a LagNetwork. */
	    var QueuedMessage = (function () {
	        function QueuedMessage() {
	        }
	        return QueuedMessage;
	    }());
	    var LagNetwork = (function () {
	        function LagNetwork() {
	            this.messages = [];
	        }
	        /** Returns next message "received" from the network, if any. */
	        LagNetwork.prototype.receive = function () {
	            var now = Date.now();
	            for (var i = 0; i < this.messages.length; ++i) {
	                var qm = this.messages[i];
	                if (qm.recvTs <= now) {
	                    this.messages.splice(i, 1);
	                    return qm;
	                }
	            }
	        };
	        LagNetwork.prototype.send = function (lagMs, message) {
	            var m = new QueuedMessage;
	            m.recvTs = Date.now() + lagMs;
	            m.payload = message;
	            this.messages.push(m);
	        };
	        return LagNetwork;
	    }());
	    var Client = (function () {
	        function Client(cssId, color, canvas, nonAckdInputsElement) {
	            this.tickRate = 60;
	            this.entities = []; // awful, contains reference to this.entity as well
	            this.leftKeyDown = false;
	            this.rightKeyDown = false;
	            this.network = new LagNetwork;
	            this.lagMs = 250;
	            this.lastUpdateTs = -1;
	            this.inputSeqNum = 0;
	            this.pendingInputs = [];
	            this.usePrediction = false;
	            this.useReconciliation = false;
	            this.useEntityInterpolation = false;
	            this.cssId = cssId;
	            this.color = color;
	            this.canvas = canvas;
	            this.nonAckdInputsElement = nonAckdInputsElement;
	        }
	        Client.prototype.processServerMessages = function () {
	            var _this = this;
	            while (true) {
	                var msg = this.network.receive();
	                if (!msg)
	                    break;
	                var incoming = Util.cast(msg.payload, WorldState);
	                var _loop_1 = function(i) {
	                    var entity = incoming.entities[i];
	                    if (this_1.entityId === undefined)
	                        return "break"; // pointless, but tsc unhappy without this
	                    if (entity.id === this_1.entityId) {
	                        // entity is the remote state for our local this.entity object
	                        // create an entity for ourself if we haven't yet
	                        if (!this_1.entity) {
	                            if (typeof this_1.entityId === 'undefined') {
	                                throw new Error("connected client should always have entityId " + this_1);
	                            }
	                            this_1.entity = new Entity(this_1.entityId, this_1.color);
	                        }
	                        // Set our position to whatever was sent by server
	                        this_1.entity.x = entity.x;
	                        this_1.entities[entity.id] = this_1.entity; // despair
	                        if (this_1.useReconciliation) {
	                            // i.e. reapply all inputs not yet ackd by server
	                            var lastProcessed_1 = incoming.lastProcessedInputSeqNums[this_1.entityId];
	                            if (lastProcessed_1) {
	                                // First, keep inputs that have not yet been taken
	                                // into account by the last WorldState sent by the
	                                // server.
	                                this_1.pendingInputs = this_1.pendingInputs.filter(function (input) {
	                                    return input.seqNum > lastProcessed_1;
	                                });
	                            }
	                            // apply any remaining inputs to our local world state
	                            this_1.pendingInputs.forEach(function (input) {
	                                if (_this.entity) {
	                                    _this.entity.applyInput(input);
	                                }
	                            });
	                        }
	                    }
	                    else {
	                        // non-local-player entity
	                        this_1.entities[entity.id] = entity;
	                    }
	                };
	                var this_1 = this;
	                for (var i = 0; i < incoming.entities.length; ++i) {
	                    var state_1 = _loop_1(i);
	                    if (state_1 === "break") break;
	                }
	                // update prev and current states for later entity interpolation
	                this.prevWorldState = this.curWorldState;
	                this.curWorldState = new SavedWorldState(Date.now(), incoming);
	            }
	        };
	        Client.prototype.processInputs = function () {
	            if (this.server === undefined)
	                return;
	            if (this.entity === undefined)
	                return;
	            if (this.entityId === undefined)
	                return;
	            var nowTs = Date.now();
	            var lastUpdateTs = this.lastUpdateTs >= 0 ? this.lastUpdateTs : nowTs;
	            var delta = (nowTs - lastUpdateTs) / 1000;
	            this.lastUpdateTs = nowTs;
	            // package up the player's current input
	            var input;
	            if (this.rightKeyDown) {
	                input = new Input(this.inputSeqNum++, delta, this.entityId);
	            }
	            else if (this.leftKeyDown) {
	                input = new Input(this.inputSeqNum++, -delta, this.entityId);
	            }
	            else {
	                // nothing interesting happenend
	                return;
	            }
	            this.server.network.send(this.lagMs, input);
	            if (this.usePrediction) {
	                // optimistically apply our input (assume server will accept it)
	                this.entity.applyInput(input);
	            }
	            if (this.useReconciliation) {
	                // Save input for later reconciliation. We'll need to re-apply
	                // some of our optimistically applied inputs after we next
	                // hear from the server.
	                this.pendingInputs.push(input);
	            }
	        };
	        // log only for a specific client (debug)
	        // private log(id: number, ...args: any[]): void {
	        //     if (this.cssId === 'p' + id.toString()) {
	        //         console.log(`${Date.now()} - client p${id}:`, ...args);
	        //     }
	        // }
	        Client.prototype.interpolateEntities = function () {
	            if (this.prevWorldState === undefined)
	                return;
	            if (this.curWorldState === undefined)
	                return;
	            // Recall: "each player sees itself in the present but sees the
	            // other entities in the past"
	            // (http://www.gabrielgambetta.com/fpm3.html) so figure out how
	            // far beyond the most recent server state we are right now, then
	            // interpolate everyone else that amount of time between prev and
	            // cur server states (i.e. one update behind).
	            var now = Date.now();
	            var delta = now - this.curWorldState.processedTs;
	            var statesDelta = this.curWorldState.processedTs - this.prevWorldState.processedTs;
	            var interpFactor = delta / statesDelta;
	            if (interpFactor === Infinity)
	                interpFactor = 1; // If it'll let us div 0, why not
	            var prev = Util.cast(this.prevWorldState.value, WorldState);
	            var cur = Util.cast(this.curWorldState.value, WorldState);
	            for (var i = 0; i < cur.entities.length; ++i) {
	                var curEntity = cur.entities[i];
	                if (curEntity.id === this.entityId)
	                    continue; // don't interpolate self
	                var prevEntity = prev.entities[i]; // assumes the set of entities never changes
	                var newEntity = curEntity.copy();
	                newEntity.x = prevEntity.x + (interpFactor * (curEntity.x - prevEntity.x));
	                newEntity.speed = prevEntity.speed + (interpFactor * (curEntity.speed - prevEntity.speed));
	                this.entities[i] = newEntity;
	            }
	        };
	        Client.prototype.render = function () {
	            Util.render(this.canvas, this.entities, this.entities.length);
	        };
	        Client.prototype.update = function () {
	            this.processServerMessages();
	            if (!this.entity)
	                return; // not connected yet
	            if (this.useEntityInterpolation) {
	                this.interpolateEntities();
	            }
	            this.processInputs();
	            this.render();
	            this.nonAckdInputsElement.textContent = this.pendingInputs.length.toString();
	        };
	        Client.prototype.start = function () {
	            var _this = this;
	            this.updateTimer = setInterval(function () { return _this.update(); }, 1000 / this.tickRate);
	        };
	        return Client;
	    }());
	    var Server = (function () {
	        function Server(canvas) {
	            this.clients = []; // nth client also has entityId == n
	            this.entities = []; // nth entry has entityId n
	            this.lastProcessedInputSeqNums = []; // last processed input's seq num, by entityId
	            this.network = new LagNetwork; // server's network (where it receives inputs from clients)
	            this.tickRate = 5;
	            this.worldStateSeq = 0;
	            this.canvas = canvas;
	        }
	        Server.prototype.connect = function (client) {
	            client.server = this;
	            var entityId = this.clients.length;
	            client.entityId = entityId; // give the client its entity id so it can identify future state messages
	            this.clients.push(client);
	            var entity = new Entity(entityId, client.color);
	            entity.x = 5; // spawn point
	            this.entities.push(entity);
	        };
	        /** Look for cheaters here. */
	        Server.validInput = function (input) {
	            // Not exactly sure where 1/40 comes from.  I got it from the
	            // original code.  The longest possible valid "press" should be
	            // 1/client.tickRate (1/60).  But the JS timers are not reliable,
	            // so if you use 1/60 below you end up throwing out a lot of
	            // inputs that are slighly too long... so maybe that's where 1/40
	            // comes from?
	            return Math.abs(input.pressTime) <= 1 / 40;
	        };
	        /**
	         * Process all pending messages from clients.
	         */
	        Server.prototype.processInputs = function () {
	            while (true) {
	                var msg = this.network.receive();
	                if (!msg)
	                    break;
	                var input = Util.cast(msg.payload, Input);
	                if (!input)
	                    break;
	                if (Server.validInput(input)) {
	                    var id = input.entityId;
	                    this.entities[id].applyInput(input);
	                    this.lastProcessedInputSeqNums[id] = input.seqNum;
	                }
	                else {
	                    console.log('throwing out input!', input);
	                }
	            }
	        };
	        /** Send world state to every client. */
	        Server.prototype.sendWorldState = function () {
	            // Make sure to send copies of our state, and not just references.
	            // i.e. simulate serializing the data like we'd do if we were
	            // using a real network.
	            var msg = new WorldState(this.worldStateSeq++, this.entities.map(function (e) { return e.copy(); }), this.lastProcessedInputSeqNums.slice());
	            this.clients.forEach(function (client) {
	                client.network.send(client.lagMs, msg);
	            });
	        };
	        Server.prototype.render = function () {
	            Util.render(this.canvas, this.entities, this.entities.length);
	        };
	        Server.prototype.update = function () {
	            this.processInputs();
	            this.sendWorldState();
	            this.render();
	        };
	        Server.prototype.setTickRate = function (x) {
	            this.tickRate = x;
	            if (this.updateTimer !== undefined) {
	                clearInterval(this.updateTimer);
	            }
	            this.startUpdateTimer();
	        };
	        Server.prototype.startUpdateTimer = function () {
	            var _this = this;
	            this.updateTimer = setInterval(function () { return _this.update(); }, 1000 / this.tickRate);
	        };
	        Server.prototype.start = function () {
	            this.setTickRate(this.tickRate);
	        };
	        return Server;
	    }());
	    var Util = (function () {
	        function Util() {
	        }
	        /**
	         * Cast 'instance' to the type of 'ctor'.  Die if it fails.Also useful
	         * for blowing up early if instance is null.
	         *
	         * What's is 'ctor'? A type constructor. Roughly, the thing you call
	         * 'new' on. e.g. It's the function Foo below:
	         *
	         * <code><pre>
	         * Class Foo {};
	         * let f = new Foo(); //
	         * </code></pre>
	         *
	         * https://github.com/Microsoft/TypeScript/issues/3193
	         * https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#389-constructor-type-literals
	         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
	         */
	        Util.cast = function (instance, ctor) {
	            if (instance instanceof ctor)
	                return instance;
	            throw new Error("failed to cast '" + instance + "' to '" + ctor + "'");
	        };
	        /** Render each entity on the given canvas. */
	        Util.render = function (canvas, entities, numPlayers) {
	            canvas.width = canvas.width; // hack to clear canvas
	            var paddingFraction = 0.1; // amount of canvas height to leave for padding
	            var yOffset = canvas.height * paddingFraction / 2;
	            var radius = (canvas.height * (1 - paddingFraction)) / numPlayers / 2;
	            var ctx = Util.cast(canvas.getContext("2d"), CanvasRenderingContext2D);
	            entities.forEach(function (entity, idx) {
	                var x = entity.x * canvas.height;
	                var y = radius * (2 * idx + 1);
	                ctx.beginPath();
	                ctx.arc(x, y + yOffset, radius, 0, 2 * Math.PI, false);
	                ctx.fillStyle = entity.color;
	                ctx.fill();
	                ctx.lineWidth = 3;
	                ctx.strokeStyle = '#003300';
	                ctx.stroke();
	            });
	        };
	        return Util;
	    }());
	    // This is all static, so maybe there is a better way than a class to
	    // encapsulate this in TypeScript?  I don't yet fully get modules and
	    // namespaces.
	    var Demo = (function () {
	        function Demo() {
	        }
	        /**
	         * Create a client instance with the given params, wire up its input
	         * handling, and return it.
	         */
	        Demo.client = function (cssId, color, leftKeyCode, rightKeyCode) {
	            var canvas = Util.cast(document.querySelector("#" + cssId + " canvas"), HTMLCanvasElement);
	            var status = Util.cast(document.querySelector("#" + cssId + " .status .non-ackd"), Element);
	            var c = new Client(cssId, color, canvas, status);
	            // install keyboard handlers
	            var keyHandler = function (e) {
	                var e0 = e || window.event;
	                if (e0 instanceof KeyboardEvent) {
	                    if (e0.keyCode === leftKeyCode) {
	                        c.leftKeyDown = (e0.type === "keydown");
	                    }
	                    else if (e0.keyCode === rightKeyCode) {
	                        c.rightKeyDown = (e0.type === "keydown");
	                    }
	                }
	            };
	            document.body.addEventListener("keydown", keyHandler);
	            document.body.addEventListener("keyup", keyHandler);
	            return c;
	        };
	        /**
	         * Update the simulation parameters from the current values in the
	         * form elements.
	         */
	        Demo.updateParameters = function (server, clients) {
	            // update server params
	            var serverTickRate = Util.cast(document.querySelector("#server .tickRate"), HTMLInputElement);
	            server.setTickRate(parseFloat(serverTickRate.value));
	            // update params for each client
	            var _loop_2 = function(i) {
	                var cssId = 'p' + i;
	                var client = clients.filter(function (c) { return c.cssId === cssId; })[0]; // linear; assumes small num of clients
	                var getInput = function (className) {
	                    return Util.cast(document.querySelector("#" + cssId + " " + className), HTMLInputElement);
	                };
	                client.lagMs = parseInt(getInput('.lag').value);
	                client.usePrediction = getInput('.prediction').checked;
	                client.useReconciliation = getInput('.reconciliation').checked;
	                client.useEntityInterpolation = getInput('.entity-interpolation').checked;
	            };
	            for (var i = 1; i <= clients.length; ++i) {
	                _loop_2(i);
	            }
	        };
	        Demo.main = function () {
	            console.log("Starting demo");
	            var server = new Server(Util.cast(document.getElementById('serverCanvas'), HTMLCanvasElement));
	            var clients = [
	                Demo.client('p1', 'red', 81, 69),
	                Demo.client('p2', 'green', 65, 68),
	                Demo.client('p3', 'blue', 90, 67) // z, c
	            ];
	            // Connect each client to the server and start their update timers
	            clients.forEach(function (client) {
	                console.log("Connecting client " + client.cssId);
	                server.connect(client);
	                client.start();
	            });
	            Demo.updateParameters(server, clients);
	            server.start();
	            // Hook up listeners to update simulation when text boxes change
	            var inputs = document.querySelectorAll("input");
	            for (var i = 0; i < inputs.length; ++i) {
	                var input = Util.cast(inputs.item(i), HTMLInputElement);
	                input.addEventListener("change", function () {
	                    Demo.updateParameters(server, clients);
	                });
	            }
	        };
	        return Demo;
	    }());
	    Demo.main();
	})(FMPDemo || (FMPDemo = {}));


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map