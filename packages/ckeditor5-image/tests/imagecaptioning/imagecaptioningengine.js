/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageCaptioningEngine from '../../src/imagecaptioning/imagecaptioningengine';

describe( 'ImageCaptioningEngine', () => {
	let editor, document, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ ImageCaptioningEngine ]
		} )
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				viewDocument = editor.editing.view;
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageCaptioningEngine ) ).to.be.instanceOf( ImageCaptioningEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( document.schema.check( { name: 'caption', iniside: 'image' } ) ).to.be.true;
		expect( document.schema.check( { name: '$inline', inside: 'caption' } ) ).to.be.true;
	} );
} );
