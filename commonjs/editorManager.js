'use strict';

exports.__esModule = true;

var _src = require('./3rdparty/walkontable/src');

var _unicode = require('./helpers/unicode');

var _event = require('./helpers/dom/event');

var _editors = require('./editors');

var _eventManager = require('./eventManager');

var _eventManager2 = _interopRequireDefault(_eventManager);

var _baseEditor = require('./editors/_baseEditor');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function EditorManager(instance, priv, selection) {
  var _this = this,
      destroyed = false,
      lock = false,
      eventManager,
      activeEditor;

  eventManager = new _eventManager2.default(instance);

  function moveSelectionAfterEnter(shiftKey) {
    selection.setSelectedHeaders(false, false, false);
    var enterMoves = typeof priv.settings.enterMoves === 'function' ? priv.settings.enterMoves(event) : priv.settings.enterMoves;

    if (shiftKey) {
      // move selection up
      selection.transformStart(-enterMoves.row, -enterMoves.col);
    } else {
      // move selection down (add a new row if needed)
      selection.transformStart(enterMoves.row, enterMoves.col, true);
    }
  }

  function moveSelectionUp(shiftKey) {
    if (shiftKey) {
      if (selection.selectedHeader.cols) {
        selection.setSelectedHeaders(selection.selectedHeader.rows, false, false);
      }
      selection.transformEnd(-1, 0);
    } else {
      selection.setSelectedHeaders(false, false, false);
      selection.transformStart(-1, 0);
    }
  }

  function moveSelectionDown(shiftKey) {
    if (shiftKey) {
      // expanding selection down with shift
      selection.transformEnd(1, 0);
    } else {
      selection.setSelectedHeaders(false, false, false);
      selection.transformStart(1, 0);
    }
  }

  function moveSelectionRight(shiftKey) {
    if (shiftKey) {
      selection.transformEnd(0, 1);
    } else {
      selection.setSelectedHeaders(false, false, false);
      selection.transformStart(0, 1);
    }
  }

  function moveSelectionLeft(shiftKey) {
    if (shiftKey) {
      if (selection.selectedHeader.rows) {
        selection.setSelectedHeaders(false, selection.selectedHeader.cols, false);
      }
      selection.transformEnd(0, -1);
    } else {
      selection.setSelectedHeaders(false, false, false);
      selection.transformStart(0, -1);
    }
  }

  function onKeyDown(event) {
    var ctrlDown, rangeModifier;

    if (!instance.isListening()) {
      return;
    }
    instance.runHooks('beforeKeyDown', event);

    if (destroyed) {
      return;
    }
    if ((0, _event.isImmediatePropagationStopped)(event)) {
      return;
    }
    priv.lastKeyCode = event.keyCode;

    if (!selection.isSelected()) {
      return;
    }
    // catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)
    ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey;

    if (activeEditor && !activeEditor.isWaiting()) {
      if (!(0, _unicode.isMetaKey)(event.keyCode) && !(0, _unicode.isCtrlMetaKey)(event.keyCode) && !ctrlDown && !_this.isEditorOpened()) {
        _this.openEditor('', event);

        return;
      }
    }
    rangeModifier = event.shiftKey ? selection.setRangeEnd : selection.setRangeStart;

    switch (event.keyCode) {
      case _unicode.KEY_CODES.A:
        if (!_this.isEditorOpened() && ctrlDown) {
          selection.selectAll();

          event.preventDefault();
          (0, _event.stopPropagation)(event);
        }
        break;

      case _unicode.KEY_CODES.ARROW_UP:
        if (_this.isEditorOpened() && !activeEditor.isWaiting()) {
          _this.closeEditorAndSaveChanges(ctrlDown);
        }
        moveSelectionUp(event.shiftKey);

        event.preventDefault();
        (0, _event.stopPropagation)(event);
        break;

      case _unicode.KEY_CODES.ARROW_DOWN:
        if (_this.isEditorOpened() && !activeEditor.isWaiting()) {
          _this.closeEditorAndSaveChanges(ctrlDown);
        }

        moveSelectionDown(event.shiftKey);

        event.preventDefault();
        (0, _event.stopPropagation)(event);
        break;

      case _unicode.KEY_CODES.ARROW_RIGHT:
        if (_this.isEditorOpened() && !activeEditor.isWaiting()) {
          _this.closeEditorAndSaveChanges(ctrlDown);
        }

        moveSelectionRight(event.shiftKey);

        event.preventDefault();
        (0, _event.stopPropagation)(event);
        break;

      case _unicode.KEY_CODES.ARROW_LEFT:
        if (_this.isEditorOpened() && !activeEditor.isWaiting()) {
          _this.closeEditorAndSaveChanges(ctrlDown);
        }

        moveSelectionLeft(event.shiftKey);

        event.preventDefault();
        (0, _event.stopPropagation)(event);
        break;

      case _unicode.KEY_CODES.TAB:
        selection.setSelectedHeaders(false, false, false);
        var tabMoves = typeof priv.settings.tabMoves === 'function' ? priv.settings.tabMoves(event) : priv.settings.tabMoves;

        if (event.shiftKey) {
          // move selection left
          selection.transformStart(-tabMoves.row, -tabMoves.col);
        } else {
          // move selection right (add a new column if needed)
          selection.transformStart(tabMoves.row, tabMoves.col, true);
        }
        event.preventDefault();
        (0, _event.stopPropagation)(event);
        break;

      case _unicode.KEY_CODES.BACKSPACE:
      case _unicode.KEY_CODES.DELETE:
        instance.emptySelectedCells();
        _this.prepareEditor();
        event.preventDefault();
        break;

      case _unicode.KEY_CODES.F2:
        /* F2 */
        _this.openEditor(null, event);

        if (activeEditor) {
          activeEditor.enableFullEditMode();
        }
        event.preventDefault(); // prevent Opera from opening 'Go to Page dialog'
        break;

      case _unicode.KEY_CODES.ENTER:
        /* return/enter */
        if (_this.isEditorOpened()) {

          if (activeEditor && activeEditor.state !== _baseEditor.EditorState.WAITING) {
            _this.closeEditorAndSaveChanges(ctrlDown);
          }
          moveSelectionAfterEnter(event.shiftKey);
        } else if (instance.getSettings().enterBeginsEditing) {
          _this.openEditor(null, event);

          if (activeEditor) {
            activeEditor.enableFullEditMode();
          }
        } else {
          moveSelectionAfterEnter(event.shiftKey);
        }
        event.preventDefault(); // don't add newline to field
        (0, _event.stopImmediatePropagation)(event); // required by HandsontableEditor
        break;

      case _unicode.KEY_CODES.ESCAPE:
        if (_this.isEditorOpened()) {
          _this.closeEditorAndRestoreOriginalValue(ctrlDown);
        }
        event.preventDefault();
        break;

      case _unicode.KEY_CODES.HOME:
        selection.setSelectedHeaders(false, false, false);
        if (event.ctrlKey || event.metaKey) {
          rangeModifier.call(selection, new _src.CellCoords(0, selection.selectedRange.current().from.col));
        } else {
          rangeModifier.call(selection, new _src.CellCoords(selection.selectedRange.current().from.row, 0));
        }
        event.preventDefault(); // don't scroll the window
        (0, _event.stopPropagation)(event);
        break;

      case _unicode.KEY_CODES.END:
        selection.setSelectedHeaders(false, false, false);
        if (event.ctrlKey || event.metaKey) {
          rangeModifier.call(selection, new _src.CellCoords(instance.countRows() - 1, selection.selectedRange.current().from.col));
        } else {
          rangeModifier.call(selection, new _src.CellCoords(selection.selectedRange.current().from.row, instance.countCols() - 1));
        }
        event.preventDefault(); // don't scroll the window
        (0, _event.stopPropagation)(event);
        break;

      case _unicode.KEY_CODES.PAGE_UP:
        selection.setSelectedHeaders(false, false, false);
        selection.transformStart(-instance.countVisibleRows(), 0);
        event.preventDefault(); // don't page up the window
        (0, _event.stopPropagation)(event);
        break;

      case _unicode.KEY_CODES.PAGE_DOWN:
        selection.setSelectedHeaders(false, false, false);
        selection.transformStart(instance.countVisibleRows(), 0);
        event.preventDefault(); // don't page down the window
        (0, _event.stopPropagation)(event);
        break;
      default:
        break;
    }
  }

  function init() {
    instance.addHook('afterDocumentKeyDown', onKeyDown);

    eventManager.addEventListener(document.documentElement, 'keydown', function (event) {
      if (!destroyed) {
        instance.runHooks('afterDocumentKeyDown', event);
      }
    });

    function onDblClick(event, coords, elem) {
      // may be TD or TH
      if (elem.nodeName === 'TD') {
        _this.openEditor(null, event);

        if (activeEditor) {
          activeEditor.enableFullEditMode();
        }
      }
    }
    instance.view.wt.update('onCellDblClick', onDblClick);
  }

  /**
  * Lock the editor from being prepared and closed. Locking the editor prevents its closing and
  * reinitialized after selecting the new cell. This feature is necessary for a mobile editor.
  *
  * @function lockEditor
  * @memberof! Handsontable.EditorManager#
   */
  this.lockEditor = function () {
    lock = true;
  };

  /**
  * Unlock the editor from being prepared and closed. This method restores the original behavior of
  * the editors where for every new selection its instances are closed.
  *
  * @function unlockEditor
  * @memberof! Handsontable.EditorManager#
   */
  this.unlockEditor = function () {
    lock = false;
  };

  /**
   * Destroy current editor, if exists.
   *
   * @function destroyEditor
   * @memberof! Handsontable.EditorManager#
   * @param {Boolean} revertOriginal
   */
  this.destroyEditor = function (revertOriginal) {
    if (!lock) {
      this.closeEditor(revertOriginal);
    }
  };

  /**
   * Get active editor.
   *
   * @function getActiveEditor
   * @memberof! Handsontable.EditorManager#
   * @returns {*}
   */
  this.getActiveEditor = function () {
    return activeEditor;
  };

  /**
   * Prepare text input to be displayed at given grid cell.
   *
   * @function prepareEditor
   * @memberof! Handsontable.EditorManager#
   */
  this.prepareEditor = function () {
    if (lock) {
      return;
    }

    var row, col, prop, td, originalValue, cellProperties, editorClass;

    if (activeEditor && activeEditor.isWaiting()) {
      this.closeEditor(false, false, function (dataSaved) {
        if (dataSaved) {
          _this.prepareEditor();
        }
      });

      return;
    }
    row = instance.selection.selectedRange.current().highlight.row;
    col = instance.selection.selectedRange.current().highlight.col;
    prop = instance.colToProp(col);
    td = instance.getCell(row, col);

    originalValue = instance.getSourceDataAtCell(instance.runHooks('modifyRow', row), col);
    cellProperties = instance.getCellMeta(row, col);
    editorClass = instance.getCellEditor(cellProperties);

    if (editorClass) {
      activeEditor = (0, _editors.getEditorInstance)(editorClass, instance);
      activeEditor.prepare(row, col, prop, td, originalValue, cellProperties);
    } else {
      activeEditor = void 0;
    }
  };

  /**
   * Check is editor is opened/showed.
   *
   * @function isEditorOpened
   * @memberof! Handsontable.EditorManager#
   * @returns {Boolean}
   */
  this.isEditorOpened = function () {
    return activeEditor && activeEditor.isOpened();
  };

  /**
   * Open editor with initial value.
   *
   * @function openEditor
   * @memberof! Handsontable.EditorManager#
   * @param {null|String} newInitialValue new value from which editor will start if handled property it's not the `null`.
   * @param {DOMEvent} event
   */
  this.openEditor = function (newInitialValue, event) {
    if (activeEditor && !activeEditor.cellProperties.readOnly) {
      activeEditor.beginEditing(newInitialValue, event);
    } else if (activeEditor && activeEditor.cellProperties.readOnly) {

      // move the selection after opening the editor with ENTER key
      if (event && event.keyCode === _unicode.KEY_CODES.ENTER) {
        moveSelectionAfterEnter();
      }
    }
  };

  /**
   * Close editor, finish editing cell.
   *
   * @function closeEditor
   * @memberof! Handsontable.EditorManager#
   * @param {Boolean} restoreOriginalValue
   * @param {Boolean} [ctrlDown]
   * @param {Function} [callback]
   */
  this.closeEditor = function (restoreOriginalValue, ctrlDown, callback) {
    if (activeEditor) {
      activeEditor.finishEditing(restoreOriginalValue, ctrlDown, callback);
    } else if (callback) {
      callback(false);
    }
  };

  /**
   * Close editor and save changes.
   *
   * @function closeEditorAndSaveChanges
   * @memberof! Handsontable.EditorManager#
   * @param {Boolean} ctrlDown
   */
  this.closeEditorAndSaveChanges = function (ctrlDown) {
    return this.closeEditor(false, ctrlDown);
  };

  /**
   * Close editor and restore original value.
   *
   * @function closeEditorAndRestoreOriginalValue
   * @memberof! Handsontable.EditorManager#
   * @param {Boolean} ctrlDown
   */
  this.closeEditorAndRestoreOriginalValue = function (ctrlDown) {
    return this.closeEditor(true, ctrlDown);
  };

  /**
   * Destroy the instance.
   */
  this.destroy = function () {
    destroyed = true;
  };

  init();
}

var instances = new WeakMap();

EditorManager.getInstance = function (hotInstance, hotSettings, selection, datamap) {
  var editorManager = instances.get(hotInstance);

  if (!editorManager) {
    editorManager = new EditorManager(hotInstance, hotSettings, selection, datamap);
    instances.set(hotInstance, editorManager);
  }

  return editorManager;
};

exports.default = EditorManager;