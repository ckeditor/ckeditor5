/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/* globals window */
import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
ClassicEditor.builtinPlugins.push(
	HeadingButtonsUI,
	ParagraphButtonUI
);
window.ClassicEditor = ClassicEditor;
