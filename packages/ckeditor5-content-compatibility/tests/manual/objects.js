/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import List from '@ckeditor/ckeditor5-list/src/list';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Table from '@ckeditor/ckeditor5-table/src/table';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';

/**
 * Client custom plugin extending HTML support for compatibility.
 */
class ExtendHTMLSupport extends Plugin {
	static get requires() {
		return [ GeneralHtmlSupport ];
	}

	init() {
		const { dataFilter } = this.editor.plugins.get( GeneralHtmlSupport );

		const definitions = [
			{ name: 'object', attributes: [ 'classid', 'codebase' ] },
			{ name: 'param', attributes: [ 'name', 'value' ] },
			{ name: 'embed', attributes: [ 'allowfullscreen', 'pluginspage', 'quality', 'src', 'type' ] },
			{ name: 'iframe', attributes: [ 'frameborder', 'scrolling', 'src' ] },
			{ name: 'form', attributes: [ 'action', 'method', 'name' ] },
			{ name: 'input', attributes: [ 'name', 'type', 'value', 'alt', 'src' ] },
			{ name: 'textarea', attributes: [ 'name' ] },
			{ name: 'select', attributes: [ 'name' ] },
			{ name: 'option', attributes: [ 'value', 'selected' ] },
			{ name: 'video', attributes: [ 'height', 'width', 'controls' ] },
			{ name: 'audio', attributes: [ 'controls' ] },
			{ name: 'source', attributes: [ 'src', 'type' ] },
			{ name: 'button' },
			{ name: 'label' }
		];

		for ( const definition of definitions ) {
			dataFilter.allowElement( { name: definition.name } );

			for ( const key of ( definition.attributes || [] ) ) {
				const attributes = {};
				attributes[ key ] = /[\s\S]+/;

				dataFilter.allowAttributes( { name: definition.name, attributes } );
			}
		}
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Table,
			Link,
			BlockQuote,
			Bold,
			Essentials,
			ExtendHTMLSupport,
			Italic,
			List,
			Paragraph,
			Strikethrough
		],
		toolbar: [
			'bold',
			'italic',
			'strikethrough',
			'|',
			'numberedList',
			'bulletedList',
			'|',
			'blockquote'
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
