/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import {
	Plugin,
	Command,
	ButtonView,
	toWidget,
	toWidgetEditable,
	findOptimalInsertionRange,
	createElement
} from 'ckeditor5';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

window.ClassicEditor = ClassicEditor;
window.Plugin = Plugin;
window.ButtonView = ButtonView;
window.Command = Command;
window.toWidget = toWidget;
window.toWidgetEditable = toWidgetEditable;
window.createElement = createElement;
window.findOptimalInsertionRange = findOptimalInsertionRange;
