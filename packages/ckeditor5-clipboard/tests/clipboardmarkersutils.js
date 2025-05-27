/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import DocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment.js';
import Position from '@ckeditor/ckeditor5-engine/src/model/position.js';
import Range from '@ckeditor/ckeditor5-engine/src/model/range.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { parse, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import Clipboard from '../src/clipboard.js';
import ClipboardMarkersUtils from '../src/clipboardmarkersutils.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ClipboardMarkersUtils.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ClipboardMarkersUtils.isPremiumPlugin ).to.be.false;
	} );

	describe( 'Check markers selection intersection', () => {
		beforeEach( () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', {
				allowedActions: [ 'copy' ],
				copyPartiallySelected: true,
				duplicateOnPaste: true
			} );
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

			checkMarker( 'comment:test:pasted', {
				start: [ 2, 4 ],
				end: [ 2, 7 ]
			} );
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

			checkMarker( 'comment:test:pasted', {
				start: [ 2, 0 ],
				end: [ 2, 12 ]
			} );
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

			checkMarker( 'comment:test:pasted', {
				start: [ 1, 0 ],
				end: [ 1, 5 ]
			} );
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

			checkMarker( 'comment:test:pasted', {
				start: [ 1, 6 ],
				end: [ 1, 11 ]
			} );
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

			checkMarker( 'comment:test:pasted', {
				start: [ 1, 6 ],
				end: [ 1, 11 ]
			} );

			checkMarker( 'comment:test2:pasted', {
				start: [ 1, 0 ],
				end: [ 1, 14 ]
			} );
		} );

		it( 'copy and paste fake marker that is inside another fake marker aligned to right', () => {
			setModelData(
				model,
				wrapWithTag( 'paragraph', 'Fake Marker' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 2 ], end: [ 0, 11 ] } );
			appendMarker( 'comment:test2', { start: [ 0, 6 ], end: [ 0, 11 ] } );

			model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
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

			checkMarker( 'comment:test:pasted', {
				start: [ 1, 2 ],
				end: [ 1, 11 ]
			} );

			checkMarker( 'comment:test2:pasted', {
				start: [ 1, 6 ],
				end: [ 1, 11 ]
			} );
		} );

		it( 'copy and paste fake marker that is inside another fake marker aligned to left', () => {
			setModelData(
				model,
				wrapWithTag( 'paragraph', 'Fake Marker' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 0 ], end: [ 0, 11 ] } );
			appendMarker( 'comment:test2', { start: [ 0, 0 ], end: [ 0, 5 ] } );

			model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
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

			checkMarker( 'comment:test:pasted', {
				start: [ 1, 0 ],
				end: [ 1, 11 ]
			} );

			checkMarker( 'comment:test2:pasted', {
				start: [ 1, 0 ],
				end: [ 1, 5 ]
			} );
		} );

		it( 'copy and paste fake marker that is inside another larger fake marker', () => {
			setModelData(
				model,
				wrapWithTag( 'paragraph', 'Fake Marker' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 0 ], end: [ 0, 11 ] } );
			appendMarker( 'comment:test2', { start: [ 0, 5 ], end: [ 0, 8 ] } );

			model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
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

			checkMarker( 'comment:test:pasted', {
				start: [ 1, 0 ],
				end: [ 1, 11 ]
			} );

			checkMarker( 'comment:test2:pasted', {
				start: [ 1, 5 ],
				end: [ 1, 8 ]
			} );
		} );
	} );

	describe( 'Restrictions', () => {
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
	} );

	describe( 'Copy partial selection', () => {
		it( 'should be possible to copy partially selected markers if `copyPartiallySelected` is set to `true`', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', {
				allowedActions: 'all',
				copyPartiallySelected: true,
				duplicateOnPaste: true
			} );

			setModelData(
				model,
				wrapWithTag( 'paragraph', '[He]llo World' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 1 ], end: [ 0, 4 ] } );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			viewDocument.fire( 'cut', data );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ),
					0
				);
			} );

			viewDocument.fire( 'paste', data );

			expect( model.markers.has( 'comment:test:pasted' ) ).to.true;
		} );

		it( 'should not be possible to copy partially selected markers if `copyPartiallySelected` is set to `false`', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', { allowedActions: 'all', copyPartiallySelected: false } );

			setModelData(
				model,
				wrapWithTag( 'paragraph', '[He]llo World' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 1 ], end: [ 0, 4 ] } );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			viewDocument.fire( 'cut', data );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ),
					0
				);
			} );

			viewDocument.fire( 'paste', data );

			expect( model.markers.has( 'comment:test:pasted' ) ).to.false;
		} );
	} );

	describe( 'duplicateOnPaste flag behavior', () => {
		it( 'should insert marker with regenerated ID on cut and `duplicateOnPaste` is set to `false`', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', {
				allowedActions: 'all',
				duplicateOnPaste: false,
				copyPartiallySelected: true
			} );

			setModelData(
				model,
				wrapWithTag( 'paragraph', '[Hello World]' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 2 ], end: [ 0, 4 ] } );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			viewDocument.fire( 'cut', data );

			model.change( writer => {
				writer.setSelection(
					writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ),
					0
				);
			} );

			viewDocument.fire( 'paste', data );

			checkMarker( 'comment:test:pasted', {
				start: [ 1, 2 ],
				end: [ 1, 4 ]
			} );

			editor.execute( 'undo' );
			editor.execute( 'undo' );

			// pasted comment is removed
			expect( editor.model.markers.get( 'comment:test:pasted' ) ).to.be.null;
		} );

		it( 'should not insert marker with the same name on paste if `duplicateOnPaste` is set to `false`', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', {
				allowedActions: 'all',
				duplicateOnPaste: false,
				copyPartiallySelected: true
			} );

			setModelData(
				model,
				wrapWithTag( 'paragraph', '[He]llo World' ) + wrapWithTag( 'paragraph', '' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 1 ], end: [ 0, 4 ] } );

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

			model.change( writer => {
				writer.setSelection(
					writer.createRangeIn( editor.model.document.getRoot().getChild( 2 ) ),
					0
				);
			} );

			viewDocument.fire( 'paste', data );

			expect( model.markers.has( 'comment:test' ) ).to.true;
			expect( model.markers.has( 'comment:test:pasted' ) ).to.false;
		} );

		it( 'should insert marker with the same name on paste if `duplicateOnPaste` is set to `true`', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', {
				allowedActions: 'all',
				duplicateOnPaste: true,
				copyPartiallySelected: true
			} );

			setModelData(
				model,
				wrapWithTag( 'paragraph', '[He]llo World' ) + wrapWithTag( 'paragraph', '' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 1 ], end: [ 0, 4 ] } );

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

			let pasteIndex = 0;
			getUniqueMarkerNameStub = getUniqueMarkerNameStub.callsFake( () => `comment:test:${ pasteIndex++ }` );

			viewDocument.fire( 'paste', data );
			model.change( writer => {
				writer.setSelection(
					writer.createRangeIn( editor.model.document.getRoot().getChild( 2 ) ),
					0
				);
			} );

			viewDocument.fire( 'paste', data );
			expect( model.markers.has( 'comment:test:0' ) ).to.true;
			expect( model.markers.has( 'comment:test:1' ) ).to.true;
		} );
	} );

	describe( '_removeFakeMarkersInsideElement', () => {
		it( 'should duplicate fake-markers in element if `duplicateOnPaste` = `true`', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', {
				allowedActions: 'all',
				duplicateOnPaste: true
			} );

			model.change( writer => {
				const fragment = new DocumentFragment( [
					...createFakeMarkerElements( writer, 'comment:123', [
						writer.createElement( 'paragraph' )
					] ),
					writer.createElement( 'paragraph' ),
					...createFakeMarkerElements( writer, 'comment:123', [
						writer.createElement( 'paragraph' )
					] )
				] );

				const markers = clipboardMarkersUtils._removeFakeMarkersInsideElement( writer, fragment );

				expect( Object.keys( markers ) ).deep.equal( [ 'comment:123', 'comment:123:pasted' ] );
			} );
		} );

		it( 'should not duplicate fake-markers in element if `duplicateOnPaste` = `true`', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', {
				allowedActions: 'all',
				duplicateOnPaste: false
			} );

			model.change( writer => {
				const fragment = new DocumentFragment( [
					...createFakeMarkerElements( writer, 'comment:123', [
						writer.createElement( 'paragraph' )
					] ),
					writer.createElement( 'paragraph' ),
					...createFakeMarkerElements( writer, 'comment:123', [
						writer.createElement( 'paragraph' )
					] )
				] );

				const markers = clipboardMarkersUtils._removeFakeMarkersInsideElement( writer, fragment );

				expect( Object.keys( markers ) ).deep.equal( [ 'comment:123' ] );
			} );
		} );

		function createFakeMarkerElements( writer, name, content = [] ) {
			return [
				writer.createElement( '$marker', { 'data-type': 'start', 'data-name': name } ),
				...content,
				writer.createElement( '$marker', { 'data-type': 'end', 'data-name': name } )
			];
		}
	} );

	describe( '_forceMarkersCopy', () => {
		it( 'properly reverts old marker restricted actions', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', {
				allowedActions: [ 'cut' ],
				copyPartiallySelected: true
			} );

			clipboardMarkersUtils._forceMarkersCopy( 'comment', () => {
				expect( getMarkerRestrictions() ).deep.equal( {
					allowedActions: 'all',
					duplicateOnPaste: true,
					copyPartiallySelected: true
				} );
			} );

			expect( getMarkerRestrictions() ).deep.equal( {
				allowedActions: [ 'cut' ],
				copyPartiallySelected: true
			} );
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

				checkMarker( 'comment:test:pasted', {
					start: [ 2, 0 ],
					end: [ 2, 12 ]
				} );
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

				checkMarker( 'new:test:pasted', {
					start: [ 2, 0 ],
					end: [ 2, 12 ]
				} );
			} );
		} );

		function getMarkerRestrictions() {
			return clipboardMarkersUtils._markersToCopy.get( 'comment' );
		}
	} );

	describe( '_isMarkerCopyable', () => {
		it( 'returns false on non existing clipboard markers', () => {
			const result = clipboardMarkersUtils._isMarkerCopyable( 'Hello', 'cut' );

			expect( result ).to.false;
		} );
	} );

	describe( '_getCopyableMarkersFromSelection', () => {
		it( 'force regenerate marker id in `dragstart` action', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', {
				allowedActions: [ 'dragstart' ],
				copyPartiallySelected: true
			} );

			setModelData(
				model,
				wrapWithTag( 'paragraph', '[Hello World]' )
			);

			appendMarker( 'comment:test', { start: [ 0, 0 ], end: [ 0, 4 ] } );

			const result = model.change(
				writer => clipboardMarkersUtils._getCopyableMarkersFromSelection( writer, writer.model.document.selection, 'dragstart' )
			);

			expect( result[ 0 ].name ).to.equal( 'comment:test:pasted' );
		} );
	} );

	describe( '_getPasteMarkersFromRangeMap', () => {
		it( 'keeps unknown markers', () => {
			const copyMarkers = createCopyableMarkersMap( new DocumentFragment(), {
				'unknown-marker': { start: [ 0, 0 ], end: [ 0, 6 ] }
			} );

			const result = clipboardMarkersUtils._getPasteMarkersFromRangeMap( copyMarkers );

			expect( result ).be.deep.equal( [
				{ name: 'unknown-marker', range: copyMarkers.get( 'unknown-marker' ) }
			] );
		} );

		it( 'properly filters markers Map instance', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', { allowedActions: [ 'cut' ] } );

			const copyMarkers = createCopyableMarkersMap( new DocumentFragment(), {
				'comment:a': { start: [ 0, 0 ], end: [ 0, 6 ] },
				'comment:b': { start: [ 0, 0 ], end: [ 0, 7 ] }
			} );

			let result = clipboardMarkersUtils._getPasteMarkersFromRangeMap( copyMarkers, 'copy' );
			expect( result ).be.deep.equal( [] );

			result = clipboardMarkersUtils._getPasteMarkersFromRangeMap( copyMarkers, 'cut' );
			expect( result ).be.deep.equal( [
				{ name: 'comment:a', range: copyMarkers.get( 'comment:a' ) },
				{ name: 'comment:b', range: copyMarkers.get( 'comment:b' ) }
			] );
		} );

		it( 'properly filters markers Record instance', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', { allowedActions: [ 'cut' ] } );

			const markers = Object.fromEntries(
				createCopyableMarkersMap( new DocumentFragment(), {
					'comment:a': { start: [ 0, 0 ], end: [ 0, 6 ] },
					'comment:b': { start: [ 0, 0 ], end: [ 0, 7 ] }
				} ).entries()
			);

			let result = clipboardMarkersUtils._getPasteMarkersFromRangeMap( markers, 'copy' );
			expect( result ).be.deep.equal( [] );

			result = clipboardMarkersUtils._getPasteMarkersFromRangeMap( markers, 'cut' );
			expect( result ).be.deep.equal( [
				{ name: 'comment:a', range: markers[ 'comment:a' ] },
				{ name: 'comment:b', range: markers[ 'comment:b' ] }
			] );
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

	describe( '_pasteMarkersIntoTransformedElement', () => {
		beforeEach( () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', {
				allowedActions: 'all'
			} );
		} );

		it( 'should add real markers to pasted fragment (overlap at the start)', () => {
			const copiedFragment = createFragment( wrapWithTag( 'paragraph', 'Hello world' ) );
			const copyMarkers = createCopyableMarkersMap(
				copiedFragment,
				{
					'comment:a': { start: [ 0, 0 ], end: [ 0, 6 ] },
					'comment:b': { start: [ 0, 0 ], end: [ 0, 7 ] }
				}
			);

			clipboardMarkersUtils._pasteMarkersIntoTransformedElement(
				copyMarkers,
				writer => {
					writer.insert( copiedFragment, modelRoot, 0 );
					return editor.model.document.getRoot().getChild( 0 );
				}
			);

			checkMarker( 'comment:a', {
				start: [ 0, 0 ],
				end: [ 0, 6 ]
			} );

			checkMarker( 'comment:b', {
				start: [ 0, 0 ],
				end: [ 0, 7 ]
			} );
		} );

		it( 'should add real markers to pasted fragment (overlap at the end)', () => {
			const copiedFragment = createFragment( wrapWithTag( 'paragraph', 'Hello world' ) );
			const copyMarkers = createCopyableMarkersMap(
				copiedFragment,
				{
					'comment:a': { start: [ 0, 5 ], end: [ 0, 11 ] },
					'comment:b': { start: [ 0, 4 ], end: [ 0, 11 ] }
				}
			);

			clipboardMarkersUtils._pasteMarkersIntoTransformedElement(
				copyMarkers,
				writer => {
					writer.insert( copiedFragment, modelRoot, 0 );
					return editor.model.document.getRoot().getChild( 0 );
				}
			);

			checkMarker( 'comment:a', {
				start: [ 0, 5 ],
				end: [ 0, 11 ]
			} );

			checkMarker( 'comment:b', {
				start: [ 0, 4 ],
				end: [ 0, 11 ]
			} );
		} );

		it( 'should add real markers to pasted fragment (overlap at center)', () => {
			const copiedFragment = createFragment( wrapWithTag( 'paragraph', 'Hello world' ) );
			const copyMarkers = createCopyableMarkersMap(
				copiedFragment,
				{
					'comment:a': { start: [ 0, 4 ], end: [ 0, 8 ] },
					'comment:b': { start: [ 0, 0 ], end: [ 0, 11 ] }
				}
			);

			clipboardMarkersUtils._pasteMarkersIntoTransformedElement(
				copyMarkers,
				writer => {
					writer.insert( copiedFragment, modelRoot, 0 );
					return editor.model.document.getRoot().getChild( 0 );
				}
			);

			checkMarker( 'comment:a', {
				start: [ 0, 4 ],
				end: [ 0, 8 ]
			} );

			checkMarker( 'comment:b', {
				start: [ 0, 0 ],
				end: [ 0, 11 ]
			} );
		} );
	} );

	async function createEditor() {
		editor = await ClassicTestEditor.create( element, {
			plugins: [ Undo, Paragraph, Clipboard ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		viewDocument = editor.editing.view.document;

		clipboardMarkersUtils = editor.plugins.get( 'ClipboardMarkersUtils' );
		clipboardMarkersUtils._registerMarkerToCopy( 'comment', { allowedActions: [ ] } );

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

	function createFragment( content ) {
		let parsedContent = parse( content, model.schema, {
			context: [ '$clipboardHolder' ]
		} );

		if ( !parsedContent.is( 'documentFragment' ) ) {
			parsedContent = new DocumentFragment( [ parsedContent ] );
		}

		return parsedContent;
	}

	function createCopyableMarkersMap( fragment, markers ) {
		const markersMap = new Map();

		for ( const [ name, value ] of Object.entries( markers ) ) {
			markersMap.set( name, new Range(
				new Position( fragment, value.start ), new Position( fragment, value.end )
			) );
		}

		return markersMap;
	}

	function wrapWithTag( tag, content ) {
		return `<${ tag }>${ content }</${ tag }>`;
	}

	function appendMarker( name, { start, end } ) {
		return editor.model.change( writer => {
			const range = model.createRange(
				model.createPositionFromPath( modelRoot, start ),
				model.createPositionFromPath( modelRoot, end )
			);

			return writer.addMarker( name, { usingOperation: false, affectsData: true, range } );
		} );
	}

	function checkMarker( name, range ) {
		const marker = editor.model.markers.get( name );

		expect( marker ).to.not.be.null;

		if ( range instanceof Range ) {
			expect( marker.getRange().isEqual( range ) ).to.be.true;
		} else {
			const markerRange = marker.getRange();

			expect( markerRange.start.path ).to.deep.equal( range.start );
			expect( markerRange.end.path ).to.deep.equal( range.end );
		}
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
