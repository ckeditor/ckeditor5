/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ListStylesEditing from '../src/liststylesediting';

describe( 'ListStylesCommand', () => {
	let editor, model, bulletedListCommand, numberedListCommand, listStylesCommand;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ListStylesEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				bulletedListCommand = editor.commands.get( 'bulletedList' );
				numberedListCommand = editor.commands.get( 'numberedList' );
				listStylesCommand = editor.commands.get( 'listStyles' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( '#isEnabled', () => {
		it( 'should be true if bulletedList or numberedList is enabled', () => {
			bulletedListCommand.isEnabled = true;
			numberedListCommand.isEnabled = false;
			listStylesCommand.refresh();

			expect( listStylesCommand.isEnabled ).to.equal( true );

			bulletedListCommand.isEnabled = false;
			numberedListCommand.isEnabled = true;
			listStylesCommand.refresh();

			expect( listStylesCommand.isEnabled ).to.equal( true );
		} );

		it( 'should be false if bulletedList and numberedList are enabled', () => {
			bulletedListCommand.isEnabled = false;
			numberedListCommand.isEnabled = false;

			listStylesCommand.refresh();

			expect( listStylesCommand.isEnabled ).to.equal( false );
		} );
	} );

	describe( '#value', () => {
		it( 'should return null if selected a paragraph', () => {
			setData( model, '<paragraph>Foo[]</paragraph>' );

			expect( listStylesCommand.value ).to.equal( null );
		} );

		it( 'should return null if selection starts in a paragraph and ends in a list item', () => {
			setData( model,
				'<paragraph>Fo[o</paragraph>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="default">Foo]</listItem>'
			);

			expect( listStylesCommand.value ).to.equal( null );
		} );

		it( 'should return the value of `listStyle` attribute if selection is inside a listItem (collapsed selection)', () => {
			setData( model, '<listItem listIndent="0" listType="bulleted" listStyle="default">Foo[]</listItem>' );

			expect( listStylesCommand.value ).to.equal( 'default' );
		} );

		it( 'should return the value of `listStyle` attribute if selection is inside a listItem (non-collapsed selection)', () => {
			setData( model, '<listItem listIndent="0" listType="bulleted" listStyle="default">[Foo]</listItem>' );

			expect( listStylesCommand.value ).to.equal( 'default' );
		} );

		it( 'should return the value of `listStyle` attribute if selected more elements in the same list', () => {
			setData( model,
				'<listItem listIndent="0" listType="bulleted" listStyle="square">[1.</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="square">2.]</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="square">3.</listItem>'
			);

			expect( listStylesCommand.value ).to.equal( 'square' );
		} );

		it( 'should return the value of `listStyle` attribute for the selection inside a nested list', () => {
			setData( model,
				'<listItem listIndent="0" listType="bulleted" listStyle="square">1.</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="disc">1.1.[]</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="square">2.</listItem>'
			);

			expect( listStylesCommand.value ).to.equal( 'disc' );
		} );

		it( 'should return the value of `listStyle` attribute from a list where the selection starts (selection over nested list)', () => {
			setData( model,
				'<listItem listIndent="0" listType="bulleted" listStyle="square">1.</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="disc">1.1.[</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="square">2.]</listItem>'
			);

			expect( listStylesCommand.value ).to.equal( 'disc' );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set the `listStyle` attribute for collapsed selection', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>'
			);

			listStylesCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>'
			);
		} );

		it( 'should set the `listStyle` attribute for non-collapsed selection', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="default" listType="bulleted">[1.]</listItem>'
			);

			listStylesCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">[1.]</listItem>'
			);
		} );

		it( 'should set the `listStyle` attribute for all the same list items (collapsed selection)', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">3.</listItem>'
			);

			listStylesCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
			);
		} );

		it( 'should set the `listStyle` attribute for all the same list items and ignores nested lists', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.1.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">3.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">3.1.</listItem>'
			);

			listStylesCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.1.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.2.</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">3.1.</listItem>'
			);
		} );

		it( 'should set the `listStyle` attribute for all the same list items and ignores nested lists (selection in nested list)', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.1.[]</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">3.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">3.1.</listItem>'
			);

			listStylesCommand.execute( { type: 'disc' } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.1.[]</listItem>' +
				'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">3.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">3.1.</listItem>'
			);
		} );

		it( 'should stop searching for the list items when spotted non-listItem element', () => {
			setData( model,
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">3.</listItem>'
			);

			listStylesCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
			);
		} );

		it( 'should stop searching for the list items when spotted listItem with different listType attribute', () => {
			setData( model,
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="numbered">1.</listItem>'
			);

			listStylesCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="numbered">1.</listItem>'
			);
		} );

		it( 'should stop searching for the list items when spotted listItem with different listStyle attribute', () => {
			setData( model,
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="disc" listType="bulleted">1.</listItem>'
			);

			listStylesCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="disc" listType="bulleted">1.</listItem>'
			);
		} );

		it( 'should start searching for the list items from starting position (collapsed selection)', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">[3.</listItem>' +
				'<paragraph>Foo.]</paragraph>'
			);

			listStylesCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">[3.</listItem>' +
				'<paragraph>Foo.]</paragraph>'
			);
		} );

		it( 'should start searching for the list items from ending position (collapsed selection)', () => {
			setData( model,
				'<paragraph>[Foo.</paragraph>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.]</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">3.</listItem>'
			);

			listStylesCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<paragraph>[Foo.</paragraph>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.]</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
			);
		} );

		it( 'should use default type if not specified (no options passed)', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>'
			);

			listStylesCommand.execute();

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>'
			);
		} );

		it( 'should use default type if not specified (passed an empty object)', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>'
			);

			listStylesCommand.execute( {} );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>'
			);
		} );

		it( 'should use default type if not specified (passed null as value)', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>'
			);

			listStylesCommand.execute( { type: null } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>'
			);
		} );

		it( 'should not update anything if no listItem found in the selection', () => {
			setData( model,
				'<paragraph>[Foo.]</paragraph>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.</listItem>'
			);

			listStylesCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<paragraph>[Foo.]</paragraph>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.</listItem>'
			);
		} );
	} );
} );
