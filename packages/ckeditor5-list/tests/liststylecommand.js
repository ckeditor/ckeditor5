/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ListStyleEditing from '../src/liststyleediting';

describe( 'ListStyleCommand', () => {
	let editor, model, bulletedListCommand, numberedListCommand, listStyleCommand;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ListStyleEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				bulletedListCommand = editor.commands.get( 'bulletedList' );
				numberedListCommand = editor.commands.get( 'numberedList' );
				listStyleCommand = editor.commands.get( 'listStyle' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( '#isEnabled', () => {
		it( 'should be true if bulletedList or numberedList is enabled', () => {
			bulletedListCommand.isEnabled = true;
			numberedListCommand.isEnabled = false;
			listStyleCommand.refresh();

			expect( listStyleCommand.isEnabled ).to.equal( true );

			bulletedListCommand.isEnabled = false;
			numberedListCommand.isEnabled = true;
			listStyleCommand.refresh();

			expect( listStyleCommand.isEnabled ).to.equal( true );
		} );

		it( 'should be false if bulletedList and numberedList are enabled', () => {
			bulletedListCommand.isEnabled = false;
			numberedListCommand.isEnabled = false;

			listStyleCommand.refresh();

			expect( listStyleCommand.isEnabled ).to.equal( false );
		} );
	} );

	describe( '#value', () => {
		it( 'should return null if selected a paragraph', () => {
			setData( model, '<paragraph>Foo[]</paragraph>' );

			expect( listStyleCommand.value ).to.equal( null );
		} );

		it( 'should return null if selection starts in a paragraph and ends in a list item', () => {
			setData( model,
				'<paragraph>Fo[o</paragraph>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="default">Foo]</listItem>'
			);

			expect( listStyleCommand.value ).to.equal( null );
		} );

		it( 'should return the value of `listStyle` attribute if selection is inside a listItem (collapsed selection)', () => {
			setData( model, '<listItem listIndent="0" listType="bulleted" listStyle="default">Foo[]</listItem>' );

			expect( listStyleCommand.value ).to.equal( 'default' );
		} );

		it( 'should return the value of `listStyle` attribute if selection is inside a listItem (non-collapsed selection)', () => {
			setData( model, '<listItem listIndent="0" listType="bulleted" listStyle="default">[Foo]</listItem>' );

			expect( listStyleCommand.value ).to.equal( 'default' );
		} );

		it( 'should return the value of `listStyle` attribute if selected more elements in the same list', () => {
			setData( model,
				'<listItem listIndent="0" listType="bulleted" listStyle="square">[1.</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="square">2.]</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="square">3.</listItem>'
			);

			expect( listStyleCommand.value ).to.equal( 'square' );
		} );

		it( 'should return the value of `listStyle` attribute for the selection inside a nested list', () => {
			setData( model,
				'<listItem listIndent="0" listType="bulleted" listStyle="square">1.</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="disc">1.1.[]</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="square">2.</listItem>'
			);

			expect( listStyleCommand.value ).to.equal( 'disc' );
		} );

		it( 'should return the value of `listStyle` attribute from a list where the selection starts (selection over nested list)', () => {
			setData( model,
				'<listItem listIndent="0" listType="bulleted" listStyle="square">1.</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="disc">1.1.[</listItem>' +
				'<listItem listIndent="0" listType="bulleted" listStyle="square">2.]</listItem>'
			);

			expect( listStyleCommand.value ).to.equal( 'disc' );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set the `listStyle` attribute for collapsed selection', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>'
			);

			listStyleCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>'
			);
		} );

		it( 'should set the `listStyle` attribute for non-collapsed selection', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="default" listType="bulleted">[1.]</listItem>'
			);

			listStyleCommand.execute( { type: 'circle' } );

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

			listStyleCommand.execute( { type: 'circle' } );

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

			listStyleCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.1.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.2.</listItem>' +
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">3.1.</listItem>'
			);
		} );

		it( 'should set the `listStyle` attribute for all the same list items and ignores "parent" list (selection in nested list)', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">2.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.1.[]</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">3.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">3.1.</listItem>'
			);

			listStyleCommand.execute( { type: 'disc' } );

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

			listStyleCommand.execute( { type: 'circle' } );

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

			listStyleCommand.execute( { type: 'circle' } );

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

			listStyleCommand.execute( { type: 'circle' } );

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

			listStyleCommand.execute( { type: 'circle' } );

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

			listStyleCommand.execute( { type: 'circle' } );

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

			listStyleCommand.execute();

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>'
			);
		} );

		it( 'should use default type if not specified (passed an empty object)', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>'
			);

			listStyleCommand.execute( {} );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>'
			);
		} );

		it( 'should use default type if not specified (passed null as value)', () => {
			setData( model,
				'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>'
			);

			listStyleCommand.execute( { type: null } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.[]</listItem>'
			);
		} );

		it( 'should not update anything if no listItem found in the selection', () => {
			setData( model,
				'<paragraph>[Foo.]</paragraph>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.</listItem>'
			);

			const modelChangeStub = sinon.stub( model, 'change' ).named( 'model#change' );

			listStyleCommand.execute( { type: 'circle' } );

			expect( getData( model ) ).to.equal(
				'<paragraph>[Foo.]</paragraph>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.</listItem>'
			);

			expect( modelChangeStub.called ).to.equal( false );
		} );

		it( 'should update all items that belong to selected elements', () => {
			// [x] = items that should be updated.
			// All list items that belong to the same lists that selected items should be updated.
			// "2." is the most outer list (listIndent=0)
			// "2.1" a child list of the "2." element (listIndent=1)
			// "2.1.1" a child list of the "2.1" element (listIndent=2)
			//
			// [x] ■ 1.
			// [x] ■ [2.
			// [x]     ○ 2.1.
			// [x]         ▶ 2.1.1.]
			// [x]         ▶ 2.1.2.
			// [x]     ○ 2.2.
			// [x] ■ 3.
			// [ ]     ○ 3.1.
			// [ ]         ▶ 3.1.1.
			//
			// "3.1" is not selected and this list should not be updated.
			setData( model,
				'<listItem listIndent="0" listStyle="default" listType="bulleted">1.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">[2.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.1.</listItem>' +
				'<listItem listIndent="2" listStyle="default" listType="bulleted">2.1.1.]</listItem>' +
				'<listItem listIndent="2" listStyle="default" listType="bulleted">2.1.2.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">2.2.</listItem>' +
				'<listItem listIndent="0" listStyle="default" listType="bulleted">3.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">3.1.</listItem>' +
				'<listItem listIndent="2" listStyle="default" listType="bulleted">3.1.1.</listItem>'
			);

			listStyleCommand.execute( { type: 'disc' } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStyle="disc" listType="bulleted">1.</listItem>' +
				'<listItem listIndent="0" listStyle="disc" listType="bulleted">[2.</listItem>' +
				'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.1.</listItem>' +
				'<listItem listIndent="2" listStyle="disc" listType="bulleted">2.1.1.]</listItem>' +
				'<listItem listIndent="2" listStyle="disc" listType="bulleted">2.1.2.</listItem>' +
				'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.2.</listItem>' +
				'<listItem listIndent="0" listStyle="disc" listType="bulleted">3.</listItem>' +
				'<listItem listIndent="1" listStyle="default" listType="bulleted">3.1.</listItem>' +
				'<listItem listIndent="2" listStyle="default" listType="bulleted">3.1.1.</listItem>'
			);
		} );
	} );
} );
