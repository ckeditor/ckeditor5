/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import MultiCommand from '@ckeditor/ckeditor5-core/src/multicommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import IndentBlock from '../../src/indentblock';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

class Indent extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.commands.add( 'indent', new MultiCommand( editor ) );
		editor.commands.add( 'outdent', new MultiCommand( editor ) );

		this._createButton( 'indent', t( '>' ) );
		this._createButton( 'outdent', t( '<' ) );

		// TODO: temporary - tests only
		this._createButton( 'indentList', t( '> List' ) );
		this._createButton( 'outdentList', t( '< List' ) );

		// TODO: temporary - tests only
		this._createButton( 'indentBlock', t( '> Block' ) );
		this._createButton( 'outdentBlock', t( '< Block' ) );
	}

	_createButton( commandName, label ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( commandName, locale => {
			const command = editor.commands.get( commandName );
			const view = new ButtonView( locale );

			view.set( {
				label,
				withText: true,
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( commandName ) );

			return view;
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Indent, IndentBlock ],
		toolbar: [
			'heading',
			'|',
			'indent',
			'outdent',
			'|',
			'indentList',
			'outdentList',
			'|',
			'indentBlock',
			'outdentBlock',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'blockQuote',
			'insertTable',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		indentBlock: {
			classes: [
				'indent-1',
				'indent-2',
				'indent-3',
				'indent-4'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
