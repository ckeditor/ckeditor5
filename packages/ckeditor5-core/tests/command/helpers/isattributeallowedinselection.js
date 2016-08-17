/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '/ckeditor5/engine/model/document.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';
import Text from '/ckeditor5/engine/model/text.js';
import Element from '/ckeditor5/engine/model/element.js';
import isAttributeAllowedInSelection from '/ckeditor5/core/command/helpers/isattributeallowedinselection.js';

describe( 'isAttributeAllowedInSelection', () => {
	const attribute = 'bold';
	let document, root;

	beforeEach( () => {
		document = new Document();
		root = document.createRoot();

		document.schema.registerItem( 'p', '$block' );
		document.schema.registerItem( 'h1', '$block' );
		document.schema.registerItem( 'img', '$inline' );

		// Bold text is allowed only in P.
		document.schema.allow( { name: '$text', attributes: 'bold', inside: 'p' } );
		document.schema.allow( { name: 'p', attributes: 'bold', inside: '$root' } );

		// Disallow bold on image.
		document.schema.disallow( { name: 'img', attributes: 'bold', inside: '$root' } );

		root.insertChildren( 0, [
			new Element( 'p', [], [
				new Text( 'foo' ),
				new Element( 'img' ),
				new Element( 'img' ),
				new Text( 'bar' )
			] ),
			new Element( 'h1' ),
			new Element( 'p' )
		] );
	} );

	describe( 'when selection is collapsed', () => {
		it( 'should return true if characters with the attribute can be placed at caret position', () => {
			document.selection.setRanges( [ new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 1 ] ) ) ] );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.true;
		} );

		it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
			document.selection.setRanges( [ new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 0 ] ) ) ] );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.false;

			document.selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 2 ] ) ) ] );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.false;
		} );
	} );

	describe( 'when selection is not collapsed', () => {
		it( 'should return true if there is at least one node in selection that can have the attribute', () => {
			// Simple selection on a few characters.
			document.selection.setRanges( [ new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 3 ] ) ) ] );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.true;

			// Selection spans over characters but also include nodes that can't have attribute.
			document.selection.setRanges( [ new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 6 ] ) ) ] );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.true;

			// Selection on whole root content. Characters in P can have an attribute so it's valid.
			document.selection.setRanges( [ new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ) ] );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.true;

			// Selection on empty P. P can have the attribute.
			document.selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 3 ] ) ) ] );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.true;
		} );

		it( 'should return false if there are no nodes in selection that can have the attribute', () => {
			// Selection on DIV which can't have bold text.
			document.selection.setRanges( [ new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) ) ] );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.false;

			// Selection on two images which can't be bold.
			document.selection.setRanges( [ new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 5 ] ) ) ] );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.false;
		} );
	} );
} );
