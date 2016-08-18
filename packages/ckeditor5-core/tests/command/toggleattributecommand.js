/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '/ckeditor5/core/editor/editor.js';
import Document from '/ckeditor5/engine/model/document.js';
import ToggleAttributeCommand from '/ckeditor5/core/command/toggleattributecommand.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';
import { setData, getData } from '/tests/engine/_utils/model.js';

describe( 'ToggleAttributeCommand', () => {
	const attrKey = 'bold';
	let editor, command, modelDoc, root;

	beforeEach( () => {
		editor = new Editor();
		editor.document = new Document();

		modelDoc = editor.document;
		root = modelDoc.createRoot();

		command = new ToggleAttributeCommand( editor, attrKey );

		modelDoc.schema.registerItem( 'p', '$block' );
		modelDoc.schema.registerItem( 'h1', '$block' );
		modelDoc.schema.registerItem( 'img', '$inline' );

		// Allow block in "root" (DIV)
		modelDoc.schema.allow( { name: '$block', inside: '$root' } );

		// Bold text is allowed only in P.
		modelDoc.schema.allow( { name: '$text', attributes: 'bold', inside: 'p' } );
		modelDoc.schema.allow( { name: 'p', attributes: 'bold', inside: '$root' } );

		// Disallow bold on image.
		modelDoc.schema.disallow( { name: 'img', attributes: 'bold', inside: '$root' } );
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'value', () => {
		it( 'should be set to true or false basing on selection attribute', () => {
			modelDoc.selection.setAttribute( attrKey, true );
			expect( command.value ).to.be.true;

			modelDoc.selection.removeAttribute( attrKey );
			expect( command.value ).to.be.false;
		} );
	} );

	describe( '_doExecute', () => {
		it( 'should add attribute on selected nodes if the command value was false', () => {
			setData( modelDoc, '<p>a[bc<$text bold="true">fo]obar</$text>xyz</p>' );

			expect( command.value ).to.be.false;

			command._doExecute();

			expect( command.value ).to.be.true;
			expect( getData( modelDoc ) ).to.equal( '<p>a[<$text bold="true">bcfo]obar</$text>xyz</p>' );
		} );

		it( 'should remove attribute from selected nodes if the command value was true', () => {
			setData( modelDoc, '<p>abc[<$text bold="true">foo]bar</$text>xyz</p>' );

			expect( command.value ).to.be.true;

			command._doExecute();

			expect( getData( modelDoc ) ).to.equal( '<p>abc[foo]<$text bold="true">bar</$text>xyz</p>' );
			expect( command.value ).to.be.false;
		} );

		it( 'should add attribute on selected nodes if execute parameter was set to true', () => {
			setData( modelDoc, '<p>abc<$text bold="true">foob[ar</$text>x]yz</p>' );

			expect( command.value ).to.be.true;

			command._doExecute( true );

			expect( command.value ).to.be.true;
			expect( getData( modelDoc ) ).to.equal( '<p>abc<$text bold="true">foob[arx</$text>]yz</p>' );
		} );

		it( 'should remove attribute on selected nodes if execute parameter was set to false', () => {
			setData( modelDoc, '<p>a[bc<$text bold="true">fo]obar</$text>xyz</p>' );

			command._doExecute( false );

			expect( command.value ).to.be.false;
			expect( getData( modelDoc ) ).to.equal( '<p>a[bcfo]<$text bold="true">obar</$text>xyz</p>' );
		} );

		it( 'should change selection attribute if selection is collapsed in non-empty parent', () => {
			setData( modelDoc, '<p>a[]bc<$text bold="true">foobar</$text>xyz</p><p></p>' );

			expect( command.value ).to.be.false;

			command._doExecute();

			expect( command.value ).to.be.true;
			expect( modelDoc.selection.hasAttribute( 'bold' ) ).to.be.true;

			command._doExecute();

			expect( command.value ).to.be.false;
			expect( modelDoc.selection.hasAttribute( 'bold' ) ).to.be.false;
		} );

		it( 'should not store attribute change on selection if selection is collapsed in non-empty parent', () => {
			setData( modelDoc, '<p>a[]bc<$text bold="true">foobar</$text>xyz</p>' );

			command._doExecute();

			// It should not save that bold was executed at position ( root, [ 0, 1 ] ).

			// Simulate clicking right arrow key by changing selection ranges.
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 2 ] ) ) ] );

			// Get back to previous selection.
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 1 ] ) ) ] );

			expect( command.value ).to.be.false;
		} );

		it( 'should change selection attribute and store it if selection is collapsed in empty parent', () => {
			setData( modelDoc, '<p>abc<$text bold="true">foobar</$text>xyz</p><p>[]</p>' );

			expect( command.value ).to.be.false;

			command._doExecute();

			expect( command.value ).to.be.true;
			expect( modelDoc.selection.hasAttribute( 'bold' ) ).to.be.true;

			// Attribute should be stored.
			// Simulate clicking somewhere else in the editor.
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 2 ] ) ) ] );

			expect( command.value ).to.be.false;

			// Go back to where attribute was stored.
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 0 ] ) ) ] );

			// Attribute should be restored.
			expect( command.value ).to.be.true;

			command._doExecute();

			expect( command.value ).to.be.false;
			expect( modelDoc.selection.hasAttribute( 'bold' ) ).to.be.false;
		} );

		it( 'should not apply attribute change where it would invalid schema', () => {
			modelDoc.schema.registerItem( 'image', '$block' );
			setData( modelDoc, '<p>ab[c<image></image><$text bold="true">foobar</$text>xy<image></image>]z</p>' );

			expect( command.isEnabled ).to.be.true;

			command._doExecute();

			expect( getData( modelDoc ) )
				.to.equal( '<p>ab[<$text bold="true">c</$text><image></image><$text bold="true">foobarxy</$text><image></image>]z</p>' );
		} );
	} );

	describe( '_checkEnabled', () => {
		describe( '_checkEnabled', () => {
			// This test doesn't tests every possible case.
			// Method `_checkEnabled` uses `isAttributeAllowedInSelection` helper which is fully tested in his own test.

			beforeEach( () => {
				modelDoc.schema.registerItem( 'x', '$block' );
				modelDoc.schema.disallow( { name: '$text', inside: 'x', attributes: 'link' } );
			} );

			describe( 'when selection is collapsed', () => {
				it( 'should return true if characters with the attribute can be placed at caret position', () => {
					setData( modelDoc, '<p>f[]oo</p>' );
					expect( command._checkEnabled() ).to.be.true;
				} );

				it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
					setData( modelDoc, '<x>fo[]o</x>' );
					expect( command._checkEnabled() ).to.be.false;
				} );
			} );

			describe( 'when selection is not collapsed', () => {
				it( 'should return true if there is at least one node in selection that can have the attribute', () => {
					setData( modelDoc, '<p>[foo]</p>' );
					expect( command._checkEnabled() ).to.be.true;
				} );

				it( 'should return false if there are no nodes in selection that can have the attribute', () => {
					setData( modelDoc, '<x>[foo]</x>' );
					expect( command._checkEnabled() ).to.be.false;
				} );
			} );
		} );
	} );
} );
