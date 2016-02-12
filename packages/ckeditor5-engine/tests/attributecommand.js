/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/core/editor.js';
import AttributeCommand from '/ckeditor5/core/attributecommand.js';
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
	root = modelDoc.createRoot( 'root' );

	command = new AttributeCommand( editor, attrKey );
} );

describe( 'value', () => {
	it( 'should be set to true or false basing on selection attribute', () => {
		modelDoc.selection.setAttribute( attrKey, true );
		expect( command.value ).to.be.true;

		modelDoc.selection.removeAttribute( attrKey );
		expect( command.value ).to.be.false;
	} );
} );

describe( 'execute', () => {
	beforeEach( () => {
		let attrs = {};
		attrs[ attrKey ] = true;

		root.insertChildren( 0, [ 'abc', new Text( 'foobar', attrs ), 'xyz' ] );
	} );

	it( 'should add attribute on selected nodes if the command value was false', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 1 ] ), new Position( root, [ 5 ] ) ) );

		expect( command.value ).to.be.false;

		command.execute();

		expect( command.value ).to.be.true;
		expect( root.getChild( 1 ).hasAttribute( attrKey ) ).to.be.true;
		expect( root.getChild( 2 ).hasAttribute( attrKey ) ).to.be.true;
	} );

	it( 'should remove attribute from selected nodes if the command value was true', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 3 ] ), new Position( root, [ 6 ] ) ) );

		expect( command.value ).to.be.true;

		command.execute();

		expect( command.value ).to.be.false;
		expect( root.getChild( 3 ).hasAttribute( attrKey ) ).to.be.false;
		expect( root.getChild( 4 ).hasAttribute( attrKey ) ).to.be.false;
		expect( root.getChild( 5 ).hasAttribute( attrKey ) ).to.be.false;
	} );

	it( 'should add attribute on selected nodes if execute parameter was set to true', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 7 ] ), new Position( root, [ 10 ] ) ) );

		expect( command.value ).to.be.true;

		command.execute( true );

		expect( command.value ).to.be.true;
		expect( root.getChild( 9 ).hasAttribute( attrKey ) ).to.be.true;
	} );

	it( 'should remove attribute on selected nodes if execute parameter was set to false', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 1 ] ), new Position( root, [ 5 ] ) ) );

		expect( command.value ).to.be.false;

		command.execute( false );

		expect( command.value ).to.be.false;
		expect( root.getChild( 3 ).hasAttribute( attrKey ) ).to.be.false;
		expect( root.getChild( 4 ).hasAttribute( attrKey ) ).to.be.false;
	} );

	it( 'should change selection attribute if selection is collapsed and is not at the beginning of node', () => {
		modelDoc.selection.addRange( new Range( new Position( root, [ 1 ] ), new Position( root, [ 1 ] ) ) );

		expect( command.value ).to.be.false;

		command.execute();

		expect( command.value ).to.be.true;
		expect( modelDoc.selection.hasAttribute( 'bold' ) ).to.be.true;

		// It should not save that bold was executed at position ( root, [ 1 ] ).

		// Simulate clicking right arrow key by changing selection ranges.
		modelDoc.selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 2 ] ) ) ] );

		// Get back to previous selection.
		modelDoc.selection.setRanges( [ new Range( new Position( root, [ 1 ] ), new Position( root, [ 1 ] ) ) ] );

		expect( command.value ).to.be.false;
	} );

	it( 'should change selection parent element attribute if selection is collapsed and in empty node', () => {
		root.insertChildren( 0, new Element( 'p' ) );
		modelDoc.selection.addRange( new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 0 ] ) ) );

		expect( command.value ).to.be.false;

		command.execute();

		expect( command.value ).to.be.true;
		expect( root.getChild( 0 ).hasAttribute( 'bold' ) ).to.be.true;

		// It should save that bold was set on selection's parent node.

		// Simulate clicking right arrow key by changing selection ranges.
		modelDoc.selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 2 ] ) ) ] );

		// Get back to previous selection.
		modelDoc.selection.setRanges( [ new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 0 ] ) ) ] );

		expect( command.value ).to.be.true;
	} );
} );
