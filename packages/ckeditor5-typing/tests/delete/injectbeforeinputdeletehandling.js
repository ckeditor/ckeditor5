/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import Delete from '../../src/delete';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Delete', () => {
	describe( 'Delete plugin', () => {
		describe( 'Delete using the beforeinput event', () => {
			describe( 'injectBeforeInputDeleteHandling()', () => {
				let element, editor, view, viewDocument, executeSpy;

				testUtils.createSinonSandbox();

				beforeEach( async () => {
					// Force the browser to use the beforeinput event.
					testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => true );

					element = document.createElement( 'div' );
					document.body.appendChild( element );

					editor = await ClassicTestEditor.create( element, {
						plugins: [ Delete, Paragraph ],
						initialData: '<p>foo</p>'
					} );

					view = editor.editing.view;
					viewDocument = editor.editing.view.document;

					executeSpy = testUtils.sinon.spy( editor, 'execute' );
				} );

				afterEach( async () => {
					element.remove();

					await editor.destroy();
				} );

				it( 'should scroll the editing view after delete', () => {
					const viewFooText = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
					const scrollSpy = testUtils.sinon.spy( view, 'scrollToTheSelection' );

					viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
						inputType: 'deleteWordBackward',
						direction: 'backward',
						unit: 'word',
						sequence: 42,
						selectionToRemove: view.createSelection( viewFooText, 2 )
					} ) );

					sinon.assert.calledOnce( scrollSpy );
					sinon.assert.callOrder( executeSpy, scrollSpy );
				} );

				describe( 'for deleteContentBackward and deleteContentForward input types', () => {
					it( 'should always use the #unit despite #selectionToRemove available for the deleteContentBackward input type', () => {
						viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
							inputType: 'deleteContentBackward',
							direction: 'backward',
							unit: 'codePoint',
							sequence: 3,
							selectionToRemove: view.createSelection( viewDocument.getRoot(), 'in' )
						} ) );

						sinon.assert.calledOnce( executeSpy );
						sinon.assert.calledWithMatch( executeSpy, 'delete', {
							sequence: 3,
							unit: 'codePoint'
						} );
					} );

					it( 'should always use the #unit despite #selectionToRemove available for the deleteContentForward input type', () => {
						viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
							inputType: 'deleteContentForward',
							direction: 'forward',
							unit: 'character',
							sequence: 5,
							selectionToRemove: view.createSelection( viewDocument.getRoot(), 'in' )
						} ) );

						sinon.assert.calledOnce( executeSpy );
						sinon.assert.calledWithMatch( executeSpy, 'forwardDelete', {
							sequence: 5,
							unit: 'character'
						} );
					} );
				} );

				describe( 'for other input types', () => {
					it( 'should always use the #selectionToRemove passed from the DeleteObserver', () => {
						const modelParagraph = editor.model.document.getRoot().getChild( 0 );

						// <paragraph>fo[]o</paragraph>
						const expectedFirstCallDeleteRange = editor.model.createRange(
							editor.model.createPositionAt( modelParagraph, 2 ),
							editor.model.createPositionAt( modelParagraph, 2 )
						);

						// <paragraph>f[]o</paragraph>
						const expectedSecondCallDeleteRange = editor.model.createRange(
							editor.model.createPositionAt( modelParagraph, 1 ),
							editor.model.createPositionAt( modelParagraph, 1 )
						);

						// <paragraph>f[]</paragraph>
						const expectedThirdCallDeleteRange = editor.model.createRange(
							editor.model.createPositionAt( modelParagraph, 1 ),
							editor.model.createPositionAt( modelParagraph, 1 )
						);

						viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
							inputType: 'deleteWordBackward',
							direction: 'backward',
							unit: 'word',
							sequence: 1,
							selectionToRemove: view.createSelection( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 2 )
						} ) );

						viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
							inputType: 'deleteSoftLineForward',
							direction: 'forward',
							unit: 'line',
							sequence: 1,
							selectionToRemove: view.createSelection( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 1 )
						} ) );

						viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
							inputType: 'justAnyInputType',
							direction: 'forward',
							sequence: 1,
							selectionToRemove: view.createSelection( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 0 )
						} ) );

						sinon.assert.calledThrice( executeSpy );
						sinon.assert.calledWithMatch( executeSpy.firstCall, 'delete', {
							sequence: 1,
							selection: sinon.match.object
						} );

						sinon.assert.calledWithMatch( executeSpy.secondCall, 'forwardDelete', {
							sequence: 1,
							selection: sinon.match.object
						} );

						sinon.assert.calledWithMatch( executeSpy.thirdCall, 'forwardDelete', {
							sequence: 1,
							selection: sinon.match.object
						} );

						const firstCallModelRange = executeSpy.firstCall.args[ 1 ].selection.getFirstRange();
						const secondCallModelRange = executeSpy.secondCall.args[ 1 ].selection.getFirstRange();
						const thirdCallModelRange = executeSpy.secondCall.args[ 1 ].selection.getFirstRange();

						expect( firstCallModelRange.isEqual( expectedFirstCallDeleteRange ) ).to.be.true;
						expect( secondCallModelRange.isEqual( expectedSecondCallDeleteRange ) ).to.be.true;
						expect( thirdCallModelRange.isEqual( expectedThirdCallDeleteRange ) ).to.be.true;
					} );

					it( 'should respect the #direction passed from the DeleteObserver observer', () => {
						const viewFooText = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

						viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
							inputType: 'justAnyInputType',
							direction: 'forward',
							selectionToRemove: view.createSelection( viewFooText, 2 )
						} ) );

						viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
							inputType: 'justAnyInputType',
							direction: 'backward',
							selectionToRemove: view.createSelection( viewFooText, 2 )
						} ) );

						sinon.assert.calledTwice( executeSpy );
						sinon.assert.calledWith( executeSpy.firstCall, 'forwardDelete' );
						sinon.assert.calledWith( executeSpy.secondCall, 'delete' );
					} );

					it( 'should respect the #sequence passed from the DeleteObserver observer', () => {
						const viewFooText = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

						viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
							inputType: 'deleteWordBackward',
							direction: 'backward',
							unit: 'word',
							sequence: 42,
							selectionToRemove: view.createSelection( viewFooText, 2 )
						} ) );

						sinon.assert.calledOnce( executeSpy );
						sinon.assert.calledWithMatch( executeSpy, 'delete', {
							sequence: 42
						} );
					} );
				} );

				describe( 'in Android environment (with some quirks)', () => {
					let element, editor;

					beforeEach( async () => {
						// Force the browser to use the beforeinput event.
						testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => true );

						// Force the the Android mode.
						testUtils.sinon.stub( env, 'isAndroid' ).get( () => true );

						element = document.createElement( 'div' );
						document.body.appendChild( element );

						editor = await ClassicTestEditor.create( element, {
							plugins: [ Delete, Paragraph ]
						} );

						const modelRoot = editor.model.document.getRoot();

						// <paragraph>Foo[]bar</paragraph>
						editor.model.change( writer => {
							writer.insertElement( 'paragraph', modelRoot, 0 );
							writer.insertText( 'Foobar', modelRoot.getChild( 0 ), 0 );
							writer.setSelection( modelRoot.getChild( 0 ), 3 );
						} );
					} );

					afterEach( async () => {
						element.remove();

						await editor.destroy();
					} );

					it( 'should re-set selection on keyup event if it was changed after deletion but before the input was fired', () => {
						// This test covers a quirk on Android. We will recreate what browser does in this scenario.
						// The test is not perfect because there are difficulties converting model selection to DOM in unit tests.
						const view = editor.editing.view;
						const viewDocument = view.document;
						const domRoot = view.getDomRoot();
						const domSelection = window.getSelection();
						const domText = domRoot.childNodes[ 0 ].childNodes[ 0 ];

						// Change the selection ("manual conversion").
						// Because it all works quite bad the selection will be moved to quite a random place after delete is fired but
						// all we care is checking if the selection is reversed on `keyup` event.
						domSelection.collapse( domText, 3 );

						// On `delete` the selection is saved.
						viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
							inputType: 'deleteContentBackward',
							direction: 'backward',
							unit: 'character',
							sequence: 1,
							domTarget: domRoot
						} ) );

						// Store what was the selection when it was saved in `delete`.
						const anchorNodeBefore = domSelection.anchorNode;
						const anchorOffsetBefore = domSelection.anchorOffset;
						const focusNodeBefore = domSelection.focusNode;
						const focusOffsetBefore = domSelection.focusOffset;

						// Change the selection.
						domSelection.collapse( domText, 0 );

						// On `keyup` it should be reversed.
						viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
							domTarget: domRoot
						} ) );

						expect( domSelection.anchorNode ).to.equal( anchorNodeBefore );
						expect( domSelection.anchorOffset ).to.equal( anchorOffsetBefore );
						expect( domSelection.focusNode ).to.equal( focusNodeBefore );
						expect( domSelection.focusOffset ).to.equal( focusOffsetBefore );
					} );

					it( 'should not crash on keyup event if it was not changed after typing', () => {
						// This test covers a quirk on Android. We will recreate what browser does in this scenario.
						const view = editor.editing.view;
						const viewDocument = view.document;

						const domEvt = {
							preventDefault: sinon.spy()
						};

						const domRoot = view.getDomRoot();
						const domEvent = {
							preventDefault: sinon.spy()
						};

						viewDocument.fire( 'input', domEvent );
						viewDocument.fire( 'keydown', new DomEventData( viewDocument, domEvent, {
							keyCode: getCode( 'A' )
						} ) );

						expect( () => {
							viewDocument.fire( 'keyup', new DomEventData( viewDocument, domEvt, {
								domTarget: domRoot
							} ) );
						} ).not.to.throw();
					} );
				} );

				function getDomEvent() {
					return {
						preventDefault: sinon.spy()
					};
				}
			} );
		} );
	} );
} );
