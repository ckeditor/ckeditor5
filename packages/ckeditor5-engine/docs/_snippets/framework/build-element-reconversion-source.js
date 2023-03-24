/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Plugin, Command } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { toWidget, toWidgetEditable, findOptimalInsertionRange } from '@ckeditor/ckeditor5-widget';
import { createElement } from '@ckeditor/ckeditor5-utils';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

window.ClassicEditor = ClassicEditor;
window.Plugin = Plugin;
window.ButtonView = ButtonView;
window.Command = Command;
window.toWidget = toWidget;
window.toWidgetEditable = toWidgetEditable;
window.createElement = createElement;
window.findOptimalInsertionRange = findOptimalInsertionRange;
