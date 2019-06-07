/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import MultiCommand from '@ckeditor/ckeditor5-core/src/multicommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Command from '@ckeditor/ckeditor5-core/src/command';
import first from '@ckeditor/ckeditor5-utils/src/first';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import IndentBlock from '../../src/indentblock';

class IndentBlockCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Indents or outdents (depends on the {@link #constructor}'s `indentDirection` parameter) selected list items.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;

		const itemsToChange = Array.from( doc.selection.getSelectedBlocks() );

		model.change( () => {
			for ( const item of itemsToChange ) {
				console.log( 'indent block', item );
			}
		} );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		// Check whether any of position's ancestor is a list item.
		const block = first( this.editor.model.document.selection.getSelectedBlocks() );

		// If selection is not in a list item, the command is disabled.
		if ( !block || !this.editor.model.schema.checkAttribute( block, 'indent' ) ) {
			return false;
		}

		return true;
	}
}

class IndentOutdent extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		this._createButton( 'indent', t( 'Indent' ) );
		// this._createButton( 'outdent', t( 'Outdent' ) );
		this._createButton( 'indentList', t( 'Indent List' ) );
		// this._createButton( 'outdentList', t( 'Outdent List' ) );
		this._createButton( 'indentBlock', t( 'Indent Block' ) );
		// this._createButton( 'outdentBlock', t( 'Outdent Block' ) );
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

		editor.commands.add( 'indentBlock', new IndentBlockCommand( editor ) );

		const indentCommand = new MultiCommand( editor );

		indentCommand.registerChildCommand( editor.commands.get( 'indentList' ) );
		indentCommand.registerChildCommand( editor.commands.get( 'indentBlock' ) );

		editor.commands.add( 'indent', indentCommand );

		// TODO nicer API?
		// editor.commands.add( 'indentList', new Command(), 'indent' );
		// editor.commands.addMulti( 'indentList', new Command(), 'indent' );
		// editor.commands.addMulti( 'indentList', 'indent' );

		const outdentCommand = new MultiCommand( editor );
		outdentCommand.registerChildCommand( editor.commands.get( 'outdentList' ) );
		editor.commands.add( 'outdent', outdentCommand );
	}
}
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, IndentOutdent, IndentBlock ],
		toolbar: [
			'heading',
			// '|',
			// 'bold',
			// 'italic',
			// 'link',
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
			// 'blockQuote',
			// 'insertTable',
			// 'mediaEmbed',
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
