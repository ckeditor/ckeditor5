/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import DeleteObserver from '../../src/deleteobserver';

import View from '@ckeditor/ckeditor5-engine/src/view/view';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { fireBeforeInputDomEvent } from '../_utils/utils';
import { setData as viewSetData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

describe( 'Delete', () => {
	describe( 'DeleteObserver', () => {
		let view, domRoot, viewDocument;

		testUtils.createSinonSandbox();

		afterEach( () => {
			view.destroy();
		} );

		// See ckeditor/ckeditor5-enter#10.
		it( 'can be initialized', () => {
			expect( () => {
				domRoot = document.createElement( 'div' );

				view = new View( new StylesProcessor() );
				viewDocument = view.document;

				createViewRoot( viewDocument );
				view.attachDomRoot( domRoot );
			} ).to.not.throw();
		} );

		describe( 'key events-based (legacy)', () => {
			let deleteSpy;

			beforeEach( () => {
				// Force the browser to not use the beforeinput event.
				testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => false );

				view = new View();
				viewDocument = view.document;
				view.addObserver( DeleteObserver );

				deleteSpy = testUtils.sinon.spy();
				viewDocument.on( 'delete', deleteSpy );
			} );

			it( 'should fire delete on keydown', () => {
				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				expect( deleteSpy.calledOnce ).to.be.true;

				const data = deleteSpy.args[ 0 ][ 1 ];
				expect( data ).to.have.property( 'direction', 'forward' );
				expect( data ).to.have.property( 'unit', 'character' );
				expect( data ).to.have.property( 'sequence', 1 );
			} );

			it( 'should fire delete with a proper direction and unit (on Mac)', () => {
				const spy = sinon.spy();

				testUtils.sinon.stub( env, 'isMac' ).value( true );

				viewDocument.on( 'delete', spy );

				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'backspace' ),
					altKey: true
				} ) );

				expect( spy.calledOnce ).to.be.true;

				const data = spy.args[ 0 ][ 1 ];
				expect( data ).to.have.property( 'direction', 'backward' );
				expect( data ).to.have.property( 'unit', 'word' );
				expect( data ).to.have.property( 'sequence', 1 );
			} );

			it( 'should fire delete with a proper direction and unit (on non-Mac)', () => {
				testUtils.sinon.stub( env, 'isMac' ).value( false );

				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'backspace' ),
					ctrlKey: true
				} ) );

				expect( deleteSpy.calledOnce ).to.be.true;

				const data = deleteSpy.args[ 0 ][ 1 ];
				expect( data ).to.have.property( 'direction', 'backward' );
				expect( data ).to.have.property( 'unit', 'word' );
				expect( data ).to.have.property( 'sequence', 1 );
			} );

			it( 'should not fire delete on keydown when keyCode does not match backspace or delete', () => {
				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: 1
				} ) );

				expect( deleteSpy.calledOnce ).to.be.false;
			} );

			it( 'should fire delete with a proper sequence number', () => {
				// Simulate that a user keeps the "Delete" key.
				for ( let i = 0; i < 5; ++i ) {
					viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
						keyCode: getCode( 'delete' )
					} ) );

					viewDocument.fire( 'input', getDomEvent() );
				}

				sinon.assert.callCount( deleteSpy, 5 );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 0 ), {}, { sequence: 1 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 1 ), {}, { sequence: 2 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 2 ), {}, { sequence: 3 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 3 ), {}, { sequence: 4 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 4 ), {}, { sequence: 5 } );
			} );

			it( 'should clear the sequence when the key was released', () => {
				// Simulate that a user keeps the "Delete" key.
				for ( let i = 0; i < 3; ++i ) {
					viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
						keyCode: getCode( 'delete' )
					} ) );

					viewDocument.fire( 'input', getDomEvent() );
				}

				// Then the user has released the key.
				viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				// And pressed it once again.
				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				viewDocument.fire( 'input', getDomEvent() );

				sinon.assert.callCount( deleteSpy, 4 );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 0 ), {}, { sequence: 1 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 1 ), {}, { sequence: 2 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 2 ), {}, { sequence: 3 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 3 ), {}, { sequence: 1 } );
			} );

			it( 'should work fine with the Backspace key', () => {
				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'backspace' )
				} ) );

				viewDocument.fire( 'input', getDomEvent() );

				viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'backspace' )
				} ) );

				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'backspace' )
				} ) );

				viewDocument.fire( 'input', getDomEvent() );

				sinon.assert.callCount( deleteSpy, 2 );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 0 ), {}, { sequence: 1 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 1 ), {}, { sequence: 1 } );
			} );

			it( 'should not reset the sequence if other than Backspace or Delete key was released', () => {
				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				viewDocument.fire( 'input', getDomEvent() );

				viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'A' )
				} ) );

				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				viewDocument.fire( 'input', getDomEvent() );

				sinon.assert.calledWithMatch( deleteSpy.getCall( 0 ), {}, { sequence: 1 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 1 ), {}, { sequence: 2 } );
			} );

			it( 'should stop the keydown event when delete event is stopped', () => {
				const keydownSpy = sinon.spy();
				viewDocument.on( 'keydown', keydownSpy );
				viewDocument.on( 'delete', evt => evt.stop() );

				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				sinon.assert.notCalled( keydownSpy );
			} );

			// https://github.com/ckeditor/ckeditor5-typing/issues/186
			it( 'should stop the keydown event when delete event is stopped (delete event with highest priority)', () => {
				const keydownSpy = sinon.spy();
				viewDocument.on( 'keydown', keydownSpy );
				viewDocument.on( 'delete', evt => evt.stop(), { priority: 'highest' } );

				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				sinon.assert.notCalled( keydownSpy );
			} );

			it( 'should not stop the keydown event when delete event is not stopped', () => {
				const keydownSpy = sinon.spy();
				viewDocument.on( 'keydown', keydownSpy );
				viewDocument.on( 'delete', evt => evt.stop() );

				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'x' )
				} ) );

				sinon.assert.calledOnce( keydownSpy );
			} );

			function getDomEvent() {
				return {
					preventDefault: sinon.spy()
				};
			}
		} );

		describe( 'beforeinput-based', () => {
			let deleteSpy;

			beforeEach( () => {
				// Force the browser to use the beforeinput event.
				testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => true );

				domRoot = document.createElement( 'div' );
				document.body.appendChild( domRoot );

				view = new View();
				viewDocument = view.document;
				createViewRoot( viewDocument );
				view.attachDomRoot( domRoot );
				view.addObserver( DeleteObserver );

				deleteSpy = testUtils.sinon.spy();
				viewDocument.on( 'delete', deleteSpy );
			} );

			afterEach( () => {
				domRoot.remove();
			} );

			it( 'should increment the sequence with every keydown event', () => {
				const deleteSpy = sinon.spy();

				viewDocument.on( 'delete', deleteSpy );

				// Simulate that the user keeps pressing the "Delete" key.
				for ( let i = 0; i < 5; ++i ) {
					viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
						keyCode: getCode( 'delete' )
					} ) );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteContentBackward'
					} );
				}

				sinon.assert.callCount( deleteSpy, 5 );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 0 ), {}, { sequence: 1 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 1 ), {}, { sequence: 2 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 2 ), {}, { sequence: 3 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 3 ), {}, { sequence: 4 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 4 ), {}, { sequence: 5 } );
			} );

			it( 'should reset the sequence on keyup event', () => {
				// Simulate that the user keeps pressing the "Delete" key.
				for ( let i = 0; i < 5; ++i ) {
					viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
						keyCode: getCode( 'delete' )
					} ) );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteContentBackward'
					} );
				}

				viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward'
				} );

				sinon.assert.callCount( deleteSpy, 6 );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 0 ), {}, { sequence: 1 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 1 ), {}, { sequence: 2 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 2 ), {}, { sequence: 3 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 3 ), {}, { sequence: 4 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 4 ), {}, { sequence: 5 } );
				sinon.assert.calledWithMatch( deleteSpy.getCall( 5 ), {}, { sequence: 1 } );
			} );

			it( 'should stop the beforeinput event propagation if delete event was stopped', () => {
				let interceptedEventInfo;

				viewDocument.on( 'beforeinput', evt => {
					interceptedEventInfo = evt;
				}, { priority: Number.POSITIVE_INFINITY } );

				viewDocument.on( 'delete', evt => {
					evt.stop();
				} );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward'
				} );

				expect( interceptedEventInfo.stop.called ).to.be.true;
			} );

			it( 'should not stop the beforeinput event propagation if delete event was not stopped', () => {
				let interceptedEventInfo;

				viewDocument.on( 'beforeinput', evt => {
					interceptedEventInfo = evt;
				}, { priority: Number.POSITIVE_INFINITY } );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward'
				} );

				expect( interceptedEventInfo.stop.called ).to.be.undefined;
			} );

			it( 'should always preventDefault() the beforeinput event', () => {
				let interceptedEventData;

				viewDocument.on( 'beforeinput', ( evt, data ) => {
					interceptedEventData = data;
					sinon.spy( interceptedEventData, 'preventDefault' );
				}, { priority: Number.POSITIVE_INFINITY } );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward'
				} );

				sinon.assert.calledOnce( interceptedEventData.preventDefault );
			} );

			describe( 'beforeinput event types handling', () => {
				describe( 'backward delete event types', () => {
					it( 'should handle the deleteContent event type and fire the delete event', () => {
						viewSetData( view, '<p>fo{}o</p>' );

						const viewRange = view.document.selection.getFirstRange();
						const domRange = view.domConverter.viewRangeToDom( viewRange );

						fireBeforeInputDomEvent( domRoot, {
							inputType: 'deleteContent',
							ranges: [ domRange ]
						} );

						sinon.assert.calledOnce( deleteSpy );
						sinon.assert.calledWithMatch( deleteSpy, {}, {
							unit: 'selection',
							direction: 'backward',
							sequence: 0,
							inputType: 'deleteContent'
						} );

						const range = deleteSpy.firstCall.args[ 1 ].selectionToRemove.getFirstRange();

						expect( range.isEqual( viewRange ) ).to.be.true;
					} );

					it( 'should handle the deleteContentBackward event type and fire the delete event', () => {
						viewSetData( view, '<p>fo{}o</p>' );

						const viewRange = view.document.selection.getFirstRange();
						const domRange = view.domConverter.viewRangeToDom( viewRange );

						fireBeforeInputDomEvent( domRoot, {
							inputType: 'deleteContentBackward',
							ranges: [ domRange ]
						} );

						sinon.assert.calledOnce( deleteSpy );
						sinon.assert.calledWithMatch( deleteSpy, {}, {
							unit: 'codePoint',
							direction: 'backward',
							sequence: 0,
							inputType: 'deleteContentBackward'
						} );

						const range = deleteSpy.firstCall.args[ 1 ].selectionToRemove.getFirstRange();

						expect( range.isEqual( viewRange ) ).to.be.true;
					} );

					it( 'should handle the deleteWordBackward event type and fire the delete event', () => {
						viewSetData( view, '<p>fo{}o</p>' );

						const viewRange = view.document.selection.getFirstRange();
						const domRange = view.domConverter.viewRangeToDom( viewRange );

						fireBeforeInputDomEvent( domRoot, {
							inputType: 'deleteWordBackward',
							ranges: [ domRange ]
						} );

						sinon.assert.calledOnce( deleteSpy );
						sinon.assert.calledWithMatch( deleteSpy, {}, {
							unit: 'word',
							direction: 'backward',
							sequence: 0,
							inputType: 'deleteWordBackward'
						} );

						const range = deleteSpy.firstCall.args[ 1 ].selectionToRemove.getFirstRange();

						expect( range.isEqual( viewRange ) ).to.be.true;
					} );

					it( 'should handle the deleteHardLineBackward event type and fire the delete event', () => {
						viewSetData( view, '<p>fo{}o</p>' );

						const viewRange = view.document.selection.getFirstRange();
						const domRange = view.domConverter.viewRangeToDom( viewRange );

						fireBeforeInputDomEvent( domRoot, {
							inputType: 'deleteHardLineBackward',
							ranges: [ domRange ]
						} );

						sinon.assert.calledOnce( deleteSpy );
						sinon.assert.calledWithMatch( deleteSpy, {}, {
							unit: 'selection',
							direction: 'backward',
							sequence: 0,
							inputType: 'deleteHardLineBackward'
						} );

						const range = deleteSpy.firstCall.args[ 1 ].selectionToRemove.getFirstRange();

						expect( range.isEqual( viewRange ) ).to.be.true;
					} );

					it( 'should handle the deleteSoftLineBackward event type and fire the delete event', () => {
						viewSetData( view, '<p>fo{}o</p>' );

						const viewRange = view.document.selection.getFirstRange();
						const domRange = view.domConverter.viewRangeToDom( viewRange );

						fireBeforeInputDomEvent( domRoot, {
							inputType: 'deleteSoftLineBackward',
							ranges: [ domRange ]
						} );

						sinon.assert.calledOnce( deleteSpy );
						sinon.assert.calledWithMatch( deleteSpy, {}, {
							unit: 'selection',
							direction: 'backward',
							sequence: 0,
							inputType: 'deleteSoftLineBackward'
						} );

						const range = deleteSpy.firstCall.args[ 1 ].selectionToRemove.getFirstRange();

						expect( range.isEqual( viewRange ) ).to.be.true;
					} );
				} );

				describe( 'forward delete event types', () => {
					it( 'should handle the deleteContentForward event type and fire the delete event', () => {
						viewSetData( view, '<p>fo{}o</p>' );

						const viewRange = view.document.selection.getFirstRange();
						const domRange = view.domConverter.viewRangeToDom( viewRange );

						fireBeforeInputDomEvent( domRoot, {
							inputType: 'deleteContentForward',
							ranges: [ domRange ]
						} );

						sinon.assert.calledOnce( deleteSpy );
						sinon.assert.calledWithMatch( deleteSpy, {}, {
							unit: 'character',
							direction: 'forward',
							sequence: 0,
							inputType: 'deleteContentForward'
						} );

						const range = deleteSpy.firstCall.args[ 1 ].selectionToRemove.getFirstRange();

						expect( range.isEqual( viewRange ) ).to.be.true;
					} );

					it( 'should handle the deleteWordForward event type and fire the delete event', () => {
						viewSetData( view, '<p>fo{}o</p>' );

						const viewRange = view.document.selection.getFirstRange();
						const domRange = view.domConverter.viewRangeToDom( viewRange );

						fireBeforeInputDomEvent( domRoot, {
							inputType: 'deleteWordForward',
							ranges: [ domRange ]
						} );

						sinon.assert.calledOnce( deleteSpy );
						sinon.assert.calledWithMatch( deleteSpy, {}, {
							unit: 'word',
							direction: 'forward',
							sequence: 0,
							inputType: 'deleteWordForward'
						} );

						const range = deleteSpy.firstCall.args[ 1 ].selectionToRemove.getFirstRange();

						expect( range.isEqual( viewRange ) ).to.be.true;
					} );

					it( 'should handle the deleteHardLineForward event type and fire the delete event', () => {
						viewSetData( view, '<p>fo{}o</p>' );

						const viewRange = view.document.selection.getFirstRange();
						const domRange = view.domConverter.viewRangeToDom( viewRange );

						fireBeforeInputDomEvent( domRoot, {
							inputType: 'deleteHardLineForward',
							ranges: [ domRange ]
						} );

						sinon.assert.calledOnce( deleteSpy );
						sinon.assert.calledWithMatch( deleteSpy, {}, {
							unit: 'selection',
							direction: 'forward',
							sequence: 0,
							inputType: 'deleteHardLineForward'
						} );

						const range = deleteSpy.firstCall.args[ 1 ].selectionToRemove.getFirstRange();

						expect( range.isEqual( viewRange ) ).to.be.true;
					} );

					it( 'should handle the deleteSoftLineForward event type and fire the delete event', () => {
						viewSetData( view, '<p>fo{}o</p>' );

						const viewRange = view.document.selection.getFirstRange();
						const domRange = view.domConverter.viewRangeToDom( viewRange );

						fireBeforeInputDomEvent( domRoot, {
							inputType: 'deleteSoftLineForward',
							ranges: [ domRange ]
						} );

						sinon.assert.calledOnce( deleteSpy );
						sinon.assert.calledWithMatch( deleteSpy, {}, {
							unit: 'selection',
							direction: 'forward',
							sequence: 0,
							inputType: 'deleteSoftLineForward'
						} );

						const range = deleteSpy.firstCall.args[ 1 ].selectionToRemove.getFirstRange();

						expect( range.isEqual( viewRange ) ).to.be.true;
					} );
				} );
			} );

			describe( 'in Android environment (with some quirks)', () => {
				let domElement, viewRoot, domText;

				testUtils.createSinonSandbox();

				beforeEach( () => {
					// Force the the Android mode.
					testUtils.sinon.stub( env, 'isAndroid' ).get( () => true );

					// Force the browser to use the beforeinput event.
					testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => true );

					domElement = document.createElement( 'div' );
					domElement.contenteditable = true;

					document.body.appendChild( domElement );

					view = new View();
					viewDocument = view.document;
					view.addObserver( DeleteObserver );

					viewRoot = createViewRoot( viewDocument );
					view.attachDomRoot( domElement );

					// <p>foo</p>
					view.change( writer => {
						const p = writer.createContainerElement( 'p' );
						const text = writer.createText( 'foo' );

						writer.insert( writer.createPositionAt( viewRoot, 0 ), p );
						writer.insert( writer.createPositionAt( p, 0 ), text );
					} );

					domText = domElement.childNodes[ 0 ].childNodes[ 0 ];
				} );

				afterEach( () => {
					domElement.remove();
				} );

				describe( 'delete event', () => {
					it( 'should be fired on beforeinput', () => {
						const spy = sinon.spy();

						viewDocument.on( 'delete', spy );

						setDomSelection( domText, 1, domText, 2 );

						viewDocument.fire( 'beforeinput', new DomEventData( viewDocument, getDomEvent(), {
							domTarget: domElement,
							inputType: 'deleteContentBackward',
							targetRanges: []
						} ) );

						expect( spy.calledOnce ).to.be.true;

						const data = spy.args[ 0 ][ 1 ];
						expect( data ).to.have.property( 'direction', 'backward' );
						expect( data ).to.have.property( 'unit', 'codePoint' );
						expect( data ).to.have.property( 'sequence', 1 );
						expect( data ).not.to.have.property( 'selectionToRemove' );
					} );

					it( 'should set selectionToRemove if DOM selection size is different than 1', () => {
						// In real scenarios, before `beforeinput` is fired, browser changes DOM selection to a selection that contains
						// all content that should be deleted. If the selection is big (> 1 character) we need to pass special parameter
						// so that `DeleteCommand` will know what to delete. This test checks that case.
						const spy = sinon.spy();

						viewDocument.on( 'delete', spy );

						setDomSelection( domText, 0, domText, 3 );

						viewDocument.fire( 'beforeinput', new DomEventData( viewDocument, getDomEvent(), {
							domTarget: domElement,
							inputType: 'deleteContentBackward'
						} ) );

						expect( spy.calledOnce ).to.be.true;

						const data = spy.args[ 0 ][ 1 ];
						expect( data ).to.have.property( 'selectionToRemove' );

						const viewText = viewRoot.getChild( 0 ).getChild( 0 );
						const range = data.selectionToRemove.getFirstRange();

						expect( range.start.offset ).to.equal( 0 );
						expect( range.start.parent ).to.equal( viewText );
						expect( range.end.offset ).to.equal( 3 );
						expect( range.end.parent ).to.equal( viewText );
					} );

					it( 'should not fired be on beforeinput when event type is other than deleteContentBackward', () => {
						const spy = sinon.spy();

						viewDocument.on( 'delete', spy );

						viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
							domTarget: domElement,
							inputType: 'insertText'
						} ) );

						expect( spy.calledOnce ).to.be.false;
					} );

					it( 'should stop the beforeinput event when delete event is stopped', () => {
						const keydownSpy = sinon.spy();
						viewDocument.on( 'beforeinput', keydownSpy );
						viewDocument.on( 'delete', evt => evt.stop() );

						viewDocument.fire( 'beforeinput', new DomEventData( viewDocument, getDomEvent(), {
							domTarget: domElement,
							inputType: 'deleteContentBackward'
						} ) );

						sinon.assert.notCalled( keydownSpy );
					} );

					it( 'should not stop keydown event when delete event is not stopped', () => {
						const keydownSpy = sinon.spy();
						viewDocument.on( 'beforeinput', keydownSpy );
						viewDocument.on( 'delete', evt => evt.stop() );

						viewDocument.fire( 'beforeinput', new DomEventData( viewDocument, getDomEvent(), {
							domTarget: domElement,
							inputType: 'insertText'
						} ) );

						sinon.assert.calledOnce( keydownSpy );
					} );
				} );

				function setDomSelection( anchorNode, anchorOffset, focusNode, focusOffset ) {
					const selection = window.getSelection();

					selection.collapse( anchorNode, anchorOffset );
					selection.extend( focusNode, focusOffset );
				}
			} );

			function getDomEvent() {
				return {
					preventDefault: sinon.spy()
				};
			}
		} );
	} );
} );
