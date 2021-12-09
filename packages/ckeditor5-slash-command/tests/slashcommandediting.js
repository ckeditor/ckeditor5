/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import SlashCommandEditing from '../src/slashcommandediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import List from '@ckeditor/ckeditor5-list/src/list';

describe( 'SlashCommandEditing', () => {
	let editorElement, editor, slashCommandEditingPlugin;

	// A list of commands that are available in this particular editor configuration.
	const defaultCommands = [ 'paragraph', 'insertParagraph', 'indent', 'outdent', 'bold', 'enter',
		'deleteForward', 'forwardDelete', 'delete', 'numberedList', 'bulletedList', 'indentList',
		'outdentList', 'blockQuote' ];

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, {
			plugins: [ Paragraph, Indent, Bold, List, BlockQuoteEditing, SlashCommandEditing ]
		} )
			.then( newEditor => {
				editor = newEditor;
				slashCommandEditingPlugin = editor.plugins.get( 'SlashCommandEditing' );
			} );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should have pluginName property', () => {
		expect( SlashCommandEditing.pluginName ).to.equal( 'SlashCommandEditing' );
	} );

	describe( 'getCommandsInfo()', () => {
		it( 'returns an iterable value', () => {
			expect( isIterable( slashCommandEditingPlugin.getCommandsInfo() ) ).to.be.true;

			function isIterable( obj ) {
				return typeof obj[ Symbol.iterator ] == 'function';
			}
		} );

		it( 'returns command items with a proper structure', () => {
			const firstResult = Array.from( slashCommandEditingPlugin.getCommandsInfo() )[ 0 ];

			expect( firstResult ).to.be.an( 'object' );
			expect( firstResult ).to.have.property( 'id' );
			expect( firstResult ).to.have.property( 'title' );
			expect( firstResult ).to.have.property( 'description' );
			expect( firstResult ).to.have.property( 'icon' );
		} );

		it( 'lists all the available commands by default', () => {
			const results = Array.from( slashCommandEditingPlugin.getCommandsInfo() ).map( info => info.id );

			expect( results.sort() ).to.deep.equal( defaultCommands.sort() );
		} );

		describe( 'returned object reads meta info from ButtonView', () => {
			it( 'title', () => {
				const numberedListInfo = Array.from( slashCommandEditingPlugin.getCommandsInfo() )
					.find( el => el.id == 'numberedList' );

				expect( numberedListInfo.title ).to.eql( 'Numbered List' );
			} );

			it( 'icon', () => {
				const numberedListInfo = Array.from( slashCommandEditingPlugin.getCommandsInfo() )
					.find( el => el.id == 'numberedList' );

				expect( numberedListInfo.icon ).to.be.a( 'string' );
			} );
		} );

		describe( 'filter parameter', () => {
			let filteredResults;

			it( 'filters out the results', () => {
				filteredResults = slashCommandEditingPlugin.getCommandsInfo( 'blockQuote' );

				expect( filteredResults ).to.have.length( 1 );
			} );

			it( 'returns all the commands if not provided', () => {
				filteredResults = slashCommandEditingPlugin.getCommandsInfo();

				expect( filteredResults ).to.have.length( defaultCommands.length );
			} );

			it( 'returns empty iterable if nothing was matched', () => {
				filteredResults = slashCommandEditingPlugin.getCommandsInfo( 'bar' );

				expect( filteredResults ).to.have.length( 0 );
			} );
		} );
	} );
} );
