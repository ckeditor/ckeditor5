/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { attachPlaceholder, detachPlaceholder } from '../../src/view/placeholder';
import createViewRoot from './_utils/createroot';
import ViewContainerElement from '../../src/view/containerelement';
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

	describe( 'createPlaceholder', () => {
		it( 'should throw if element is not inside document', () => {
			const element = new ViewContainerElement( 'div' );

			expect( () => {
				attachPlaceholder( element, 'foo bar baz' );
			} ).to.throw( 'view-placeholder-element-is-detached' );
		} );

		it( 'should attach proper CSS class and data attribute', () => {
			setData( viewDocument, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			attachPlaceholder( element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'if element has children set only data attribute', () => {
			setData( viewDocument, '<div>first div</div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			attachPlaceholder( element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'if element has only ui elements, set CSS class and data attribute', () => {
			setData( viewDocument, '<div><ui:span></ui:span><ui:span></ui:span></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			attachPlaceholder( element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'if element has selection inside set only data attribute', () => {
			setData( viewDocument, '<div>[]</div><div>another div</div>' );
			const element = viewRoot.getChild( 0 );

			attachPlaceholder( element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'if element has selection inside but document is blurred should contain placeholder CSS class', () => {
			setData( viewDocument, '<div>[]</div><div>another div</div>' );
			const element = viewRoot.getChild( 0 );
			viewDocument.isFocused = false;

			attachPlaceholder( element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'use check function if one is provided', () => {
			setData( viewDocument, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );
			const spy = sinon.spy( () => false );

			attachPlaceholder( element, 'foo bar baz', spy );

			sinon.assert.calledOnce( spy );
			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should remove CSS class if selection is moved inside', () => {
			setData( viewDocument, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			attachPlaceholder( element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;

			view.change( () => {
				viewDocument.selection.setRanges( [ ViewRange.createIn( element ) ] );
			} );

			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should change placeholder settings when called twice', () => {
			setData( viewDocument, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			attachPlaceholder( element, 'foo bar baz' );
			attachPlaceholder( element, 'new text' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'new text' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;
		} );

		it( 'should not throw when element is no longer in document', () => {
			setData( viewDocument, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			attachPlaceholder( element, 'foo bar baz' );
			setData( viewDocument, '<p>paragraph</p>' );

			view.render();
		} );

		it( 'should allow to add placeholder to elements from different documents', () => {
			setData( viewDocument, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			const secondView = new View();
			const secondDocument = secondView.document;
			secondDocument.isFocused = true;
			const secondRoot = createViewRoot( secondDocument );
			setData( secondDocument, '<div></div><div>{another div}</div>' );
			const secondElement = secondRoot.getChild( 0 );

			attachPlaceholder( element, 'first placeholder' );
			attachPlaceholder( secondElement, 'second placeholder' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'first placeholder' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;

			expect( secondElement.getAttribute( 'data-placeholder' ) ).to.equal( 'second placeholder' );
			expect( secondElement.hasClass( 'ck-placeholder' ) ).to.be.true;

			// Move selection to the elements with placeholders.
			view.change( () => {
				viewDocument.selection.setRanges( [ ViewRange.createIn( element ) ] );
			} );

			secondView.change( () => {
				secondDocument.selection.setRanges( [ ViewRange.createIn( secondElement ) ] );
			} );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'first placeholder' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;

			expect( secondElement.getAttribute( 'data-placeholder' ) ).to.equal( 'second placeholder' );
			expect( secondElement.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );
	} );

	describe( 'detachPlaceholder', () => {
		it( 'should remove placeholder from element', () => {
			setData( viewDocument, '<div></div><div>{another div}</div>' );
			const element = viewRoot.getChild( 0 );

			attachPlaceholder( element, 'foo bar baz' );

			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'foo bar baz' );
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.true;

			detachPlaceholder( element );

			expect( element.hasAttribute( 'data-placeholder' ) ).to.be.false;
			expect( element.hasClass( 'ck-placeholder' ) ).to.be.false;
		} );
	} );
} );
