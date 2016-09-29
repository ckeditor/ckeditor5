/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import FocusTracker from '/ckeditor5/utils/focustracker.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import testUtils from '/tests/core/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'FocusTracker', () => {
	let focusTracker, container, containerFirstInput, containerSecondInput, inputOuOfContainer;

	beforeEach( () => {
		container = document.createElement( 'div' );
		containerFirstInput = document.createElement( 'input' );
		containerSecondInput = document.createElement( 'input' );
		inputOuOfContainer = document.createElement( 'input' );

		container.appendChild( containerFirstInput );
		container.appendChild( containerSecondInput );
		document.body.appendChild( container );
		document.body.appendChild( inputOuOfContainer );

		testUtils.sinon.useFakeTimers();

		focusTracker = new FocusTracker();
	} );

	afterEach( () => {
		document.body.removeChild( container );
		document.body.removeChild( inputOuOfContainer );
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

				containerFirstInput.focus();

				expect( focusTracker.isFocused ).to.true;
			} );

			it( 'should start listening on element blur and update `isFocused` property', () => {
				focusTracker.add( containerFirstInput );

				containerFirstInput.focus();

				expect( focusTracker.isFocused ).to.true;

				containerSecondInput.focus();
				testUtils.sinon.clock.tick( 0 );

				expect( focusTracker.isFocused ).to.false;
			} );
		} );

		describe( 'container element', () => {
			it( 'should start listening on element focus using event capturing and update `isFocused` property', () => {
				focusTracker.add( container );

				expect( focusTracker.isFocused ).to.false;

				containerFirstInput.focus();

				expect( focusTracker.isFocused ).to.true;
			} );

			it( 'should start listening on element blur using event capturing and update `isFocused` property', () => {
				focusTracker.add( container );

				containerFirstInput.focus();

				expect( focusTracker.isFocused ).to.true;

				inputOuOfContainer.focus();
				testUtils.sinon.clock.tick( 0 );

				expect( focusTracker.isFocused ).to.false;
			} );

			it( 'should not change `isFocused` property when focus is going between child elements', () => {
				const changeSpy = testUtils.sinon.spy();

				focusTracker.add( container );

				containerFirstInput.focus();

				focusTracker.listenTo( focusTracker, 'change:isFocused', changeSpy );

				expect( focusTracker.isFocused ).to.true;

				containerSecondInput.focus();
				testUtils.sinon.clock.tick( 0 );

				expect( focusTracker.isFocused ).to.true;
				expect( changeSpy.notCalled ).to.true;
			} );
		} );
	} );

	describe( 'remove', () => {
		it( 'should do nothing when element was not added', () => {
			expect( () => {
				focusTracker.remove( container );
			} ).to.not.throw();
		} );

		it( 'should stop listening on element focus and update `isFocused` property', () => {
			focusTracker.add( containerFirstInput );
			focusTracker.remove( containerFirstInput );

			containerFirstInput.focus();

			expect( focusTracker.isFocused ).to.false;
		} );

		it( 'should blur element before removing when is focused', () => {
			focusTracker.add( containerFirstInput );
			containerFirstInput.focus();

			expect( focusTracker.isFocused ).to.true;

			focusTracker.remove( containerFirstInput );
			testUtils.sinon.clock.tick( 0 );

			expect( focusTracker.isFocused ).to.false;
		} );
	} );
} );
