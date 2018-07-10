/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, FocusEvent */

import FocusTracker from '../src/focustracker';
import CKEditorError from '../src/ckeditorerror';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'FocusTracker', () => {
	let focusTracker, container, containerFirstInput, containerSecondInput;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		container = document.createElement( 'div' );
		containerFirstInput = document.createElement( 'input' );
		containerSecondInput = document.createElement( 'input' );

		container.appendChild( containerFirstInput );
		container.appendChild( containerSecondInput );

		testUtils.sinon.useFakeTimers();

		focusTracker = new FocusTracker();
	} );

	describe( 'constructor', () => {
		describe( 'isFocused', () => {
			it( 'should be false at default', () => {
				expect( focusTracker.isFocused ).to.false;
			} );

			it( 'should be observable', () => {
				const observableSpy = testUtils.sinon.spy();

				focusTracker.listenTo( focusTracker, 'change:isFocused', observableSpy );

				focusTracker.isFocused = true;

				expect( observableSpy.calledOnce ).to.true;
			} );
		} );
	} );

	describe( 'add', () => {
		it( 'should throw an error when element has been already added', () => {
			focusTracker.add( containerFirstInput );

			expect( () => {
				focusTracker.add( containerFirstInput );
			} ).to.throw( CKEditorError, /focusTracker-add-element-already-exist/ );
		} );

		describe( 'single element', () => {
			it( 'should start listening on element focus and update `isFocused` property', () => {
				focusTracker.add( containerFirstInput );

				expect( focusTracker.isFocused ).to.false;

				containerFirstInput.dispatchEvent( new FocusEvent( 'focus' ) );

				expect( focusTracker.isFocused ).to.true;
			} );

			it( 'should start listening on element blur and update `isFocused` property', () => {
				focusTracker.add( containerFirstInput );
				focusTracker.isFocused = true;

				containerFirstInput.dispatchEvent( new FocusEvent( 'blur' ) );

				expect( focusTracker.isFocused ).to.false;
			} );
		} );

		describe( 'container element', () => {
			it( 'should start listening on element focus using event capturing and update `isFocused` property', () => {
				focusTracker.add( container );

				expect( focusTracker.isFocused ).to.false;

				containerFirstInput.dispatchEvent( new FocusEvent( 'focus' ) );

				expect( focusTracker.isFocused ).to.true;
			} );

			it( 'should start listening on element blur using event capturing and update `isFocused` property', () => {
				focusTracker.add( container );
				focusTracker.isFocused = true;

				containerFirstInput.dispatchEvent( new FocusEvent( 'blur' ) );

				expect( focusTracker.isFocused ).to.false;
			} );

			it( 'should not change `isFocused` property when focus is going between child elements', () => {
				const changeSpy = testUtils.sinon.spy();

				focusTracker.add( container );

				containerFirstInput.dispatchEvent( new FocusEvent( 'focus' ) );

				focusTracker.listenTo( focusTracker, 'change:isFocused', changeSpy );

				expect( focusTracker.isFocused ).to.true;

				containerFirstInput.dispatchEvent( new FocusEvent( 'blur', {
					relatedTarget: containerSecondInput
				} ) );

				containerSecondInput.dispatchEvent( new FocusEvent( 'focus' ) );

				expect( focusTracker.isFocused ).to.true;
				expect( changeSpy.notCalled ).to.true;
			} );

			// https://github.com/ckeditor/ckeditor5-utils/issues/159
			it( 'should keep `isFocused` synced when multiple blur events are followed by the focus', () => {
				focusTracker.add( container );
				focusTracker.isFocused = true;

				container.dispatchEvent( new FocusEvent( 'blur' ) );
				containerFirstInput.dispatchEvent( new FocusEvent( 'blur' ) );
				containerSecondInput.dispatchEvent( new FocusEvent( 'focus' ) );

				expect( focusTracker.isFocused ).to.be.true;
			} );
		} );
	} );

	describe( 'remove', () => {
		it( 'should do nothing when element was not added', () => {
			expect( () => {
				focusTracker.remove( container );
			} ).to.not.throw();
		} );

		it( 'should stop listening on element focus', () => {
			focusTracker.add( containerFirstInput );
			focusTracker.remove( containerFirstInput );

			containerFirstInput.dispatchEvent( new FocusEvent( 'focus' ) );

			expect( focusTracker.isFocused ).to.false;
		} );

		it( 'should stop listening on element blur', () => {
			focusTracker.add( containerFirstInput );
			focusTracker.remove( containerFirstInput );
			focusTracker.isFocused = true;

			containerFirstInput.dispatchEvent( new FocusEvent( 'blur' ) );

			expect( focusTracker.isFocused ).to.true;
		} );

		it( 'should blur element before removing when is focused', () => {
			focusTracker.add( containerFirstInput );
			containerFirstInput.dispatchEvent( new FocusEvent( 'focus' ) );

			expect( focusTracker.isFocused ).to.true;

			focusTracker.remove( containerFirstInput );

			expect( focusTracker.isFocused ).to.false;
		} );
	} );
} );
