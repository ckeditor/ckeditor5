/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { global, env } from '@ckeditor/ckeditor5-utils';

import { InputObserver } from '../../../src/view/observer/inputobserver.js';
import { ViewDataTransfer } from '../../../src/view/datatransfer.js';
import { ViewRange } from '../../../src/view/range.js';
import { EditingView } from '../../../src/view/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

import { createViewRoot } from '../_utils/createroot.js';

describe( 'InputObserver', () => {
	let domEditable, view, viewRoot, viewDocument, observer, evtData, beforeInputSpy;

	beforeEach( () => {
		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;
		domEditable = global.document.createElement( 'div' );
		viewRoot = createViewRoot( viewDocument );

		view.attachDomRoot( domEditable );
		global.document.body.appendChild( domEditable );

		// <p>foo</p>
		view.change( writer => {
			const paragraph = writer.createContainerElement( 'p' );
			const text = writer.createText( 'foo' );

			writer.insert( writer.createPositionAt( paragraph, 0 ), text );
			writer.insert( writer.createPositionAt( viewRoot, 0 ), paragraph );
		} );

		observer = view.getObserver( InputObserver );

		beforeInputSpy = vi.fn();
		viewDocument.on( 'beforeinput', beforeInputSpy );
	} );

	afterEach( () => {
		view.destroy();
		domEditable.remove();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).toContain( 'beforeinput' );
	} );

	it( 'should fire the #beforeinput once for every DOM event', () => {
		fireMockNativeBeforeInput();

		expect( beforeInputSpy ).toHaveBeenCalledOnce();
	} );

	describe( 'event data', () => {
		it( 'should contain #eventType', () => {
			fireMockNativeBeforeInput( {
				inputType: 'foo'
			} );

			expect( evtData.inputType ).toBe( 'foo' );
		} );

		describe( '#dataTransfer', () => {
			it( 'should be an instance of DataTransfer if the DOM event passes data transfer', () => {
				const dataTransferMock = vi.fn();

				dataTransferMock.mockImplementation( type => {
					if ( type === 'foo/bar' ) {
						return 'baz';
					}
				} );

				fireMockNativeBeforeInput( {
					dataTransfer: {
						getData: dataTransferMock
					}
				} );

				expect( evtData.dataTransfer ).toBeInstanceOf( ViewDataTransfer );
				expect( evtData.dataTransfer.getData( 'foo/bar' ) ).toBe( 'baz' );
			} );

			it( 'should be "null" if no data transfer was provided by the DOM event', () => {
				fireMockNativeBeforeInput();

				expect( evtData.dataTransfer ).toBeNull();
			} );
		} );

		describe( '#targetRanges', () => {
			it( 'should be an empty array if there are no native DOM ranges', () => {
				fireMockNativeBeforeInput( {
					getTargetRanges: () => []
				} );

				expect( evtData.targetRanges ).toHaveLength( 0 );
			} );

			it( 'should provide editing view ranges corresponding to DOM ranges passed along with the DOM event', () => {
				const domRange1 = global.document.createRange();
				const domRange2 = global.document.createRange();

				// [<p>foo</p>]
				domRange1.selectNodeContents( domEditable );
				// <p>[fo]o</p>
				domRange2.setStart( domEditable.firstChild.firstChild, 0 );
				domRange2.setEnd( domEditable.firstChild.firstChild, 2 );

				fireMockNativeBeforeInput( {
					getTargetRanges: () => [ domRange1, domRange2 ]
				} );

				expect( evtData.targetRanges ).toHaveLength( 2 );

				const viewRange1 = evtData.targetRanges[ 0 ];
				const viewRange2 = evtData.targetRanges[ 1 ];

				expect( viewRange1 ).toBeInstanceOf( ViewRange );
				expect( viewRange2 ).toBeInstanceOf( ViewRange );

				expect( viewRange1.start.parent ).toBe( viewRoot );
				expect( viewRange1.start.offset ).toBe( 0 );
				expect( viewRange1.end.parent ).toBe( viewRoot );
				expect( viewRange1.end.offset ).toBe( 1 );

				expect( viewRange2.start.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange2.start.offset ).toBe( 0 );
				expect( viewRange2.end.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange2.end.offset ).toBe( 2 );
			} );

			it( 'should exclude inline filler from target ranges', () => {
				// <p><span>foo</span></p>
				view.change( writer => {
					const paragraph = writer.createContainerElement( 'p' );
					const span = writer.createAttributeElement( 'span' );
					const text = writer.createText( 'foo' );

					writer.insert( writer.createPositionAt( paragraph, 0 ), text );
					writer.insert( writer.createPositionAt( viewRoot, 0 ), paragraph );
					writer.wrap( writer.createRangeIn( paragraph ), span );
					writer.setSelection( writer.createPositionAt( paragraph, 1 ) );
				} );

				// <p><span>foo</span> </p> (space after an inline filler)
				view.change( writer => {
					writer.insert( writer.createPositionAt( viewRoot.getChild( 0 ), 1 ), writer.createText( ' ' ) );
				} );

				const domRange = global.document.createRange();
				const preventDefaultSpy = vi.fn();

				// Browser wants to replace last 2 chars with other text, but it includes an inline filler instead of a letter.
				// <p><span>foo</span>[ ]</p>
				domRange.setStart( domEditable.firstChild.childNodes[ 1 ], 6 );
				domRange.setEnd( domEditable.firstChild.childNodes[ 1 ], 8 );

				fireMockNativeBeforeInput( {
					getTargetRanges: () => [ domRange ],
					preventDefault: preventDefaultSpy
				} );

				expect( evtData.targetRanges ).toHaveLength( 1 );

				const viewRange = evtData.targetRanges[ 0 ];

				expect( viewRange ).toBeInstanceOf( ViewRange );

				expect( viewRange.start.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ) );
				expect( viewRange.start.offset ).toBe( 2 );
				expect( viewRange.end.parent ).toBe( viewRoot.getChild( 0 ).getChild( 1 ) );
				expect( viewRange.end.offset ).toBe( 1 );

				expect( preventDefaultSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should provide fixed editing view ranges corresponding to DOM ranges passed along with the DOM event', () => {
				const domRange = global.document.createRange();

				// [<div contenteditable="true">
				// <p>fo]o</p>
				domRange.setStartBefore( domEditable );
				domRange.setEnd( domEditable.firstChild.firstChild, 2 );

				fireMockNativeBeforeInput( {
					getTargetRanges: () => [ domRange ]
				} );

				expect( evtData.targetRanges ).toHaveLength( 1 );

				const viewRange = evtData.targetRanges[ 0 ];

				expect( viewRange ).toBeInstanceOf( ViewRange );

				expect( viewRange.start.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange.start.offset ).toBe( 2 );
				expect( viewRange.end.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange.end.offset ).toBe( 2 );
			} );

			it( 'should provide a range encompassing the selected object when selection is fake', () => {
				const domRange = global.document.createRange();

				vi.spyOn( viewDocument.selection, 'isFake', 'get' ).mockReturnValue( true );
				vi.spyOn( viewDocument.selection, 'getRanges' ).mockReturnValue( [ 'fakeRange1', 'fakeRange2' ] );

				fireMockNativeBeforeInput( {
					getTargetRanges: () => [ domRange ]
				} );

				expect( evtData.targetRanges ).toEqual( [ 'fakeRange1', 'fakeRange2' ] );
			} );

			it( 'should provide editing view ranges corresponding to DOM selection ranges (Android)', () => {
				vi.spyOn( env, 'isAndroid', 'get' ).mockReturnValue( true );

				const selection = domEditable.ownerDocument.defaultView.getSelection();

				// <p>[fo]o</p>
				selection.collapse( domEditable.firstChild.firstChild, 0 );
				selection.extend( domEditable.firstChild.firstChild, 2 );

				fireMockNativeBeforeInput( { target: domEditable } );

				expect( evtData.targetRanges ).toHaveLength( 1 );

				const viewRange = evtData.targetRanges[ 0 ];

				expect( viewRange ).toBeInstanceOf( ViewRange );

				expect( viewRange.start.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange.start.offset ).toBe( 0 );
				expect( viewRange.end.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange.end.offset ).toBe( 2 );
			} );

			describe( 'target range followed by an inline filler', () => {
				it( 'should prevent default if target range end touches an inline filler', () => {
					// <p>om<span>w</span></p>
					view.change( writer => {
						const paragraph = writer.createContainerElement( 'p' );
						const span = writer.createAttributeElement( 'span' );

						writer.insert( writer.createPositionAt( paragraph, 0 ), writer.createText( 'omw' ) );
						writer.insert( writer.createPositionAt( viewRoot, 0 ), paragraph );

						writer.wrap( writer.createRange(
							writer.createPositionAt( paragraph.getChild( 0 ), 2 ),
							writer.createPositionAt( paragraph.getChild( 0 ), 3 )
						), span );

						writer.setSelection( writer.createPositionAt( paragraph, 2 ) );
					} );

					const domRange = global.document.createRange();
					const preventDefaultSpy = vi.fn();

					// The Browser wants to replace 'omw' with other text, but there is an inline filler just after it.
					// <p>{om<span>w}</span>$INLINE_FILLER$</p> -> <p>{On my way!}$INLINE_FILLER$</p>
					// So to avoid inline filler at the end of a text node, we must handle this in engine.
					domRange.setStart( domEditable.firstChild.childNodes[ 0 ], 0 );
					domRange.setEnd( domEditable.firstChild.childNodes[ 1 ].firstChild, 1 );

					fireMockNativeBeforeInput( {
						getTargetRanges: () => [ domRange ],
						preventDefault: preventDefaultSpy
					} );

					expect( preventDefaultSpy ).toHaveBeenCalledOnce();

					expect( evtData.targetRanges ).toHaveLength( 1 );

					const viewRange = evtData.targetRanges[ 0 ];

					expect( viewRange ).toBeInstanceOf( ViewRange );

					expect( viewRange.start.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
					expect( viewRange.start.offset ).toBe( 0 );
					expect( viewRange.end.parent ).toBe( viewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 ) );
					expect( viewRange.end.offset ).toBe( 1 );
				} );

				it( 'should not prevent default if target range end does not touch an inline filler', () => {
					// <p>foo<span>bar</span></p>
					view.change( writer => {
						const paragraph = writer.createContainerElement( 'p' );
						const span = writer.createAttributeElement( 'span' );

						writer.insert( writer.createPositionAt( paragraph, 0 ), writer.createText( 'foobar' ) );
						writer.insert( writer.createPositionAt( viewRoot, 0 ), paragraph );

						writer.wrap( writer.createRange(
							writer.createPositionAt( paragraph.getChild( 0 ), 3 ),
							writer.createPositionAt( paragraph.getChild( 0 ), 6 )
						), span );

						writer.setSelection( writer.createPositionAt( paragraph, 2 ) );
					} );

					const domRange = global.document.createRange();
					const preventDefaultSpy = vi.fn();

					// <p>{foo<span>ba}r</span>$INLINE_FILLER$</p>
					domRange.setStart( domEditable.firstChild.childNodes[ 0 ], 0 );
					domRange.setEnd( domEditable.firstChild.childNodes[ 1 ].firstChild, 2 );

					fireMockNativeBeforeInput( {
						getTargetRanges: () => [ domRange ],
						preventDefault: preventDefaultSpy
					} );

					expect( preventDefaultSpy ).not.toHaveBeenCalled();

					expect( evtData.targetRanges ).toHaveLength( 1 );

					const viewRange = evtData.targetRanges[ 0 ];

					expect( viewRange ).toBeInstanceOf( ViewRange );

					expect( viewRange.start.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
					expect( viewRange.start.offset ).toBe( 0 );
					expect( viewRange.end.parent ).toBe( viewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 ) );
					expect( viewRange.end.offset ).toBe( 2 );
				} );

				it( 'should prevent default if target range end touches an inline filler (deeper nesting)', () => {
					// <p>foo<i><span>bar</span></i></p>
					view.change( writer => {
						const paragraph = writer.createContainerElement( 'p' );
						const span = writer.createAttributeElement( 'span' );
						const italic = writer.createAttributeElement( 'i' );

						writer.insert( writer.createPositionAt( paragraph, 0 ), writer.createText( 'foobar' ) );
						writer.insert( writer.createPositionAt( viewRoot, 0 ), paragraph );

						writer.wrap( writer.createRange(
							writer.createPositionAt( paragraph.getChild( 0 ), 3 ),
							writer.createPositionAt( paragraph.getChild( 0 ), 6 )
						), span );

						writer.wrap( writer.createRangeIn( paragraph.getChild( 1 ) ), italic );

						writer.setSelection( writer.createPositionAt( paragraph, 2 ) );
					} );

					const domRange = global.document.createRange();
					const preventDefaultSpy = vi.fn();

					// <p>{foo<i><span>bar}</i></span>$INLINE_FILLER$</p>
					domRange.setStart( domEditable.firstChild.childNodes[ 0 ], 0 );
					domRange.setEnd( domEditable.firstChild.childNodes[ 1 ].firstChild.firstChild, 3 );

					fireMockNativeBeforeInput( {
						getTargetRanges: () => [ domRange ],
						preventDefault: preventDefaultSpy
					} );

					expect( preventDefaultSpy ).toHaveBeenCalledOnce();

					expect( evtData.targetRanges ).toHaveLength( 1 );

					const viewRange = evtData.targetRanges[ 0 ];

					expect( viewRange ).toBeInstanceOf( ViewRange );

					expect( viewRange.start.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
					expect( viewRange.start.offset ).toBe( 0 );
					expect( viewRange.end.parent ).toBe( viewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ) );
					expect( viewRange.end.offset ).toBe( 3 );
				} );

				it( 'should not prevent default if target range end does not touch an inline filler (deeper nesting)', () => {
					// <p>foo<span><strong>ba</strong>r</span></p>
					view.change( writer => {
						const paragraph = writer.createContainerElement( 'p' );
						const span = writer.createAttributeElement( 'span' );
						const strong = writer.createAttributeElement( 'strong' );

						writer.insert( writer.createPositionAt( paragraph, 0 ), writer.createText( 'foobar' ) );
						writer.insert( writer.createPositionAt( viewRoot, 0 ), paragraph );

						writer.wrap( writer.createRange(
							writer.createPositionAt( paragraph.getChild( 0 ), 3 ),
							writer.createPositionAt( paragraph.getChild( 0 ), 6 )
						), span );

						writer.wrap( writer.createRange(
							writer.createPositionAt( paragraph.getChild( 1 ).getChild( 0 ), 0 ),
							writer.createPositionAt( paragraph.getChild( 1 ).getChild( 0 ), 2 )
						), strong );

						writer.setSelection( writer.createPositionAt( paragraph, 2 ) );
					} );

					const domRange = global.document.createRange();
					const preventDefaultSpy = vi.fn();

					// <p>{foo<span><strong>ba}</strong>r</span>$INLINE_FILLER$</p>
					domRange.setStart( domEditable.firstChild.childNodes[ 0 ], 0 );
					domRange.setEnd( domEditable.firstChild.childNodes[ 1 ].firstChild.firstChild, 2 );

					fireMockNativeBeforeInput( {
						getTargetRanges: () => [ domRange ],
						preventDefault: preventDefaultSpy
					} );

					expect( preventDefaultSpy ).not.toHaveBeenCalled();

					expect( evtData.targetRanges ).toHaveLength( 1 );

					const viewRange = evtData.targetRanges[ 0 ];

					expect( viewRange ).toBeInstanceOf( ViewRange );

					expect( viewRange.start.parent ).toBe( viewRoot.getChild( 0 ).getChild( 0 ) );
					expect( viewRange.start.offset ).toBe( 0 );
					expect( viewRange.end.parent ).toBe( viewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ) );
					expect( viewRange.end.offset ).toBe( 2 );
				} );
			} );
		} );

		describe( '#data', () => {
			it( 'should reflect InputEvent#data (when available)', () => {
				fireMockNativeBeforeInput( {
					data: 'foo'
				} );

				expect( evtData.data ).toBe( 'foo' );
			} );

			it( 'should attempt to use text/plain from #dataTransfer if InputEvent#data is unavailable', () => {
				const dataTransferMock = vi.fn();

				dataTransferMock.mockImplementation( type => {
					if ( type === 'text/plain' ) {
						return 'bar';
					}
				} );

				fireMockNativeBeforeInput( {
					data: null,
					dataTransfer: {
						getData: dataTransferMock
					}
				} );

				expect( evtData.data ).toBe( 'bar' );
			} );

			it( 'should not use text/plain from #dataTransfer if InputEvent#data is an empty string', () => {
				const dataTransferMock = vi.fn();

				dataTransferMock.mockImplementation( type => {
					if ( type === 'text/plain' ) {
						return 'bar';
					}
				} );

				fireMockNativeBeforeInput( {
					data: '',
					dataTransfer: {
						getData: dataTransferMock
					}
				} );

				expect( evtData.data ).toBe( '' );
			} );

			it( 'should be "null" if both InputEvent#data and InputEvent#dataTransfer are unavailable', () => {
				fireMockNativeBeforeInput( {
					data: null,
					dataTransfer: null
				} );

				expect( evtData.data ).toBeNull();
			} );
		} );

		describe( '#isComposing', () => {
			it( 'should reflect InputEvent#isComposing when true', () => {
				fireMockNativeBeforeInput( {
					isComposing: true
				} );

				expect( evtData.isComposing ).toBe( true );
			} );

			it( 'should reflect InputEvent#isComposing when false', () => {
				fireMockNativeBeforeInput( {
					isComposing: false
				} );

				expect( evtData.isComposing ).toBe( false );
			} );

			it( 'should reflect InputEvent#isComposing when not set', () => {
				fireMockNativeBeforeInput();

				expect( evtData.isComposing ).toBeUndefined();
			} );
		} );
	} );

	it( 'should fire insertParagraph if newline character is at the end of data on Android', () => {
		vi.spyOn( env, 'isAndroid', 'get' ).mockReturnValue( true );

		const domRange = global.document.createRange();

		domRange.selectNodeContents( domEditable.firstChild.firstChild );

		fireMockNativeBeforeInput( {
			inputType: 'insertCompositionText',
			data: 'foo\n',
			getTargetRanges: () => [ domRange ]
		} );

		expect( evtData.inputType ).toBe( 'insertParagraph' );
		expect( evtData.targetRanges.length ).toBe( 1 );
		expect( evtData.targetRanges[ 0 ].isEqual( view.createRange(
			view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 'end' )
		) ) ).toBe( true );
	} );

	describe( 'should split single insertText with new-line characters into separate events', () => {
		it( 'single new-line surrounded by text', () => {
			const domRange = global.document.createRange();

			domRange.setStart( domEditable.firstChild.firstChild, 0 );
			domRange.setEnd( domEditable.firstChild.firstChild, 0 );

			// Mocking view selection and offsets since there is no change in the model and view in this tests.
			let i = 0;

			vi.spyOn( viewDocument.selection, 'getFirstRange' ).mockImplementation( () => {
				return view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), i++ )
				);
			} );

			fireMockNativeBeforeInput( {
				inputType: 'insertText',
				data: 'foo\nbar',
				getTargetRanges: () => [ domRange ]
			} );

			expect( beforeInputSpy ).toHaveBeenCalledTimes( 3 );

			const firstCallData = beforeInputSpy.mock.calls[ 0 ][ 1 ];
			const secondCallData = beforeInputSpy.mock.calls[ 1 ][ 1 ];
			const thirdCallData = beforeInputSpy.mock.calls[ 2 ][ 1 ];

			expect( firstCallData.inputType ).toBe( 'insertText' );
			expect( firstCallData.data ).toBe( 'foo' );
			expect( firstCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 )
			) ) ).toBe( true );

			expect( secondCallData.inputType ).toBe( 'insertParagraph' );
			expect( secondCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 1 )
			) ) ).toBe( true );

			expect( thirdCallData.inputType ).toBe( 'insertText' );
			expect( thirdCallData.data ).toBe( 'bar' );
			expect( thirdCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 )
			) ) ).toBe( true );
		} );

		it( 'single new-line surrounded by text (insertReplacementText)', () => {
			const domRange = global.document.createRange();

			domRange.setStart( domEditable.firstChild.firstChild, 0 );
			domRange.setEnd( domEditable.firstChild.firstChild, 0 );

			// Mocking view selection and offsets since there is no change in the model and view in this tests.
			let i = 0;

			vi.spyOn( viewDocument.selection, 'getFirstRange' ).mockImplementation( () => {
				return view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), i++ )
				);
			} );

			fireMockNativeBeforeInput( {
				inputType: 'insertReplacementText',
				data: 'foo\nbar',
				getTargetRanges: () => [ domRange ]
			} );

			expect( beforeInputSpy ).toHaveBeenCalledTimes( 3 );

			const firstCallData = beforeInputSpy.mock.calls[ 0 ][ 1 ];
			const secondCallData = beforeInputSpy.mock.calls[ 1 ][ 1 ];
			const thirdCallData = beforeInputSpy.mock.calls[ 2 ][ 1 ];

			expect( firstCallData.inputType ).toBe( 'insertReplacementText' );
			expect( firstCallData.data ).toBe( 'foo' );
			expect( firstCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 )
			) ) ).toBe( true );

			expect( secondCallData.inputType ).toBe( 'insertParagraph' );
			expect( secondCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 1 )
			) ) ).toBe( true );

			expect( thirdCallData.inputType ).toBe( 'insertReplacementText' );
			expect( thirdCallData.data ).toBe( 'bar' );
			expect( thirdCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 )
			) ) ).toBe( true );
		} );

		it( 'new-line after a text', () => {
			const domRange = global.document.createRange();

			domRange.setStart( domEditable.firstChild.firstChild, 0 );
			domRange.setEnd( domEditable.firstChild.firstChild, 0 );

			vi.spyOn( viewDocument.selection, 'getFirstRange' ).mockImplementation( () => {
				return view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 )
				);
			} );

			fireMockNativeBeforeInput( {
				inputType: 'insertText',
				data: 'foo\n',
				getTargetRanges: () => [ domRange ]
			} );

			expect( beforeInputSpy ).toHaveBeenCalledTimes( 2 );

			const firstCallData = beforeInputSpy.mock.calls[ 0 ][ 1 ];
			const secondCallData = beforeInputSpy.mock.calls[ 1 ][ 1 ];

			expect( firstCallData.inputType ).toBe( 'insertText' );
			expect( firstCallData.data ).toBe( 'foo' );

			expect( secondCallData.inputType ).toBe( 'insertParagraph' );
		} );

		it( 'double new-line surrounded by text', () => {
			const domRange = global.document.createRange();

			domRange.setStart( domEditable.firstChild.firstChild, 0 );
			domRange.setEnd( domEditable.firstChild.firstChild, 0 );

			vi.spyOn( viewDocument.selection, 'getFirstRange' ).mockImplementation( () => {
				return view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 )
				);
			} );

			fireMockNativeBeforeInput( {
				inputType: 'insertText',
				data: 'foo\n\nbar',
				getTargetRanges: () => [ domRange ]
			} );

			expect( beforeInputSpy ).toHaveBeenCalledTimes( 3 );

			const firstCallData = beforeInputSpy.mock.calls[ 0 ][ 1 ];
			const secondCallData = beforeInputSpy.mock.calls[ 1 ][ 1 ];
			const thirdCallData = beforeInputSpy.mock.calls[ 2 ][ 1 ];

			expect( firstCallData.inputType ).toBe( 'insertText' );
			expect( firstCallData.data ).toBe( 'foo' );

			expect( secondCallData.inputType ).toBe( 'insertParagraph' );

			expect( thirdCallData.inputType ).toBe( 'insertText' );
			expect( thirdCallData.data ).toBe( 'bar' );
		} );

		it( 'tripple new-line surrounded by text', () => {
			const domRange = global.document.createRange();

			domRange.setStart( domEditable.firstChild.firstChild, 0 );
			domRange.setEnd( domEditable.firstChild.firstChild, 0 );

			vi.spyOn( viewDocument.selection, 'getFirstRange' ).mockImplementation( () => {
				return view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 )
				);
			} );

			fireMockNativeBeforeInput( {
				inputType: 'insertText',
				data: 'foo\n\n\nbar',
				getTargetRanges: () => [ domRange ]
			} );

			expect( beforeInputSpy ).toHaveBeenCalledTimes( 4 );

			const firstCallData = beforeInputSpy.mock.calls[ 0 ][ 1 ];
			const secondCallData = beforeInputSpy.mock.calls[ 1 ][ 1 ];
			const thirdCallData = beforeInputSpy.mock.calls[ 2 ][ 1 ];
			const fourthCallData = beforeInputSpy.mock.calls[ 3 ][ 1 ];

			expect( firstCallData.inputType ).toBe( 'insertText' );
			expect( firstCallData.data ).toBe( 'foo' );

			expect( secondCallData.inputType ).toBe( 'insertParagraph' );
			expect( thirdCallData.inputType ).toBe( 'insertParagraph' );

			expect( fourthCallData.inputType ).toBe( 'insertText' );
			expect( fourthCallData.data ).toBe( 'bar' );
		} );
	} );

	function fireMockNativeBeforeInput( domEvtMock ) {
		const eventData = Object.assign( {
			type: 'beforeinput',
			getTargetRanges: () => [],
			preventDefault: vi.fn()
		}, domEvtMock );

		eventData.domEvent = {
			get defaultPrevented() {
				return eventData.preventDefault.mock.calls.length > 0;
			}
		};

		observer.onDomEvent( eventData );

		evtData = beforeInputSpy.mock.calls[ 0 ][ 1 ];
	}
} );
