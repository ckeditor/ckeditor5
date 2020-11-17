/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import uid from '@ckeditor/ckeditor5-utils/src/uid';
import first from '@ckeditor/ckeditor5-utils/src/first';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import HtmlEmbedEditing from '@ckeditor/ckeditor5-html-embed/src/htmlembedediting';
import HtmlEmbedUI from '@ckeditor/ckeditor5-html-embed/src/htmlembedui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition, toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

export {
	uid,
	first,
	Plugin,
	ClassicEditor,
	HtmlEmbedEditing,
	HtmlEmbedUI,
	ButtonView,
	createElement,
	toWidgetEditable,
	toWidget,
	findOptimalInsertionPosition,
	Command
};
