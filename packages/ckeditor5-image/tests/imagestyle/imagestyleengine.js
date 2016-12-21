/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from 'tests/core/_utils/virtualtesteditor.js';
import ImageStyleEngine from 'ckeditor5/image/imagestyle/imagestyleengine.js';
import ImageEngine from 'ckeditor5/image/imageengine.js';
import ImageStyleCommand from 'ckeditor5/image/imagestyle/imagestylecommand.js';
import { getData } from 'ckeditor5/engine/dev-utils/model.js';

describe( 'ImageStyleEngine', () => {
	let editor, document;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ ImageStyleEngine ],
		} )
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageStyleEngine ) ).to.be.instanceOf( ImageStyleEngine );
	} );

	it( 'should load image engine', () => {
		expect( editor.plugins.get( ImageEngine ) ).to.be.instanceOf( ImageEngine );
	} );

	it( 'should set schema rules for image style', () => {
		const schema = document.schema;

		expect( schema.check( { name: 'image', attributes: [ 'imageStyle', 'src' ], inside: '$root' } ) ).to.be.true;
	} );

	it( 'should register command', () => {
		expect( editor.commands.has( 'imagestyle' ) ).to.be.true;
		const command = editor.commands.get( 'imagestyle' );

		expect( command ).to.be.instanceOf( ImageStyleCommand );
	} );

	// TODO: check default configuration.

	it( 'should convert from view to model', () => {
		editor.setData( '<figure class="image image-style-side"><img src="foo.png" /></figure>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<image imageStyle="side" src="foo.png"></image>' );
	} );

	it( 'should not convert from view to model if class is not defined', () => {
		editor.setData( '<figure class="image foo-bar"><img src="foo.png" /></figure>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<image src="foo.png"></image>' );
	} );

	it( 'should not convert from view to model when not in image figure', () => {
		editor.setData( '<figure class="image-style-side"></figure>'  );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '' );
	} );

	it( 'should not convert from view to model if schema prevents it', () => {
		document.schema.disallow( { name: 'image', attributes: 'imageStyle' } );
		editor.setData( '<figure class="image image-style-side"><img src="foo.png" /></figure>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<image src="foo.png"></image>' );
	} );
} );
