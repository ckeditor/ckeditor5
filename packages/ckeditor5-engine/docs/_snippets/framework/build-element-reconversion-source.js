/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { toWidget, toWidgetEditable, findOptimalInsertionRange } from '@ckeditor/ckeditor5-widget/src/utils';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

window.ClassicEditor = ClassicEditor;
window.Plugin = Plugin;
window.ButtonView = ButtonView;
window.Command = Command;
window.toWidget = toWidget;
window.toWidgetEditable = toWidgetEditable;
window.createElement = createElement;
window.findOptimalInsertionRange = findOptimalInsertionRange;
