"use strict";

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

var Canvas = function Canvas(projection) {
  _classCallCheck(this, Canvas);

  _defineProperty(this, "isDragging", false);

  _defineProperty(this, "currentPoint", void 0);
};

var BaseEditor = /*#__PURE__*/function (_React$Component) {
  _inherits(BaseEditor, _React$Component);

  var _super3 = _createSuper(BaseEditor);

  function BaseEditor(props) {
    var _this3;

    _classCallCheck(this, BaseEditor);

    _this3 = _super3.call(this, props);
    _this3.state = {
      length: props.length,
      width: props.width,
      thickness: props.thickness,
      continuity: props.continuity
    };
    return _this3;
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