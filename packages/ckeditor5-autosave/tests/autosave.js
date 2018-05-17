/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
 */

/* globals document */

// import ModelText from '@ckeditor/ckeditor5-engine/src/model/text';
// import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Autosave from '../src/autosave';

describe( 'Autosave', () => {
	const sandbox = sinon.sandbox.create();
	let editor, element, autosave;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: []
			} )
			.then( _editor => {
				editor = _editor;
				autosave = editor.plugins.get( Autosave );
			} );
	} );

	afterEach( () => {
		document.body.removeChild( element );
		sandbox.restore();

		return editor.destroy();
	} );

	it( 'should have static pluginName property', () => {
		expect( Autosave.pluginName ).to.equal( 'Autosave' );
	} );

	describe( 'initialization', () => {
		it( 'should initialize provider with an undefined value', () => {
			expect( autosave.provider ).to.be.undefined;
		} );
	} );
} );
