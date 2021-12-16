/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';

import ImageCaptionEditing from '../../src/imagecaption/imagecaptionediting';
import {
	getCaptionFromImageModelElement,
	matchImageCaptionViewElement
} from '../../src/imagecaption/utils';

describe( 'image captioning utils', () => {
	let editor, view, document;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ImageCaptionEditing ]
		} );

		view = editor.editing.view;
		document = view.document;
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	describe( 'getCaptionFromImageModelElement', () => {
		it( 'should return caption element from image element', () => {
			const dummy = new ModelElement( 'dummy' );
			const caption = new ModelElement( 'caption' );
			const image = new ModelElement( 'imageBlock', null, [ dummy, caption ] );

			expect( getCaptionFromImageModelElement( image ) ).to.equal( caption );
		} );

		it( 'should return null when caption element is not present', () => {
			const image = new ModelElement( 'imageBlock' );

			expect( getCaptionFromImageModelElement( image ) ).to.be.null;
		} );
	} );

	describe( 'matchImageCaptionViewElement', () => {
		it( 'should return null for element that is not a figcaption', () => {
			const element = new ViewElement( document, 'div' );

			expect( matchImageCaptionViewElement( editor.plugins.get( 'ImageUtils' ), element ) ).to.be.null;
		} );

		it( 'should return null if figcaption has no parent', () => {
			const element = new ViewElement( document, 'figcaption' );

			expect( matchImageCaptionViewElement( editor.plugins.get( 'ImageUtils' ), element ) ).to.be.null;
		} );

		it( 'should return null if figcaption\'s parent is not a figure', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'div', null, element ); // eslint-disable-line no-new

			expect( matchImageCaptionViewElement( editor.plugins.get( 'ImageUtils' ), element ) ).to.be.null;
		} );

		it( 'should return null if parent has no image class', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'figure', null, element ); // eslint-disable-line no-new

			expect( matchImageCaptionViewElement( editor.plugins.get( 'ImageUtils' ), element ) ).to.be.null;
		} );

		it( 'should return object if element is a valid caption', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'figure', { class: 'image' }, element ); // eslint-disable-line no-new

			expect( matchImageCaptionViewElement( editor.plugins.get( 'ImageUtils' ), element ) ).to.deep.equal( { name: true } );
		} );
	} );
} );
