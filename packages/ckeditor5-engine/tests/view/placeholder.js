/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	enableViewPlaceholder,
	disableViewPlaceholder,
	showViewPlaceholder,
	hideViewPlaceholder,
	needsViewPlaceholder
} from '../../src/view/placeholder.js';
import { createViewRoot } from './_utils/createroot.js';
import { EditingView } from '../../src/view/view.js';
import { ViewRange } from '../../src/view/range.js';
import { _setViewData } from '../../src/dev-utils/view.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'placeholder', () => {
	let view, viewDocument, viewRoot;

	beforeEach( () => {
		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;
		viewRoot = createViewRoot( viewDocument );
		viewDocument.isFocused = true;
	} );

	describe( 'enableViewPlaceholder', () => {
		it( 'should attach proper CSS class and data attribute', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should attach proper CSS class and data attribute (isDirectHost=false)', () => {
			_setViewData( view, '<p></p>' );
			viewDocument.isFocused = false;

			viewRoot.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'if element has children set only data attribute', () => {
			_setViewData( view, '<div>first div</div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'if element has only ui elements, set CSS class and data attribute', () => {
			_setViewData( view, '<div><ui:span></ui:span><ui:span></ui:span></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'if element has selection inside set only data attribute', () => {
			_setViewData( view, '<div>[]</div><div>another div</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'if element has selection inside but document is blurred should contain placeholder CSS class', () => {
			_setViewData( view, '<div>[]</div><div>another div</div>' );
			const element = viewRoot.getChild( 0 );
			viewDocument.isFocused = false;

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
			} );

			view.forceRender();

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should remove CSS class if selection is moved inside', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;

			view.change( writer => {
				writer.setSelection( ViewRange._createIn( element ) );
			} );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should change placeholder settings when called twice', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
			} );

			element.placeholder = 'new text';
			enableViewPlaceholder( {
				view,
				element
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'new text' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should not throw when element is no longer in document', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
			} );
			_setViewData( view, '<p>paragraph</p>' );

			view.forceRender();
		} );

		it( 'should allow to add placeholder to elements from different documents', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			const secondView = new EditingView( new StylesProcessor() );
			const secondDocument = secondView.document;
			secondDocument.isFocused = true;
			const secondRoot = createViewRoot( secondDocument );
			_setViewData( secondView, '<div></div><div>{another div}</div>' );
			const secondElement = secondRoot.getChild( 0 );

			element.placeholder = 'first placeholder';
			enableViewPlaceholder( {
				view,
				element
			} );

			secondElement.placeholder = 'second placeholder';
			enableViewPlaceholder( {
				view: secondView,
				element: secondElement
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'first placeholder' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;

			expect( secondElement.getAttribute( 'data-placeholder' ) ).to.equal( 'second placeholder' );
			expect( secondElement.hasClass( 'ck-placeholder' ) ).to.be.true;

			// Move selection to the elements with placeholders.
			view.change( writer => {
				writer.setSelection( ViewRange._createIn( element ) );
			} );

			secondView.change( writer => {
				writer.setSelection( ViewRange._createIn( secondElement ) );
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'first placeholder' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;

			expect( secondElement.getAttribute( 'data-placeholder' ) ).to.equal( 'second placeholder' );
			expect( secondElement.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should update placeholder before rendering', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
			} );

			view.change( writer => {
				writer.setSelection( ViewRange._createIn( element ) );

				// Here we are before rendering - placeholder is visible in first element;
				expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
				expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
			} );

			// After rendering - placeholder should be invisible since selection is moved there.
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should not set class when multiple children (isDirectHost=false)', () => {
			_setViewData( view, '<p></p><p></p>' );
			viewDocument.isFocused = false;

			viewRoot.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.true;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		// https://github.com/ckeditor/ckeditor5/issues/9009
		it( 'should not set class when multiple children and some other element has content (isDirectHost=false)', () => {
			_setViewData( view, '<p></p><p>foobar</p>' );
			viewDocument.isFocused = false;

			viewRoot.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.true;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		// https://github.com/ckeditor/ckeditor5/issues/9046
		it( 'should set attribute for the direct placeholder even if there is also indirect one (isDirectHost=false)', () => {
			_setViewData( view, '<p></p>' );
			viewDocument.isFocused = false;

			viewRoot.placeholder = 'foo';
			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false
			} );

			viewRoot.getChild( 0 ).placeholder = 'bar';
			enableViewPlaceholder( {
				view,
				element: viewRoot.getChild( 0 ),
				isDirectHost: true
			} );

			view.forceRender();

			expect( viewRoot.getChild( 0 ).getAttribute( 'data-placeholder' ) ).to.equal( 'bar' );
			expect( viewRoot.getChild( 0 ).isEmpty ).to.be.true;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should not trigger infinite post-fixers loop (isDirectHost=false)', () => {
			_setViewData( view, '<p></p>' );
			viewDocument.isFocused = false;

			viewRoot.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false
			} );

			view.forceRender();

			expect( viewRoot.getChild( 0 ).getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should not set class when there is no children (isDirectHost=false)', () => {
			_setViewData( view, '<p></p><p>foobar</p>' );
			viewDocument.isFocused = false;

			viewRoot.getChild( 0 ).placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element: viewRoot.getChild( 0 ),
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( viewRoot.getChild( 0 ).isEmpty ).to.be.true;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should not set attributes/class when first child is not element (isDirectHost=false)', () => {
			_setViewData( view, '<ui:span></ui:span>' );
			viewDocument.isFocused = false;

			viewRoot.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should not set attributes/class when first child is an ViewAttributeElement (isDirectHost=false)', () => {
			_setViewData( view, '<attribute:ul><attribute:li>foo</attribute:li></attribute:ul>' );
			viewDocument.isFocused = false;

			viewRoot.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should keep the placeholder visible when the host element is focused (keepOnFocus = true)', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element,
				keepOnFocus: true
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.true;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.true;

			view.change( writer => {
				writer.setSelection( ViewRange._createIn( element ) );

				// Here we are before rendering - placeholder is visible in first element;
				expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
				expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.true;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should hide the placeholder when the host element is focused (keepOnFocus = false)', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
				// Defaults: keepOnFocus = false
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.true;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.true;

			view.change( writer => {
				writer.setSelection( ViewRange._createIn( element ) );

				// Here we are before rendering - placeholder is visible in first element;
				expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
				expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.true;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should hide the placeholder when there is a composition in progress in the host element (keepOnFocus = true)', () => {
			_setViewData( view, '<div>[]</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element,
				keepOnFocus: true
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.true;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.true;

			// Make sure that renderer is not locked before the view got updated.
			view._renderer.on( 'set:isComposing', () => {
				expect( viewDocument.isComposing ).to.be.true;
				expect( view._renderer.isComposing ).to.be.false;
				expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.true;
				expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
			} );

			viewDocument.isComposing = true;

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.true;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );
	} );

	describe( 'disableViewPlaceholder', () => {
		it( 'should remove placeholder from element', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			element.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;

			disableViewPlaceholder( view, element );

			expect( element.hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should not blow up when called on element without placeholder', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			disableViewPlaceholder( view, element );

			expect( element.hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should remove placeholder from element (isDirectHost=false)', () => {
			_setViewData( view, '<p></p>' );
			viewDocument.isFocused = false;

			viewRoot.placeholder = 'foo bar baz';
			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.true;

			disableViewPlaceholder( view, viewRoot );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );
	} );

	describe( 'showViewPlaceholder', () => {
		it( 'should add the ck-placholder class if an element does not have it', () => {
			_setViewData( view, '<div></div>' );
			const element = viewRoot.getChild( 0 );

			const result = view.change( writer => showViewPlaceholder( writer, element ) );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
			expect( result ).to.be.true;
		} );

		it( 'should do nothing if an element already has the ck-placeholder class', () => {
			_setViewData( view, '<div class="ck-placeholder"></div>' );
			const element = viewRoot.getChild( 0 );
			let spy;

			const result = view.change( writer => {
				spy = sinon.spy( writer, 'addClass' );

				return showViewPlaceholder( writer, element );
			} );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
			expect( result ).to.be.false;
			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'hideViewPlaceholder', () => {
		it( 'should remove the ck-placholder class if an element has it', () => {
			_setViewData( view, '<div class="ck-placeholder"></div>' );
			const element = viewRoot.getChild( 0 );

			const result = view.change( writer => hideViewPlaceholder( writer, element ) );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
			expect( result ).to.be.true;
		} );

		it( 'should do nothing if an element has no ck-placeholder class', () => {
			_setViewData( view, '<div></div>' );
			const element = viewRoot.getChild( 0 );
			let spy;

			const result = view.change( writer => {
				spy = sinon.spy( writer, 'removeClass' );

				return hideViewPlaceholder( writer, element );
			} );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
			expect( result ).to.be.false;
			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'needsViewPlaceholder', () => {
		it( 'should return false if element was removed from the document', () => {
			_setViewData( view, '<p></p>' );
			viewDocument.isFocused = false;

			const element = viewRoot.getChild( 0 );

			expect( needsViewPlaceholder( element ) ).to.be.true;

			view.change( writer => {
				writer.remove( element );
			} );

			expect( needsViewPlaceholder( element ) ).to.be.false;
		} );

		it( 'should return true if element is empty and document is blurred', () => {
			_setViewData( view, '<p></p>' );
			viewDocument.isFocused = false;

			const element = viewRoot.getChild( 0 );

			expect( needsViewPlaceholder( element ) ).to.be.true;
		} );

		it( 'should return false if element has content other than UI elements', () => {
			_setViewData( view, '<p>{moo}<ui:span></ui:span></p>' );
			viewDocument.isFocused = true;

			const element = viewRoot.getChild( 0 );

			expect( needsViewPlaceholder( element ) ).to.be.false;
		} );

		it( 'should return true if element hosts UI elements only and document is blurred', () => {
			_setViewData( view, '<p><ui:span></ui:span></p>' );
			viewDocument.isFocused = false;

			const element = viewRoot.getChild( 0 );

			expect( needsViewPlaceholder( element ) ).to.be.true;
		} );

		it( 'should return true when document is focused but selection anchored somewhere else', () => {
			_setViewData( view, '<p></p><p>{moo}</p>' );
			viewDocument.isFocused = true;

			const element = viewRoot.getChild( 0 );

			expect( needsViewPlaceholder( element ) ).to.be.true;
		} );

		it( 'should return true if we want to keep placeholder when element is focused', () => {
			_setViewData( view, '<p><ui:span></ui:span></p>' );
			viewDocument.isFocused = true;

			const element = viewRoot.getChild( 0 );

			expect( needsViewPlaceholder( element, true ) ).to.be.true;
		} );

		it( 'should return false if we want to keep placeholder when element is focused and document is in composition mode', () => {
			_setViewData( view, '<p>[]</p>' );
			viewDocument.isFocused = true;
			viewDocument.isComposing = true;

			const element = viewRoot.getChild( 0 );

			expect( needsViewPlaceholder( element, true ) ).to.be.false;
		} );

		it( 'should update placeholder when property in editing root is changed', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );

			enableViewPlaceholder( {
				view,
				element: viewRoot
			} );
			viewRoot.placeholder = 'new placeholder';

			expect( viewRoot.getAttribute( 'data-placeholder' ) ).to.equal( 'new placeholder' );
		} );

		it( 'should update placeholder when property in editing root is changed (isDirectHost=false)', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );

			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false
			} );
			viewRoot.placeholder = 'new placeholder';

			expect( viewRoot.getChild( 0 ).getAttribute( 'data-placeholder' ) ).to.equal( 'new placeholder' );
		} );

		it( 'should through warning once if "text" is used as argument', () => {
			sinon.stub( console, 'warn' );

			_setViewData( view, '<div></div><div>{another div}</div>' );

			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false,
				text: 'foo bar'
			} );

			enableViewPlaceholder( {
				view,
				element: viewRoot,
				isDirectHost: false,
				text: 'foo bar baz'
			} );

			sinon.assert.calledOnce( console.warn );
			expect( console.warn.calledWith( sinon.match( /^enableViewPlaceholder-deprecated-text-option/ ) ) ).to.be.true;
		} );

		it( 'should set placeholder using "text" argument', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );

			enableViewPlaceholder( {
				view,
				element: viewRoot,
				text: 'placeholder'
			} );

			expect( viewRoot.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder' );
		} );

		it( 'should prefer element\'s placeholder value over text parameter', () => {
			_setViewData( view, '<div></div><div>{another div}</div>' );

			enableViewPlaceholder( {
				view,
				element: viewRoot,
				text: 'foo'
			} );

			viewRoot.placeholder = 'bar';

			expect( viewRoot.getAttribute( 'data-placeholder' ) ).to.equal( 'bar' );
		} );
	} );
} );
