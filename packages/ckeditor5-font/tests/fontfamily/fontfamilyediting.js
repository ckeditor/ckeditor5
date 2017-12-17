/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontFamilyEditing from './../../src/fontfamily/fontfamilyediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

describe( 'FontFamilyEditing', () => {
	let editor;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ FontFamilyEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should set proper schema rules', () => {
		expect( editor.model.schema.check( { name: '$inline', attributes: 'fontFamily', inside: '$block' } ) ).to.be.true;
		expect( editor.model.schema.check( { name: '$inline', attributes: 'fontFamily', inside: '$clipboardHolder' } ) ).to.be.true;
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				expect( editor.config.get( 'fontFamily.items' ) ).to.deep.equal( [
					'default',
					'Arial, Helvetica, sans-serif',
					'Courier New, Courier, monospace'
				] );
			} );
		} );
	} );
} );
