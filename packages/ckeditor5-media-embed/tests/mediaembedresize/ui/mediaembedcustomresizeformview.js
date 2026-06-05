/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import { ButtonView, LabeledFieldView } from '@ckeditor/ckeditor5-ui';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { MediaEmbedCustomResizeFormView } from '../../../src/mediaembedresize/ui/mediaembedcustomresizeformview.js';

describe( 'MediaEmbedCustomResizeFormView', () => {
	let view, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();

		view = new MediaEmbedCustomResizeFormView( locale, '%', [
			form => {
				if ( !form.rawSize || form.rawSize.trim() === '' ) {
					return 'The value must not be empty.';
				}

				if ( form.parsedSize === null ) {
					return 'The value should be a plain number.';
				}
			}
		] );

		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.destroy();
		view.element.remove();
	} );

	it( 'should render as a form element', () => {
		expect( view.element.tagName ).to.equal( 'FORM' );
	} );

	it( 'should have the `ck-media-embed-custom-resize-form` CSS class', () => {
		expect( view.element.classList.contains( 'ck-media-embed-custom-resize-form' ) ).to.be.true;
	} );

	it( 'should have unit set from constructor', () => {
		expect( view.unit ).to.equal( '%' );
	} );

	describe( 'backButtonView', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( view.backButtonView ).to.be.instanceof( ButtonView );
		} );

		it( 'should delegate execute to cancel event', () => {
			const spy = sinon.spy();

			view.on( 'cancel', spy );
			view.backButtonView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'saveButtonView', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( view.saveButtonView ).to.be.instanceof( ButtonView );
		} );

		it( 'should fire submit event on form submit', () => {
			const spy = sinon.spy();

			view.on( 'submit', spy );
			view.element.dispatchEvent( new Event( 'submit' ) );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'labeledInput', () => {
		it( 'should be an instance of LabeledFieldView', () => {
			expect( view.labeledInput ).to.be.instanceof( LabeledFieldView );
		} );

		it( 'should have the label "Resize media (in %)"', () => {
			expect( view.labeledInput.label ).to.equal( 'Resize media (in %)' );
		} );
	} );

	describe( 'rawSize getter', () => {
		it( 'should return the value from the input element', () => {
			view.labeledInput.fieldView.element.value = '42';
			expect( view.rawSize ).to.equal( '42' );
		} );

		it( 'should return null when the input element is null', () => {
			sinon.stub( view.labeledInput.fieldView, 'element' ).get( () => null );
			expect( view.rawSize ).to.be.null;
		} );
	} );

	describe( 'parsedSize getter', () => {
		it( 'should return a number for valid input', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = '42.5';
			expect( view.parsedSize ).to.equal( 42.5 );
		} );

		it( 'should return null when rawSize is null', () => {
			sinon.stub( view, 'rawSize' ).get( () => null );
			expect( view.parsedSize ).to.be.null;
		} );

		it( 'should return null for non-numeric input', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = 'abc';
			expect( view.parsedSize ).to.be.null;
		} );
	} );

	describe( 'sizeWithUnits getter', () => {
		it( 'should return size with unit suffix', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = '50';
			expect( view.sizeWithUnits ).to.equal( '50%' );
		} );

		it( 'should return null for non-numeric input', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = 'abc';
			expect( view.sizeWithUnits ).to.be.null;
		} );
	} );

	describe( 'isValid()', () => {
		it( 'should return false for empty value', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = '';
			expect( view.isValid() ).to.be.false;
			expect( view.labeledInput.errorText ).to.equal( 'The value must not be empty.' );
		} );

		it( 'should return false for non-numeric value', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = 'abc';
			expect( view.isValid() ).to.be.false;
			expect( view.labeledInput.errorText ).to.equal( 'The value should be a plain number.' );
		} );

		it( 'should return true for valid numeric value', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = '50';
			expect( view.isValid() ).to.be.true;
			expect( view.labeledInput.errorText ).to.be.null;
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'should clear the error text', () => {
			view.labeledInput.errorText = 'Some error';
			view.resetFormStatus();
			expect( view.labeledInput.errorText ).to.be.null;
		} );
	} );

	describe( 'Esc key handling', () => {
		it( 'should fire cancel event on Esc', () => {
			const spy = sinon.spy();

			view.on( 'cancel', spy );

			const keyEvtData = {
				keyCode: 27, // Esc
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			view.keystrokes.press( keyEvtData );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'focus tracker', () => {
		it( 'should track focus on back button, input, and save button', () => {
			const trackedElements = [ ...view.focusTracker._elements ];

			expect( trackedElements ).to.include( view.backButtonView.element );
			expect( trackedElements ).to.include( view.labeledInput.element );
			expect( trackedElements ).to.include( view.saveButtonView.element );
		} );
	} );
} );
