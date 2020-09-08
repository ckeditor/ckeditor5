/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import InputObserver from '../../../src/view/observer/inputobserver';
import View from '../../../src/view/view';
import createViewRoot from '../_utils/createroot';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { StylesProcessor } from '../../../src/view/stylesmap';
import DataTransfer from '../../../src/view/datatransfer';

describe( 'InputObserver', () => {
	let domEditable, view, viewRoot, viewDocument, observer, evtData, beforeInputSpy;

	beforeEach( () => {
		view = new View( new StylesProcessor() );
		viewDocument = view.document;
		domEditable = global.document.createElement( 'div' );
		viewRoot = createViewRoot( viewDocument );

		view.attachDomRoot( domEditable );

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

		describe( '#domTargetRanges', () => {
			it( 'should be an array of native DOM ranges', () => {
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

				expect( evtData.domTargetRanges ).to.have.ordered.members( [ domRange1, domRange2 ] );
			} );

			it( 'should be an empty array if there are no native DOM ranges', () => {
				fireMockNativeBeforeInput( {
					getTargetRanges: () => []
				} );

				expect( evtData.domTargetRanges ).to.be.empty;
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

				expect( viewRange1.start.parent ).to.equal( viewRoot );
				expect( viewRange1.start.offset ).to.equal( 0 );
				expect( viewRange1.end.parent ).to.equal( viewRoot );
				expect( viewRange1.end.offset ).to.equal( 1 );

				expect( viewRange2.start.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange2.start.offset ).to.equal( 0 );
				expect( viewRange2.end.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( viewRange2.end.offset ).to.equal( 2 );
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

			it( 'should be "null" if both InputEvent#data and InputEvent#dataTransfer are unavailable', () => {
				fireMockNativeBeforeInput( {
					data: null,
					dataTransfer: null
				} );

				expect( evtData.data ).to.be.null;
			} );
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
