/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import DeleteObserver from '../src/deleteobserver';

import View from '@ckeditor/ckeditor5-engine/src/view/view';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { fireBeforeInputDomEvent } from './_utils/utils';
import { setData as viewSetData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

describe( 'Delete', () => {
	describe( 'DeleteObserver', () => {
		let view, domRoot, viewDocument;
		let deleteSpy;

		testUtils.createSinonSandbox();

		beforeEach( () => {
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
			view.destroy();
			domRoot.remove();
		} );

		// See ckeditor/ckeditor5-enter#10.
		it( 'can be initialized', () => {
			expect( () => {
				const newDomRoot = document.createElement( 'div' );

				view = new View( new StylesProcessor() );
				viewDocument = view.document;

				createViewRoot( viewDocument );
				view.attachDomRoot( newDomRoot );

				newDomRoot.remove();
			} ).to.not.throw();
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
					inputType: 'deleteContentForward'
				} );
			}

			viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentForward'
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

		it( 'should never preventDefault() the beforeinput event', () => {
			let interceptedEventData;

			viewDocument.on( 'beforeinput', ( evt, data ) => {
				interceptedEventData = data;
				sinon.spy( interceptedEventData, 'preventDefault' );
			}, { priority: Number.POSITIVE_INFINITY } );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentBackward'
			} );

			sinon.assert.notCalled( interceptedEventData.preventDefault );
		} );

		it( 'should not work if the observer is disabled', () => {
			view.getObserver( DeleteObserver )._isEnabled = false;

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentBackward'
			} );

			sinon.assert.notCalled( deleteSpy );
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
						sequence: 0
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
						selectionToRemove: undefined
					} );
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
						selectionToRemove: undefined
					} );
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
						sequence: 0
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
						sequence: 0
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
						selectionToRemove: undefined
					} );
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
						selectionToRemove: undefined
					} );
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
						sequence: 0
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
						sequence: 0
					} );

					const range = deleteSpy.firstCall.args[ 1 ].selectionToRemove.getFirstRange();

					expect( range.isEqual( viewRange ) ).to.be.true;
				} );
			} );
		} );

		describe( 'in Android environment (with some quirks)', () => {
			let domElement, viewRoot, viewText;

			beforeEach( () => {
				// Force the the Android mode.
				testUtils.sinon.stub( env, 'isAndroid' ).value( true );

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

				viewText = viewRoot.getChild( 0 ).getChild( 0 );
			} );

			afterEach( () => {
				domElement.remove();
			} );

			describe( 'delete event', () => {
				it( 'should be fired on beforeinput', () => {
					const spy = sinon.spy();

					viewDocument.on( 'delete', spy );

					viewDocument.fire( 'beforeinput', new DomEventData( viewDocument, getDomEvent(), {
						domTarget: domElement,
						inputType: 'deleteContentBackward',
						targetRanges: [
							view.createRange( view.createPositionAt( viewText, 1 ), view.createPositionAt( viewText, 2 ) )
						]
					} ) );

					expect( spy.calledOnce ).to.be.true;

					const data = spy.args[ 0 ][ 1 ];
					expect( data ).to.have.property( 'direction', 'backward' );
					expect( data ).to.have.property( 'unit', 'codePoint' );
					expect( data ).to.have.property( 'sequence', 1 );
					expect( data ).not.to.have.property( 'selectionToRemove' );
				} );

				it( 'should set selectionToRemove if target ranges size is different than 1', () => {
					// In real scenarios, before `beforeinput` is fired, browser changes DOM selection to a selection that contains
					// all content that should be deleted. If the selection is big (> 1 character) we need to pass special parameter
					// so that `DeleteCommand` will know what to delete. This test checks that case.
					const spy = sinon.spy();

					viewDocument.on( 'delete', spy );

					viewDocument.fire( 'beforeinput', new DomEventData( viewDocument, getDomEvent(), {
						domTarget: domElement,
						inputType: 'deleteContentBackward',
						targetRanges: [
							view.createRange( view.createPositionAt( viewText, 0 ), view.createPositionAt( viewText, 3 ) )
						]
					} ) );

					expect( spy.calledOnce ).to.be.true;

					const data = spy.args[ 0 ][ 1 ];
					expect( data ).to.have.property( 'selectionToRemove' );

					const range = data.selectionToRemove.getFirstRange();

					expect( range.start.offset ).to.equal( 0 );
					expect( range.start.parent ).to.equal( viewText );
					expect( range.end.offset ).to.equal( 3 );
					expect( range.end.parent ).to.equal( viewText );
				} );

				it( 'should set selectionToRemove if target ranges spans different parent nodes', () => {
					// In real scenarios, before `beforeinput` is fired, browser changes DOM selection to a selection that contains
					// all content that should be deleted. If the selection is big (> 1 character) we need to pass special parameter
					// so that `DeleteCommand` will know what to delete. This test checks that case.
					const spy = sinon.spy();

					viewDocument.on( 'delete', spy );

					viewDocument.fire( 'beforeinput', new DomEventData( viewDocument, getDomEvent(), {
						domTarget: domElement,
						inputType: 'deleteContentBackward',
						targetRanges: [
							view.createRange( view.createPositionAt( viewRoot.getChild( 0 ), 0 ), view.createPositionAt( viewText, 1 ) )
						]
					} ) );

					expect( spy.calledOnce ).to.be.true;

					const data = spy.args[ 0 ][ 1 ];
					expect( data ).to.have.property( 'selectionToRemove' );

					const range = data.selectionToRemove.getFirstRange();

					expect( range.start.offset ).to.equal( 0 );
					expect( range.start.parent ).to.equal( viewRoot.getChild( 0 ) );
					expect( range.end.offset ).to.equal( 1 );
					expect( range.end.parent ).to.equal( viewText );
				} );

				it( 'should not fired be on beforeinput when event type is other than deleteContentBackward', () => {
					const spy = sinon.spy();

					viewDocument.on( 'delete', spy );

					viewDocument.fire( 'beforeinput', new DomEventData( viewDocument, getDomEvent(), {
						domTarget: domElement,
						inputType: 'insertText',
						targetRanges: []
					} ) );

					expect( spy.calledOnce ).to.be.false;
				} );

				it( 'should stop the beforeinput event when delete event is stopped', () => {
					const keydownSpy = sinon.spy();
					viewDocument.on( 'beforeinput', keydownSpy );
					viewDocument.on( 'delete', evt => evt.stop() );

					viewDocument.fire( 'beforeinput', new DomEventData( viewDocument, getDomEvent(), {
						domTarget: domElement,
						inputType: 'deleteContentBackward',
						targetRanges: []
					} ) );

					sinon.assert.notCalled( keydownSpy );
				} );

				it( 'should not stop keydown event when delete event is not stopped', () => {
					const keydownSpy = sinon.spy();
					viewDocument.on( 'beforeinput', keydownSpy );
					viewDocument.on( 'delete', evt => evt.stop() );

					viewDocument.fire( 'beforeinput', new DomEventData( viewDocument, getDomEvent(), {
						domTarget: domElement,
						inputType: 'insertText',
						targetRanges: []
					} ) );

					sinon.assert.calledOnce( keydownSpy );
				} );
			} );
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
