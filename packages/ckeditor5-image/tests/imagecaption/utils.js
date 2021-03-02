/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import View from '@ckeditor/ckeditor5-engine/src/view/view';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import {
	getCaptionFromImageModelElement,
	matchImageCaptionViewElement
} from '../../src/imagecaption/utils';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';

describe( 'image captioning utils', () => {
	let view, document;

	beforeEach( () => {
		view = new View();
		document = view.document;
	} );

	describe( 'getCaptionFromImageModelElement', () => {
		it( 'should return caption element from image element', () => {
			const dummy = new ModelElement( 'dummy' );
			const caption = new ModelElement( 'caption' );
			const image = new ModelElement( 'image', null, [ dummy, caption ] );

			expect( getCaptionFromImageModelElement( image ) ).to.equal( caption );
		} );

		it( 'should return null when caption element is not present', () => {
			const image = new ModelElement( 'image' );

			expect( getCaptionFromImageModelElement( image ) ).to.be.null;
		} );
	} );

	describe( 'matchImageCaptionViewElement', () => {
		it( 'should return null for element that is not a figcaption', () => {
			const element = new ViewElement( document, 'div' );

			expect( matchImageCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return null if figcaption has no parent', () => {
			const element = new ViewElement( document, 'figcaption' );

			expect( matchImageCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return null if figcaption\'s parent is not a figure', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'div', null, element ); // eslint-disable-line no-new

			expect( matchImageCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return null if parent has no image class', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'figure', null, element ); // eslint-disable-line no-new

			expect( matchImageCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return object if element is a valid caption', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'figure', { class: 'image' }, element ); // eslint-disable-line no-new

			expect( matchImageCaptionViewElement( element ) ).to.deep.equal( { name: true } );
		} );
	} );
} );
