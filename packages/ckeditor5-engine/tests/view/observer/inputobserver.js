/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import InputObserver from '../../../src/view/observer/inputobserver';
import DataTransfer from '../../../src/view/datatransfer';
import Range from '../../../src/view/range';
import View from '../../../src/view/view';
import { StylesProcessor } from '../../../src/view/stylesmap';

import createViewRoot from '../_utils/createroot';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';

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
		observer.onDomEvent( Object.assign( {
			type: 'beforeinput',
			getTargetRanges: () => []
		}, domEvtMock ) );

		evtData = beforeInputSpy.firstCall.args[ 1 ];
	}
} );
