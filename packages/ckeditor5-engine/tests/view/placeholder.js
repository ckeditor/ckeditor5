/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	enablePlaceholder,
	disablePlaceholder,
	showPlaceholder,
	hidePlaceholder,
	needsPlaceholder
} from '../../src/view/placeholder';
import createViewRoot from './_utils/createroot';
import View from '../../src/view/view';
import ViewRange from '../../src/view/range';
import { setData } from '../../src/dev-utils/view';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'placeholder', () => {
	let view, viewDocument, viewRoot;
	let stylesProcessor;

	before( () => {
		stylesProcessor = new StylesProcessor();
	} );

	beforeEach( () => {
		view = new View( stylesProcessor );
		viewDocument = view.document;
		viewRoot = createViewRoot( viewDocument );
		viewDocument.isFocused = true;
	} );

	describe( 'enablePlaceholder', () => {
		it( 'should attach proper CSS class and data attribute', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			enablePlaceholder( {
				view,
				element,
				text: 'foo bar baz'
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should attach proper CSS class and data attribute (isDirectHost=false)', () => {
			setData( view, '<p></p>' );
			viewDocument.isFocused = false;

			enablePlaceholder( {
				view,
				element: viewRoot,
				text: 'foo bar baz',
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'if element has children set only data attribute', () => {
			setData( view, '<div>first div</div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			enablePlaceholder( {
				view,
				element,
				text: 'foo bar baz'
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'if element has only ui elements, set CSS class and data attribute', () => {
			setData( view, '<div><ui:span></ui:span><ui:span></ui:span></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			enablePlaceholder( {
				view,
				element,
				text: 'foo bar baz'
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'if element has selection inside set only data attribute', () => {
			setData( view, '<div>[]</div><div>another div</div>' );
			const element = viewRoot.getChild( 0 );

			enablePlaceholder( {
				view,
				element,
				text: 'foo bar baz'
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'if element has selection inside but document is blurred should contain placeholder CSS class', () => {
			setData( view, '<div>[]</div><div>another div</div>' );
			const element = viewRoot.getChild( 0 );
			viewDocument.isFocused = false;

			enablePlaceholder( {
				view,
				element,
				text: 'foo bar baz'
			} );

			view.forceRender();

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should remove CSS class if selection is moved inside', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			enablePlaceholder( {
				view,
				element,
				text: 'foo bar baz'
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;

			view.change( writer => {
				writer.setSelection( ViewRange._createIn( element ) );
			} );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should change placeholder settings when called twice', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			enablePlaceholder( {
				view,
				element,
				text: 'foo bar baz'
			} );

			enablePlaceholder( {
				view,
				element,
				text: 'new text'
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'new text' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should not throw when element is no longer in document', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			enablePlaceholder( {
				view,
				element,
				text: 'foo bar baz'
			} );
			setData( view, '<p>paragraph</p>' );

			view.forceRender();
		} );

		it( 'should allow to add placeholder to elements from different documents', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			const secondView = new View( stylesProcessor );
			const secondDocument = secondView.document;
			secondDocument.isFocused = true;
			const secondRoot = createViewRoot( secondDocument );
			setData( secondView, '<div></div><div>{another div}</div>' );
			const secondElement = secondRoot.getChild( 0 );

			enablePlaceholder( {
				view,
				element,
				text: 'first placeholder'
			} );

			enablePlaceholder( {
				view: secondView,
				element: secondElement,
				text: 'second placeholder'
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
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			enablePlaceholder( {
				view,
				element,
				text: 'foo bar baz'
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

		it( 'should not set attributes/class when multiple children (isDirectHost=false)', () => {
			setData( view, '<p></p><p></p>' );
			viewDocument.isFocused = false;

			enablePlaceholder( {
				view,
				element: viewRoot,
				text: 'foo bar baz',
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should not set attributes/class when first child is not element (isDirectHost=false)', () => {
			setData( view, '<ui:span></ui:span>' );
			viewDocument.isFocused = false;

			enablePlaceholder( {
				view,
				element: viewRoot,
				text: 'foo bar baz',
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );
	} );

	describe( 'disablePlaceholder', () => {
		it( 'should remove placeholder from element', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			enablePlaceholder( {
				view,
				element,
				text: 'foo bar baz'
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;

			disablePlaceholder( view, element );

			expect( element.hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should not blow up when called on element without placeholder', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			disablePlaceholder( view, element );

			expect( element.hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should remove placeholder from element (isDirectHost=false)', () => {
			setData( view, '<p></p>' );
			viewDocument.isFocused = false;

			enablePlaceholder( {
				view,
				element: viewRoot,
				text: 'foo bar baz',
				isDirectHost: false
			} );

			expect( viewRoot.getChild( 0 ).getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.true;

			disablePlaceholder( view, viewRoot );

			expect( viewRoot.getChild( 0 ).hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.be.false;
		} );
	} );

	describe( 'showPlaceholder', () => {
		it( 'should add the ck-placholder class if an element does not have it', () => {
			setData( view, '<div></div>' );
			const element = viewRoot.getChild( 0 );

			const result = view.change( writer => showPlaceholder( writer, element ) );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
			expect( result ).to.be.true;
		} );

		it( 'should do nothing if an element already has the ck-placeholder class', () => {
			setData( view, '<div class="ck-placeholder"></div>' );
			const element = viewRoot.getChild( 0 );
			let spy;

			const result = view.change( writer => {
				spy = sinon.spy( writer, 'addClass' );

				return showPlaceholder( writer, element );
			} );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
			expect( result ).to.be.false;
			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'hidePlaceholder', () => {
		it( 'should remove the ck-placholder class if an element has it', () => {
			setData( view, '<div class="ck-placeholder"></div>' );
			const element = viewRoot.getChild( 0 );

			const result = view.change( writer => hidePlaceholder( writer, element ) );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
			expect( result ).to.be.true;
		} );

		it( 'should do nothing if an element has no ck-placeholder class', () => {
			setData( view, '<div></div>' );
			const element = viewRoot.getChild( 0 );
			let spy;

			const result = view.change( writer => {
				spy = sinon.spy( writer, 'removeClass' );

				return hidePlaceholder( writer, element );
			} );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
			expect( result ).to.be.false;
			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'needsPlaceholder', () => {
		it( 'should return false if element was removed from the document', () => {
			setData( view, '<p></p>' );
			viewDocument.isFocused = false;

			const element = viewRoot.getChild( 0 );

			expect( needsPlaceholder( element ) ).to.be.true;

			view.change( writer => {
				writer.remove( element );
			} );

			expect( needsPlaceholder( element ) ).to.be.false;
		} );

		it( 'should return true if element is empty and document is blurred', () => {
			setData( view, '<p></p>' );
			viewDocument.isFocused = false;

			const element = viewRoot.getChild( 0 );

			expect( needsPlaceholder( element ) ).to.be.true;
		} );

		it( 'should return true if element hosts UI elements only and document is blurred', () => {
			setData( view, '<p><ui:span></ui:span></p>' );
			viewDocument.isFocused = false;

			const element = viewRoot.getChild( 0 );

			expect( needsPlaceholder( element ) ).to.be.true;
		} );

		it( 'should return true when document is focused but selection anchored somewhere else', () => {
			setData( view, '<p></p><p>{moo}</p>' );
			viewDocument.isFocused = true;

			const element = viewRoot.getChild( 0 );

			expect( needsPlaceholder( element ) ).to.be.true;
		} );
	} );
} );
