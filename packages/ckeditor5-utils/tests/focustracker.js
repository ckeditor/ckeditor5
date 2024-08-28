/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event */

import FocusTracker from '../src/focustracker.js';
import global from '../src/dom/global.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { expectToThrowCKEditorError } from './_utils/utils.js';

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

	describe( 'constructor()', () => {
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

		describe( 'focusedElement', () => {
			it( 'should be null at default', () => {
				expect( focusTracker.focusedElement ).to.be.null;
			} );

			it( 'should be observable', () => {
				const observableSpy = testUtils.sinon.spy();

				focusTracker.listenTo( focusTracker, 'change:focusedElement', observableSpy );

				focusTracker.focusedElement = global.document.body;

				expect( observableSpy.calledOnce ).to.true;
			} );
		} );
	} );

	describe( 'add()', () => {
		it( 'should throw an error when element has been already added', () => {
			focusTracker.add( containerFirstInput );

			expectToThrowCKEditorError( () => {
				focusTracker.add( containerFirstInput );
			}, 'focustracker-add-element-already-exist', focusTracker );
		} );

		describe( 'single element', () => {
			it( 'should start listening on element focus and update `isFocused` property', () => {
				focusTracker.add( containerFirstInput );

				expect( focusTracker.isFocused ).to.false;

				containerFirstInput.dispatchEvent( new Event( 'focus' ) );

				expect( focusTracker.isFocused ).to.true;
				expect( focusTracker.focusedElement ).to.equal( containerFirstInput );
			} );

			it( 'should start listening on element blur and update `isFocused` property', () => {
				focusTracker.add( containerFirstInput );
				containerFirstInput.dispatchEvent( new Event( 'focus' ) );

				expect( focusTracker.focusedElement ).to.equal( containerFirstInput );

				containerFirstInput.dispatchEvent( new Event( 'blur' ) );
				testUtils.sinon.clock.tick( 0 );

				expect( focusTracker.isFocused ).to.false;
				expect( focusTracker.focusedElement ).to.be.null;
			} );
		} );

		describe( 'container element', () => {
			it( 'should start listening on element focus using event capturing and update `isFocused` property', () => {
				focusTracker.add( container );

				expect( focusTracker.isFocused ).to.false;

				containerFirstInput.dispatchEvent( new Event( 'focus' ) );

				expect( focusTracker.isFocused ).to.true;
				expect( focusTracker.focusedElement ).to.equal( container );
			} );

			it( 'should start listening on element blur using event capturing and update `isFocused` property', () => {
				focusTracker.add( container );
				containerFirstInput.dispatchEvent( new Event( 'focus' ) );

				expect( focusTracker.focusedElement ).to.equal( container );

				containerFirstInput.dispatchEvent( new Event( 'blur' ) );
				testUtils.sinon.clock.tick( 0 );

				expect( focusTracker.isFocused ).to.false;
				expect( focusTracker.focusedElement ).to.be.null;
			} );

			it( 'should not change `isFocused` property when focus is going between child elements', () => {
				const changeSpy = testUtils.sinon.spy();

				focusTracker.add( container );

				containerFirstInput.dispatchEvent( new Event( 'focus' ) );
				expect( focusTracker.focusedElement ).to.equal( container );
				expect( focusTracker.isFocused ).to.true;

				focusTracker.listenTo( focusTracker, 'change:isFocused', changeSpy );

				containerFirstInput.dispatchEvent( new Event( 'blur' ) );
				containerSecondInput.dispatchEvent( new Event( 'focus' ) );
				testUtils.sinon.clock.tick( 0 );

				expect( focusTracker.focusedElement ).to.equal( container );
				expect( focusTracker.isFocused ).to.true;
				expect( changeSpy.notCalled ).to.true;
			} );

			// https://github.com/ckeditor/ckeditor5-utils/issues/159
			it( 'should keep `isFocused` synced when multiple blur events are followed by the focus', () => {
				focusTracker.add( container );
				container.dispatchEvent( new Event( 'focus' ) );

				expect( focusTracker.focusedElement ).to.equal( container );

				container.dispatchEvent( new Event( 'blur' ) );
				containerFirstInput.dispatchEvent( new Event( 'blur' ) );
				containerSecondInput.dispatchEvent( new Event( 'focus' ) );
				testUtils.sinon.clock.tick( 0 );

				expect( focusTracker.isFocused ).to.be.true;
				expect( focusTracker.focusedElement ).to.equal( container );
			} );
		} );
	} );

	describe( 'remove()', () => {
		it( 'should do nothing when element was not added', () => {
			expect( () => {
				focusTracker.remove( container );
			} ).to.not.throw();
		} );

		it( 'should stop listening on element focus', () => {
			focusTracker.add( containerFirstInput );
			focusTracker.remove( containerFirstInput );

			containerFirstInput.dispatchEvent( new Event( 'focus' ) );

			expect( focusTracker.isFocused ).to.false;
			expect( focusTracker.focusedElement ).to.be.null;
		} );

		it( 'should stop listening on element blur', () => {
			focusTracker.add( containerFirstInput );
			focusTracker.remove( containerFirstInput );
			focusTracker.isFocused = true;

			containerFirstInput.dispatchEvent( new Event( 'blur' ) );
			testUtils.sinon.clock.tick( 0 );

			expect( focusTracker.isFocused ).to.true;
		} );

		it( 'should blur element before removing when is focused', () => {
			focusTracker.add( containerFirstInput );
			containerFirstInput.dispatchEvent( new Event( 'focus' ) );
			expect( focusTracker.focusedElement ).to.equal( containerFirstInput );

			expect( focusTracker.isFocused ).to.true;

			focusTracker.remove( containerFirstInput );
			testUtils.sinon.clock.tick( 0 );

			expect( focusTracker.isFocused ).to.false;
			expect( focusTracker.focusedElement ).to.be.null;
		} );
	} );

	describe( 'elements', () => {
		it( 'should return an array with elements currently added to the focus tracker', () => {
			expect( focusTracker.elements ).to.deep.equal( [] );

			const elementA = document.createElement( 'div' );
			focusTracker.add( elementA );

			expect( focusTracker.elements ).to.deep.equal( [ elementA ] );

			const elementB = document.createElement( 'div' );
			focusTracker.add( elementB );

			expect( focusTracker.elements ).to.deep.equal( [ elementA, elementB ] );

			focusTracker.remove( elementA );

			expect( focusTracker.elements ).to.deep.equal( [ elementB ] );

			focusTracker.remove( elementB );

			expect( focusTracker.elements ).to.deep.equal( [] );
		} );

		it( 'changing returned value should not have an effect on focus tracker', () => {
			const elements = focusTracker.elements;

			expect( focusTracker.elements ).to.deep.equal( [] );

			const elementA = document.createElement( 'div' );
			elements.push( elementA );

			expect( focusTracker.elements ).to.deep.equal( [] );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should stop listening', () => {
			const stopListeningSpy = sinon.spy( focusTracker, 'stopListening' );

			focusTracker.destroy();

			sinon.assert.calledOnce( stopListeningSpy );
		} );
	} );
} );
