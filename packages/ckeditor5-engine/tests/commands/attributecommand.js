/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/core/editor.js';
import AttributeCommand from '/ckeditor5/core/command/attributecommand.js';
import Text from '/ckeditor5/core/treemodel/text.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Element from '/ckeditor5/core/treemodel/element.js';

let element, editor, command, modelDoc, root;

const attrKey = 'bold';

beforeEach( () => {
	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element );
	modelDoc = editor.document;
	root = modelDoc.createRoot( 'root', 'div' );

	command = new AttributeCommand( editor, attrKey );

	modelDoc.schema.registerItem( 'div', '$block' );
	modelDoc.schema.registerItem( 'p', '$block' );
	modelDoc.schema.registerItem( 'img', '$inline' );

	// Allow block in "root" (DIV)
	modelDoc.schema.allow( { name: '$block', inside: 'div' } );

	// Bold text is allowed only in P.
	modelDoc.schema.allow( { name: '$text', attribute: 'bold', inside: 'p' } );
	modelDoc.schema.allow( { name: 'p', attribute: 'bold', inside: 'div' } );

	// Disallow bold on image.
	modelDoc.schema.disallow( { name: 'img', attribute: 'bold', inside: 'div' } );
} );

describe( 'value', () => {
	it( 'should be set to true or false basing on selection attribute', () => {
		modelDoc.selection.setAttribute( attrKey, true );
		expect( command.value ).to.be.true;

		modelDoc.selection.removeAttribute( attrKey );
		expect( command.value ).to.be.false;
	} );
} );

describe( '_execute', () => {
	let p;

	beforeEach( () => {
		let attrs = {};
		attrs[ attrKey ] = true;

		root.insertChildren( 0, [ new Element( 'p', [] , [ 'abc', new Text( 'foobar', attrs ), 'xyz' ] ), new Element( 'p' ) ] );
		p = root.getChild( 0 );
	} );

	it( 'should add attribute on selected nodes if the command value was false', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 5 ] ) ) );

		expect( command.value ).to.be.false;

		command._execute();

		expect( command.value ).to.be.true;
		expect( p.getChild( 1 ).hasAttribute( attrKey ) ).to.be.true;
		expect( p.getChild( 2 ).hasAttribute( attrKey ) ).to.be.true;
	} );

	it( 'should remove attribute from selected nodes if the command value was true', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 6 ] ) ) );

		expect( command.value ).to.be.true;

		command._execute();

		expect( command.value ).to.be.false;
		expect( p.getChild( 3 ).hasAttribute( attrKey ) ).to.be.false;
		expect( p.getChild( 4 ).hasAttribute( attrKey ) ).to.be.false;
		expect( p.getChild( 5 ).hasAttribute( attrKey ) ).to.be.false;
	} );

	it( 'should add attribute on selected nodes if execute parameter was set to true', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 0, 7 ] ), new Position( root, [ 0, 10 ] ) ) );

		expect( command.value ).to.be.true;

		command._execute( true );

		expect( command.value ).to.be.true;
		expect( p.getChild( 9 ).hasAttribute( attrKey ) ).to.be.true;
	} );

	it( 'should remove attribute on selected nodes if execute parameter was set to false', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 5 ] ) ) );

		expect( command.value ).to.be.false;

		command._execute( false );

		expect( command.value ).to.be.false;
		expect( p.getChild( 3 ).hasAttribute( attrKey ) ).to.be.false;
		expect( p.getChild( 4 ).hasAttribute( attrKey ) ).to.be.false;
	} );

	it( 'should change selection attribute if selection is collapsed in non-empty parent', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 1 ] ) ) );

		expect( command.value ).to.be.false;

		command._execute();

		expect( command.value ).to.be.true;
		expect( modelDoc.selection.hasAttribute( 'bold' ) ).to.be.true;

		command._execute();

		expect( command.value ).to.be.false;
		expect( modelDoc.selection.hasAttribute( 'bold' ) ).to.be.false;
	} );

	it( 'should not store attribute change on selection if selection is collapsed in non-empty parent', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 1 ] ) ) );
		command._execute();

		// It should not save that bold was executed at position ( root, [ 0, 1 ] ).

		// Simulate clicking right arrow key by changing selection ranges.
		modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 2 ] ) ) ] );

		// Get back to previous selection.
		modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 1 ] ) ) ] );

		expect( command.value ).to.be.false;
	} );

	it( 'should change selection attribute and store it if selection is collapsed in empty parent', () => {
		modelDoc.selection.setRanges( [ new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 0 ] ) ) ] );

		expect( command.value ).to.be.false;

		command._execute();

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

		command._execute();

		expect( command.value ).to.be.false;
		expect( modelDoc.selection.hasAttribute( 'bold' ) ).to.be.false;
	} );

	it( 'should not throw and do nothing if selection has no ranges', () => {
		let spy = sinon.spy();
		modelDoc.on( 'change', spy );

		modelDoc.selection.removeAllRanges();
		command._execute();

		expect( spy.called ).to.be.false;
		expect( Array.from( modelDoc.selection.getAttributes() ) ).to.deep.equal( [ ] );
	} );

	it( 'should not apply attribute change where it would invalid schema', () => {
		p.insertChildren( 3, new Element( 'image' ) );
		p.insertChildren( 12, new Element( 'image' ) );
		modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 13 ] ) ) ] );

		expect( command.isEnabled ).to.be.true;

		command._execute();

		let expectedHas = [ 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ];

		for ( let i = 0; i < expectedHas.length; i++ ) {
			expect( p.getChild( i ).hasAttribute( attrKey ) ).to.equal( !!expectedHas[ i ] );
		}
	} );
} );

describe( 'checkEnabled', () => {
	beforeEach( () => {
		root.insertChildren( 0, [
			new Element( 'p', [], [
				'foo',
				new Element( 'img' ),
				new Element( 'img' ),
				'bar'
			] ),
			new Element( 'div' ),
			new Element( 'p' )
		] );
	} );

	describe( 'when selection is collapsed', () => {
		it( 'should return true if characters with the attribute can be placed at caret position', () => {
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 1 ] ) ) ] );
			expect( command.checkEnabled() ).to.be.true;
		} );

		it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 0 ] ) ) ] );
			expect( command.checkEnabled() ).to.be.false;

			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 2 ] ) ) ] );
			expect( command.checkEnabled() ).to.be.false;
		} );
	} );

	describe( 'when selection is not collapsed', () => {
		it( 'should return true if there is at least one node in selection that can have the attribute', () => {
			// Simple selection on a few characters.
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 3 ] ) ) ] );
			expect( command.checkEnabled() ).to.be.true;

			// Selection spans over characters but also include nodes that can't have attribute.
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 6 ] ) ) ] );
			expect( command.checkEnabled() ).to.be.true;

			// Selection on whole root content. Characters in P can have an attribute so it's valid.
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ) ] );
			expect( command.checkEnabled() ).to.be.true;

			// Selection on empty P. P can have the attribute.
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 3 ] ) ) ] );
			expect( command.checkEnabled() ).to.be.true;
		} );

		it( 'should return false if there are no nodes in selection that can have the attribute', () => {
			// Selection on DIV which can't have bold text.
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) ) ] );
			expect( command.checkEnabled() ).to.be.false;

			// Selection on two images which can't be bold.
			modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 5 ] ) ) ] );
			expect( command.checkEnabled() ).to.be.false;
		} );
	} );

	it( 'should return false if selection has no ranges', () => {
		modelDoc.selection.removeAllRanges();
		expect( command.checkEnabled() ).to.be.false;
	} );
} );
