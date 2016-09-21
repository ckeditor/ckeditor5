/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import FocusManager from '/ckeditor5/utils/focusmanager.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import testUtils from '/tests/core/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'FocusManager', () => {
	let focusManager, container, containerFirstInput, containerSecondInput, inputOuOfContainer;

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

		focusManager = new FocusManager();
	} );

	afterEach( () => {
		document.body.removeChild( container );
		document.body.removeChild( inputOuOfContainer );
	} );

	describe( 'constructor', () => {
		describe( 'isFocused', () => {
			it( 'should be false at default', () => {
				expect( focusManager.isFocused ).to.false;
			} );

			it( 'should be observable', () => {
				const observableSpy = testUtils.sinon.spy();

				focusManager.listenTo( focusManager, 'change:isFocused', observableSpy );

				focusManager.isFocused = true;

				expect( observableSpy.calledOnce ).to.true;
			} );
		} );
	} );

	describe( 'add', () => {
		it( 'should throw an error when element has been already added', () => {
			focusManager.add( containerFirstInput );

			expect( () => {
				focusManager.add( containerFirstInput );
			} ).to.throw( CKEditorError, /focusManager-add-element-already-exist/ );
		} );

		describe( 'single element', () => {
			it( 'should start listening on element focus and update `isFocused` property', () => {
				focusManager.add( containerFirstInput );

				expect( focusManager.isFocused ).to.false;

				containerFirstInput.focus();

				expect( focusManager.isFocused ).to.true;
			} );

			it( 'should start listening on element blur and update `isFocused` property', () => {
				focusManager.add( containerFirstInput );

				containerFirstInput.focus();

				expect( focusManager.isFocused ).to.true;

				containerSecondInput.focus();
				testUtils.sinon.clock.tick( 0 );

				expect( focusManager.isFocused ).to.false;
			} );
		} );

		describe( 'container element', () => {
			it( 'should start listening on element focus using event capturing and update `isFocused` property', () => {
				focusManager.add( container );

				expect( focusManager.isFocused ).to.false;

				containerFirstInput.focus();

				expect( focusManager.isFocused ).to.true;
			} );

			it( 'should start listening on element blur using event capturing and update `isFocused` property', () => {
				focusManager.add( container );

				containerFirstInput.focus();

				expect( focusManager.isFocused ).to.true;

				inputOuOfContainer.focus();
				testUtils.sinon.clock.tick( 0 );

				expect( focusManager.isFocused ).to.false;
			} );

			it( 'should not change `isFocused` property when focus is going between child elements', () => {
				const changeSpy = testUtils.sinon.spy();

				focusManager.add( container );

				containerFirstInput.focus();

				focusManager.listenTo( focusManager, 'change:isFocused', changeSpy );

				expect( focusManager.isFocused ).to.true;

				containerSecondInput.focus();
				testUtils.sinon.clock.tick( 0 );

				expect( focusManager.isFocused ).to.true;
				expect( changeSpy.notCalled ).to.true;
			} );
		} );
	} );

	describe( 'remove', () => {
		it( 'should do nothing when element was not added', () => {
			expect( () => {
				focusManager.remove( container );
			} ).to.not.throw();
		} );

		it( 'should stop listening on element focus and update `isFocused` property', () => {
			focusManager.add( containerFirstInput );
			focusManager.remove( containerFirstInput );

			containerFirstInput.focus();

			expect( focusManager.isFocused ).to.false;
		} );

		it( 'should blur element before removing when is focused', () => {
			focusManager.add( containerFirstInput );
			containerFirstInput.focus();

			expect( focusManager.isFocused ).to.true;

			focusManager.remove( containerFirstInput );
			testUtils.sinon.clock.tick( 0 );

			expect( focusManager.isFocused ).to.false;
		} );
	} );
} );
