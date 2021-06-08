/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import FindAndReplaceFormView from '../../src/ui/findandreplaceformview';
import View from '@ckeditor/ckeditor5-ui/src/view';
// import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
// import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
// import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
// import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
// import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'FindAndReplaceFormView', () => {
	let view;
	let viewValue;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new FindAndReplaceFormView( { t: val => val } );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-find-and-replace-form__wrapper' ) ).to.true;
		} );

		it( 'should create child views', () => {
			expect( view.findPrevButtonView ).to.be.instanceOf( View );
			expect( view.findNextButtonView ).to.be.instanceOf( View );
			expect( view.replaceOneButtonView ).to.be.instanceOf( View );
			expect( view.replaceAllButtonView ).to.be.instanceOf( View );
			expect( view.findInputView ).to.be.instanceOf( View );
			expect( view.replaceInputView ).to.be.instanceOf( View );
			expect( view.findView ).to.be.instanceOf( View );
			expect( view.replaceView ).to.be.instanceOf( View );
		} );

		describe( 'find input view', () => {
			it( 'has info text', () => {
				expect( view.findInputView.infoText ).to.match( /^Search for something you'd like to find/ );
			} );

			it( 'displays the tip upon #input when the field has a value', () => {
				view.findInputView.fieldView.element.value = 'foo';
				view.findInputView.fieldView.fire( 'input' );

				expect( view.findInputView.infoText ).to.match( /^Search for something you'd like to find/ );
			} );
		} );

		describe( 'replace input view', () => {
			it( 'has info text', () => {
				expect( view.replaceInputView.infoText ).to.match( /^Replace what you've previously selected/ );
			} );

			it( 'displays the tip upon #input when the field has a value', () => {
				view.replaceInputView.fieldView.element.value = 'foo';
				view.replaceInputView.fieldView.fire( 'input' );

				expect( view.replaceInputView.infoText ).to.match( /^Replace what you've previously selected/ );
			} );
		} );

		describe( 'template', () => {
			it( 'has find and replace views', () => {
				expect( view.template.children[ 0 ] ).to.equal( view.findView );
				expect( view.template.children[ 1 ] ).to.equal( view.replaceView );
			} );

			// ?
			// ? How to check if the general findView has children
			// ?
			// it( 'findView has button views', () => {
			// 	expect( view.findView.template.children[ 0 ] ).to.equal( view.findNextButtonView );
			// } );
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'submit event', () => {
			it( 'should trigger submit event', () => {
				const spy = sinon.spy();

				view.on( 'submit', spy );
				// eslint-disable-next-line no-undef
				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy.calledOnce ).to.true;
			} );
		} );

		// describe.only( 'findNext event', () => {
		// 	it( 'should trigger findNext', () => {
		// 		const spy = sinon.spy();

		// 		view.findView.on( 'findNext', spy );

		// 		console.log( view.findView.template.children[0] );

		// 		// this.findNextButtonView.on( 'execute', () => {
		// 		// 	this.fire( 'findNext', { searchText: this.searchText } );
		// 		// } );
		// 		// eslint-disable-next-line no-undef
		// 		view.element.dispatchEvent( new Event( 'findNext' ) );

		// 		expect( spy.calledOnce ).to.true;
		// 	} );
		// } );
	} );

	// ?
	// ? Should we add focusCycler to the findandreplaceform as it is implemented in both link and media-embed
	// ?
	// describe.only( 'focus()', () => {
	// 	it( 'focuses the #findInputView', () => {
	// 		const spy = sinon.spy( view.findInputView, 'focus' );

	// 		view.focus();

	// 		sinon.assert.calledOnce( spy );
	// 	} );

	// 	it( 'focuses the #replaceInputView', () => {
	// 		const spy = sinon.spy( view.replaceInputView, 'focus' );

	// 		view.focus();

	// 		sinon.assert.calledOnce( spy );
	// 	} );
	// } );

	describe( 'find and replace input values', () => {
		it( 'returns the #findInputView DOM value', () => { // @think about shortening the path throughout
			viewValue = view.findInputView.fieldView.element.value;
			viewValue = 'foo';
			expect( viewValue ).to.equal( 'foo' );
		} );

		it( 'returns the #replaceInputView DOM value', () => {
			viewValue = view.replaceInputView.fieldView.element.value;
			viewValue = 'foo';
			expect( viewValue ).to.equal( 'foo' );
		} );

		it( 'sets the #findInputView DOM value', () => {
			viewValue = view.findInputView.fieldView.element.value;
			viewValue = 'bar';
			viewValue = 'foo';

			expect( viewValue ).to.equal( 'foo' );
		} );

		it( 'sets the #replaceInputView DOM value', () => {
			viewValue = view.replaceInputView.fieldView.element.value;
			viewValue = 'bar';
			viewValue = 'foo';

			expect( viewValue ).to.equal( 'foo' );
		} );
	} );
} );
