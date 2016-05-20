/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import BoldEngine from '/ckeditor5/basic-styles/boldengine.js';
import Editor from '/ckeditor5/editor.js';
import StandardCreator from '/ckeditor5/creator/standardcreator.js';
import { getData } from '/tests/engine/_utils/model.js';
import BuildModelConverterFor from '/ckeditor5/engine/conversion/model-converter-builder.js';
import BuildViewConverterFor from '/ckeditor5/engine/conversion/view-converter-builder.js';

describe( 'BoldEngine', () => {
	let editor, document;

	beforeEach( () => {
		editor = new Editor( null, {
			creator: StandardCreator,
			features: [ BoldEngine ]
		} );

		return editor.init().then( () => {
			document = editor.document;
			document.createRoot( 'main' );

			// Register some block element for tests.
			document.schema.registerItem( 'p', '$block' );

			// Build converter from model to view for data and editing pipelines.
			BuildModelConverterFor( editor.data.modelToView )
				.fromElement( 'p' )
				.toElement( 'p' );

			// Build converter from view to model for data and editing pipelines.
			BuildViewConverterFor( editor.data.viewToModel )
				.fromElement( 'p' )
				.toElement( 'p' );
		} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( BoldEngine ) ).to.be.instanceOf( BoldEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( document.schema.check( { name: '$inline', attributes: [ 'bold' ], inside: '$block' } ) ).to.be.true;
	} );

	it( 'should convert <strong> to bold attribute', () => {
		editor.setData( '<p><strong>foobar</strong></p>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<p><$text bold=true>foobar</$text></p>' );
		expect( editor.getData() ).to.equal( '<p><strong>foobar</strong></p>' );
	} );

	it( 'should convert <b> to bold attribute', () => {
		editor.setData( '<p><b>foobar</b></p>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<p><$text bold=true>foobar</$text></p>' );
		expect( editor.getData() ).to.equal( '<p><strong>foobar</strong></p>' );
	} );

	it( 'should convert font-weight:bold to bold attribute', () => {
		editor.setData( '<p style="font-weight: bold;">foobar</p>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<p><$text bold=true>foobar</$text></p>' );
		expect( editor.getData() ).to.equal( '<p><strong>foobar</strong></p>' );
	} );
} );
