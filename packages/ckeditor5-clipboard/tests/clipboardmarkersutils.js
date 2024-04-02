/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import DocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment.js';
import Position from '@ckeditor/ckeditor5-engine/src/model/position.js';
import Range from '@ckeditor/ckeditor5-engine/src/model/range.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { parse, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

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

			checkMarker( 'comment:test:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 1, 2 ] ),
				model.createPositionFromPath( modelRoot, [ 1, 11 ] )
			) );

			checkMarker( 'comment:test2:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 1, 6 ] ),
				model.createPositionFromPath( modelRoot, [ 1, 11 ] )
			) );
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

			checkMarker( 'comment:test:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 1, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 1, 11 ] )
			) );

			checkMarker( 'comment:test2:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 1, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 1, 5 ] )
			) );
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

			checkMarker( 'comment:test:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 1, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 1, 11 ] )
			) );

			checkMarker( 'comment:test2:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 1, 5 ] ),
				model.createPositionFromPath( modelRoot, [ 1, 8 ] )
			) );
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

	describe( 'Presets', () => {
		it( 'should not copy marker in default preset', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', 'default' );

			setModelData(
				model,
				wrapWithTag( 'paragraph', 'Hello World' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 0 ], end: [ 0, 3 ] } );

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

			expect( model.markers.has( 'comment:test:pasted' ) ).to.false;
		} );

		it( 'should cut marker in default preset', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', 'default' );

			setModelData(
				model,
				wrapWithTag( 'paragraph', 'Hello World' ) + wrapWithTag( 'paragraph', '' )
			);

			appendMarker( 'comment:test', { start: [ 0, 0 ], end: [ 0, 3 ] } );

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

		for ( const emptyPreset of [ 'never', 'dummy' ] ) {
			it( `should not cut marker in ${ emptyPreset } preset`, () => {
				clipboardMarkersUtils._registerMarkerToCopy( 'comment', emptyPreset );

				setModelData(
					model,
					wrapWithTag( 'paragraph', 'Hello World' ) + wrapWithTag( 'paragraph', '' )
				);

				appendMarker( 'comment:test', { start: [ 0, 0 ], end: [ 0, 3 ] } );

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
		}
	} );

	describe( '_removeFakeMarkersInsideElement', () => {
		it( 'should handle duplicated fake-markers in element', () => {
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
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', [ 'cut' ] );

			expect( getMarkerRestrictions() ).deep.equal( [ 'cut' ] );

			clipboardMarkersUtils._forceMarkersCopy( 'comment', () => {
				expect( getMarkerRestrictions() ).deep.equal( clipboardMarkersUtils._mapRestrictionPresetToActions( 'always' ) );
			} );

			expect( getMarkerRestrictions() ).deep.equal( [ 'cut' ] );
		} );

		function getMarkerRestrictions() {
			return clipboardMarkersUtils._markersToCopy.get( 'comment' );
		}
	} );

	describe( '_canPerformMarkerClipboardAction', () => {
		it( 'returns false on non existing clipboard markers', () => {
			const result = clipboardMarkersUtils._canPerformMarkerClipboardAction( 'Hello', 'cut' );

			expect( result ).to.false;
		} );
	} );

	describe( '_getCopyableMarkersFromRangeMap', () => {
		it( 'properly filters markers Map instance', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', [ 'cut' ] );

			const { markers } = createFragmentWithMarkers(
				wrapWithTag( 'paragraph', 'Hello world' ),
				{
					'comment:a': { start: [ 0, 0 ], end: [ 0, 6 ] },
					'comment:b': { start: [ 0, 0 ], end: [ 0, 7 ] }
				}
			);

			let result = clipboardMarkersUtils._getCopyableMarkersFromRangeMap( markers, 'copy' );
			expect( result ).be.deep.equal( [] );

			result = clipboardMarkersUtils._getCopyableMarkersFromRangeMap( markers, 'cut' );
			expect( result ).be.deep.equal( [
				{ name: 'comment:a', range: markers.get( 'comment:a' ) },
				{ name: 'comment:b', range: markers.get( 'comment:b' ) }
			] );
		} );

		it( 'properly filters markers Record instance', () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', [ 'cut' ] );

			const markers = Object.fromEntries(
				createFragmentWithMarkers(
					wrapWithTag( 'paragraph', 'Hello world' ),
					{
						'comment:a': { start: [ 0, 0 ], end: [ 0, 6 ] },
						'comment:b': { start: [ 0, 0 ], end: [ 0, 7 ] }
					}
				).markers.entries()
			);

			let result = clipboardMarkersUtils._getCopyableMarkersFromRangeMap( markers, 'copy' );
			expect( result ).be.deep.equal( [] );

			result = clipboardMarkersUtils._getCopyableMarkersFromRangeMap( markers, 'cut' );
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
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', 'always' );
		} );

		it( 'should preserve original marker name if it is not duplicated', () => {
			const copiedFragment = createFragmentWithMarkers(
				wrapWithTag( 'paragraph', 'Hello world' ),
				{
					'comment:a': { start: [ 0, 0 ], end: [ 0, 6 ] },
					'comment:b': { start: [ 0, 0 ], end: [ 0, 7 ] }
				}
			);

			clipboardMarkersUtils._pasteMarkersIntoTransformedElement(
				copiedFragment.markers,
				writer => {
					writer.insert( copiedFragment, modelRoot, 0 );
					writer.removeMarker( 'comment:a' );
					writer.removeMarker( 'comment:b' );

					return editor.model.document.getRoot().getChild( 0 );
				}
			);

			checkMarker( 'comment:a', model.createRange(
				model.createPositionFromPath( modelRoot, [ 0, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 0, 6 ] )
			) );

			checkMarker( 'comment:b', model.createRange(
				model.createPositionFromPath( modelRoot, [ 0, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 0, 7 ] )
			) );
		} );

		it( 'should add real markers to pasted fragment (overlap at the start)', () => {
			const copiedFragment = createFragmentWithMarkers(
				wrapWithTag( 'paragraph', 'Hello world' ),
				{
					'comment:a': { start: [ 0, 0 ], end: [ 0, 6 ] },
					'comment:b': { start: [ 0, 0 ], end: [ 0, 7 ] }
				}
			);

			clipboardMarkersUtils._pasteMarkersIntoTransformedElement(
				copiedFragment.markers,
				writer => {
					writer.insert( copiedFragment, modelRoot, 0 );
					return editor.model.document.getRoot().getChild( 0 );
				}
			);

			checkMarker( 'comment:a:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 0, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 0, 6 ] )
			) );

			checkMarker( 'comment:b:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 0, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 0, 7 ] )
			) );
		} );

		it( 'should add real markers to pasted fragment (overlap at the end)', () => {
			const copiedFragment = createFragmentWithMarkers(
				wrapWithTag( 'paragraph', 'Hello world' ),
				{
					'comment:a': { start: [ 0, 5 ], end: [ 0, 11 ] },
					'comment:b': { start: [ 0, 4 ], end: [ 0, 11 ] }
				}
			);

			clipboardMarkersUtils._pasteMarkersIntoTransformedElement(
				copiedFragment.markers,
				writer => {
					writer.insert( copiedFragment, modelRoot, 0 );
					return editor.model.document.getRoot().getChild( 0 );
				}
			);

			checkMarker( 'comment:a:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 0, 5 ] ),
				model.createPositionFromPath( modelRoot, [ 0, 11 ] )
			) );

			checkMarker( 'comment:b:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 0, 4 ] ),
				model.createPositionFromPath( modelRoot, [ 0, 11 ] )
			) );
		} );

		it( 'should add real markers to pasted fragment (overlap at center)', () => {
			const copiedFragment = createFragmentWithMarkers(
				wrapWithTag( 'paragraph', 'Hello world' ),
				{
					'comment:a': { start: [ 0, 4 ], end: [ 0, 8 ] },
					'comment:b': { start: [ 0, 0 ], end: [ 0, 11 ] }
				}
			);

			clipboardMarkersUtils._pasteMarkersIntoTransformedElement(
				copiedFragment.markers,
				writer => {
					writer.insert( copiedFragment, modelRoot, 0 );
					return editor.model.document.getRoot().getChild( 0 );
				}
			);

			checkMarker( 'comment:a:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 0, 4 ] ),
				model.createPositionFromPath( modelRoot, [ 0, 8 ] )
			) );

			checkMarker( 'comment:b:pasted', model.createRange(
				model.createPositionFromPath( modelRoot, [ 0, 0 ] ),
				model.createPositionFromPath( modelRoot, [ 0, 11 ] )
			) );
		} );
	} );

	describe( '_setUniqueMarkerNamesInFragment', () => {
		beforeEach( () => {
			clipboardMarkersUtils._registerMarkerToCopy( 'comment', 'always' );
		} );

		it( 'do not regenerate name of marker if not copyable', () => {
			const fragment = createFragmentWithMarkers( '<paragraph>ABC</paragraph>', {
				'comment:1123:1': {
					start: [ 0 ],
					end: [ 1 ]
				},
				'marker-1': {
					start: [ 0 ],
					end: [ 1 ]
				}
			} );

			clipboardMarkersUtils._setUniqueMarkerNamesInFragment( fragment );

			expect( fragment.markers.has( 'comment:1123:1:pasted' ) ).to.be.true;
			expect( fragment.markers.has( 'marker-1' ) ).to.be.true;
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

	function createFragmentWithMarkers( content, markers ) {
		let parsedContent = parse( content, model.schema, {
			context: [ '$clipboardHolder' ]
		} );

		if ( markers && !parsedContent.is( 'documentFragment' ) ) {
			parsedContent = new DocumentFragment( [ parsedContent ] );
		}

		if ( markers ) {
			const markersMap = new Map();

			for ( const [ name, value ] of Object.entries( markers ) ) {
				markersMap.set( name, new Range(
					new Position( parsedContent, value.start ), new Position( parsedContent, value.end )
				) );
			}

			parsedContent.markers = markersMap;
		}

		return parsedContent;
	}
} );
