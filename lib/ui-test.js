"use strict";

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var configs = {
  boardPadding: 40,
  boardFillColor: "rgba(45, 252, 194, 0.3)",
  boardStrokeColor: "black",
  parentPointFillColor: "#444444",
  childPointFillColor: "#A0A0A0",
  highlightStrokeColor: 'red',
  highlightStrokeWidth: 2,
  pointStrokeColor: 'black',
  pointStrokeWidth: 1,
  pointRadius: 6
};

var Point = /*#__PURE__*/function () {
  function Point(x, y, freedomX, freedomY, number) {
    _classCallCheck(this, Point);

    _defineProperty(this, "isDragging", false);

    _defineProperty(this, "freedom", [1, 1]);

    _defineProperty(this, "number", null);

    this.x = x;
    this.y = y;
    this.freedom = [freedomX, freedomY];
    this.number = number;
  }

  _createClass(Point, [{
    key: "plot",
    value: function plot(ctx) {
      var selected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      ctx.beginPath();
      ctx.arc(this.x, this.y, configs.pointRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      if (selected) {
        ctx.strokeStyle = configs.highlightStrokeColor;
        ctx.lineWidth = configs.highlightStrokeWidth;
        ctx.stroke();
        ctx.strokeStyle = configs.pointStrokeColor;
        ctx.lineWidth = configs.pointStrokeWidth;
      }
    }
  }, {
    key: "update",
    value: function update(dx, dy) {
      dx = dx * this.freedom[0];
      dy = dy * this.freedom[1];
      this.x += dx;
      this.y += dy;
    }
  }, {
    key: "dest",
    get: function get() {
      return [this.x, this.y].concat(_toConsumableArray(this.freedom), [this.number]);
    }
  }, {
    key: "pair",
    get: function get() {
      return [this.x, this.y];
    }
  }, {
    key: "hasContinuity",
    get: function get() {
      return 2;
    }
  }]);

  return Point;
}();

var ParentPoint = /*#__PURE__*/function (_Point) {
  _inherits(ParentPoint, _Point);

  var _super = _createSuper(ParentPoint);

  function ParentPoint() {
    var _this;

    _classCallCheck(this, ParentPoint);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "continuity", false);

    _defineProperty(_assertThisInitialized(_this), "before", null);

    _defineProperty(_assertThisInitialized(_this), "after", null);

    return _this;
  }

  _createClass(ParentPoint, [{
    key: "update",
    value: function update(dx, dy) {
      dx = dx * this.freedom[0];
      dy = dy * this.freedom[1];

      if (this.before) {
        this.before.update(dx, dy, false);
      }

      if (this.after) {
        this.after.update(dx, dy, false);
      }

      this.x += dx;
      this.y += dy;
    }
  }, {
    key: "plot",
    value: function plot(ctx) {
      var selected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      ctx.fillStyle = configs.parentPointFillColor;

      _get(_getPrototypeOf(ParentPoint.prototype), "plot", this).call(this, ctx, selected);
    }
  }]);

  return ParentPoint;
}(Point);

var ChildPoint = /*#__PURE__*/function (_Point2) {
  _inherits(ChildPoint, _Point2);

  var _super2 = _createSuper(ChildPoint);

  function ChildPoint() {
    var _this2;

    _classCallCheck(this, ChildPoint);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this2 = _super2.call.apply(_super2, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this2), "parent", null);

    _defineProperty(_assertThisInitialized(_this2), "sibling", null);

    return _this2;
  }

  _createClass(ChildPoint, [{
    key: "move",
    value: function move(alpha) {
      var rX = this.x - this.parent.x,
          rY = this.y - this.parent.y;
      var norm = Math.sqrt(rX * rX + rY * rY);
      this.x = norm * Math.cos(alpha) + this.parent.x;
      this.y = norm * Math.sin(alpha) + this.parent.y;
    }
  }, {
    key: "update",
    value: function update(dx, dy) {
      var propagate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      dx = dx * this.freedom[0];
      dy = dy * this.freedom[1];

      if (this.parent.continuity && this.sibling && propagate) {
        var rX = this.x - this.parent.x,
            rY = this.y - this.parent.y;
        var nX = rX + dx,
            nY = rY + dy;
        var alpha = Math.atan(nY / nX);
        this.sibling.move(alpha + (nX >= 0) * Math.PI);
      }

      this.x += dx;
      this.y += dy;
    }
  }, {
    key: "plot",
    value: function plot(ctx) {
      var selected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      ctx.fillStyle = configs.childPointFillColor;

      _get(_getPrototypeOf(ChildPoint.prototype), "plot", this).call(this, ctx, selected);
    }
  }]);

  return ChildPoint;
}(Point);

var Canvas = /*#__PURE__*/function () {
  function Canvas(board, profile, id) {
    var _this3 = this;

    _classCallCheck(this, Canvas);

    _defineProperty(this, "isDragging", false);

    _defineProperty(this, "currentPoint", void 0);

    this.board = board;
    this.profile = profile;
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext("2d");

    this.canvas.onmousedown = function (e) {
      return _this3.onDown(e);
    };

    this.canvas.onmouseup = function (e) {
      return _this3.onUp(e);
    };

    this.canvas.onmousemove = function (e) {
      return _this3.onMove(e);
    };

    window.addEventListener('resize', function () {
      _this3.initialize(profile);
    });
    this.initialize(profile);
  }

  _createClass(Canvas, [{
    key: "initialize",
    value: function initialize(profile) {
      this.profile = profile;
      var actual = document.getElementById('cvs-container').getBoundingClientRect();
      this.width = Math.floor(actual.width);
      this.height = Math.floor(actual.height);
      this.canvas.height = this.height;
      this.canvas.width = this.width;
      this.padding = Math.floor(actual.height / 10);
      this.offsetX = actual.left;
      this.offsetY = actual.top;
      this.setRescaling(profile);
      this.points = this.getPoints(profile);
      this.render();
    }
  }, {
    key: "onCommit",
    value: function onCommit(state) {
      var newBoard = _objectSpread({}, this.board.board);

      newBoard.width = state.width;
      newBoard.length = state.length;
      newBoard.thickness = state.thickness;
      newBoard[this.profile] = this.returnPoints();
      this.board.initialize(newBoard);
      this.initialize(this.profile);
      this.onBoardChange();
    }
  }, {
    key: "setPointControls",
    value: function setPointControls(i) {
      this.currentPoint = i;

      if (i == -1) {
        this.controls.setState(_objectSpread(_objectSpread({}, this.controls.state), {}, {
          x: '',
          y: '',
          continuity: false,
          pointSelected: false
        }));
      } else {
        var _this$from = this.from(this.points[i].pair),
            _this$from2 = _slicedToArray(_this$from, 2),
            x = _this$from2[0],
            y = _this$from2[1];

        this.controls.setState(_objectSpread(_objectSpread({}, this.controls.state), {}, {
          x: round(x),
          y: round(y),
          continuity: this.points[i] instanceof ChildPoint ? this.points[i].parent.continuity : this.points[i].continuity,
          pointSelected: true
        }));
      }
    }
  }, {
    key: "renderControls",
    value: function renderControls() {
      var _this4 = this;

      this.controls = ReactDOM.render( /*#__PURE__*/React.createElement(Controls, {
        width: rBoard.width.toString(),
        length: rBoard.length.toString(),
        thickness: rBoard.thickness.toString(),
        pointSelected: false,
        continuity: false,
        onContinuity: function onContinuity() {
          if (_this4.points[_this4.currentPoint].parent) {
            _this4.points[_this4.currentPoint].parent.continuity ^= true;

            _this4.points[_this4.currentPoint].update(0, 0);
          } else {
            _this4.points[_this4.currentPoint].continuity ^= true;
          }
        },
        onCommit: function onCommit(state) {
          _this4.onCommit(state);
        },
        onSave: function onSave() {
          _this4.onSave(_this4.board.nonNested());
        },
        setProfile: function setProfile(profile) {
          _this4.initialize(profile);
        }
      }), document.getElementById('controls'));
    }
  }, {
    key: "setRescaling",
    value: function setRescaling(profile) {
      switch (profile) {
        case 'x':
          this.xFactor = this.board.width;
          this.yFactor = this.board.thickness;
          break;

        case 'x0':
          this.xFactor = this.board.x0Width();
          this.yFactor = this.board.x0Thickness();
          break;

        case 'y':
          this.xFactor = this.board.length;
          this.yFactor = this.board.thickness;
          break;

        case 'z':
          this.xFactor = this.board.length;
          this.yFactor = this.board.width;
          break;

        default:
          throw new Error('Profile not understood');
      }

      this.rescaling = Math.max(this.xFactor / this.width, this.yFactor / this.height);
      this.rescaling = 0.9 / this.rescaling;
    }
  }, {
    key: "getPoints",
    value: function getPoints(profile) {
      var _this5 = this;

      var pointsArray = this.board.board[profile];
      pointsArray = pointsArray.map(function (p, i) {
        var j = p.slice();

        var _this5$to = _this5.to([j[0], j[1]]);

        var _this5$to2 = _slicedToArray(_this5$to, 2);

        j[0] = _this5$to2[0];
        j[1] = _this5$to2[1];

        if (j[4] >= 0) {
          return _construct(ParentPoint, _toConsumableArray(j));
        } else {
          return _construct(ChildPoint, _toConsumableArray(j));
        }
      });

      for (var i = 0; i < pointsArray.length; i++) {
        if (pointsArray[i - 1 >= 0 ? i - 1 : 0].number == -2) {
          pointsArray[i].before = pointsArray[i - 1];
          pointsArray[i].before.parent = pointsArray[i];
        }

        if (pointsArray[i + 1 < pointsArray.length ? i + 1 : i - 1].number == -1) {
          pointsArray[i].after = pointsArray[i + 1];
          pointsArray[i].after.parent = pointsArray[i];
        }

        if (pointsArray[i].before && pointsArray[i].after) {
          pointsArray[i].before.sibling = pointsArray[i].after;
          pointsArray[i].after.sibling = pointsArray[i].before;
        }
      }

      return pointsArray;
    }
  }, {
    key: "returnPoints",
    value: function returnPoints() {
      var _this6 = this;

      return this.points.map(function (p, i) {
        var j = p.dest;

        var _this6$from = _this6.from([j[0], j[1]]);

        var _this6$from2 = _slicedToArray(_this6$from, 2);

        j[0] = _this6$from2[0];
        j[1] = _this6$from2[1];
        return j;
      });
    }
  }, {
    key: "to",
    value: function to(_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          x = _ref2[0],
          y = _ref2[1];

      y *= this.yFactor;
      y *= -this.rescaling;
      y += this.height - this.padding;
      x *= this.xFactor;
      x *= this.rescaling;
      x += this.padding;
      return [x, y];
    }
  }, {
    key: "from",
    value: function from(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          x = _ref4[0],
          y = _ref4[1];

      y -= this.height - this.padding;
      y /= -this.rescaling;
      y /= this.yFactor;
      x -= this.padding;
      x /= this.rescaling;
      x /= this.xFactor;
      return [x, y];
    }
  }, {
    key: "drawProfile",
    value: function drawProfile() {
      var _this$ctx;

      this.ctx.lineWidth = 2;
      this.ctx.fillStyle = "rgba(45, 252, 194, 0.3)";
      this.ctx.strokeStyle = 'black';
      this.ctx.beginPath();

      (_this$ctx = this.ctx).moveTo.apply(_this$ctx, _toConsumableArray(this.points[0].pair));

      for (var i = 1; i < this.points.length; i += 3) {
        if (this.points[i].number > 0) {
          var _this$ctx2;

          (_this$ctx2 = this.ctx).lineTo.apply(_this$ctx2, _toConsumableArray(this.points[i].pair));

          i -= 2;
        } else {
          var _this$ctx3;

          (_this$ctx3 = this.ctx).bezierCurveTo.apply(_this$ctx3, _toConsumableArray(this.points[i].pair).concat(_toConsumableArray(this.points[i + 1].pair), _toConsumableArray(this.points[i + 2].pair)));
        }
      }

      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }
  }, {
    key: "clear",
    value: function clear() {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }, {
    key: "render",
    value: function render() {
      this.clear();
      this.drawProfile();
      this.drawPoints();
    }
  }, {
    key: "drawPoints",
    value: function drawPoints() {
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'black';

      for (var i = 0; i < this.points.length; i++) {
        if (this.points[i].number == -1) {
          var _this$ctx4, _this$ctx5;

          this.ctx.beginPath();

          (_this$ctx4 = this.ctx).moveTo.apply(_this$ctx4, _toConsumableArray(this.points[i - 1].pair));

          (_this$ctx5 = this.ctx).lineTo.apply(_this$ctx5, _toConsumableArray(this.points[i].pair));

          this.ctx.stroke();
        } else if (this.points[i].number == -2) {
          var _this$ctx6, _this$ctx7;

          this.ctx.beginPath();

          (_this$ctx6 = this.ctx).moveTo.apply(_this$ctx6, _toConsumableArray(this.points[i + 1].pair));

          (_this$ctx7 = this.ctx).lineTo.apply(_this$ctx7, _toConsumableArray(this.points[i].pair));

          this.ctx.stroke();
        }

        this.points[i].plot(this.ctx, i == this.currentPoint);
      }
    }
  }, {
    key: "onDown",
    value: function onDown(e) {
      var actual = this.canvas.getBoundingClientRect();
      this.offsetX = actual.left;
      this.offsetY = actual.top;
      e.preventDefault();
      e.stopPropagation();
      var mx = parseInt(e.clientX - this.offsetX);
      var my = parseInt(e.clientY - this.offsetY);
      this.isDragging = false;

      for (var i = 0; i < this.points.length; i++) {
        var p = this.points[i];
        var dx = p.x - mx;
        var dy = p.y - my;

        if (dx * dx + dy * dy < p.r * p.r) {
          this.isDragging = true;
          this.setPointControls(i);
          p.isDragging = true;
          break;
        }
      }

      if (!this.isDragging) {
        this.setPointControls(-1);
      }

      this.startX = mx;
      this.startY = my;
      this.render();
    }
  }, {
    key: "onUp",
    value: function onUp(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isDragging = false;

      for (var i = 0; i < this.points.length; i++) {
        this.points[i].isDragging = false;
      }
    }
  }, {
    key: "onMove",
    value: function onMove(e) {
      var mx = parseInt(e.clientX - this.offsetX);
      var my = parseInt(e.clientY - this.offsetY);

      if (this.isDragging) {
        e.preventDefault();
        e.stopPropagation();
        var dx = mx - this.startX;
        var dy = my - this.startY;

        for (var i = 0; i < this.points.length; i++) {
          var p = this.points[i];

          if (p.isDragging) {
            p.update(dx, dy);
            this.setPointControls(i);
          }
        }

        this.render();
        this.startX = mx;
        this.startY = my;
      }
    }
  }]);

  return Canvas;
}();

var BaseEditor = /*#__PURE__*/function (_React$Component) {
  _inherits(BaseEditor, _React$Component);

  var _super3 = _createSuper(BaseEditor);

  function BaseEditor(props) {
    var _this7;

    _classCallCheck(this, BaseEditor);

    _this7 = _super3.call(this, props);
    _this7.state = {
      length: props.length,
      width: props.width,
      thickness: props.thickness,
      continuity: props.continuity
    };
    return _this7;
  }

  _createClass(BaseEditor, [{
    key: "render",
    value: function render() {
      return /*#__PURE__*/React.createElement("canvas", {
        "class": "controls"
      });
    }
  }]);

  return BaseEditor;
}(React.Component);