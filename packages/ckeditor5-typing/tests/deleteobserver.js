/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { DeleteObserver } from '../src/deleteobserver.js';

import { EditingView, ViewDocumentDomEventData, _setViewData, StylesProcessor } from '@ckeditor/ckeditor5-engine';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';
import { env, getCode } from '@ckeditor/ckeditor5-utils';
import { fireBeforeInputDomEvent } from './_utils/utils.js';

describe( 'Delete', () => {
	describe( 'DeleteObserver', () => {
		let view, domRoot, viewRoot, viewDocument;
		let deleteSpy;

		afterEach( () => {
			vi.restoreAllMocks();
		} );

		beforeEach( () => {
			domRoot = document.createElement( 'div' );
			domRoot.contenteditable = true;

			document.body.appendChild( domRoot );

			view = new EditingView();
			viewDocument = view.document;
			viewRoot = createViewRoot( viewDocument );
			view.attachDomRoot( domRoot );
			view.addObserver( DeleteObserver );

			deleteSpy = vi.fn();
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

				view = new EditingView( new StylesProcessor() );
				viewDocument = view.document;

				createViewRoot( viewDocument );
				view.attachDomRoot( newDomRoot );

				newDomRoot.remove();
			} ).not.toThrow();
		} );

		it( 'should increment the sequence with every keydown event', () => {
			const deleteSpy = vi.fn();

			viewDocument.on( 'delete', deleteSpy );

			// Simulate that the user keeps pressing the "Delete" key.
			for ( let i = 0; i < 5; ++i ) {
				viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward'
				} );
			}

			expect( deleteSpy ).toHaveBeenCalledTimes( 5 );
			expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 1 } ) );
			expect( deleteSpy.mock.calls[ 1 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 2 } ) );
			expect( deleteSpy.mock.calls[ 2 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 3 } ) );
			expect( deleteSpy.mock.calls[ 3 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 4 } ) );
			expect( deleteSpy.mock.calls[ 4 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 5 } ) );
		} );

		it( 'should reset the sequence on keyup event', () => {
			// Simulate that the user keeps pressing the "Delete" key.
			for ( let i = 0; i < 5; ++i ) {
				viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'delete' )
				} ) );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentForward'
				} );
			}

			viewDocument.fire( 'keyup', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentForward'
			} );

			expect( deleteSpy ).toHaveBeenCalledTimes( 6 );
			expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 1 } ) );
			expect( deleteSpy.mock.calls[ 1 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 2 } ) );
			expect( deleteSpy.mock.calls[ 2 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 3 } ) );
			expect( deleteSpy.mock.calls[ 3 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 4 } ) );
			expect( deleteSpy.mock.calls[ 4 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 5 } ) );
			expect( deleteSpy.mock.calls[ 5 ][ 1 ] ).toEqual( expect.objectContaining( { sequence: 1 } ) );
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

			expect( interceptedEventInfo.stop.called ).toBe( true );
		} );

		it( 'should not stop the beforeinput event propagation if delete event was not stopped', () => {
			let interceptedEventInfo;

			viewDocument.on( 'beforeinput', evt => {
				interceptedEventInfo = evt;
			}, { priority: Number.POSITIVE_INFINITY } );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentBackward'
			} );

			expect( interceptedEventInfo.stop.called ).toBeUndefined();
		} );

		it( 'should never preventDefault() the beforeinput event', () => {
			let interceptedEventData;
			let preventDefaultSpy;

			viewDocument.on( 'beforeinput', ( evt, data ) => {
				interceptedEventData = data;
				preventDefaultSpy = vi.spyOn( interceptedEventData, 'preventDefault' );
			}, { priority: Number.POSITIVE_INFINITY } );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentBackward'
			} );

			expect( preventDefaultSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not work if the observer is disabled', () => {
			view.getObserver( DeleteObserver )._isEnabled = false;

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentBackward'
			} );

			expect( deleteSpy ).not.toHaveBeenCalled();
		} );

		describe( 'beforeinput event types handling', () => {
			describe( 'backward delete event types', () => {
				it( 'should handle the deleteContent event type and fire the delete event', () => {
					_setViewData( view, '<p>fo{}o</p>' );

					const viewRange = view.document.selection.getFirstRange();
					const domRange = view.domConverter.viewRangeToDom( viewRange );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteContent',
						ranges: [ domRange ]
					} );

					expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
					expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
						unit: 'selection',
						direction: 'backward',
						sequence: 0
					} ) );

					const range = deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove.getFirstRange();

					expect( range.isEqual( viewRange ) ).toBe( true );
				} );

				it( 'should handle the deleteContentBackward event type and fire the delete event', () => {
					_setViewData( view, '<p>fo{}o</p>' );

					const viewRange = view.document.selection.getFirstRange();
					const domRange = view.domConverter.viewRangeToDom( viewRange );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteContentBackward',
						ranges: [ domRange ]
					} );

					expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
					expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
						unit: 'codePoint',
						direction: 'backward',
						sequence: 0
					} ) );

					expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
				} );

				it( 'should handle the deleteContentBackward event type and fire the delete event on Android', () => {
					vi.spyOn( env, 'isAndroid', 'get' ).mockReturnValue( true );

					_setViewData( view, '<p>f{o}o</p>' );

					const viewRange = view.document.selection.getFirstRange();
					const domRange = view.domConverter.viewRangeToDom( viewRange );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteContentBackward',
						ranges: [ domRange ]
					} );

					expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
					expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
						unit: 'codePoint',
						direction: 'backward',
						sequence: 1
					} ) );

					expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
				} );

				it( 'should handle the deleteWordBackward event type and fire the delete event', () => {
					_setViewData( view, '<p>fo{}o</p>' );

					const viewRange = view.document.selection.getFirstRange();
					const domRange = view.domConverter.viewRangeToDom( viewRange );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteWordBackward',
						ranges: [ domRange ]
					} );

					expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
					expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
						unit: 'word',
						direction: 'backward',
						sequence: 0
					} ) );

					expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
				} );

				it( 'should handle the deleteHardLineBackward event type and fire the delete event', () => {
					_setViewData( view, '<p>fo{}o</p>' );

					const viewRange = view.document.selection.getFirstRange();
					const domRange = view.domConverter.viewRangeToDom( viewRange );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteHardLineBackward',
						ranges: [ domRange ]
					} );

					expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
					expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
						unit: 'selection',
						direction: 'backward',
						sequence: 0
					} ) );

					const range = deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove.getFirstRange();

					expect( range.isEqual( viewRange ) ).toBe( true );
				} );

				it( 'should handle the deleteSoftLineBackward event type and fire the delete event', () => {
					_setViewData( view, '<p>fo{}o</p>' );

					const viewRange = view.document.selection.getFirstRange();
					const domRange = view.domConverter.viewRangeToDom( viewRange );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteSoftLineBackward',
						ranges: [ domRange ]
					} );

					expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
					expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
						unit: 'selection',
						direction: 'backward',
						sequence: 0
					} ) );

					const range = deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove.getFirstRange();

					expect( range.isEqual( viewRange ) ).toBe( true );
				} );
			} );

			describe( 'forward delete event types', () => {
				it( 'should handle the deleteContentForward event type and fire the delete event', () => {
					_setViewData( view, '<p>fo{}o</p>' );

					const viewRange = view.document.selection.getFirstRange();
					const domRange = view.domConverter.viewRangeToDom( viewRange );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteContentForward',
						ranges: [ domRange ]
					} );

					expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
					expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
						unit: 'character',
						direction: 'forward',
						sequence: 0
					} ) );

					expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
				} );

				it( 'should handle the deleteWordForward event type and fire the delete event', () => {
					_setViewData( view, '<p>fo{}o</p>' );

					const viewRange = view.document.selection.getFirstRange();
					const domRange = view.domConverter.viewRangeToDom( viewRange );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteWordForward',
						ranges: [ domRange ]
					} );

					expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
					expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
						unit: 'word',
						direction: 'forward',
						sequence: 0
					} ) );

					expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
				} );

				it( 'should handle the deleteHardLineForward event type and fire the delete event', () => {
					_setViewData( view, '<p>fo{}o</p>' );

					const viewRange = view.document.selection.getFirstRange();
					const domRange = view.domConverter.viewRangeToDom( viewRange );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteHardLineForward',
						ranges: [ domRange ]
					} );

					expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
					expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
						unit: 'selection',
						direction: 'forward',
						sequence: 0
					} ) );

					const range = deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove.getFirstRange();

					expect( range.isEqual( viewRange ) ).toBe( true );
				} );

				it( 'should handle the deleteSoftLineForward event type and fire the delete event', () => {
					_setViewData( view, '<p>fo{}o</p>' );

					const viewRange = view.document.selection.getFirstRange();
					const domRange = view.domConverter.viewRangeToDom( viewRange );

					fireBeforeInputDomEvent( domRoot, {
						inputType: 'deleteSoftLineForward',
						ranges: [ domRange ]
					} );

					expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
					expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
						unit: 'selection',
						direction: 'forward',
						sequence: 0
					} ) );

					const range = deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove.getFirstRange();

					expect( range.isEqual( viewRange ) ).toBe( true );
				} );
			} );
		} );

		describe( 'using event target ranges (deleteContentBackward)', () => {
			it( 'should not use target ranges if it should remove a single character', () => {
				_setViewData( view, '<container:p>fo{o}</container:p>' );

				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'codePoint',
					direction: 'backward',
					sequence: 0
				} ) );

				expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
			} );

			it( 'should not use target ranges if it should remove a single code point from a combined symbol', () => {
				_setViewData( view, '<container:p>foo{a&#771;}</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'codePoint',
					direction: 'backward',
					sequence: 0
				} ) );

				expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
			} );

			it( 'should set selectionToRemove if target ranges include more than a single character', () => {
				_setViewData( view, '<container:p>f{oo}</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'selection',
					direction: 'backward',
					sequence: 0
				} ) );

				const data = deleteSpy.mock.calls[ 0 ][ 1 ];
				const range = data.selectionToRemove.getFirstRange();
				const viewText = viewRoot.getChild( 0 ).getChild( 0 );

				expect( range.start.offset ).toBe( 1 );
				expect( range.start.parent ).toBe( viewText );
				expect( range.end.offset ).toBe( 3 );
				expect( range.end.parent ).toBe( viewText );
			} );

			it( 'should not use target ranges if it should remove a single emoji sequence', () => {
				_setViewData( view, '<container:p>foo{👨‍👩‍👧‍👧}</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'codePoint',
					direction: 'backward',
					sequence: 0
				} ) );

				expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
			} );

			it( 'should use target ranges if it should remove more than a emoji sequence', () => {
				_setViewData( view, '<container:p>foo{👨‍👩‍👧‍👧👨‍👩‍👧‍👧}</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'selection',
					direction: 'backward',
					sequence: 0
				} ) );

				const data = deleteSpy.mock.calls[ 0 ][ 1 ];
				const range = data.selectionToRemove.getFirstRange();
				const viewText = viewRoot.getChild( 0 ).getChild( 0 );

				expect( range.start.offset ).toBe( 3 );
				expect( range.start.parent ).toBe( viewText );
				expect( range.end.offset ).toBe( 25 );
				expect( range.end.parent ).toBe( viewText );
			} );

			it( 'should not use target ranges if it is collapsed', () => {
				_setViewData( view, '<container:p>foo{}</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'codePoint',
					direction: 'backward',
					sequence: 0
				} ) );

				expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
			} );

			it( 'should not use target ranges if there is more than one range', () => {
				_setViewData( view, '<container:p>foo{}</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange, domRange ]
				} );

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'codePoint',
					direction: 'backward',
					sequence: 0
				} ) );

				expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
			} );

			it( 'should set selectionToRemove if target ranges spans different parent nodes', () => {
				_setViewData( view,
					'<container:p>fo{o</container:p>' +
					'<container:p>]bar</container:p>'
				);
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'selection',
					direction: 'backward',
					sequence: 0
				} ) );

				const data = deleteSpy.mock.calls[ 0 ][ 1 ];
				const range = data.selectionToRemove.getFirstRange();

				expect( range.start.offset ).toBe( 2 );
				expect( range.start.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( range.end.offset ).toBe( 0 );
				expect( range.end.parent ).toBe( viewRoot.getChild( 1 ) );
			} );

			it( 'should set selectionToRemove if target ranges spans a single character and an element', () => {
				_setViewData( view, '<container:p>fo{o<empty:br/>]</container:p>' );
				const viewRange = view.document.selection.getFirstRange();
				const domRange = view.domConverter.viewRangeToDom( viewRange );

				fireBeforeInputDomEvent( domRoot, {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'selection',
					direction: 'backward',
					sequence: 0
				} ) );

				const data = deleteSpy.mock.calls[ 0 ][ 1 ];
				const range = data.selectionToRemove.getFirstRange();

				expect( range.start.offset ).toBe( 2 );
				expect( range.start.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( range.end.offset ).toBe( 2 );
				expect( range.end.parent ).toBe( viewRoot.getChild( 0 ) );
			} );

			it( 'should not set selectionToRemove if target ranges spans between <p> and <li>', () => {
				_setViewData( view,
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

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'codePoint',
					direction: 'backward',
					sequence: 0
				} ) );

				expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
			} );

			it( 'should not set selectionToRemove if target ranges spans between <p> and bogus paragraph in <li>', () => {
				_setViewData( view,
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

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'codePoint',
					direction: 'backward',
					sequence: 0
				} ) );

				expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
			} );

			it( 'should not set selectionToRemove if target ranges spans between <p> and paragraph in <li>', () => {
				_setViewData( view,
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

				expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
				expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( {
					unit: 'codePoint',
					direction: 'backward',
					sequence: 0
				} ) );

				expect( deleteSpy.mock.calls[ 0 ][ 1 ].selectionToRemove ).toBeUndefined();
			} );
		} );

		it( 'should implement empty #stopObserving() method', () => {
			expect( () => {
				view.getObserver( DeleteObserver ).stopObserving();
			} ).not.toThrow();
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: vi.fn()
		};
	}
} );
