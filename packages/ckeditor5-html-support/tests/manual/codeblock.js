/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
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

		dataFilter.allowElement( /^(pre|code)$/ );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, styles: { color: /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, styles: { background: /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, attributes: { 'data-foo': /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, classes: [ 'foo' ] } );

		dataFilter.disallowAttributes( { name: /^(pre|code)$/, attributes: { 'data-foo': 'bar' } } );
		dataFilter.disallowAttributes( { name: /^(pre|code)$/, styles: { background: 'yellow' } } );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Bold,
			CodeBlock,
			Essentials,
			ExtendHTMLSupport,
			Italic,
			Paragraph,
			Strikethrough
		],
		toolbar: [ 'codeBlock', '|', 'bold', 'italic', 'strikethrough' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
