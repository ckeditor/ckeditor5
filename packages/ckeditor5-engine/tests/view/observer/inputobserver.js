/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import InputObserver from '../../../src/view/observer/inputobserver.js';
import DataTransfer from '../../../src/view/datatransfer.js';
import Range from '../../../src/view/range.js';
import View from '../../../src/view/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

import createViewRoot from '../_utils/createroot.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';

describe( 'InputObserver', () => {
	let domEditable, view, viewRoot, viewDocument, observer, evtData, beforeInputSpy;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new View( new StylesProcessor() );
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

		beforeInputSpy = sinon.spy();
		viewDocument.on( 'beforeinput', beforeInputSpy );
	} );

	afterEach( () => {
		view.destroy();
		domEditable.remove();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.contains( 'beforeinput' );
	} );

	it( 'should fire the #beforeinput once for every DOM event', () => {
		fireMockNativeBeforeInput();

		sinon.assert.calledOnce( beforeInputSpy );
	} );

	describe( 'event data', () => {
		it( 'should contain #eventType', () => {
			fireMockNativeBeforeInput( {
				inputType: 'foo'
			} );

			expect( evtData.inputType ).to.equal( 'foo' );
		} );

		describe( '#dataTransfer', () => {
			it( 'should be an instance of DataTransfer if the DOM event passes data transfer', () => {
				const dataTransferMock = sinon.stub();

				dataTransferMock.withArgs( 'foo/bar' ).returns( 'baz' );

				fireMockNativeBeforeInput( {
					dataTransfer: {
						getData: dataTransferMock
					}
				} );

				expect( evtData.dataTransfer ).to.be.instanceOf( DataTransfer );
				expect( evtData.dataTransfer.getData( 'foo/bar' ) ).to.equal( 'baz' );
			} );

			it( 'should be "null" if no data transfer was provided by the DOM event', () => {
				fireMockNativeBeforeInput();

				expect( evtData.dataTransfer ).to.be.null;
			} );
		} );

		describe( '#targetRanges', () => {
			it( 'should be an empty array if there are no native DOM ranges', () => {
				fireMockNativeBeforeInput( {
					getTargetRanges: () => []
				} );

				expect( evtData.targetRanges ).to.be.empty;
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

				expect( evtData.targetRanges ).to.have.length( 2 );

				const viewRange1 = evtData.targetRanges[ 0 ];
				const viewRange2 = evtData.targetRanges[ 1 ];

				expect( viewRange1 ).to.be.instanceOf( Range );
				expect( viewRange2 ).to.be.instanceOf( Range );

				expect( viewRange1.start.parent ).to.equal( viewRoot );
				expect( viewRange1.start.offset ).to.equal( 0 );
				expect( viewRange1.end.parent ).to.equal( viewRoot );
				expect( viewRange1.end.offset ).to.equal( 1 );

				expect( viewRange2.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange2.start.offset ).to.equal( 0 );
				expect( viewRange2.end.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange2.end.offset ).to.equal( 2 );
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
				const preventDefaultSpy = sinon.spy();

				// Browser wants to replace last 2 chars with other text, but it includes an inline filler instead of a letter.
				// <p><span>foo</span>[ ]</p>
				domRange.setStart( domEditable.firstChild.childNodes[ 1 ], 6 );
				domRange.setEnd( domEditable.firstChild.childNodes[ 1 ], 8 );

				fireMockNativeBeforeInput( {
					getTargetRanges: () => [ domRange ],
					preventDefault: preventDefaultSpy
				} );

				expect( evtData.targetRanges ).to.have.length( 1 );

				const viewRange = evtData.targetRanges[ 0 ];

				expect( viewRange ).to.be.instanceOf( Range );

				expect( viewRange.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ) );
				expect( viewRange.start.offset ).to.equal( 2 );
				expect( viewRange.end.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 1 ) );
				expect( viewRange.end.offset ).to.equal( 1 );

				expect( preventDefaultSpy.calledOnce ).to.be.true;
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

				expect( evtData.targetRanges ).to.have.length( 1 );

				const viewRange = evtData.targetRanges[ 0 ];

				expect( viewRange ).to.be.instanceOf( Range );

				expect( viewRange.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange.start.offset ).to.equal( 2 );
				expect( viewRange.end.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange.end.offset ).to.equal( 2 );
			} );

			it( 'should provide a range encompassing the selected object when selection is fake', () => {
				const domRange = global.document.createRange();

				sinon.stub( viewDocument.selection, 'isFake' ).get( () => true );
				sinon.stub( viewDocument.selection, 'getRanges' ).returns( [ 'fakeRange1', 'fakeRange2' ] );

				fireMockNativeBeforeInput( {
					getTargetRanges: () => [ domRange ]
				} );

				expect( evtData.targetRanges ).to.have.ordered.members( [ 'fakeRange1', 'fakeRange2' ] );
			} );

			it( 'should provide editing view ranges corresponding to DOM selection ranges (Android)', () => {
				testUtils.sinon.stub( env, 'isAndroid' ).value( true );

				const selection = domEditable.ownerDocument.defaultView.getSelection();

				// <p>[fo]o</p>
				selection.collapse( domEditable.firstChild.firstChild, 0 );
				selection.extend( domEditable.firstChild.firstChild, 2 );

				fireMockNativeBeforeInput( { target: domEditable } );

				expect( evtData.targetRanges ).to.have.length( 1 );

				const viewRange = evtData.targetRanges[ 0 ];

				expect( viewRange ).to.be.instanceOf( Range );

				expect( viewRange.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange.start.offset ).to.equal( 0 );
				expect( viewRange.end.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange.end.offset ).to.equal( 2 );
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
					const preventDefaultSpy = sinon.spy();

					// The Browser wants to replace 'omw' with other text, but there is an inline filler just after it.
					// <p>{om<span>w}</span>$INLINE_FILLER$</p> -> <p>{On my way!}$INLINE_FILLER$</p>
					// So to avoid inline filler at the end of a text node, we must handle this in engine.
					domRange.setStart( domEditable.firstChild.childNodes[ 0 ], 0 );
					domRange.setEnd( domEditable.firstChild.childNodes[ 1 ].firstChild, 1 );

					fireMockNativeBeforeInput( {
						getTargetRanges: () => [ domRange ],
						preventDefault: preventDefaultSpy
					} );

					expect( preventDefaultSpy.calledOnce ).to.be.true;

					expect( evtData.targetRanges ).to.have.length( 1 );

					const viewRange = evtData.targetRanges[ 0 ];

					expect( viewRange ).to.be.instanceOf( Range );

					expect( viewRange.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
					expect( viewRange.start.offset ).to.equal( 0 );
					expect( viewRange.end.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 ) );
					expect( viewRange.end.offset ).to.equal( 1 );
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
					const preventDefaultSpy = sinon.spy();

					// <p>{foo<span>ba}r</span>$INLINE_FILLER$</p>
					domRange.setStart( domEditable.firstChild.childNodes[ 0 ], 0 );
					domRange.setEnd( domEditable.firstChild.childNodes[ 1 ].firstChild, 2 );

					fireMockNativeBeforeInput( {
						getTargetRanges: () => [ domRange ],
						preventDefault: preventDefaultSpy
					} );

					expect( preventDefaultSpy.calledOnce ).to.be.false;

					expect( evtData.targetRanges ).to.have.length( 1 );

					const viewRange = evtData.targetRanges[ 0 ];

					expect( viewRange ).to.be.instanceOf( Range );

					expect( viewRange.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
					expect( viewRange.start.offset ).to.equal( 0 );
					expect( viewRange.end.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 ) );
					expect( viewRange.end.offset ).to.equal( 2 );
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
					const preventDefaultSpy = sinon.spy();

					// <p>{foo<i><span>bar}</i></span>$INLINE_FILLER$</p>
					domRange.setStart( domEditable.firstChild.childNodes[ 0 ], 0 );
					domRange.setEnd( domEditable.firstChild.childNodes[ 1 ].firstChild.firstChild, 3 );

					fireMockNativeBeforeInput( {
						getTargetRanges: () => [ domRange ],
						preventDefault: preventDefaultSpy
					} );

					expect( preventDefaultSpy.calledOnce ).to.be.true;

					expect( evtData.targetRanges ).to.have.length( 1 );

					const viewRange = evtData.targetRanges[ 0 ];

					expect( viewRange ).to.be.instanceOf( Range );

					expect( viewRange.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
					expect( viewRange.start.offset ).to.equal( 0 );
					expect( viewRange.end.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ) );
					expect( viewRange.end.offset ).to.equal( 3 );
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
					const preventDefaultSpy = sinon.spy();

					// <p>{foo<span><strong>ba}</strong>r</span>$INLINE_FILLER$</p>
					domRange.setStart( domEditable.firstChild.childNodes[ 0 ], 0 );
					domRange.setEnd( domEditable.firstChild.childNodes[ 1 ].firstChild.firstChild, 2 );

					fireMockNativeBeforeInput( {
						getTargetRanges: () => [ domRange ],
						preventDefault: preventDefaultSpy
					} );

					expect( preventDefaultSpy.calledOnce ).to.be.false;

					expect( evtData.targetRanges ).to.have.length( 1 );

					const viewRange = evtData.targetRanges[ 0 ];

					expect( viewRange ).to.be.instanceOf( Range );

					expect( viewRange.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
					expect( viewRange.start.offset ).to.equal( 0 );
					expect( viewRange.end.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ) );
					expect( viewRange.end.offset ).to.equal( 2 );
				} );
			} );
		} );

		describe( '#data', () => {
			it( 'should reflect InputEvent#data (when available)', () => {
				fireMockNativeBeforeInput( {
					data: 'foo'
				} );

				expect( evtData.data ).to.equal( 'foo' );
			} );

			it( 'should attempt to use text/plain from #dataTransfer if InputEvent#data is unavailable', () => {
				const dataTransferMock = sinon.stub();

				dataTransferMock.withArgs( 'text/plain' ).returns( 'bar' );

				fireMockNativeBeforeInput( {
					data: null,
					dataTransfer: {
						getData: dataTransferMock
					}
				} );

				expect( evtData.data ).to.equal( 'bar' );
			} );

			it( 'should not use text/plain from #dataTransfer if InputEvent#data is an empty string', () => {
				const dataTransferMock = sinon.stub();

				dataTransferMock.withArgs( 'text/plain' ).returns( 'bar' );

				fireMockNativeBeforeInput( {
					data: '',
					dataTransfer: {
						getData: dataTransferMock
					}
				} );

				expect( evtData.data ).to.equal( '' );
			} );

			it( 'should be "null" if both InputEvent#data and InputEvent#dataTransfer are unavailable', () => {
				fireMockNativeBeforeInput( {
					data: null,
					dataTransfer: null
				} );

				expect( evtData.data ).to.be.null;
			} );
		} );

		describe( '#isComposing', () => {
			it( 'should reflect InputEvent#isComposing when true', () => {
				fireMockNativeBeforeInput( {
					isComposing: true
				} );

				expect( evtData.isComposing ).to.be.true;
			} );

			it( 'should reflect InputEvent#isComposing when false', () => {
				fireMockNativeBeforeInput( {
					isComposing: false
				} );

				expect( evtData.isComposing ).to.be.false;
			} );

			it( 'should reflect InputEvent#isComposing when not set', () => {
				fireMockNativeBeforeInput();

				expect( evtData.isComposing ).to.be.undefined;
			} );
		} );
	} );

	it( 'should fire insertParagraph if newline character is at the end of data on Android', () => {
		testUtils.sinon.stub( env, 'isAndroid' ).value( true );

		const domRange = global.document.createRange();

		domRange.selectNodeContents( domEditable.firstChild.firstChild );

		fireMockNativeBeforeInput( {
			inputType: 'insertCompositionText',
			data: 'foo\n',
			getTargetRanges: () => [ domRange ]
		} );

		expect( evtData.inputType ).to.equal( 'insertParagraph' );
		expect( evtData.targetRanges.length ).to.equal( 1 );
		expect( evtData.targetRanges[ 0 ].isEqual( view.createRange(
			view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 'end' )
		) ) ).to.be.true;
	} );

	describe( 'should split single insertText with new-line characters into separate events', () => {
		it( 'single new-line surrounded by text', () => {
			const domRange = global.document.createRange();

			domRange.setStart( domEditable.firstChild.firstChild, 0 );
			domRange.setEnd( domEditable.firstChild.firstChild, 0 );

			// Mocking view selection and offsets since there is no change in the model and view in this tests.
			let i = 0;

			sinon.stub( viewDocument.selection, 'getFirstRange' ).callsFake( () => {
				return view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), i++ )
				);
			} );

			fireMockNativeBeforeInput( {
				inputType: 'insertText',
				data: 'foo\nbar',
				getTargetRanges: () => [ domRange ]
			} );

			expect( beforeInputSpy.callCount ).to.equal( 3 );

			const firstCallData = beforeInputSpy.getCall( 0 ).args[ 1 ];
			const secondCallData = beforeInputSpy.getCall( 1 ).args[ 1 ];
			const thirdCallData = beforeInputSpy.getCall( 2 ).args[ 1 ];

			expect( firstCallData.inputType ).to.equal( 'insertText' );
			expect( firstCallData.data ).to.equal( 'foo' );
			expect( firstCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 )
			) ) ).to.be.true;

			expect( secondCallData.inputType ).to.equal( 'insertParagraph' );
			expect( secondCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 1 )
			) ) ).to.be.true;

			expect( thirdCallData.inputType ).to.equal( 'insertText' );
			expect( thirdCallData.data ).to.equal( 'bar' );
			expect( thirdCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 )
			) ) ).to.be.true;
		} );

		it( 'single new-line surrounded by text (insertReplacementText)', () => {
			const domRange = global.document.createRange();

			domRange.setStart( domEditable.firstChild.firstChild, 0 );
			domRange.setEnd( domEditable.firstChild.firstChild, 0 );

			// Mocking view selection and offsets since there is no change in the model and view in this tests.
			let i = 0;

			sinon.stub( viewDocument.selection, 'getFirstRange' ).callsFake( () => {
				return view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), i++ )
				);
			} );

			fireMockNativeBeforeInput( {
				inputType: 'insertReplacementText',
				data: 'foo\nbar',
				getTargetRanges: () => [ domRange ]
			} );

			expect( beforeInputSpy.callCount ).to.equal( 3 );

			const firstCallData = beforeInputSpy.getCall( 0 ).args[ 1 ];
			const secondCallData = beforeInputSpy.getCall( 1 ).args[ 1 ];
			const thirdCallData = beforeInputSpy.getCall( 2 ).args[ 1 ];

			expect( firstCallData.inputType ).to.equal( 'insertReplacementText' );
			expect( firstCallData.data ).to.equal( 'foo' );
			expect( firstCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 )
			) ) ).to.be.true;

			expect( secondCallData.inputType ).to.equal( 'insertParagraph' );
			expect( secondCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 1 )
			) ) ).to.be.true;

			expect( thirdCallData.inputType ).to.equal( 'insertReplacementText' );
			expect( thirdCallData.data ).to.equal( 'bar' );
			expect( thirdCallData.targetRanges[ 0 ].isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 )
			) ) ).to.be.true;
		} );

		it( 'new-line after a text', () => {
			const domRange = global.document.createRange();

			domRange.setStart( domEditable.firstChild.firstChild, 0 );
			domRange.setEnd( domEditable.firstChild.firstChild, 0 );

			sinon.stub( viewDocument.selection, 'getFirstRange' ).callsFake( () => {
				return view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 )
				);
			} );

			fireMockNativeBeforeInput( {
				inputType: 'insertText',
				data: 'foo\n',
				getTargetRanges: () => [ domRange ]
			} );

			expect( beforeInputSpy.callCount ).to.equal( 2 );

			const firstCallData = beforeInputSpy.getCall( 0 ).args[ 1 ];
			const secondCallData = beforeInputSpy.getCall( 1 ).args[ 1 ];

			expect( firstCallData.inputType ).to.equal( 'insertText' );
			expect( firstCallData.data ).to.equal( 'foo' );

			expect( secondCallData.inputType ).to.equal( 'insertParagraph' );
		} );

		it( 'double new-line surrounded by text', () => {
			const domRange = global.document.createRange();

			domRange.setStart( domEditable.firstChild.firstChild, 0 );
			domRange.setEnd( domEditable.firstChild.firstChild, 0 );

			sinon.stub( viewDocument.selection, 'getFirstRange' ).callsFake( () => {
				return view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 )
				);
			} );

			fireMockNativeBeforeInput( {
				inputType: 'insertText',
				data: 'foo\n\nbar',
				getTargetRanges: () => [ domRange ]
			} );

			expect( beforeInputSpy.callCount ).to.equal( 3 );

			const firstCallData = beforeInputSpy.getCall( 0 ).args[ 1 ];
			const secondCallData = beforeInputSpy.getCall( 1 ).args[ 1 ];
			const thirdCallData = beforeInputSpy.getCall( 2 ).args[ 1 ];

			expect( firstCallData.inputType ).to.equal( 'insertText' );
			expect( firstCallData.data ).to.equal( 'foo' );

			expect( secondCallData.inputType ).to.equal( 'insertParagraph' );

			expect( thirdCallData.inputType ).to.equal( 'insertText' );
			expect( thirdCallData.data ).to.equal( 'bar' );
		} );

		it( 'tripple new-line surrounded by text', () => {
			const domRange = global.document.createRange();

			domRange.setStart( domEditable.firstChild.firstChild, 0 );
			domRange.setEnd( domEditable.firstChild.firstChild, 0 );

			sinon.stub( viewDocument.selection, 'getFirstRange' ).callsFake( () => {
				return view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 )
				);
			} );

			fireMockNativeBeforeInput( {
				inputType: 'insertText',
				data: 'foo\n\n\nbar',
				getTargetRanges: () => [ domRange ]
			} );

			expect( beforeInputSpy.callCount ).to.equal( 4 );

			const firstCallData = beforeInputSpy.getCall( 0 ).args[ 1 ];
			const secondCallData = beforeInputSpy.getCall( 1 ).args[ 1 ];
			const thirdCallData = beforeInputSpy.getCall( 2 ).args[ 1 ];
			const fourthCallData = beforeInputSpy.getCall( 3 ).args[ 1 ];

			expect( firstCallData.inputType ).to.equal( 'insertText' );
			expect( firstCallData.data ).to.equal( 'foo' );

			expect( secondCallData.inputType ).to.equal( 'insertParagraph' );
			expect( thirdCallData.inputType ).to.equal( 'insertParagraph' );

			expect( fourthCallData.inputType ).to.equal( 'insertText' );
			expect( fourthCallData.data ).to.equal( 'bar' );
		} );
	} );

	function fireMockNativeBeforeInput( domEvtMock ) {
		const eventData = Object.assign( {
			type: 'beforeinput',
			getTargetRanges: () => [],
			preventDefault: sinon.spy()
		}, domEvtMock );

		eventData.domEvent = {
			get defaultPrevented() {
				return eventData.preventDefault.called;
			}
		};

		observer.onDomEvent( eventData );

		evtData = beforeInputSpy.firstCall.args[ 1 ];
	}
} );
