/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import UploadcareImageEditFormView from '../../../src/uploadcareimageedit/ui/uploadcareimageeditformview.js';

describe( 'UploadcareImageEditFormView', () => {
	let locale, view;
	const mockCdnUrl = 'https://mock.cdn.url';

	beforeEach( () => {
		locale = new Locale();

		view = new UploadcareImageEditFormView( locale, mockCdnUrl );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'template', () => {
		it( 'should be a div with CSS classes', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-reset_all-excluded' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-uploadcare-form' ) ).to.be.true;
		} );

		it( 'should render `uc-cloud-image-editor` web component with correct attributes', () => {
			const webComponentElement = view.element.firstChild;

			expect( webComponentElement.tagName ).to.equal( 'UC-CLOUD-IMAGE-EDITOR' );
			expect( webComponentElement.classList.contains( 'uc-light' ) ).to.be.true;
			expect( webComponentElement.classList.contains( 'ck-uploadcare-theme' ) ).to.be.true;
			expect( webComponentElement.getAttribute( 'ctx-name' ) ).to.equal( 'image-edit' );
			expect( webComponentElement.getAttribute( 'cdn-url' ) ).to.equal( mockCdnUrl );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the main view element', () => {
			sinon.spy( view.element, 'focus' );

			view.focus();

			expect( view.element.focus.called ).to.be.true;
		} );
	} );
} );
