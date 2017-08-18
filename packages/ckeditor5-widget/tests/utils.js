/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import {
	toWidget,
	isWidget,
	setLabel,
	getLabel,
	toWidgetEditable,
	setVirtualSelectionHandling,
	WIDGET_CLASS_NAME
} from '../src/utils';

describe( 'widget utils', () => {
	let element;

	beforeEach( () => {
		element = new ViewElement( 'div' );
		toWidget( element );
	} );

	describe( 'toWidget()', () => {
		it( 'should set contenteditable to false', () => {
			expect( element.getAttribute( 'contenteditable' ) ).to.be.false;
		} );

		it( 'should define getFillerOffset method', () => {
			expect( element.getFillerOffset ).to.be.a( 'function' );
			expect( element.getFillerOffset() ).to.be.null;
		} );

		it( 'should add proper CSS class', () => {
			expect( element.hasClass( WIDGET_CLASS_NAME ) ).to.be.true;
		} );

		it( 'should add element\'s label if one is provided', () => {
			toWidget( element, { label: 'foo bar baz label' } );

			expect( getLabel( element ) ).to.equal( 'foo bar baz label' );
		} );

		it( 'should add element\'s label if one is provided as function', () => {
			toWidget( element, { label: () => 'foo bar baz label' } );

			expect( getLabel( element ) ).to.equal( 'foo bar baz label' );
		} );

		it( 'should set default virtual selection methods', () => {
			toWidget( element );

			const set = element.getCustomProperty( 'setVirtualSelection' );
			const remove = element.getCustomProperty( 'removeVirtualSelection' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			set( element, { priority: 1, class: 'virtual-selection' } );
			expect( element.hasClass( 'virtual-selection' ) ).to.be.true;

			remove( element, { priority: 1, class: 'virtual-selection' } );
			expect( element.hasClass( 'virtual-selection' ) ).to.be.false;
		} );
	} );

	describe( 'isWidget()', () => {
		it( 'should return true for widgetized elements', () => {
			expect( isWidget( element ) ).to.be.true;
		} );

		it( 'should return false for non-widgetized elements', () => {
			expect( isWidget( new ViewElement( 'p' ) ) ).to.be.false;
		} );
	} );

	describe( 'label utils', () => {
		it( 'should allow to set label for element', () => {
			const element = new ViewElement( 'p' );
			setLabel( element, 'foo bar baz' );

			expect( getLabel( element ) ).to.equal( 'foo bar baz' );
		} );

		it( 'should return empty string for elements without label', () => {
			const element = new ViewElement( 'div' );

			expect( getLabel( element ) ).to.equal( '' );
		} );

		it( 'should allow to use a function as label creator', () => {
			const element = new ViewElement( 'p' );
			let caption = 'foo';
			setLabel( element, () => caption );

			expect( getLabel( element ) ).to.equal( 'foo' );
			caption = 'bar';
			expect( getLabel( element ) ).to.equal( 'bar' );
		} );
	} );

	describe( 'toWidgetEditable', () => {
		let viewDocument, element;

		beforeEach( () => {
			viewDocument = new ViewDocument();
			element = new ViewEditableElement( 'div' );
			element.document = viewDocument;
			toWidgetEditable( element );
		} );

		it( 'should be created in context of proper document', () => {
			expect( element.document ).to.equal( viewDocument );
		} );

		it( 'should add proper class', () => {
			expect( element.hasClass( 'ck-editable' ) ).to.be.true;
		} );

		it( 'should add proper contenteditable value when element is read-only', () => {
			element.isReadOnly = false;
			expect( element.getAttribute( 'contenteditable' ) ).to.true;

			element.isReadOnly = true;
			expect( element.getAttribute( 'contenteditable' ) ).to.false;
		} );

		it( 'should add proper class when element is focused', () => {
			element.isFocused = true;
			expect( element.hasClass( 'ck-editable_focused' ) ).to.be.true;

			element.isFocused = false;
			expect( element.hasClass( 'ck-editable_focused' ) ).to.be.false;
		} );
	} );

	describe( 'setVirtualSelectionHandling()', () => {
		let element, addSpy, removeSpy, set, remove;

		beforeEach( () => {
			element = new ViewElement( 'p' );
			addSpy = sinon.spy();
			removeSpy = sinon.spy();

			setVirtualSelectionHandling( element, addSpy, removeSpy );
			set = element.getCustomProperty( 'setVirtualSelection' );
			remove = element.getCustomProperty( 'removeVirtualSelection' );
		} );

		it( 'should set virtual selection methods', () => {
			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );
		} );

		it( 'should call virtual selection methods when descriptor is added and removed', () => {
			const descriptor = { priority: 10, class: 'virtual-selection' };

			set( element, descriptor );
			remove( element, descriptor );

			sinon.assert.calledOnce( addSpy );
			sinon.assert.calledWithExactly( addSpy, element, descriptor );

			sinon.assert.calledOnce( removeSpy );
			sinon.assert.calledWithExactly( removeSpy, element, descriptor );
		} );

		it( 'should call virtual selection methods when next descriptor is added', () => {
			const descriptor = { priority: 10, class: 'virtual-selection' };
			const secondDescriptor = { priority: 11, class: 'virtual-selection' };

			set( element, descriptor );
			set( element, secondDescriptor );

			sinon.assert.calledTwice( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
		} );

		it( 'should not call virtual selection methods when descriptor with lower priority is added', () => {
			const descriptor = { priority: 10, class: 'virtual-selection' };
			const secondDescriptor = { priority: 9, class: 'virtual-selection' };

			set( element, descriptor );
			set( element, secondDescriptor );

			sinon.assert.calledOnce( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
		} );

		it( 'should call virtual selection methods when descriptor is removed changing active descriptor', () => {
			const descriptor = { priority: 10, class: 'virtual-selection' };
			const secondDescriptor = { priority: 11, class: 'virtual-selection' };

			set( element, descriptor );
			set( element, secondDescriptor );
			remove( element, secondDescriptor );

			sinon.assert.calledThrice( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
			expect( addSpy.thirdCall.args[ 1 ] ).to.equal( descriptor );

			sinon.assert.calledTwice( removeSpy );
			expect( removeSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( removeSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
		} );

		it( 'should call virtual selection methods when descriptor is removed not changing active descriptor', () => {
			const descriptor = { priority: 10, class: 'virtual-selection' };
			const secondDescriptor = { priority: 9, class: 'virtual-selection' };

			set( element, descriptor );
			set( element, secondDescriptor );
			remove( element, secondDescriptor );

			sinon.assert.calledOnce( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );

			sinon.assert.notCalled( removeSpy );
		} );
	} );
} );
