/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global } from '@ckeditor/ckeditor5-utils';
import TextareaView from '../../src/textarea/textareaview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'TextareaView', () => {
	let wrapper, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		// The reset wrapper is needed for proper line height calculation.
		wrapper = document.createElement( 'div' );
		wrapper.classList.add( 'ck', 'ck-reset_all' );

		view = new TextareaView();
		view.render();
		wrapper.appendChild( view.element );
		document.body.appendChild( wrapper );
	} );

	afterEach( () => {
		view.destroy();
		wrapper.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'TEXTAREA' );
			expect( view.element.getAttribute( 'type' ) ).to.be.null;
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-input' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-textarea' ) ).to.be.true;
		} );

		it( 'should have default resize attribute value', () => {
			expect( view.element.style.resize ).to.equal( 'none' );
		} );

		it( 'should throw if #minHeight is greater than #maxHeight', () => {
			view.minRows = 2;
			view.maxRows = 3;
			view.minRows = view.maxRows;

			expectToThrowCKEditorError(
				() => { view.minRows = 4; },
				'ui-textarea-view-min-rows-greater-than-max-rows',
				{
					view,
					minRows: 4,
					maxRows: 3
				}
			);

			expectToThrowCKEditorError(
				() => { view.minRows = 5; },
				'ui-textarea-view-min-rows-greater-than-max-rows',
				{
					view,
					minRows: 5,
					maxRows: 3
				}
			);
		} );
	} );

	describe( 'reset()', () => {
		it( 'should reset the #value of the view', () => {
			view.value = 'foo';

			view.reset();

			expect( view.value ).to.equal( '' );
		} );

		it( 'should reset the value of the DOM #element', () => {
			view.element.value = 'foo';

			view.reset();

			expect( view.element.value ).to.equal( '' );
		} );

		it( 'should update the size of the view', () => {
			view.element.value = '1';
			view.fire( 'input' );

			const initialHeight = view.element.style.height;
			const initialScrollTop = view.element.scrollTop;

			view.element.value = '1\n2\n3\n4\n5\n6';
			view.fire( 'input' );
			expect( view.element.style.height ).to.not.equal( initialHeight );
			expect( view.element.scrollTop ).to.not.equal( initialScrollTop );

			view.reset();
			expect( view.element.style.height ).to.equal( initialHeight );
			expect( view.element.scrollTop ).to.equal( initialScrollTop );
		} );
	} );

	describe( 'render()', () => {
		it( 'should resize the view on the #input event and scroll to the end', async () => {
			const initialHeight = view.element.style.height;
			const initialScrollTop = view.element.scrollTop;

			view.element.value = '1\n2\n3\n4\n5\n6';

			expect( view.element.style.height ).to.equal( initialHeight );
			expect( view.element.scrollTop ).to.equal( initialScrollTop );

			view.fire( 'input' );

			expect( view.element.style.height ).to.not.equal( initialHeight );
			expect( view.element.scrollTop ).to.not.equal( initialScrollTop );
		} );

		it( 'should resize the view on the #value change using requestAnimationFrame to let the browser update the UI', async () => {
			const initialHeight = view.element.style.height;

			view.value = 'foo\nbar\nbaz\nqux';

			expect( view.element.style.height ).to.equal( initialHeight );

			await requestAnimationFrame();
			expect( view.element.style.height ).to.not.equal( initialHeight );
		} );

		it( 'should not resize the view on the #value change when the view element is not in DOM', async () => {
			wrapper.removeChild( view.element );

			const initialHeight = view.element.style.height;

			view.value = 'foo\nbar\nbaz\nqux';

			expect( view.element.style.height ).to.equal( initialHeight );

			await requestAnimationFrame();
			expect( view.element.style.height ).to.equal( initialHeight );
		} );

		describe( 'dynamic resizing', () => {
			it( 'should respect #minRows and #maxRows', async () => {
				// One row, it's less than default #minRows.
				view.value = '1';
				await requestAnimationFrame();
				const oneRowHeight = parseFloat( view.element.style.height );

				// Two rows (default).
				view.value = '1\n2';
				await requestAnimationFrame();
				const twoRowsHeight = parseFloat( view.element.style.height );
				expect( twoRowsHeight ).to.equal( oneRowHeight );

				// Three rows (more then default #minRows), resize again.
				view.value = '1\n2\n3';
				await requestAnimationFrame();
				const threeRowsHeight = parseFloat( view.element.style.height );
				expect( threeRowsHeight ).to.be.greaterThan( twoRowsHeight );

				// Four rows.
				view.value = '1\n2\n3\n4';
				await requestAnimationFrame();
				const fourRowsHeight = parseFloat( view.element.style.height );
				expect( fourRowsHeight ).to.be.greaterThan( threeRowsHeight );

				// Five rows (default #maxRows), this will be the max height.
				view.value = '1\n2\n3\n4\n5';
				await requestAnimationFrame();
				const maxHeight = parseFloat( view.element.style.height );
				expect( maxHeight ).to.be.greaterThan( fourRowsHeight );

				// Six rows (more than #maxRows), the view is no longer growing.
				view.value = '1\n2\n3\n4\n5\n6';
				await requestAnimationFrame();
				expect( parseFloat( view.element.style.height ) ).to.equal( maxHeight );

				// Going back to #minRows
				view.value = '1';
				await requestAnimationFrame();
				expect( parseFloat( view.element.style.height ) ).to.equal( twoRowsHeight );
			} );

			it( 'should be deferred until the view becomes visible again (#reset())', async () => {
				const warnStub = testUtils.sinon.stub( console, 'warn' );
				const updateSpy = sinon.spy();

				view.on( 'update', updateSpy );

				view.value = '1\n2\n3\n4\n5';
				await requestAnimationFrame();
				const initialHeight = parseFloat( view.element.style.height );

				sinon.assert.calledOnce( updateSpy );

				// Remove the view from DOM. Anything that happens after it should be deferred.
				wrapper.remove();

				view.reset();
				await requestAnimationFrame();

				sinon.assert.calledTwice( updateSpy );
				const heightAfterReset = parseFloat( view.element.style.height );

				expect( heightAfterReset ).to.equal( initialHeight );

				// Inject the view back into DOM. Anything that was pending should get executed.
				document.body.appendChild( wrapper );

				// The first one is for the ResizeObserver to notice the view is visible again.
				// The second one is fo the auto-grow logic executed in another RAF.
				await requestAnimationFrame();
				await requestAnimationFrame();

				const heightAfterShow = parseFloat( view.element.style.height );

				expect( heightAfterShow ).to.be.lessThan( initialHeight );
				sinon.assert.notCalled( warnStub );
				sinon.assert.calledThrice( updateSpy );
			} );

			it( 'should be deferred until the view becomes visible again (#value change)', async () => {
				const warnStub = testUtils.sinon.stub( console, 'warn' );
				const updateSpy = sinon.spy();

				view.on( 'update', updateSpy );

				view.value = '1\n2\n3\n4\n5';
				await requestAnimationFrame();
				const initialHeight = parseFloat( view.element.style.height );

				sinon.assert.calledOnce( updateSpy );

				// Remove the view from DOM. Anything that happens after it should be deferred.
				wrapper.remove();

				view.value = '1';
				await requestAnimationFrame();

				sinon.assert.calledOnce( updateSpy );
				const heightAfterValueChange = parseFloat( view.element.style.height );

				expect( heightAfterValueChange ).to.equal( initialHeight );

				// Inject the view back into DOM. Anything that was pending should get executed.
				document.body.appendChild( wrapper );

				// The first one is for the ResizeObserver to notice the view is visible again.
				// The second one is fo the auto-grow logic executed in another RAF.
				await requestAnimationFrame();
				await requestAnimationFrame();

				const heightAfterShow = parseFloat( view.element.style.height );

				expect( heightAfterShow ).to.be.lessThan( initialHeight );
				sinon.assert.notCalled( warnStub );
				sinon.assert.calledTwice( updateSpy );
			} );
		} );

		describe( '#update event', () => {
			it( 'should get fired on the user #input', () => {
				const spy = sinon.spy();

				view.on( 'update', spy );

				view.element.value = '1\n2\n3\n4\n5\n6';

				view.fire( 'input' );
				sinon.assert.calledOnce( spy );

				view.fire( 'input' );

				// The event gets fired whether the view is changing dimensions or not.
				sinon.assert.calledTwice( spy );
			} );

			it( 'should get fired on #value change', async () => {
				const spy = sinon.spy();

				view.on( 'update', spy );

				view.value = '1\n2\n3\n4\n5\n6';

				await requestAnimationFrame();

				sinon.assert.calledOnce( spy );
			} );

			it( 'should be fired upon reset()', async () => {
				const spy = sinon.spy();

				view.on( 'update', spy );

				view.value = '1\n2\n3\n4\n5\n6';

				await requestAnimationFrame();

				sinon.assert.calledOnce( spy );

				view.reset();

				sinon.assert.calledTwice( spy );
			} );
		} );
	} );

	describe( 'DOM bindings', () => {
		beforeEach( () => {
			view.value = 'foo';
			view.id = 'bar';
		} );

		describe( 'rows attribute', () => {
			it( 'should react on view#minRows', () => {
				expect( view.element.getAttribute( 'rows' ) ).to.equal( '2' );

				view.minRows = 5;

				expect( view.element.getAttribute( 'rows' ) ).to.equal( '5' );
			} );
		} );

		describe( 'resize attribute', () => {
			it( 'should react on view#reisze', () => {
				expect( view.element.style.resize ).to.equal( 'none' );

				view.resize = 'vertical';

				expect( view.element.style.resize ).to.equal( 'vertical' );
			} );
		} );
	} );

	function requestAnimationFrame() {
		return new Promise( res => {
			global.window.requestAnimationFrame( res );
		} );
	}
} );
