/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import createDocumentMock from '../../tests/view/_utils/createdocumentmock';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import RootEditableElement from '../../src/view/rooteditableelement';
import Range from '../../src/view/range';

describe( 'EditableElement', () => {
	describe( 'document', () => {
		let element, docMock;

		beforeEach( () => {
			element = new RootEditableElement( 'div' );
			docMock = createDocumentMock();
		} );

		it( 'should allow to set document', () => {
			element.document = docMock;

			expect( element.document ).to.equal( docMock );
		} );

		it( 'should return undefined if document is not set', () => {
			expect( element.document ).to.be.undefined;
		} );

		it( 'should throw if trying to set document again', () => {
			element.document = docMock;
			const newDoc = createDocumentMock();

			expect( () => {
				element.document = newDoc;
			} ).to.throw( CKEditorError, 'view-editableelement-document-already-set: View document is already set.' );
		} );

		it( 'should be cloned properly', () => {
			element.document = docMock;
			const newElement = element.clone();

			expect( newElement.document ).to.equal( docMock );
		} );
	} );

	describe( 'isFocused', () => {
		let docMock, viewMain, viewHeader;

		beforeEach( () => {
			docMock = createDocumentMock();

			viewMain = new RootEditableElement( 'div' );
			viewMain.document = docMock;

			viewHeader = new RootEditableElement( 'h1' );
			viewHeader.document = docMock;
			viewHeader.rootName = 'header';
		} );

		it( 'should be observable', () => {
			const root = new RootEditableElement( 'div' );
			root.document = createDocumentMock();

			expect( root.isFocused ).to.be.false;

			const isFocusedSpy = sinon.spy();

			root.on( 'change:isFocused', isFocusedSpy );

			root.isFocused = true;

			expect( root.isFocused ).to.be.true;

			expect( isFocusedSpy.calledOnce ).to.be.true;
		} );

		it( 'should change isFocused on document render event', () => {
			const rangeMain = Range.createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = Range.createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
			docMock.selection.addRange( rangeMain );
			docMock.isFocused = true;

			expect( viewMain.isFocused ).to.be.true;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.selection.setRanges( [ rangeHeader ] );
			docMock.fire( 'render' );

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.true;
		} );

		it( 'should change isFocus before actual rendering', done => {
			const rangeMain = Range.createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = Range.createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
			docMock.render = sinon.spy();

			docMock.selection.addRange( rangeMain );
			docMock.isFocused = true;

			expect( viewMain.isFocused ).to.be.true;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.selection.setRanges( [ rangeHeader ] );

			viewHeader.on( 'change:isFocused', ( evt, propertyName, value ) => {
				expect( value ).to.be.true;
				sinon.assert.notCalled( docMock.render );
				done();
			} );

			docMock.fire( 'render' );
		} );

		it( 'should change isFocused when document.isFocus changes', () => {
			const rangeMain = Range.createFromParentsAndOffsets( viewMain, 0, viewMain, 0 );
			const rangeHeader = Range.createFromParentsAndOffsets( viewHeader, 0, viewHeader, 0 );
			docMock.selection.addRange( rangeMain );
			docMock.isFocused = true;

			expect( viewMain.isFocused ).to.be.true;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.isFocused = false;

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.false;

			docMock.selection.setRanges( [ rangeHeader ] );

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.false;
		} );
	} );

	describe( 'isReadOnly', () => {
		it( 'should be observable', () => {
			const root = new RootEditableElement( 'div' );
			root.document = createDocumentMock();

			expect( root.isReadOnly ).to.be.false;

			const isReadOnlySpy = sinon.spy();

			root.on( 'change:isReadOnly', isReadOnlySpy );

			root.isReadOnly = true;

			expect( root.isReadOnly ).to.be.true;

			expect( isReadOnlySpy.calledOnce ).to.be.true;
		} );

		it( 'should be bound to the document#isReadOnly', () => {
			const root = new RootEditableElement( 'div' );
			root.document = createDocumentMock();

			root.document.isReadOnly = false;

			expect( root.isReadOnly ).to.false;

			root.document.isReadOnly = true;

			expect( root.isReadOnly ).to.true;
		} );
	} );

	describe( 'getDocument', () => {
		it( 'should return document', () => {
			const docMock = createDocumentMock();
			const root = new RootEditableElement( 'div' );
			root.document = docMock;

			expect( root.document ).to.equal( docMock );
		} );
	} );
} );
