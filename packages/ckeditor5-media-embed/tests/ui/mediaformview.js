/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MediaFormView from '../../src/ui/mediaformview.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'MediaFormView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new MediaFormView( [], { t: val => val } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'accepts validators', () => {
			const validators = [];
			const view = new MediaFormView( validators, { t: val => val } );

			expect( view._validators ).to.equal( validators );
		} );

		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-media-form' ) ).to.true;
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.urlInputView ).to.be.instanceOf( View );

			expect( view._unboundChildren.get( 0 ) ).to.equal( view.urlInputView );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		describe( 'url input view', () => {
			it( 'has info text', () => {
				expect( view.urlInputView.infoText ).to.match( /^Paste the media URL/ );
			} );

			it( 'displays the tip upon #input when the field has a value', () => {
				view.urlInputView.fieldView.element.value = 'foo';
				view.urlInputView.fieldView.fire( 'input' );

				expect( view.urlInputView.infoText ).to.match( /^Tip: Paste the URL into/ );

				view.urlInputView.fieldView.element.value = '';
				view.urlInputView.fieldView.fire( 'input' );

				expect( view.urlInputView.infoText ).to.match( /^Paste the media URL/ );
			} );
		} );

		describe( 'template', () => {
			it( 'has url input view', () => {
				expect( view.template.children[ 0 ] ).to.equal( view.urlInputView );
			} );

			it( 'has button views', () => {
				expect( view.template.children[ 1 ] ).to.equal( view.saveButtonView );
				expect( view.template.children[ 2 ] ).to.equal( view.cancelButtonView );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child view #element in #focusTracker', () => {
			const view = new MediaFormView( [], { t: () => {} } );

			const spy = testUtils.sinon.spy( view.focusTracker, 'add' );

			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.urlInputView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new MediaFormView( [], { t: () => {} } );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( view.focusTracker, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( view.keystrokes, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'submit event', () => {
			it( 'should trigger submit event', () => {
				const spy = sinon.spy();

				view.on( 'submit', spy );
				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy.calledOnce ).to.true;
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #urlInputView', () => {
			const spy = sinon.spy( view.urlInputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'url()', () => {
		it( 'returns the #inputView DOM value', () => {
			view.urlInputView.fieldView.element.value = 'foo';

			expect( view.url ).to.equal( 'foo' );
		} );

		it( 'sets the #inputView DOM value', () => {
			view.urlInputView.fieldView.element.value = 'bar';

			view.url = 'foo';
			expect( view.urlInputView.fieldView.element.value ).to.equal( 'foo' );

			view.url = ' baz ';
			expect( view.urlInputView.fieldView.element.value ).to.equal( 'baz' );
		} );
	} );

	describe( 'isValid()', () => {
		it( 'calls resetFormStatus()', () => {
			const spy = sinon.spy( view, 'resetFormStatus' );

			view.isValid();

			sinon.assert.calledOnce( spy );
		} );

		it( 'returns false when at least one validator has failed', () => {
			const val1 = sinon.stub().returns( 'some error' );
			const val2 = sinon.stub().returns( false );
			const validators = [ val1, val2 ];
			const view = new MediaFormView( validators, { t: val => val } );

			expect( view.isValid() ).to.be.false;

			sinon.assert.calledOnce( val1 );
			sinon.assert.notCalled( val2 );

			expect( view.urlInputView.errorText ).to.equal( 'some error' );
		} );

		it( 'returns true when all validators passed', () => {
			const val1 = sinon.stub().returns( false );
			const val2 = sinon.stub().returns( false );
			const validators = [ val1, val2 ];
			const view = new MediaFormView( validators, { t: val => val } );

			expect( view.isValid() ).to.be.true;

			sinon.assert.calledOnce( val1 );
			sinon.assert.calledOnce( val2 );

			expect( view.urlInputView.errorText ).to.be.null;
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'resets urlInputView#errorText', () => {
			view.urlInputView.errorText = 'foo';

			view.resetFormStatus();

			expect( view.urlInputView.errorText ).to.be.null;
		} );

		it( 'resets urlInputView#infoText', () => {
			view.urlInputView.infoText = 'foo';

			view.resetFormStatus();

			expect( view.urlInputView.infoText ).to.match( /^Paste the media URL/ );
		} );
	} );
} );
