'use strict';

exports.__esModule = true;

var _unicode = require('./../helpers/unicode');

var _object = require('./../helpers/object');

var _element = require('./../helpers/dom/element');

var _event = require('./../helpers/dom/event');

var _textEditor = require('./textEditor');

var _textEditor2 = _interopRequireDefault(_textEditor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HandsontableEditor = _textEditor2.default.prototype.extend();

/**
 * @private
 * @editor HandsontableEditor
 * @class HandsontableEditor
 * @dependencies TextEditor
 */
HandsontableEditor.prototype.createElements = function () {
  _textEditor2.default.prototype.createElements.apply(this, arguments);

  var DIV = document.createElement('DIV');
  DIV.className = 'handsontableEditor';
  this.TEXTAREA_PARENT.appendChild(DIV);

  this.htContainer = DIV;
  this.assignHooks();
};

HandsontableEditor.prototype.prepare = function (td, row, col, prop, value, cellProperties) {
  _textEditor2.default.prototype.prepare.apply(this, arguments);

  var parent = this;
  var options = {
    startRows: 0,
    startCols: 0,
    minRows: 0,
    minCols: 0,
    className: 'listbox',
    copyPaste: false,
    autoColumnSize: false,
    autoRowSize: false,
    readOnly: true,
    fillHandle: false,
    afterOnCellMouseDown: function afterOnCellMouseDown(_, coords) {
      var value = this.getSourceData(coords.row, coords.col);

      // if the value is undefined then it means we don't want to set the value
      if (value !== void 0) {
        parent.setValue(value);
      }
      parent.instance.destroyEditor();
    }
  };

  if (this.cellProperties.handsontable) {
    (0, _object.extend)(options, cellProperties.handsontable);
  }
  this.htOptions = options;
};

var onBeforeKeyDown = function onBeforeKeyDown(event) {
  if ((0, _event.isImmediatePropagationStopped)(event)) {
    return;
  }
  var editor = this.getActiveEditor();

  var innerHOT = editor.htEditor.getInstance();

  var rowToSelect;
  var selectedRow;

  if (event.keyCode == _unicode.KEY_CODES.ARROW_DOWN) {
    if (!innerHOT.getSelectedLast() && !innerHOT.flipped) {
      rowToSelect = 0;
    } else if (innerHOT.getSelectedLast()) {
      if (innerHOT.flipped) {
        rowToSelect = innerHOT.getSelectedLast()[0] + 1;
      } else if (!innerHOT.flipped) {
        selectedRow = innerHOT.getSelectedLast()[0];
        var lastRow = innerHOT.countRows() - 1;
        rowToSelect = Math.min(lastRow, selectedRow + 1);
      }
    }
  } else if (event.keyCode == _unicode.KEY_CODES.ARROW_UP) {
    if (!innerHOT.getSelectedLast() && innerHOT.flipped) {
      rowToSelect = innerHOT.countRows() - 1;
    } else if (innerHOT.getSelectedLast()) {
      if (innerHOT.flipped) {
        selectedRow = innerHOT.getSelectedLast()[0];
        rowToSelect = Math.max(0, selectedRow - 1);
      } else {
        selectedRow = innerHOT.getSelectedLast()[0];
        rowToSelect = selectedRow - 1;
      }
    }
  }

  if (rowToSelect !== void 0) {
    if (rowToSelect < 0 || innerHOT.flipped && rowToSelect > innerHOT.countRows() - 1) {
      innerHOT.deselectCell();
    } else {
      innerHOT.selectCell(rowToSelect, 0);
    }
    if (innerHOT.getData().length) {
      event.preventDefault();
      (0, _event.stopImmediatePropagation)(event);

      editor.instance.listen();
      editor.TEXTAREA.focus();
    }
  }
};

HandsontableEditor.prototype.open = function () {
  this.instance.addHook('beforeKeyDown', onBeforeKeyDown);

  _textEditor2.default.prototype.open.apply(this, arguments);

  if (this.htEditor) {
    this.htEditor.destroy();
  }
  // Construct and initialise a new Handsontable
  this.htEditor = new this.instance.constructor(this.htContainer, this.htOptions);
  this.htEditor.init();

  if (this.cellProperties.strict) {
    this.htEditor.selectCell(0, 0);
    this.TEXTAREA.style.visibility = 'hidden';
  } else {
    this.htEditor.deselectCell();
    this.TEXTAREA.style.visibility = 'visible';
  }

  (0, _element.setCaretPosition)(this.TEXTAREA, 0, this.TEXTAREA.value.length);
};

HandsontableEditor.prototype.close = function () {
  this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
  this.instance.listen();

  _textEditor2.default.prototype.close.apply(this, arguments);
};

HandsontableEditor.prototype.focus = function () {
  this.instance.listen();
  _textEditor2.default.prototype.focus.apply(this, arguments);
};

HandsontableEditor.prototype.beginEditing = function (initialValue) {
  var onBeginEditing = this.instance.getSettings().onBeginEditing;

  if (onBeginEditing && onBeginEditing() === false) {
    return;
  }
  _textEditor2.default.prototype.beginEditing.apply(this, arguments);
};

HandsontableEditor.prototype.finishEditing = function (isCancelled, ctrlDown) {
  if (this.htEditor && this.htEditor.isListening()) {
    // if focus is still in the HOT editor

    this.instance.listen(); // return the focus to the parent HOT instance
  }

  if (this.htEditor && this.htEditor.getSelectedLast()) {
    var value = this.htEditor.getInstance().getValue();

    if (value !== void 0) {
      // if the value is undefined then it means we don't want to set the value
      this.setValue(value);
    }
  }

  return _textEditor2.default.prototype.finishEditing.apply(this, arguments);
};

HandsontableEditor.prototype.assignHooks = function () {
  var _this = this;

  this.instance.addHook('afterDestroy', function () {
    if (_this.htEditor) {
      _this.htEditor.destroy();
    }
  });
};

exports.default = HandsontableEditor;