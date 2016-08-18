/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '/ckeditor5/engine/model/document.js';
import isAttributeAllowedInSelection from '/ckeditor5/core/command/helpers/isattributeallowedinselection.js';
import { setData } from '/tests/engine/_utils/model.js';

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
	} );

	describe( 'when selection is collapsed', () => {
		it( 'should return true if characters with the attribute can be placed at caret position', () => {
			setData( document, '<p>f[]oo</p>' );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.true;
		} );

		it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
			setData( document, '<h1>[]</h1>' );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.false;

			setData( document, '[]' );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.false;
		} );
	} );

	describe( 'when selection is not collapsed', () => {
		it( 'should return true if there is at least one node in selection that can have the attribute', () => {
			// Simple selection on a few characters.
			setData( document, '<p>[foo]</p>' );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.true;

			// Selection spans over characters but also include nodes that can't have attribute.
			setData( document, '<p>fo[o<img />b]ar</p>' );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.true;

			// Selection on whole root content. Characters in P can have an attribute so it's valid.
			setData( document, '[<p>foo<img />bar</p><h1></h1>]' );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.true;

			// Selection on empty P. P can have the attribute.
			setData( document, '[<p></p>]' );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.true;
		} );

		it( 'should return false if there are no nodes in selection that can have the attribute', () => {
			// Selection on DIV which can't have bold text.
			setData( document, '[<h1></h1>]' );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.false;

			// Selection on two images which can't be bold.
			setData( document, '<p>foo[<img /><img />]bar</p>' );
			expect( isAttributeAllowedInSelection( attribute, document.selection, document.schema ) ).to.be.false;
		} );
	} );
} );
