/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import Clipboard from '../src/clipboard.js';

describe( 'Clipboard Markers Utils', () => {
	let editor, model, modelRoot, element, viewDocument, clipboardMarkersUtils, getUniqueMarkerNameStub;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		await createEditor();
	} );

	afterEach( async () => {
		await editor.destroy();

		element.remove();
	} );

	describe( 'Check markers selection intersection', () => {
		beforeEach( () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', [ 'copy' ] );
		} );

		it( 'should copy and paste marker that is inside selection', () => {
			setModelData(
				model,
				wrapWithTag( 'paragraph', '' ) +
					wrapWithTag( 'paragraph', 'Foo Bar Test' ) +
					wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 1, 4 ], end: [ 1, 7 ] } );

			model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ) );
			} );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			viewDocument.fire( 'copy', data );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeIn( editor.model.document.getRoot().getChild( 2 ) ),
					0
				);
			} );

			viewDocument.fire( 'paste', data );

			checkMarker( 'comment:test:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 2, 4 ] ),
				model.createPositionFromPath( modelRoot, [ 2, 7 ] )
			) );
		} );

		it( 'should copy and paste marker that is outside selection', () => {
			setModelData(
				model,
				wrapWithTag( 'paragraph', 'Start' ) +
					wrapWithTag( 'paragraph', 'Foo Bar Test' ) +
					wrapWithTag( 'paragraph', 'End' )
			);

			appendMarker( 'comment:test', { start: [ 0 ], end: [ 3 ] } );
			model.change( writer => {
				writer.setSelection(
					writer.createRangeOn( editor.model.document.getRoot().getChild( 1 ) ),
					0
				);
			} );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			viewDocument.fire( 'copy', data );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeIn( editor.model.document.getRoot().getChild( 2 ) ),
					0
				);
			} );

			viewDocument.fire( 'paste', data );

			checkMarker( 'comment:test:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 2, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 2, 12 ] )
			) );
		} );

		it( 'should copy and paste marker that starts before selection', () => {
			setModelData(
				model,
				wrapWithTag( 'paragraph', 'Hello World' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 0 ], end: [ 0, 5 ] } );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeOn( editor.model.document.getRoot().getChild( 0 ) ),
					0
				);
			} );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			viewDocument.fire( 'copy', data );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ),
					0
				);
			} );

			viewDocument.fire( 'paste', data );

			checkMarker( 'comment:test:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 1, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 1, 5 ] )
			) );
		} );

		it( 'should copy and paste marker that starts after selection', () => {
			setModelData(
				model,
				wrapWithTag( 'paragraph', 'Hello World' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 6 ], end: [ 0, 11 ] } );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeOn( editor.model.document.getRoot().getChild( 0 ) ),
					0
				);
			} );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			viewDocument.fire( 'copy', data );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ),
					0
				);
			} );

			viewDocument.fire( 'paste', data );

			checkMarker( 'comment:test:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 1, 6 ] ),
				model.createPositionFromPath( modelRoot, [ 1, 11 ] )
			) );
		} );

		it( 'copy and paste markers does not affect position of markers that are after selection', () => {
			setModelData(
				model,
				wrapWithTag( 'paragraph', 'Hello World Hello World' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 6 ], end: [ 0, 11 ] } );
			appendMarker( 'comment:test2', { start: [ 0, 0 ], end: [ 0, 14 ] } );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeOn( editor.model.document.getRoot().getChild( 0 ) ),
					0
				);
			} );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			viewDocument.fire( 'copy', data );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ),
					0
				);
			} );

			viewDocument.fire( 'paste', data );

			checkMarker( 'comment:test:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 1, 6 ] ),
				model.createPositionFromPath( modelRoot, [ 1, 11 ] )
			) );

			checkMarker( 'comment:test2:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 1, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 1, 14 ] )
			) );
		} );
	} );

	describe( '_canPerformMarkerClipboardAction', () => {
		it( 'returns false on non existing clipboard markers', () => {
			const result = clipboardMarkersUtils._canPerformMarkerClipboardAction( 'Hello', 'cut' );

			expect( result ).to.false;
		} );
	} );

	describe( '_getUniqueMarkerName', () => {
		it( 'replaces only ID part of three segmented marker name', () => {
			getUniqueMarkerNameStub.restore();

			const firstResult = clipboardMarkersUtils._getUniqueMarkerName( 'comment:thread:123123' );
			const secondResult = clipboardMarkersUtils._getUniqueMarkerName( 'comment:thread:123123' );

			expect( firstResult.startsWith( 'comment:thread:' ) ).to.be.true;
			expect( firstResult ).not.to.eq( 'comment:thread:123123' );

			expect( firstResult ).not.to.eq( secondResult );
		} );

		it( 'replaces only ID part of two segmented marker name', () => {
			getUniqueMarkerNameStub.restore();

			const firstResult = clipboardMarkersUtils._getUniqueMarkerName( 'comment:thread' );
			const secondResult = clipboardMarkersUtils._getUniqueMarkerName( 'comment:thread' );

			expect( firstResult.startsWith( 'comment:thread' ) ).to.be.true;
			expect( firstResult ).not.to.eq( 'comment:thread' );
			expect( firstResult ).not.to.eq( secondResult );
		} );
	} );

	describe( 'restrictions', () => {
		it( 'should not be possible to copy and paste with restrictions', () => {
			setModelData(
				model,
				wrapWithTag( 'paragraph', 'Start' ) +
					wrapWithTag( 'paragraph', 'Foo Bar Test' ) +
					wrapWithTag( 'paragraph', 'End' )
			);

			appendMarker( 'comment:test', { start: [ 0 ], end: [ 3 ] } );
			model.change( writer => {
				writer.setSelection(
					writer.createRangeOn( editor.model.document.getRoot().getChild( 1 ) ),
					0
				);
			} );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			viewDocument.fire( 'copy', data );

			expect( data.dataTransfer.getData( 'text/html' ) ).to.equal( 'Foo Bar Test' );
		} );

		it( 'should be possible to force markers copy', () => {
			clipboardMarkersUtils._forceMarkersCopy( 'comment', () => {
				setModelData(
					model,
					wrapWithTag( 'paragraph', 'Start' ) +
						wrapWithTag( 'paragraph', 'Foo Bar Test' ) +
						wrapWithTag( 'paragraph', 'End' )
				);

				appendMarker( 'comment:test', { start: [ 0 ], end: [ 3 ] } );
				model.change( writer => {
					writer.setSelection(
						writer.createRangeOn( editor.model.document.getRoot().getChild( 1 ) ),
						0
					);
				} );

				const data = {
					dataTransfer: createDataTransfer(),
					preventDefault: () => {},
					stopPropagation: () => {}
				};

				viewDocument.fire( 'copy', data );

				model.change( writer => {
					writer.setSelection(
						writer.createRangeIn( editor.model.document.getRoot().getChild( 2 ) ),
						0
					);
				} );

				viewDocument.fire( 'paste', data );

				checkMarker( 'comment:test:pasted', model.createRange(
					model.createPositionFromPath( modelRoot, [ 2, 0 ] ),
					model.createPositionFromPath( modelRoot, [ 2, 12 ] )
				) );
			} );
		} );

		it( 'should be possible to force markers copy #2 - unregistered marker', () => {
			clipboardMarkersUtils._forceMarkersCopy( 'new', () => {
				setModelData(
					model,
					wrapWithTag( 'paragraph', 'Start' ) +
					wrapWithTag( 'paragraph', 'Foo Bar Test' ) +
					wrapWithTag( 'paragraph', 'End' )
				);

				appendMarker( 'new:test', { start: [ 0 ], end: [ 3 ] } );
				model.change( writer => {
					writer.setSelection(
						writer.createRangeOn( editor.model.document.getRoot().getChild( 1 ) ),
						0
					);
				} );

				const data = {
					dataTransfer: createDataTransfer(),
					preventDefault: () => {},
					stopPropagation: () => {}
				};

				viewDocument.fire( 'copy', data );

				model.change( writer => {
					writer.setSelection(
						writer.createRangeIn( editor.model.document.getRoot().getChild( 2 ) ),
						0
					);
				} );

				viewDocument.fire( 'paste', data );

				checkMarker( 'new:test:pasted', model.createRange(
					model.createPositionFromPath( modelRoot, [ 2, 0 ] ),
					model.createPositionFromPath( modelRoot, [ 2, 12 ] )
				) );
			} );
		} );
	} );

	async function createEditor() {
		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, Clipboard ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		viewDocument = editor.editing.view.document;

		clipboardMarkersUtils = editor.plugins.get( 'ClipboardMarkersUtils' );
		clipboardMarkersUtils._registerMarkerToCopy( 'comment', [ ] );

		getUniqueMarkerNameStub = sinon
			.stub( clipboardMarkersUtils, '_getUniqueMarkerName' )
			.callsFake( markerName => `${ markerName }:pasted` );

		editor.conversion.for( 'downcast' ).markerToData( {
			model: 'comment'
		} );

		editor.conversion.for( 'upcast' ).dataToMarker( {
			view: 'comment'
		} );

		editor.conversion.for( 'downcast' ).markerToData( {
			model: 'new'
		} );

		editor.conversion.for( 'upcast' ).dataToMarker( {
			view: 'new'
		} );
	}

	function wrapWithTag( tag, content ) {
		return `<${ tag }>${ content }</${ tag }>`;
	}

	function appendMarker( name, { start, end } ) {
		editor.model.change( writer => {
			const range = model.createRange(
				model.createPositionFromPath( modelRoot, start ),
				model.createPositionFromPath( modelRoot, end )
			);

			writer.addMarker( name, { usingOperation: false, affectsData: true, range } );
		} );
	}

	function checkMarker( name, range ) {
		const marker = editor.model.markers.get( name );

		expect( marker ).to.not.be.null;
		expect( marker.getRange().isEqual( range ) ).to.be.true;
	}

	function createDataTransfer() {
		const store = new Map();

		return {
			setData( type, data ) {
				store.set( type, data );
			},

			getData( type ) {
				return store.get( type );
			}
		};
	}
} );
