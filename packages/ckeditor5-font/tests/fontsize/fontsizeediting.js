/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontSizeEditing from './../../src/fontsize/fontsizeediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

describe( 'FontSizeEditing', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ FontSizeEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.check( { name: '$inline', attributes: 'fontSize', inside: '$block' } ) ).to.be.true;
		expect( doc.schema.check( { name: '$inline', attributes: 'fontSize', inside: '$clipboardHolder' } ) ).to.be.true;
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				expect( editor.config.get( 'fontSize.items' ) ).to.deep.equal( [] );
			} );
		} );
	} );
} );
