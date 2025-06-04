/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DeleteObserver from '../src/deleteobserver.js';

import View from '@ckeditor/ckeditor5-engine/src/view/view.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { fireBeforeInputDomEvent } from './_utils/utils.js';
import { setData as viewSetData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';

describe( 'Delete', () => {
	describe( 'DeleteObserver', () => {
		let view, domRoot, viewRoot, viewDocument;
		let deleteSpy;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			domRoot = document.createElement( 'div' );
			domRoot.contenteditable = true;

			document.body.appendChild( domRoot );

			view = new View();
			viewDocument = view.document;
			viewRoot = createViewRoot( viewDocument );
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

				it( 'should handle the deleteContentBackward event type and fire the delete event on Android', () => {
					testUtils.sinon.stub( env, 'isAndroid' ).value( true );

					viewSetData( view, '<p>f{o}o</p>' );

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
						sequence: 1,
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

		describe( 'using event target ranges (deleteContentBackward)', () => {
			it( 'should not use target ranges if it should remove a single character', () => {
				viewSetData( view, '<container:p>fo{o}</container:p>' );

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

			it( 'should not use target ranges if it should remove a single code point from a combined symbol', () => {
				viewSetData( view, '<container:p>foo{a&#771;}</container:p>' );
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

			it( 'should set selectionToRemove if target ranges include more than a single character', () => {
				viewSetData( view, '<container:p>f{oo}</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				sinon.assert.calledOnce( deleteSpy );
				sinon.assert.calledWithMatch( deleteSpy, {}, {
					unit: 'selection',
					direction: 'backward',
					sequence: 0
				} );

				const data = deleteSpy.args[ 0 ][ 1 ];
				const range = data.selectionToRemove.getFirstRange();
				const viewText = viewRoot.getChild( 0 ).getChild( 0 );

				expect( range.start.offset ).to.equal( 1 );
				expect( range.start.parent ).to.equal( viewText );
				expect( range.end.offset ).to.equal( 3 );
				expect( range.end.parent ).to.equal( viewText );
			} );

			it( 'should not use target ranges if it should remove a single emoji sequence', () => {
				viewSetData( view, '<container:p>foo{👨‍👩‍👧‍👧}</container:p>' );
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

			it( 'should use target ranges if it should remove more than a emoji sequence', () => {
				viewSetData( view, '<container:p>foo{👨‍👩‍👧‍👧👨‍👩‍👧‍👧}</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				sinon.assert.calledOnce( deleteSpy );
				sinon.assert.calledWithMatch( deleteSpy, {}, {
					unit: 'selection',
					direction: 'backward',
					sequence: 0
				} );

				const data = deleteSpy.args[ 0 ][ 1 ];
				const range = data.selectionToRemove.getFirstRange();
				const viewText = viewRoot.getChild( 0 ).getChild( 0 );

				expect( range.start.offset ).to.equal( 3 );
				expect( range.start.parent ).to.equal( viewText );
				expect( range.end.offset ).to.equal( 25 );
				expect( range.end.parent ).to.equal( viewText );
			} );

			it( 'should not use target ranges if it is collapsed', () => {
				viewSetData( view, '<container:p>foo{}</container:p>' );
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

			it( 'should not use target ranges if there is more than one range', () => {
				viewSetData( view, '<container:p>foo{}</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange, domRange ]
				} );

				sinon.assert.calledOnce( deleteSpy );
				sinon.assert.calledWithMatch( deleteSpy, {}, {
					unit: 'codePoint',
					direction: 'backward',
					sequence: 0,
					selectionToRemove: undefined
				} );
			} );

			it( 'should set selectionToRemove if target ranges spans different parent nodes', () => {
				viewSetData( view,
					'<container:p>fo{o</container:p>' +
					'<container:p>]bar</container:p>'
				);
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				sinon.assert.calledOnce( deleteSpy );
				sinon.assert.calledWithMatch( deleteSpy, {}, {
					unit: 'selection',
					direction: 'backward',
					sequence: 0
				} );

				const data = deleteSpy.args[ 0 ][ 1 ];
				const range = data.selectionToRemove.getFirstRange();

				expect( range.start.offset ).to.equal( 2 );
				expect( range.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( range.end.offset ).to.equal( 0 );
				expect( range.end.parent ).to.equal( viewRoot.getChild( 1 ) );
			} );

			it( 'should set selectionToRemove if target ranges spans a single character and an element', () => {
				viewSetData( view, '<container:p>fo{o<empty:br/>]</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				sinon.assert.calledOnce( deleteSpy );
				sinon.assert.calledWithMatch( deleteSpy, {}, {
					unit: 'selection',
					direction: 'backward',
					sequence: 0
				} );

				const data = deleteSpy.args[ 0 ][ 1 ];
				const range = data.selectionToRemove.getFirstRange();

				expect( range.start.offset ).to.equal( 2 );
				expect( range.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( range.end.offset ).to.equal( 2 );
				expect( range.end.parent ).to.equal( viewRoot.getChild( 0 ) );
			} );

			it( 'should not set selectionToRemove if target ranges spans between <p> and <li>', () => {
				viewSetData( view,
					'<container:p>[</container:p>' +
					'<attribute:ul>' +
						'<attribute:li>]</attribute:li>' +
					'</attribute:ul>'
				);
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

			it( 'should not set selectionToRemove if target ranges spans between <p> and bogus paragraph in <li>', () => {
				viewSetData( view,
					'<container:p>[</container:p>' +
					'<attribute:ul>' +
						'<attribute:li>' +
							'<container:span>]</container:span>' +
						'</attribute:li>' +
					'</attribute:ul>'
				);
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

			it( 'should not set selectionToRemove if target ranges spans between <p> and paragraph in <li>', () => {
				viewSetData( view,
					'<container:p>[</container:p>' +
					'<attribute:ul>' +
						'<attribute:li>' +
							'<container:p>]</container:p>' +
						'</attribute:li>' +
					'</attribute:ul>'
				);
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
		} );

		it( 'should implement empty #stopObserving() method', () => {
			expect( () => {
				view.getObserver( DeleteObserver ).stopObserving();
			} ).to.not.throw();
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
