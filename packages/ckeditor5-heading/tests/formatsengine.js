/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import FormatsEngine from '/ckeditor5/formats/formatsengine.js';
import Paragraph from '/ckeditor5/paragraph/paragraph.js';
import Editor from '/ckeditor5/editor.js';
import StandardCreator from '/ckeditor5/creator/standardcreator.js';
import { getData } from '/tests/engine/_utils/model.js';

describe( 'FormatsEngine', () => {
	let editor, document;

	beforeEach( () => {
		editor = new Editor( null, {
			creator: StandardCreator,
			features: [ FormatsEngine ]
		} );

		return editor.init().then( () => {
			document = editor.document;
			document.createRoot( 'main' );
		} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( FormatsEngine ) ).to.be.instanceOf( FormatsEngine );
	} );

	it( 'should load paragraph feature', () => {
		expect( editor.plugins.get( Paragraph ) ).to.be.instanceOf( Paragraph );
	} );

	it( 'should set proper schema rules', () => {
		expect( document.schema.hasItem( 'heading1' ) ).to.be.true;
		expect( document.schema.hasItem( 'heading2' ) ).to.be.true;
		expect( document.schema.hasItem( 'heading3' ) ).to.be.true;

		expect( document.schema.check( { name: 'heading1', inside: '$root' } ) ).to.be.true;
		expect( document.schema.check( { name: '$inline', inside: 'heading1' } ) ).to.be.true;

		expect( document.schema.check( { name: 'heading2', inside: '$root' } ) ).to.be.true;
		expect( document.schema.check( { name: '$inline', inside: 'heading2' } ) ).to.be.true;

		expect( document.schema.check( { name: 'heading3', inside: '$root' } ) ).to.be.true;
		expect( document.schema.check( { name: '$inline', inside: 'heading3' } ) ).to.be.true;
	} );

	// it( 'should convert heading1', () => {
	// 	editor.setData( '<h2>foobar</h2>' );
	//
	// 	expect( getData( document, { withoutSelection: true } ) ).to.equal( '<heading1>foobar</heading1>' );
	// 	expect( editor.getData() ).to.equal( '<h2>foobar</h2>' );
	// } );

	// it( 'should convert heading2', () => {
	// 	editor.setData( '<h3>foobar</h3>' );
	//
	// 	expect( getData( document, { withoutSelection: true } ) ).to.equal( '<heading2>foobar</heading2>' );
	// 	expect( editor.getData() ).to.equal( '<h3>foobar</h3>' );
	// } );
	//
	// it( 'should convert heading3', () => {
	// 	editor.setData( '<h4>foobar</h4>' );
	//
	// 	expect( getData( document, { withoutSelection: true } ) ).to.equal( '<heading3>foobar</heading3>' );
	// 	expect( editor.getData() ).to.equal( '<h4>foobar</h4>' );
	// } );
} );
