/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '../_utils/articlepluginset';
import MultiCommand from '../../src/multicommand';
import Plugin from '../../src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class IndentOutdent extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		this._createButton( 'indent', t( 'Indent' ) );
		this._createButton( 'outdent', t( 'Outdent' ) );
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

	afterInit() {
		const editor = this.editor;

		const indentCommand = new MultiCommand( editor );
		indentCommand.registerChildCommand( editor.commands.get( 'indentList' ) );
		editor.commands.add( 'indent', indentCommand );

		const outdentCommand = new MultiCommand( editor );
		outdentCommand.registerChildCommand( editor.commands.get( 'outdentList' ) );
		editor.commands.add( 'outdent', outdentCommand );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, IndentOutdent ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'|',
			'indent',
			'outdent',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
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
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
