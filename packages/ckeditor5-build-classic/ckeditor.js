/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classic';
import ArticlePlugin from '@ckeditor/ckeditor5-presets/src/article';

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.build = {
	plugins: [ ArticlePlugin ],
	config: {
		toolbar: [
			'image',
			'headings'
		]
	}
};
