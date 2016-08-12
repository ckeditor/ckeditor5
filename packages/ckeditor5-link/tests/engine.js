/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import LinkEngine from '/ckeditor5/link/engine.js';
import VirtualTestEditor from '/tests/core/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData } from '/tests/engine/_utils/model.js';
import { getData as getViewData } from '/tests/engine/_utils/view.js';

describe( 'LinkEngine', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor.create( {
				features: [ LinkEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;

				doc.schema.allow( { name: '$text', inside: '$root' } );
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( LinkEngine ) ).to.be.instanceOf( LinkEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.check( { name: '$inline', attributes: [ 'link' ] } ) ).to.be.true;
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert `<a href="url">` to `bold="url"` attribute', () => {
			editor.setData( '<a href="url">foo</a>bar' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<$text link="url">foo</$text>bar' );
			expect( editor.getData() ).to.equal( '<a href="url">foo</a>bar' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( doc, '<$text link="url">foo</$text>bar' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<a href="url">foo</a>bar' );
		} );
	} );
} );
