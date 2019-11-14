/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from './_utils/utils';
import VirtualTestEditor from './_utils/virtualtesteditor';

import RestrictedDocument from './../src/restricteddocument';

describe( 'RestrictedDocument', () => {
	let editor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( { plugins: [ RestrictedDocument ] } )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( RestrictedDocument.pluginName ).to.equal( 'RestrictedDocument' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( 'RestrictedDocument' ) ).to.be.instanceOf( RestrictedDocument );
	} );

	it( 'should set proper schema rules', () => {
		const model = editor.model;

		expect( model.schema.checkAttribute( [ '$root', '$text' ], 'nonRestricted' ) ).to.be.true;

		expect( model.schema.checkAttribute( [ '$block', '$text' ], 'nonRestricted' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'nonRestricted' ) ).to.be.true;

		expect( model.schema.checkAttribute( [ '$block' ], 'nonRestricted' ) ).to.be.false;
	} );
} );
