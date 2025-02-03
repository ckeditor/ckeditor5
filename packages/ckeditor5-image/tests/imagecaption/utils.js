/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element.js';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element.js';

import ImageCaptionEditing from '../../src/imagecaption/imagecaptionediting.js';
import ImageCaptionUtils from '../../src/imagecaption/imagecaptionutils.js';

describe( 'image captioning utils', () => {
	let editor, view, document, imageCaptionUtils;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ImageCaptionEditing ]
		} );

		view = editor.editing.view;
		document = view.document;

		imageCaptionUtils = editor.plugins.get( ImageCaptionUtils );
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageCaptionUtils.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageCaptionUtils.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be a plugin loaded by the ImageCaptionEditing', () => {
		expect( editor.plugins.get( 'ImageCaptionUtils' ) ).to.be.instanceOf( ImageCaptionUtils );
	} );

	describe( 'getCaptionFromImageModelElement()', () => {
		it( 'should return caption element from image element', () => {
			const dummy = new ModelElement( 'dummy' );
			const caption = new ModelElement( 'caption' );
			const image = new ModelElement( 'imageBlock', null, [ dummy, caption ] );

			expect( imageCaptionUtils.getCaptionFromImageModelElement( image ) ).to.equal( caption );
		} );

		it( 'should return null when caption element is not present', () => {
			const image = new ModelElement( 'imageBlock' );

			expect( imageCaptionUtils.getCaptionFromImageModelElement( image ) ).to.be.null;
		} );
	} );

	describe( 'matchImageCaptionViewElement()', () => {
		it( 'should return null for element that is not a figcaption', () => {
			const element = new ViewElement( document, 'div' );

			expect( imageCaptionUtils.matchImageCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return null if figcaption has no parent', () => {
			const element = new ViewElement( document, 'figcaption' );

			expect( imageCaptionUtils.matchImageCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return null if figcaption\'s parent is not a figure', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'div', null, element ); // eslint-disable-line no-new

			expect( imageCaptionUtils.matchImageCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return null if parent has no image class', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'figure', null, element ); // eslint-disable-line no-new

			expect( imageCaptionUtils.matchImageCaptionViewElement( element ) ).to.be.null;
		} );

		it( 'should return object if element is a valid caption', () => {
			const element = new ViewElement( document, 'figcaption' );
			new ViewElement( document, 'figure', { class: 'image' }, element ); // eslint-disable-line no-new

			expect( imageCaptionUtils.matchImageCaptionViewElement( element ) ).to.deep.equal( { name: true } );
		} );
	} );
} );
