'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _pluginHooks = require('./../../pluginHooks');

var _pluginHooks2 = _interopRequireDefault(_pluginHooks);

var _object = require('./../../helpers/object');

var _array = require('./../../helpers/array');

var _src = require('./../../3rdparty/walkontable/src');

var _constants = require('./../../i18n/constants');

var C = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CustomBorders() {}
/** *
 * Current instance (table where borders should be placed)
 */
var instance;

/**
 * This plugin enables an option to apply custom borders through the context menu (configurable with context menu key `borders`).
 *
 * To initialize Handsontable with predefined custom borders, provide cell coordinates and border styles in a form of an array.
 *
 * See [Custom Borders](http://docs.handsontable.com/demo-custom-borders.html) demo for more examples.
 *
 * @example
 * ```js
 * ...
 * customBorders: [
 *   {range: {
   *     from: {row: 1, col: 1},
   *     to: {row: 3, col: 4}},
   *     left: {},
   *     right: {},
   *     top: {},
   *     bottom: {}
   *   }
 * ],
 * ...
 *
 * // or
 * ...
 * customBorders: [
 *   {row: 2, col: 2, left: {width: 2, color: 'red'},
 *     right: {width: 1, color: 'green'}, top: '', bottom: ''}
 * ],
 * ...
 * ```
 * @private
 * @class CustomBorders
 * @plugin CustomBorders
 */

/** *
 * Check if plugin should be enabled.
 */
var checkEnable = function checkEnable(customBorders) {
  if (typeof customBorders === 'boolean') {
    if (customBorders === true) {
      return true;
    }
  }
  if ((typeof customBorders === 'undefined' ? 'undefined' : _typeof(customBorders)) === 'object') {
    if (customBorders.length > 0) {
      return true;
    }
  }

  return false;
};

/** *
 * Initialize plugin.
 */
var init = function init() {
  if (checkEnable(this.getSettings().customBorders)) {
    if (!this.customBorders) {
      instance = this;
      this.customBorders = new CustomBorders();
    }
  }
};

/** *
 * Get index of border from the settings.
 *
 * @param {String} className
 * @returns {Number}
 */
var getSettingIndex = function getSettingIndex(className) {
  var index = -1;

  (0, _array.arrayEach)(instance.selection.highlight.borders, function (selection, i) {
    if (selection.settings.className == className) {
      index = i;

      return false;
    }
  });

  return index;
};

/** *
 * Insert WalkontableSelection instance into Walkontable settings.
 *
 * @param border
 */
var insertBorderIntoSettings = function insertBorderIntoSettings(border) {
  var coordinates = {
    row: border.row,
    col: border.col
  };
  var selection = new _src.Selection(border, new _src.CellRange(coordinates, coordinates, coordinates));
  var index = getSettingIndex(border.className);

  if (index >= 0) {
    instance.selection.highlight.borders[index] = selection;
  } else {
    instance.selection.highlight.borders.push(selection);
  }
};

/** *
 * Prepare borders from setting (single cell).
 *
 * @param {Number} row Visual row index.
 * @param {Number} col Visual column index.
 * @param borderObj
 */
var prepareBorderFromCustomAdded = function prepareBorderFromCustomAdded(row, col, borderObj) {
  var border = createEmptyBorders(row, col);
  border = extendDefaultBorder(border, borderObj);
  this.setCellMeta(row, col, 'borders', border);

  insertBorderIntoSettings(border);
};

/** *
 * Prepare borders from setting (object).
 *
 * @param {Object} rowObj
 */
var prepareBorderFromCustomAddedRange = function prepareBorderFromCustomAddedRange(rowObj) {
  var range = rowObj.range;

  for (var row = range.from.row; row <= range.to.row; row++) {
    for (var col = range.from.col; col <= range.to.col; col++) {
      var border = createEmptyBorders(row, col);
      var add = 0;

      if (row == range.from.row) {
        add++;

        if ((0, _object.hasOwnProperty)(rowObj, 'top')) {
          border.top = rowObj.top;
        }
      }

      if (row == range.to.row) {
        add++;

        if ((0, _object.hasOwnProperty)(rowObj, 'bottom')) {
          border.bottom = rowObj.bottom;
        }
      }

      if (col == range.from.col) {
        add++;

        if ((0, _object.hasOwnProperty)(rowObj, 'left')) {
          border.left = rowObj.left;
        }
      }

      if (col == range.to.col) {
        add++;

        if ((0, _object.hasOwnProperty)(rowObj, 'right')) {
          border.right = rowObj.right;
        }
      }

      if (add > 0) {
        this.setCellMeta(row, col, 'borders', border);
        insertBorderIntoSettings(border);
      }
    }
  }
};

/** *
 * Create separated class name for borders for each cell.
 *
 * @param {Number} row Visual row index.
 * @param {Number} col Visual column index.
 * @returns {String}
 */
var createClassName = function createClassName(row, col) {
  return 'border_row' + row + 'col' + col;
};

/** *
 * Create default single border for each position (top/right/bottom/left).
 *
 * @returns {Object} `{{width: number, color: string}}`
 */
var createDefaultCustomBorder = function createDefaultCustomBorder() {
  return {
    width: 1,
    color: '#000'
  };
};

/** *
 * Create default object for empty border.
 *
 * @returns {Object} `{{hide: boolean}}`
 */
var createSingleEmptyBorder = function createSingleEmptyBorder() {
  return {
    hide: true
  };
};

/** *
 * Create default Handsontable border object.
 *
 * @returns {Object} `{{width: number, color: string, cornerVisible: boolean}}`
 */
var createDefaultHtBorder = function createDefaultHtBorder() {
  return {
    width: 1,
    color: '#000',
    cornerVisible: false
  };
};

/** *
 * Prepare empty border for each cell with all custom borders hidden.
 *
 * @param {Number} row Visual row index.
 * @param {Number} col Visual column index.
 * @returns {Object} `{{className: *, border: *, row: *, col: *, top: {hide: boolean}, right: {hide: boolean}, bottom: {hide: boolean}, left: {hide: boolean}}}`
 */
var createEmptyBorders = function createEmptyBorders(row, col) {
  return {
    className: createClassName(row, col),
    border: createDefaultHtBorder(),
    row: row,
    col: col,
    top: createSingleEmptyBorder(),
    right: createSingleEmptyBorder(),
    bottom: createSingleEmptyBorder(),
    left: createSingleEmptyBorder()
  };
};

var extendDefaultBorder = function extendDefaultBorder(defaultBorder, customBorder) {
  if ((0, _object.hasOwnProperty)(customBorder, 'border')) {
    defaultBorder.border = customBorder.border;
  }

  if ((0, _object.hasOwnProperty)(customBorder, 'top')) {
    defaultBorder.top = customBorder.top;
  }

  if ((0, _object.hasOwnProperty)(customBorder, 'right')) {
    defaultBorder.right = customBorder.right;
  }

  if ((0, _object.hasOwnProperty)(customBorder, 'bottom')) {
    defaultBorder.bottom = customBorder.bottom;
  }

  if ((0, _object.hasOwnProperty)(customBorder, 'left')) {
    defaultBorder.left = customBorder.left;
  }

  return defaultBorder;
};

/**
 * Remove borders divs from DOM.
 *
 * @param borderClassName
 */
var removeBordersFromDom = function removeBordersFromDom(borderClassName) {
  var borders = document.querySelectorAll('.' + borderClassName);

  for (var i = 0; i < borders.length; i++) {
    if (borders[i]) {
      if (borders[i].nodeName != 'TD') {
        var parent = borders[i].parentNode;

        if (parent.parentNode) {
          parent.parentNode.removeChild(parent);
        }
      }
    }
  }
};

/** *
 * Remove border (triggered from context menu).
 *
 * @param {Number} row Visual row index.
 * @param {Number} col Visual column index.
 */
var removeAllBorders = function removeAllBorders(row, col) {
  var borderClassName = createClassName(row, col);
  removeBordersFromDom(borderClassName);
  this.removeCellMeta(row, col, 'borders');
};

/** *
 * Set borders for each cell re. to border position
 *
 * @param row Visual row index.
 * @param col Visual column index.
 * @param place
 * @param remove
 */
var setBorder = function setBorder(row, col, place, remove) {

  var bordersMeta = this.getCellMeta(row, col).borders;

  if (!bordersMeta || bordersMeta.border == undefined) {
    bordersMeta = createEmptyBorders(row, col);
  }

  if (remove) {
    bordersMeta[place] = createSingleEmptyBorder();
  } else {
    bordersMeta[place] = createDefaultCustomBorder();
  }

  this.setCellMeta(row, col, 'borders', bordersMeta);

  var borderClassName = createClassName(row, col);
  removeBordersFromDom(borderClassName);
  insertBorderIntoSettings(bordersMeta);
};

/** *
 * Prepare borders based on cell and border position
 *
 * @param range
 * @param place
 * @param remove
 */
var prepareBorder = function prepareBorder(selected, place, remove) {
  var _this = this;

  (0, _array.arrayEach)(selected, function (_ref) {
    var start = _ref.start,
        end = _ref.end;

    if (start.row == end.row && start.col == end.col) {
      if (place == 'noBorders') {
        removeAllBorders.call(_this, start.row, start.col);
      } else {
        setBorder.call(_this, start.row, start.col, place, remove);
      }
    } else {
      switch (place) {
        case 'noBorders':
          for (var column = start.col; column <= end.col; column++) {
            for (var row = start.row; row <= end.row; row++) {
              removeAllBorders.call(_this, row, column);
            }
          }
          break;
        case 'top':
          for (var topCol = start.col; topCol <= end.col; topCol++) {
            setBorder.call(_this, start.row, topCol, place, remove);
          }
          break;
        case 'right':
          for (var rowRight = start.row; rowRight <= end.row; rowRight++) {
            setBorder.call(_this, rowRight, end.col, place);
          }
          break;
        case 'bottom':
          for (var bottomCol = start.col; bottomCol <= end.col; bottomCol++) {
            setBorder.call(_this, end.row, bottomCol, place);
          }
          break;
        case 'left':
          for (var rowLeft = start.row; rowLeft <= end.row; rowLeft++) {
            setBorder.call(_this, rowLeft, start.col, place);
          }
          break;
        default:
          break;
      }
    }
  });

  this.render();
};

/** *
 * Check if selection has border by className
 *
 * @param hot
 * @param direction
 */
var checkSelectionBorders = function checkSelectionBorders(hot, direction) {
  var atLeastOneHasBorder = false;

  (0, _array.arrayEach)(hot.getSelectedRange(), function (range) {
    range.forAll(function (r, c) {
      var metaBorders = hot.getCellMeta(r, c).borders;

      if (metaBorders) {
        if (direction) {
          if (!(0, _object.hasOwnProperty)(metaBorders[direction], 'hide')) {
            atLeastOneHasBorder = true;
            return false; // breaks forAll
          }
        } else {
          atLeastOneHasBorder = true;
          return false; // breaks forAll
        }
      }
    });
  });

  return atLeastOneHasBorder;
};

/** *
 * Mark label in contextMenu as selected
 *
 * @param label
 * @returns {string}
 */
var markSelected = function markSelected(label) {
  return '<span class="selected">' + String.fromCharCode(10003) + '</span>' + label; // workaround for https://github.com/handsontable/handsontable/issues/1946
};

/** *
 * Add border options to context menu
 *
 * @param defaultOptions
 */
var addBordersOptionsToContextMenu = function addBordersOptionsToContextMenu(defaultOptions) {
  if (!this.getSettings().customBorders) {
    return;
  }

  defaultOptions.items.push({
    name: '---------'
  });
  defaultOptions.items.push({
    key: 'borders',
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_BORDERS);
    },
    disabled: function disabled() {
      return this.selection.selectedHeader.corner;
    },

    submenu: {
      items: [{
        key: 'borders:top',
        name: function name() {
          var label = this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_BORDERS_TOP);

          var hasBorder = checkSelectionBorders(this, 'top');
          if (hasBorder) {
            label = markSelected(label);
          }

          return label;
        },
        callback: function callback(key, selected) {
          var hasBorder = checkSelectionBorders(this, 'top');
          prepareBorder.call(this, selected, 'top', hasBorder);
        }
      }, {
        key: 'borders:right',
        name: function name() {
          var label = this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_BORDERS_RIGHT);
          var hasBorder = checkSelectionBorders(this, 'right');
          if (hasBorder) {
            label = markSelected(label);
          }
          return label;
        },
        callback: function callback(key, selected) {
          var hasBorder = checkSelectionBorders(this, 'right');
          prepareBorder.call(this, selected, 'right', hasBorder);
        }
      }, {
        key: 'borders:bottom',
        name: function name() {
          var label = this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_BORDERS_BOTTOM);
          var hasBorder = checkSelectionBorders(this, 'bottom');
          if (hasBorder) {
            label = markSelected(label);
          }
          return label;
        },
        callback: function callback(key, selected) {
          var hasBorder = checkSelectionBorders(this, 'bottom');
          prepareBorder.call(this, selected, 'bottom', hasBorder);
        }
      }, {
        key: 'borders:left',
        name: function name() {
          var label = this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_BORDERS_LEFT);
          var hasBorder = checkSelectionBorders(this, 'left');
          if (hasBorder) {
            label = markSelected(label);
          }

          return label;
        },
        callback: function callback(key, selected) {
          var hasBorder = checkSelectionBorders(this, 'left');
          prepareBorder.call(this, selected, 'left', hasBorder);
        }
      }, {
        key: 'borders:no_borders',
        name: function name() {
          return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_REMOVE_BORDERS);
        },
        callback: function callback(key, selected) {
          prepareBorder.call(this, selected, 'noBorders');
        },
        disabled: function disabled() {
          return !checkSelectionBorders(this);
        }
      }]
    }
  });
};

_pluginHooks2.default.getSingleton().add('beforeInit', init);
_pluginHooks2.default.getSingleton().add('afterContextMenuDefaultOptions', addBordersOptionsToContextMenu);
_pluginHooks2.default.getSingleton().add('afterInit', function () {
  var customBorders = this.getSettings().customBorders;

  if (customBorders) {
    for (var i = 0; i < customBorders.length; i++) {
      if (customBorders[i].range) {
        prepareBorderFromCustomAddedRange.call(this, customBorders[i]);
      } else {
        prepareBorderFromCustomAdded.call(this, customBorders[i].row, customBorders[i].col, customBorders[i]);
      }
    }

    this.render();
    this.view.wt.draw(true);
  }
});

exports.default = CustomBorders;