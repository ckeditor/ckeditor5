/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import SlashCommandEditing from '../src/slashcommandediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting';
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';

describe( 'SlashCommandEditing', () => {
	let editor, slashCommandEditingPlugin;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, IndentEditing, BoldEditing, ListEditing, BlockQuoteEditing, SlashCommandEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				slashCommandEditingPlugin = editor.plugins.get( 'SlashCommandEditing' );
			} );
	} );

	afterEach( () => editor.destroy() );

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

		describe( 'filter parameter', () => {
			it( 'filters out the results', () => {} );

			it( 'returns all the commands if not provided', () => {} );

			it( 'returns empty iterable if nothing was matched', () => {} );
		} );
	} );
} );
