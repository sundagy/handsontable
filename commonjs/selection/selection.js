'use strict';

exports.__esModule = true;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['Unsupported format of the selection ranges was passed. To select cells pass \n        the coordinates as an array of arrays ([[rowStart, columnStart/columnPropStart, rowEnd, columnEnd/columnPropEnd]]) \n        or as an array of CellRange objects.'], ['Unsupported format of the selection ranges was passed. To select cells pass\\x20\n        the coordinates as an array of arrays ([[rowStart, columnStart/columnPropStart, rowEnd, columnEnd/columnPropEnd]])\\x20\n        or as an array of CellRange objects.']);

var _highlight = require('./highlight/highlight');

var _highlight2 = _interopRequireDefault(_highlight);

var _range = require('./range');

var _range2 = _interopRequireDefault(_range);

var _src = require('./../3rdparty/walkontable/src');

var _keyStateObserver = require('./../utils/keyStateObserver');

var _object = require('./../helpers/object');

var _mixed = require('./../helpers/mixed');

var _element = require('./../helpers/dom/element');

var _array = require('./../helpers/array');

var _localHooks = require('./../mixins/localHooks');

var _localHooks2 = _interopRequireDefault(_localHooks);

var _transformation = require('./transformation');

var _transformation2 = _interopRequireDefault(_transformation);

var _utils = require('./utils');

var _templateLiteralTag = require('./../helpers/templateLiteralTag');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class Selection
 * @util
 */
var Selection = function () {
  function Selection(settings, tableProps) {
    var _this = this;

    _classCallCheck(this, Selection);

    /**
     * Handsontable settings instance.
     *
     * @type {GridSettings}
     */
    this.settings = settings;
    /**
     * An additional object with dynamically defined properties which describes table state.
     *
     * @type {Object}
     */
    this.tableProps = tableProps;
    /**
     * The flag which determines if the selection is in progress.
     *
     * @type {Boolean}
     */
    this.inProgress = false;
    /**
     * An object with flags which indicates what header is currently selected.
     *
     * @type {Object}
     */
    this.selectedHeader = {
      cols: false,
      rows: false,
      corner: false
    };
    /**
     * Selection data layer.
     *
     * @type {SelectionRange}
     */
    this.selectedRange = new _range2.default();
    /**
     * Visualization layer.
     *
     * @type {Highlight}
     */
    this.highlight = new _highlight2.default({
      headerClassName: settings.currentHeaderClassName,
      rowClassName: settings.currentRowClassName,
      columnClassName: settings.currentColClassName,
      disableHighlight: this.settings.disableVisualSelection,
      cellCornerVisible: function cellCornerVisible() {
        return _this.isCellCornerVisible.apply(_this, arguments);
      },
      areaCornerVisible: function areaCornerVisible() {
        return _this.isAreaCornerVisible.apply(_this, arguments);
      }
    });
    /**
     * The module for modifying coordinates.
     *
     * @type {Transformation}
     */
    this.transformation = new _transformation2.default(this.selectedRange, {
      countRows: function countRows() {
        return _this.tableProps.countRows();
      },
      countCols: function countCols() {
        return _this.tableProps.countCols();
      },
      fixedRowsBottom: function fixedRowsBottom() {
        return settings.fixedRowsBottom;
      },
      minSpareRows: function minSpareRows() {
        return settings.minSpareRows;
      },
      minSpareCols: function minSpareCols() {
        return settings.minSpareCols;
      },
      autoWrapRow: function autoWrapRow() {
        return settings.autoWrapRow;
      },
      autoWrapCol: function autoWrapCol() {
        return settings.autoWrapCol;
      }
    });

    this.transformation.addLocalHook('beforeTransformStart', function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _this.runLocalHooks.apply(_this, ['beforeModifyTransformStart'].concat(args));
    });
    this.transformation.addLocalHook('afterTransformStart', function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _this.runLocalHooks.apply(_this, ['afterModifyTransformStart'].concat(args));
    });
    this.transformation.addLocalHook('beforeTransformEnd', function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return _this.runLocalHooks.apply(_this, ['beforeModifyTransformEnd'].concat(args));
    });
    this.transformation.addLocalHook('afterTransformEnd', function () {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return _this.runLocalHooks.apply(_this, ['afterModifyTransformEnd'].concat(args));
    });
    this.transformation.addLocalHook('insertRowRequire', function () {
      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return _this.runLocalHooks.apply(_this, ['insertRowRequire'].concat(args));
    });
    this.transformation.addLocalHook('insertColRequire', function () {
      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return _this.runLocalHooks.apply(_this, ['insertColRequire'].concat(args));
    });
  }

  /**
   * Get data layer for current selection.
   *
   * @return {SelectionRange}
   */


  _createClass(Selection, [{
    key: 'getSelectedRange',
    value: function getSelectedRange() {
      return this.selectedRange;
    }

    /**
     * Set indication of what table header is currently selected.
     *
     * @param {Boolean} [rows=false] Indication for row header.
     * @param {Boolean} [cols=false] Indication for column header.
     * @param {Boolean} [corner=false] Indication for corner.
     */

  }, {
    key: 'setSelectedHeaders',
    value: function setSelectedHeaders() {
      var rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var cols = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var corner = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      this.selectedHeader.rows = rows;
      this.selectedHeader.cols = cols;
      this.selectedHeader.corner = corner;
    }

    /**
     * Indicate that selection process began. It sets internaly `.inProgress` property to `true`.
     */

  }, {
    key: 'begin',
    value: function begin() {
      this.inProgress = true;
    }

    /**
     * Indicate that selection process finished. It sets internaly `.inProgress` property to `false`.
     */

  }, {
    key: 'finish',
    value: function finish() {
      this.runLocalHooks('afterSelectionFinished', Array.from(this.selectedRange));
      this.inProgress = false;
    }

    /**
     * Check if the process of selecting the cell/cells is in progress.
     *
     * @returns {Boolean}
     */

  }, {
    key: 'isInProgress',
    value: function isInProgress() {
      return this.inProgress;
    }

    /**
     * Starts selection range on given coordinate object.
     *
     * @param {CellCoords} coords Visual coords.
     * @param {Boolean} [multipleSelection] If `true`, selection will be worked in 'multiple' mode. This option works
     *                                      only when 'selectionMode' is set as 'multiple'. If the argument is not defined
     *                                      the default trigger will be used (isPressedCtrlKey() helper).
     */

  }, {
    key: 'setRangeStart',
    value: function setRangeStart(coords, multipleSelection) {
      var isMultipleMode = this.settings.selectionMode === 'multiple';
      var isMultipleSelection = (0, _mixed.isUndefined)(multipleSelection) ? (0, _keyStateObserver.isPressedCtrlKey)() : multipleSelection;

      this.runLocalHooks('beforeSetRangeStart', coords);

      if (!isMultipleMode || isMultipleMode && !isMultipleSelection && (0, _mixed.isUndefined)(multipleSelection)) {
        this.selectedRange.clear();
      }

      this.selectedRange.add(coords);
      this.setRangeEnd(coords);
    }

    /**
     * Starts selection range on given coordinate object.
     *
     * @param {CellCoords} coords Visual coords.
     * @param {Boolean} [multipleSelection] If `true`, selection will be worked in 'multiple' mode. This option works
     *                                      only when 'selectionMode' is set as 'multiple'. If the argument is not defined
     *                                      the default trigger will be used (isPressedCtrlKey() helper).
     */

  }, {
    key: 'setRangeStartOnly',
    value: function setRangeStartOnly(coords, multipleSelection) {
      var isMultipleMode = this.settings.selectionMode === 'multiple';
      var isMultipleSelection = (0, _mixed.isUndefined)(multipleSelection) ? (0, _keyStateObserver.isPressedCtrlKey)() : multipleSelection;

      this.runLocalHooks('beforeSetRangeStartOnly', coords);

      if (!isMultipleMode || isMultipleMode && !isMultipleSelection && (0, _mixed.isUndefined)(multipleSelection)) {
        this.selectedRange.clear();
      }

      this.selectedRange.add(coords);
    }

    /**
     * Ends selection range on given coordinate object.
     *
     * @param {CellCoords} coords Visual coords.
     */

  }, {
    key: 'setRangeEnd',
    value: function setRangeEnd(coords) {
      if (this.selectedRange.isEmpty()) {
        return;
      }

      this.runLocalHooks('beforeSetRangeEnd', coords);
      this.begin();

      var cellRange = this.selectedRange.current();

      if (this.settings.selectionMode !== 'single') {
        cellRange.setTo(new _src.CellCoords(coords.row, coords.col));
      }

      // Set up current selection.
      this.highlight.getCell().clear();

      if (this.highlight.isEnabledFor(_highlight.CELL_TYPE)) {
        this.highlight.getCell().add(this.selectedRange.current().highlight);
      }

      var highlightLayerLevel = this.selectedRange.size() - 1;

      // If the next layer level is lower than previous then clear all area and header highlights. This is the
      // indication that the new selection is performing.
      if (highlightLayerLevel < this.highlight.layerLevel) {
        (0, _array.arrayEach)(this.highlight.getAreas(), function (area) {
          area.clear();
        });
        (0, _array.arrayEach)(this.highlight.getHeaders(), function (header) {
          header.clear();
        });
      }

      this.highlight.useLayerLevel(highlightLayerLevel);

      var areaHighlight = this.highlight.createOrGetArea();
      var headerHighlight = this.highlight.createOrGetHeader();

      areaHighlight.clear();
      headerHighlight.clear();

      if (this.highlight.isEnabledFor(_highlight.AREA_TYPE)) {
        if (this.isMultiple() || highlightLayerLevel >= 1) {
          areaHighlight.add(cellRange.from).add(cellRange.to);

          if (highlightLayerLevel === 1) {
            // For single cell selection in the same layer, we do not create area selection to prevent blue background.
            // When non-consecutive selection is performed we have to add that missing area selection to the previous layer
            // based on previous coordinates. It only occurs when the previous selection wasn't select multiple cells.
            this.highlight.useLayerLevel(highlightLayerLevel - 1).createOrGetArea().add(this.selectedRange.previous().from);

            this.highlight.useLayerLevel(highlightLayerLevel);
          }
        }
      }

      if (this.highlight.isEnabledFor(_highlight.HEADER_TYPE)) {
        if (this.settings.selectionMode === 'single') {
          headerHighlight.add(cellRange.highlight);
        } else {
          headerHighlight.add(cellRange.from).add(cellRange.to);
        }
      }

      this.runLocalHooks('afterSetRangeEnd', coords);
    }

    /**
     * Returns information if we have a multiselection. This method check multiselection only on the latest layer of
     * the selection.
     *
     * @returns {Boolean}
     */

  }, {
    key: 'isMultiple',
    value: function isMultiple() {
      var isMultipleListener = (0, _object.createObjectPropListener)(!this.selectedRange.current().isSingle());

      this.runLocalHooks('afterIsMultipleSelection', isMultipleListener);

      return isMultipleListener.value;
    }

    /**
     * Selects cell relative to the current cell (if possible).
     *
     * @param {Number} rowDelta Rows number to move, value can be passed as negative number.
     * @param {Number} colDelta Columns number to move, value can be passed as negative number.
     * @param {Boolean} force If `true` the new rows/columns will be created if necessary. Otherwise, row/column will
     *                        be created according to `minSpareRows/minSpareCols` settings of Handsontable.
     */

  }, {
    key: 'transformStart',
    value: function transformStart(rowDelta, colDelta, force) {
      var newCoords = this.transformation.transformStart(rowDelta, colDelta, force);

      this.setRangeStart(newCoords);
    }

    /**
     * Sets selection end cell relative to the current selection end cell (if possible).
     *
     * @param {Number} rowDelta Rows number to move, value can be passed as negative number.
     * @param {Number} colDelta Columns number to move, value can be passed as negative number.
     */

  }, {
    key: 'transformEnd',
    value: function transformEnd(rowDelta, colDelta) {
      var newCoords = this.transformation.transformEnd(rowDelta, colDelta);

      this.setRangeEnd(newCoords);
    }

    /**
     * Returns `true` if currently there is a selection on the screen, `false` otherwise.
     *
     * @returns {Boolean}
     */

  }, {
    key: 'isSelected',
    value: function isSelected() {
      return !this.selectedRange.isEmpty();
    }

    /**
     * Returns `true` if coords is within selection coords. This method iterates through all selection layers to check if
     * the coords object is within selection range.
     *
     * @param {CellCoords} coords The CellCoords instance with defined visual coordinates.
     * @returns {Boolean}
     */

  }, {
    key: 'inInSelection',
    value: function inInSelection(coords) {
      return this.selectedRange.includes(coords);
    }

    /**
     * Returns `true` if the cell corner should be visible.
     *
     * @private
     * @param {Number} layerLevel The layer level.
     * @return {Boolean} `true` if the corner element has to be visible, `false` otherwise.
     */

  }, {
    key: 'isCellCornerVisible',
    value: function isCellCornerVisible(layerLevel) {
      return this.settings.fillHandle && !this.tableProps.isEditorOpened() && !this.isMultiple();
    }

    /**
     * Returns `true` if the area corner should be visible.
     *
     * @param {Number} layerLevel The layer level.
     * @return {Boolean} `true` if the corner element has to be visible, `false` otherwise.
     */

  }, {
    key: 'isAreaCornerVisible',
    value: function isAreaCornerVisible(layerLevel) {
      if (layerLevel !== this.selectedRange.ranges.length - 1) {
        return false;
      }

      return this.settings.fillHandle && !this.tableProps.isEditorOpened() && this.isMultiple();
    }

    /**
     * Clear the selection by resetting the collected ranges and highlights.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.selectedRange.clear();
      this.highlight.clear();
    }

    /**
     * Deselects all selected cells.
     */

  }, {
    key: 'deselect',
    value: function deselect() {
      if (!this.isSelected()) {
        return;
      }

      this.inProgress = false;
      this.clear();
      this.runLocalHooks('afterDeselect');
    }

    /**
     * Select all cells.
     */

  }, {
    key: 'selectAll',
    value: function selectAll() {
      if (this.settings.selectionMode === 'single') {
        return;
      }

      this.clear();
      this.setSelectedHeaders(true, true, true);
      this.setRangeStart(new _src.CellCoords(0, 0));
      this.setRangeEnd(new _src.CellCoords(this.tableProps.countRows() - 1, this.tableProps.countCols() - 1));
    }

    /**
     * Make multiple, non-contiguous selection specified by `row` and `column` values or a range of cells
     * finishing at `endRow`, `endColumn`. The method supports two input formats, first as an array of arrays such
     * as `[[rowStart, columnStart, rowEnd, columnEnd]]` and second format as an array of CellRange objects.
     * If the passed ranges have another format the exception will be thrown.
     *
     * @param {Array[]|CellRange[]} selectionRanges The coordinates which define what the cells should be selected.
     * @return {Boolean} Returns `true` if selection was successful, `false` otherwise.
     */

  }, {
    key: 'selectCells',
    value: function selectCells(selectionRanges) {
      var _this2 = this;

      var selectionType = (0, _utils.detectSelectionType)(selectionRanges);

      if (selectionType === _utils.SELECTION_TYPE_EMPTY) {
        return false;
      } else if (selectionType === _utils.SELECTION_TYPE_UNRECOGNIZED) {
        throw new Error((0, _templateLiteralTag.toSingleLine)(_templateObject));
      }

      var selectionSchemaNormalizer = (0, _utils.normalizeSelectionFactory)(selectionType, {
        propToCol: function propToCol(prop) {
          return _this2.tableProps.propToCol(prop);
        },
        keepDirection: true
      });
      var countRows = this.tableProps.countRows();
      var countCols = this.tableProps.countCols();

      // Check if every layer of the coordinates are valid.
      var isValid = !selectionRanges.some(function (selection) {
        var _selectionSchemaNorma = selectionSchemaNormalizer(selection),
            _selectionSchemaNorma2 = _slicedToArray(_selectionSchemaNorma, 4),
            rowStart = _selectionSchemaNorma2[0],
            columnStart = _selectionSchemaNorma2[1],
            rowEnd = _selectionSchemaNorma2[2],
            columnEnd = _selectionSchemaNorma2[3];

        var isValid = (0, _utils.isValidCoord)(rowStart, countRows) && (0, _utils.isValidCoord)(columnStart, countCols) && (0, _utils.isValidCoord)(rowEnd, countRows) && (0, _utils.isValidCoord)(columnEnd, countCols);

        return !isValid;
      });

      if (isValid) {
        this.clear();

        (0, _array.arrayEach)(selectionRanges, function (selection) {
          var _selectionSchemaNorma3 = selectionSchemaNormalizer(selection),
              _selectionSchemaNorma4 = _slicedToArray(_selectionSchemaNorma3, 4),
              rowStart = _selectionSchemaNorma4[0],
              columnStart = _selectionSchemaNorma4[1],
              rowEnd = _selectionSchemaNorma4[2],
              columnEnd = _selectionSchemaNorma4[3];

          _this2.setRangeStartOnly(new _src.CellCoords(rowStart, columnStart), false);
          _this2.setRangeEnd(new _src.CellCoords(rowEnd, columnEnd));
          _this2.finish();
        });
      }

      return isValid;
    }

    /**
     * Select column specified by `startColumn` visual index or column property or a range of columns finishing at `endColumn`.
     *
     * @param {Number|String} startColumn Visual column index or column property from which the selection starts.
     * @param {Number|String} [endColumn] Visual column index or column property from to the selection finishes.
     * @returns {Boolean} Returns `true` if selection was successful, `false` otherwise.
     */

  }, {
    key: 'selectColumns',
    value: function selectColumns(startColumn) {
      var endColumn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : startColumn;

      startColumn = typeof startColumn === 'string' ? this.tableProps.propToCol(startColumn) : startColumn;
      endColumn = typeof endColumn === 'string' ? this.tableProps.propToCol(endColumn) : endColumn;

      var countCols = this.tableProps.countCols();
      var isValid = (0, _utils.isValidCoord)(startColumn, countCols) && (0, _utils.isValidCoord)(endColumn, countCols);

      if (isValid) {
        this.clear();
        this.setSelectedHeaders(false, true, false);
        this.setRangeStartOnly(new _src.CellCoords(0, startColumn));
        this.setRangeEnd(new _src.CellCoords(this.tableProps.countRows() - 1, endColumn));
        this.finish();
      }

      return isValid;
    }

    /**
     * Select row specified by `startRow` visual index or a range of rows finishing at `endRow`.
     *
     * @param {Number} startRow Visual row index from which the selection starts.
     * @param {Number} [endRow] Visual row index from to the selection finishes.
     * @returns {Boolean} Returns `true` if selection was successful, `false` otherwise.
     */

  }, {
    key: 'selectRows',
    value: function selectRows(startRow) {
      var endRow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : startRow;

      var countRows = this.tableProps.countRows();
      var isValid = (0, _utils.isValidCoord)(startRow, countRows) && (0, _utils.isValidCoord)(endRow, countRows);

      if (isValid) {
        this.clear();
        this.setSelectedHeaders(true, false, false);
        this.setRangeStartOnly(new _src.CellCoords(startRow, 0));
        this.setRangeEnd(new _src.CellCoords(endRow, this.tableProps.countCols() - 1));
        this.finish();
      }

      return isValid;
    }
  }]);

  return Selection;
}();

(0, _object.mixin)(Selection, _localHooks2.default);

exports.default = Selection;