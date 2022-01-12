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
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import List from '@ckeditor/ckeditor5-list/src/list';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Table from '@ckeditor/ckeditor5-table/src/table';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';

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
		const dataSchema = this.editor.plugins.get( 'DataSchema' );

		dataSchema.registerBlockElement( { model: 'htmlXyz',
			view: 'xyz',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectBlock'
			}
		} );

		const definitions = [
			{ name: 'object', attributes: [ 'classid', 'codebase' ] },
			{ name: 'embed', attributes: [ 'allowfullscreen', 'pluginspage', 'quality', 'src', 'type' ] },
			{ name: 'iframe', attributes: [ 'frameborder', 'scrolling', 'src' ] },
			{ name: 'form', attributes: [ 'action', 'method', 'name' ] },
			{ name: 'input', attributes: [ 'name', 'type', 'value', 'alt', 'src' ] },
			{ name: 'textarea', attributes: [ 'name' ] },
			{ name: 'select', attributes: [ 'name' ] },
			{ name: 'video', attributes: [ 'height', 'width', 'controls' ] },
			{ name: 'audio', attributes: [ 'controls' ] },
			{ name: 'button' },
			{ name: 'label' },
			{ name: 'xyz', attributes: [ 'data-foo' ] }
		];

		for ( const definition of definitions ) {
			dataFilter.allowElement( definition.name );

			for ( const key of ( definition.attributes || [] ) ) {
				const attributes = {};
				attributes[ key ] = true;

				dataFilter.allowAttributes( { name: definition.name, attributes } );
			}
		}
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			BlockQuote,
			Bold,
			Code,
			Essentials,
			ExtendHTMLSupport,
			Highlight,
			Italic,
			Link,
			List,
			Paragraph,
			Strikethrough,
			Subscript,
			Superscript,
			Table,
			Underline
		],
		toolbar: [
			'bold',
			'italic',
			'strikethrough',
			'underline',
			'code',
			'subscript',
			'superscript',
			'highlight',
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
