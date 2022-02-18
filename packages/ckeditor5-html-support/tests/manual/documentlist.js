/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import DocumentListProperties from '@ckeditor/ckeditor5-list/src/documentlistproperties';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';

/**
 * Client custom plugin extending HTML support for compatibility.
 */
class ExtendHTMLSupport extends Plugin {
	static get requires() {
		return [ GeneralHtmlSupport ];
	}

	init() {
		const dataFilter = this.editor.plugins.get( 'DataFilter' );

		dataFilter.allowElement( /^p$/ );
		dataFilter.allowAttributes( { name: /^p$/, attributes: true, styles: true } );

		dataFilter.allowElement( /^(ul|ol)$/ );
		dataFilter.allowAttributes( { name: /^(ul|ol)$/, attributes: true, styles: true } );
		dataFilter.allowElement( /^(li)$/ );
		dataFilter.allowAttributes( { name: /^(li)$/, attributes: true, styles: true } );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Bold,
			DocumentListProperties,
			Essentials,
			ExtendHTMLSupport,
			Italic,
			Paragraph,
			Strikethrough,
			SourceEditing
		],
		toolbar: [
			'sourceEditing', '|',
			'numberedList', 'bulletedList', '|',
			'outdent', 'indent', '|',
			'bold', 'italic', 'strikethrough'
		],
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
