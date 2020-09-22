/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Input from '../../../src/input';
import { fireBeforeInputDomEvent } from '../../_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Input', () => {
	describe( 'Typing text using beforeinput event', () => {
		describe( 'injectBeforeInputTypingHandling()', () => {
			let domElement, editor, editableElement, view, viewDocument, insertTextEventSpy;

			testUtils.createSinonSandbox();

			beforeEach( async () => {
				insertTextEventSpy = sinon.spy();

				// Force the browser to use the beforeinput event.
				testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => true );

				domElement = document.createElement( 'div' );
				document.body.appendChild( domElement );

				editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input, Paragraph ],
					initialData: '<p>foo</p>'
				} );

				editableElement = editor.ui.getEditableElement();

				view = editor.editing.view;
				viewDocument = view.document;
				viewDocument.on( 'insertText', insertTextEventSpy );
			} );

			afterEach( async () => {
				await editor.destroy();

				domElement.remove();
			} );

			it( 'should stop() the beforeinput event', () => {
				const domRange = document.createRange();
				domRange.selectNodeContents( editableElement.firstChild );

				let interceptedEventInfo;

				viewDocument.on( 'beforeinput', evt => {
					interceptedEventInfo = evt;
				}, { priority: Number.POSITIVE_INFINITY } );

				fireBeforeInputDomEvent( editableElement, {
					inputType: 'insertText',
					ranges: [ domRange ],
					data: 'bar'
				} );

				expect( interceptedEventInfo.stop.called ).to.be.true;
			} );

			it( 'should preventDefault() the DOM beforeinput event', () => {
				const domRange = document.createRange();
				domRange.selectNodeContents( editableElement.firstChild );

				let interceptedEventData;

				viewDocument.on( 'beforeinput', ( evt, data ) => {
					interceptedEventData = data;
					sinon.spy( interceptedEventData, 'preventDefault' );
				}, { priority: Number.POSITIVE_INFINITY } );

				fireBeforeInputDomEvent( editableElement, {
					inputType: 'insertText',
					ranges: [ domRange ],
					data: 'bar'
				} );

				sinon.assert.calledOnce( interceptedEventData.preventDefault );
			} );

			describe( 'beforeinput event types handling', () => {
				it( 'should handle the insertText input type and execute the input command', () => {
					const domRange1 = document.createRange();
					const domRange2 = document.createRange();
					domRange1.selectNodeContents( editableElement.firstChild );
					domRange2.setStart( editableElement.firstChild, 0 );
					domRange2.setEnd( editableElement.firstChild, 0 );

					const viewSelection = view.createSelection( [
						view.createRangeIn( viewDocument.getRoot().getChild( 0 ) ),
						view.createRange(
							view.createPositionAt( viewDocument.getRoot().getChild( 0 ), 0 )
						)
					] );

					fireBeforeInputDomEvent( editableElement, {
						inputType: 'insertText',
						ranges: [ domRange1, domRange2 ],
						data: 'bar'
					} );

					sinon.assert.calledOnce( insertTextEventSpy );

					const firstCallArgs = insertTextEventSpy.firstCall.args[ 1 ];

					expect( firstCallArgs.text ).to.equal( 'bar' );
					expect( firstCallArgs.selection.isEqual( viewSelection ) ).to.be.true;
				} );

				it( 'should handle the insertReplacementText input type and execute the input command', () => {
					const domRange1 = document.createRange();
					const domRange2 = document.createRange();
					domRange1.selectNodeContents( editableElement.firstChild );
					domRange2.setStart( editableElement.firstChild, 0 );
					domRange2.setEnd( editableElement.firstChild, 0 );

					const viewSelection = view.createSelection( [
						view.createRangeIn( viewDocument.getRoot().getChild( 0 ) ),
						view.createRange(
							view.createPositionAt( viewDocument.getRoot().getChild( 0 ), 0 )
						)
					] );

					fireBeforeInputDomEvent( editableElement, {
						inputType: 'insertReplacementText',
						ranges: [ domRange1, domRange2 ],
						data: 'bar'
					} );

					sinon.assert.calledOnce( insertTextEventSpy );

					const firstCallArgs = insertTextEventSpy.firstCall.args[ 1 ];

					expect( firstCallArgs.text ).to.equal( 'bar' );
					expect( firstCallArgs.selection.isEqual( viewSelection ) ).to.be.true;
				} );

				it( 'should ignore other input types', () => {
					const inputCommandSpy = testUtils.sinon.spy( editor.commands.get( 'input' ), 'execute' );

					const domRange1 = document.createRange();
					const domRange2 = document.createRange();
					domRange1.selectNodeContents( editableElement.firstChild );
					domRange2.setStart( editableElement.firstChild, 0 );
					domRange2.setEnd( editableElement.firstChild, 0 );

					fireBeforeInputDomEvent( editableElement, {
						inputType: 'justAnyInputType',
						ranges: [ domRange1, domRange2 ],
						data: 'bar'
					} );

					sinon.assert.notCalled( inputCommandSpy );
				} );
			} );
		} );
	} );
} );
