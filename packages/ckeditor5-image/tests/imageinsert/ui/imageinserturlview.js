/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview.js';

import ImageInsertUrlView from '../../../src/imageinsert/ui/imageinserturlview.js';

import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview.js';

describe( 'ImageInsertUrlView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new ImageInsertUrlView( { t: val => val } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have #imageURLInputValue', () => {
			expect( view.imageURLInputValue ).to.equal( '' );
		} );

		it( 'should have #isImageSelected', () => {
			expect( view.isImageSelected ).to.be.false;
		} );

		it( 'should have #isEnabled', () => {
			expect( view.isEnabled ).to.be.true;
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );
	} );

	describe( 'template', () => {
		it( 'should create element from the template', () => {
			expect( view.element.tagName ).to.equal( 'FORM' );
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-image-insert-url' ) ).to.true;

			const childNodes = view.element.childNodes;

			expect( childNodes[ 0 ] ).to.equal( view.urlInputView.element );
			expect( childNodes[ 1 ].tagName ).to.equal( 'DIV' );
			expect( childNodes[ 1 ].classList.contains( 'ck' ) ).to.be.true;
			expect( childNodes[ 1 ].classList.contains( 'ck-image-insert-url__action-row' ) ).to.be.true;
		} );

		it( 'should use dedicated views', () => {
			expect( view.template.children[ 0 ] ).to.equal( view.urlInputView );
			expect( view.template.children[ 1 ].children[ 0 ] ).to.equal( view.insertButtonView );
			expect( view.template.children[ 1 ].children[ 1 ] ).to.equal( view.cancelButtonView );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( view.keystrokes, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the url input', () => {
			const spy = sinon.spy( view.urlInputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( '#urlInputView', () => {
		it( 'should be an instance of the LabeledFieldView', () => {
			expect( view.urlInputView ).to.be.instanceOf( LabeledFieldView );
		} );

		it( 'should accept text', () => {
			expect( view.urlInputView.fieldView ).to.be.instanceOf( InputTextView );
		} );

		it( 'should bind label to #isImageSelected', () => {
			view.isImageSelected = false;

			expect( view.urlInputView.label ).to.equal( 'Insert image via URL' );

			view.isImageSelected = true;

			expect( view.urlInputView.label ).to.equal( 'Update image URL' );
		} );

		it( 'should bind isEnabled to #isEnabled', () => {
			view.isEnabled = false;

			expect( view.urlInputView.isEnabled ).to.be.false;

			view.isEnabled = true;

			expect( view.urlInputView.isEnabled ).to.be.true;
		} );

		it( 'should set placeholder', () => {
			expect( view.urlInputView.placeholder ).to.equal( 'https://example.com/image.png' );
			expect( view.urlInputView.fieldView.placeholder ).to.equal( 'https://example.com/image.png' );
		} );

		it( 'should bind value to #imageURLInputValue', () => {
			view.imageURLInputValue = 'abc';

			expect( view.urlInputView.fieldView.value ).to.equal( 'abc' );

			view.imageURLInputValue = null;

			expect( view.urlInputView.fieldView.value ).to.equal( '' );
		} );

		it( 'should be bound with #imageURLInputValue', () => {
			view.urlInputView.fieldView.element.value = 'abc';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( 'abc' );

			view.urlInputView.fieldView.element.value = 'xyz';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( 'xyz' );
		} );

		it( 'should trim input value', () => {
			view.urlInputView.fieldView.element.value = '   ';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( '' );

			view.urlInputView.fieldView.element.value = '   test   ';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( 'test' );
		} );
	} );
} );
