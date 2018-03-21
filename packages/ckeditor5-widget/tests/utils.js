/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Writer from '@ckeditor/ckeditor5-engine/src/view/writer';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import {
	toWidget,
	isWidget,
	setLabel,
	getLabel,
	toWidgetEditable,
	setHighlightHandling,
	WIDGET_CLASS_NAME
} from '../src/utils';

describe( 'widget utils', () => {
	let element, writer, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		writer = new Writer( viewDocument );

		element = writer.createContainerElement( 'div' );
		toWidget( element, writer );
	} );

	describe( 'toWidget()', () => {
		it( 'should set contenteditable to "false"', () => {
			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'false' );
		} );

		it( 'should define getFillerOffset method', () => {
			expect( element.getFillerOffset ).to.be.a( 'function' );
			expect( element.getFillerOffset() ).to.be.null;
		} );

		it( 'should add proper CSS class', () => {
			expect( element.hasClass( WIDGET_CLASS_NAME ) ).to.be.true;
		} );

		it( 'should add element\'s label if one is provided', () => {
			toWidget( element, writer, { label: 'foo bar baz label' } );

			expect( getLabel( element ) ).to.equal( 'foo bar baz label' );
		} );

		it( 'should add element\'s label if one is provided as function', () => {
			toWidget( element, writer, { label: () => 'foo bar baz label' } );

			expect( getLabel( element ) ).to.equal( 'foo bar baz label' );
		} );

		it( 'should set default highlight handling methods', () => {
			toWidget( element, writer );

			const set = element.getCustomProperty( 'addHighlight' );
			const remove = element.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			set( element, { priority: 1, class: 'highlight', id: 'highlight' }, writer );
			expect( element.hasClass( 'highlight' ) ).to.be.true;

			remove( element, 'highlight', writer );
			expect( element.hasClass( 'highlight' ) ).to.be.false;
		} );

		it( 'should set default highlight handling methods - CSS classes array', () => {
			toWidget( element, writer );

			const set = element.getCustomProperty( 'addHighlight' );
			const remove = element.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			set( element, { priority: 1, class: [ 'highlight', 'foo' ], id: 'highlight' }, writer );
			expect( element.hasClass( 'highlight' ) ).to.be.true;
			expect( element.hasClass( 'foo' ) ).to.be.true;

			remove( element, 'highlight', writer );
			expect( element.hasClass( 'highlight' ) ).to.be.false;
			expect( element.hasClass( 'foo' ) ).to.be.false;
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
			setLabel( element, 'foo bar baz', writer );

			expect( getLabel( element ) ).to.equal( 'foo bar baz' );
		} );

		it( 'should return empty string for elements without label', () => {
			const element = new ViewElement( 'div' );

			expect( getLabel( element ) ).to.equal( '' );
		} );

		it( 'should allow to use a function as label creator', () => {
			const element = new ViewElement( 'p' );
			let caption = 'foo';
			setLabel( element, () => caption, writer );

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
			element._document = viewDocument;
			toWidgetEditable( element, writer );
		} );

		it( 'should be created in context of proper document', () => {
			expect( element.document ).to.equal( viewDocument );
		} );

		it( 'should add proper class', () => {
			expect( element.hasClass( 'ck-editor__editable', 'ck-editor__nested-editable' ) ).to.be.true;
		} );

		it( 'should add proper contenteditable value when element is read-only - initialization', () => {
			const element = new ViewEditableElement( 'div' );
			element._document = viewDocument;
			element.isReadOnly = true;
			toWidgetEditable( element, writer );

			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'false' );
		} );

		it( 'should add proper contenteditable value when element is read-only - when changing', () => {
			element.isReadOnly = true;
			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'false' );

			element.isReadOnly = false;
			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'true' );
		} );

		it( 'should add proper class when element is focused', () => {
			element.isFocused = true;
			expect( element.hasClass( 'ck-editor__nested-editable_focused' ) ).to.be.true;

			element.isFocused = false;
			expect( element.hasClass( 'ck-editor__nested-editable_focused' ) ).to.be.false;
		} );
	} );

	describe( 'addHighlightHandling()', () => {
		let element, addSpy, removeSpy, set, remove;

		beforeEach( () => {
			element = new ViewElement( 'p' );
			addSpy = sinon.spy();
			removeSpy = sinon.spy();

			setHighlightHandling( element, writer, addSpy, removeSpy );
			set = element.getCustomProperty( 'addHighlight' );
			remove = element.getCustomProperty( 'removeHighlight' );
		} );

		it( 'should set highlight handling methods', () => {
			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );
		} );

		it( 'should call highlight methods when descriptor is added and removed', () => {
			const descriptor = { priority: 10, class: 'highlight', id: 'highlight' };

			set( element, descriptor, writer );
			remove( element, descriptor.id, writer );

			sinon.assert.calledOnce( addSpy );
			sinon.assert.calledWithExactly( addSpy, element, descriptor, writer );

			sinon.assert.calledOnce( removeSpy );
			sinon.assert.calledWithExactly( removeSpy, element, descriptor, writer );
		} );

		it( 'should call highlight methods when next descriptor is added', () => {
			const descriptor = { priority: 10, class: 'highlight', id: 'highlight-1' };
			const secondDescriptor = { priority: 11, class: 'highlight', id: 'highlight-2' };

			set( element, descriptor );
			set( element, secondDescriptor );

			sinon.assert.calledTwice( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
		} );

		it( 'should not call highlight methods when descriptor with lower priority is added', () => {
			const descriptor = { priority: 10, class: 'highlight', id: 'highlight-1' };
			const secondDescriptor = { priority: 9, class: 'highlight', id: 'highlight-2' };

			set( element, descriptor );
			set( element, secondDescriptor );

			sinon.assert.calledOnce( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
		} );

		it( 'should call highlight methods when descriptor is removed changing active descriptor', () => {
			const descriptor = { priority: 10, class: 'highlight', id: 'highlight-1' };
			const secondDescriptor = { priority: 11, class: 'highlight', id: 'highlight-2' };

			set( element, descriptor );
			set( element, secondDescriptor );
			remove( element, secondDescriptor.id );

			sinon.assert.calledThrice( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
			expect( addSpy.thirdCall.args[ 1 ] ).to.equal( descriptor );

			sinon.assert.calledTwice( removeSpy );
			expect( removeSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( removeSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
		} );

		it( 'should call highlight methods when descriptor is removed not changing active descriptor', () => {
			const descriptor = { priority: 10, class: 'highlight', id: 'highlight-1' };
			const secondDescriptor = { priority: 9, class: 'highlight', id: 'highlight-2' };

			set( element, descriptor );
			set( element, secondDescriptor );
			remove( element, secondDescriptor );

			sinon.assert.calledOnce( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );

			sinon.assert.notCalled( removeSpy );
		} );

		it( 'should call highlight methods - CSS class array', () => {
			const descriptor = { priority: 10, class: [ 'highlight', 'a' ], id: 'highlight-1' };
			const secondDescriptor = { priority: 10, class: [ 'highlight', 'b' ], id: 'highlight-2' };

			set( element, descriptor );
			set( element, secondDescriptor );

			sinon.assert.calledTwice( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
		} );
	} );
} );
