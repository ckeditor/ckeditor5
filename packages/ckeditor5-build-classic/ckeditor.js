/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classic';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import ClipboardPlugin from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImagecaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImagestylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImagetoolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';

export class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.build = {
	plugins: [
		AutoformatPlugin,
		ClipboardPlugin,
		BoldPlugin,
		ItalicPlugin,
		EnterPlugin,
		HeadingPlugin,
		ImagePlugin,
		ImagecaptionPlugin,
		ImagestylePlugin,
		ImagetoolbarPlugin,
		LinkPlugin,
		ListPlugin,
		ParagraphPlugin,
		TypingPlugin,
		UndoPlugin 
	],
	config: {
		toolbar: [
			'headings',
			'bold',
			'italic',
			'link',
			'unlink',
			'bulletedList',
			'numberedList',
			'undo',
			'redo'
		]
	}
};
