/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { addPlaceholder, removePlaceholder } from '../../src/view/placeholder';
import createViewRoot from './_utils/createroot';
import View from '../../src/view/view';
import ViewRange from '../../src/view/range';
import { setData } from '../../src/dev-utils/view';

describe( 'placeholder', () => {
	let view, viewDocument, viewRoot;

	beforeEach( () => {
		view = new View();
		viewDocument = view.document;
		viewRoot = createViewRoot( viewDocument );
		viewDocument.isFocused = true;
	} );

	describe( 'addPlaceholder', () => {
		it( 'should attach proper CSS class and data attribute', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			addPlaceholder( view, element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'if element has children set only data attribute', () => {
			setData( view, '<div>first div</div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			addPlaceholder( view, element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'if element has only ui elements, set CSS class and data attribute', () => {
			setData( view, '<div><ui:span></ui:span><ui:span></ui:span></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			addPlaceholder( view, element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'if element has selection inside set only data attribute', () => {
			setData( view, '<div>[]</div><div>another div</div>' );
			const element = viewRoot.getChild( 0 );

			addPlaceholder( view, element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'if element has selection inside but document is blurred should contain placeholder CSS class', () => {
			setData( view, '<div>[]</div><div>another div</div>' );
			const element = viewRoot.getChild( 0 );
			viewDocument.isFocused = false;

			addPlaceholder( view, element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'use check function if one is provided', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );
			let result = true;
			const spy = sinon.spy( () => result );

			addPlaceholder( view, element, 'foo bar baz', spy );

			sinon.assert.called( spy );
			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;

			result = false;
			view.render();
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should remove CSS class if selection is moved inside', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			addPlaceholder( view, element, 'foo bar baz' );

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

			addPlaceholder( view, element, 'foo bar baz' );
			addPlaceholder( view, element, 'new text' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'new text' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should not throw when element is no longer in document', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			addPlaceholder( view, element, 'foo bar baz' );
			setData( view, '<p>paragraph</p>' );

			view.render();
		} );

		it( 'should allow to add placeholder to elements from different documents', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			const secondView = new View();
			const secondDocument = secondView.document;
			secondDocument.isFocused = true;
			const secondRoot = createViewRoot( secondDocument );
			setData( secondView, '<div></div><div>{another div}</div>' );
			const secondElement = secondRoot.getChild( 0 );

			addPlaceholder( view, element, 'first placeholder' );
			addPlaceholder( secondView, secondElement, 'second placeholder' );

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

			addPlaceholder( view, element, 'foo bar baz' );

			view.change( writer => {
				writer.setSelection( ViewRange._createIn( element ) );

				// Here we are before rendering - placeholder is visible in first element;
				expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
				expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
			} );

			// After rendering - placeholder should be invisible since selection is moved there.
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );
	} );

	describe( 'removePlaceholder', () => {
		it( 'should remove placeholder from element', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			addPlaceholder( view, element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;

			removePlaceholder( view, element );

			expect( element.hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should not blow up when called on element without placeholder', () => {
			setData( view, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			removePlaceholder( view, element );

			expect( element.hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );
	} );
} );
