/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../src/model/model';

import View from '../../src/view/view';
import ViewUIElement from '../../src/view/uielement';

import Mapper from '../../src/conversion/mapper';
import DowncastDispatcher from '../../src/conversion/downcastdispatcher';
import {
	convertRangeSelection,
	convertCollapsedSelection,
	clearAttributes,
} from '../../src/conversion/downcast-selection-converters';

import {
	insertElement,
	insertText,
	wrap,
	highlightElement,
	highlightText,
	removeHighlight
} from '../../src/conversion/downcast-converters';

import createViewRoot from '../view/_utils/createroot';
import { stringify as stringifyView } from '../../src/dev-utils/view';
import { setData as setModelData } from '../../src/dev-utils/model';

describe( 'downcast-selection-converters', () => {
	let dispatcher, mapper, model, view, modelDoc, modelRoot, docSelection, viewDoc, viewRoot, viewSelection, highlightDescriptor;

	beforeEach( () => {
		model = new Model();
		modelDoc = model.document;
		modelRoot = modelDoc.createRoot();
		docSelection = modelDoc.selection;

		model.schema.extend( '$text', { allowIn: '$root' } );

		view = new View();
		viewDoc = view.document;
		viewRoot = createViewRoot( viewDoc );
		viewSelection = viewDoc.selection;

		mapper = new Mapper();
		mapper.bindElements( modelRoot, viewRoot );

		highlightDescriptor = { classes: 'marker', priority: 1 };

		dispatcher = new DowncastDispatcher( { mapper, viewSelection } );

		dispatcher.on( 'insert:$text', insertText() );

		const strongCreator = ( modelAttributeValue, viewWriter ) => viewWriter.createAttributeElement( 'strong' );
		dispatcher.on( 'attribute:bold', wrap( strongCreator ) );

		dispatcher.on( 'addMarker:marker', highlightText( highlightDescriptor ) );
		dispatcher.on( 'addMarker:marker', highlightElement( highlightDescriptor ) );
		dispatcher.on( 'removeMarker:marker', removeHighlight( highlightDescriptor ) );

		// Default selection converters.
		dispatcher.on( 'selection', clearAttributes(), { priority: 'low' } );
		dispatcher.on( 'selection', convertRangeSelection(), { priority: 'low' } );
		dispatcher.on( 'selection', convertCollapsedSelection(), { priority: 'low' } );
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'default converters', () => {
		describe( 'range selection', () => {
			it( 'in same container', () => {
				test(
					[ 1, 4 ],
					'foobar',
					'f{oob}ar'
				);
			} );

			it( 'in same container with unicode characters', () => {
				test(
					[ 2, 6 ],
					'நிலைக்கு',
					'நி{லைக்}கு'
				);
			} );

			it( 'in same container, over attribute', () => {
				test(
					[ 1, 5 ],
					'fo<$text bold="true">ob</$text>ar',
					'f{o<strong>ob</strong>a}r'
				);
			} );

			it( 'in same container, next to attribute', () => {
				test(
					[ 1, 2 ],
					'fo<$text bold="true">ob</$text>ar',
					'f{o}<strong>ob</strong>ar'
				);
			} );

			it( 'in same attribute', () => {
				test(
					[ 2, 4 ],
					'f<$text bold="true">ooba</$text>r',
					'f<strong>o{ob}a</strong>r'
				);
			} );

			it( 'in same attribute, selection same as attribute', () => {
				test(
					[ 2, 4 ],
					'fo<$text bold="true">ob</$text>ar',
					'fo{<strong>ob</strong>}ar'
				);
			} );

			it( 'starts in text node, ends in attribute #1', () => {
				test(
					[ 1, 3 ],
					'fo<$text bold="true">ob</$text>ar',
					'f{o<strong>o}b</strong>ar'
				);
			} );

			it( 'starts in text node, ends in attribute #2', () => {
				test(
					[ 1, 4 ],
					'fo<$text bold="true">ob</$text>ar',
					'f{o<strong>ob</strong>}ar'
				);
			} );

			it( 'starts in attribute, ends in text node', () => {
				test(
					[ 3, 5 ],
					'fo<$text bold="true">ob</$text>ar',
					'fo<strong>o{b</strong>a}r'
				);
			} );

			it( 'consumes consumable values properly', () => {
				// Add callback that will fire before default ones.
				// This should prevent default callback doing anything.
				dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
					expect( conversionApi.consumable.consume( data.selection, 'selection' ) ).to.be.true;
				}, { priority: 'high' } );

				// Similar test case as the first in this suite.
				test(
					[ 1, 4 ],
					'foobar',
					'foobar' // No selection in view.
				);
			} );

			it( 'should convert backward selection', () => {
				test(
					[ 1, 3, 'backward' ],
					'foobar',
					'f{oo}bar'
				);

				expect( viewSelection.focus.offset ).to.equal( 1 );
			} );
		} );

		describe( 'collapsed selection', () => {
			let marker;

			it( 'in container', () => {
				test(
					[ 1, 1 ],
					'foobar',
					'f{}oobar'
				);
			} );

			it( 'in attribute', () => {
				test(
					[ 3, 3 ],
					'f<$text bold="true">ooba</$text>r',
					'f<strong>oo{}ba</strong>r'
				);
			} );

			it( 'in attribute and marker', () => {
				setModelData( model, 'fo<$text bold="true">ob</$text>ar' );

				model.change( writer => {
					const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 5 ) );
					marker = writer.addMarker( 'marker', { range, usingOperation: false } );
					writer.setSelection( writer.createRange( writer.createPositionAt( modelRoot, 3 ) ) );
				} );

				// Remove view children manually (without firing additional conversion).
				viewRoot._removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );
					dispatcher.convertMarkerAdd( marker.name, marker.getRange(), writer );
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) ).to.equal(
					'<div>f<span class="marker">o<strong>o{}b</strong>a</span>r</div>'
				);
			} );

			it( 'in attribute and marker - no attribute', () => {
				setModelData( model, 'fo<$text bold="true">ob</$text>ar' );

				model.change( writer => {
					const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 5 ) );
					marker = writer.addMarker( 'marker', { range, usingOperation: false } );
					writer.setSelection( writer.createRange( writer.createPositionAt( modelRoot, 3 ) ) );
					writer.removeSelectionAttribute( 'bold' );
				} );

				// Remove view children manually (without firing additional conversion).
				viewRoot._removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );
					dispatcher.convertMarkerAdd( marker.name, marker.getRange(), writer );
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>f<span class="marker">o<strong>o</strong>[]<strong>b</strong>a</span>r</div>' );
			} );

			it( 'in marker - using highlight descriptor creator', () => {
				dispatcher.on( 'addMarker:marker2', highlightText(
					data => ( { classes: data.markerName } )
				) );

				setModelData( model, 'foobar' );

				model.change( writer => {
					const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 5 ) );
					marker = writer.addMarker( 'marker2', { range, usingOperation: false } );
					writer.setSelection( writer.createRange( writer.createPositionAt( modelRoot, 3 ) ) );
				} );

				// Remove view children manually (without firing additional conversion).
				viewRoot._removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );
					dispatcher.convertMarkerAdd( marker.name, marker.getRange(), writer );
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>f<span class="marker2">oo{}ba</span>r</div>' );
			} );

			it( 'should do nothing if creator return null', () => {
				dispatcher.on( 'addMarker:marker3', highlightText( () => null ) );

				setModelData( model, 'foobar' );

				model.change( writer => {
					const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 5 ) );
					marker = writer.addMarker( 'marker3', { range, usingOperation: false } );
					writer.setSelection( writer.createRange( writer.createPositionAt( modelRoot, 3 ) ) );
				} );

				// Remove view children manually (without firing additional conversion).
				viewRoot._removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );
					dispatcher.convertMarkerAdd( marker.name, marker.getRange(), writer );
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>foo{}bar</div>' );
			} );

			// #1072 - if the container has only ui elements, collapsed selection attribute should be rendered after those ui elements.
			it( 'selection with attribute before ui element - no non-ui children', () => {
				setModelData( model, '' );

				// Add two ui elements to view.
				viewRoot._appendChild( [
					new ViewUIElement( 'span' ),
					new ViewUIElement( 'span' )
				] );

				model.change( writer => {
					writer.setSelection( writer.createRange( writer.createPositionFromPath( modelRoot, [ 0 ] ) ) );
					writer.setSelectionAttribute( 'bold', true );
				} );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div><span></span><span></span><strong>[]</strong></div>' );
			} );

			// #1072.
			it( 'selection with attribute before ui element - has non-ui children #1', () => {
				setModelData( model, 'x' );

				model.change( writer => {
					writer.setSelection( writer.createRange( writer.createPositionFromPath( modelRoot, [ 1 ] ) ) );
					writer.setSelectionAttribute( 'bold', true );
				} );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );

					// Add ui element to view.
					const uiElement = new ViewUIElement( 'span' );
					viewRoot._insertChild( 1, uiElement );

					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>x<strong>[]</strong><span></span></div>' );
			} );

			// #1072.
			it( 'selection with attribute before ui element - has non-ui children #2', () => {
				setModelData( model, '<$text bold="true">x</$text>y' );

				model.change( writer => {
					writer.setSelection( writer.createRange( writer.createPositionFromPath( modelRoot, [ 1 ] ) ) );
					writer.setSelectionAttribute( 'bold', true );
				} );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );

					// Add ui element to view.
					const uiElement = new ViewUIElement( 'span' );
					viewRoot._insertChild( 1, uiElement, writer );
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div><strong>x{}</strong><span></span>y</div>' );
			} );

			it( 'consumes consumable values properly', () => {
				// Add callbacks that will fire before default ones.
				// This should prevent default callbacks doing anything.
				dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
					expect( conversionApi.consumable.consume( data.selection, 'selection' ) ).to.be.true;
				}, { priority: 'high' } );

				dispatcher.on( 'attribute:bold', ( evt, data, conversionApi ) => {
					expect( conversionApi.consumable.consume( data.item, 'attribute:bold' ) ).to.be.true;
				}, { priority: 'high' } );

				// Similar test case as above.
				test(
					[ 3, 3 ],
					'f<$text bold="true">ooba</$text>r',
					'foobar' // No selection in view and no attribute.
				);
			} );
		} );
	} );

	describe( 'clean-up', () => {
		describe( 'convertRangeSelection', () => {
			it( 'should remove all ranges before adding new range', () => {
				test(
					[ 0, 2 ],
					'foobar',
					'{fo}obar'
				);

				test(
					[ 3, 5 ],
					'foobar',
					'foo{ba}r'
				);

				expect( viewSelection.rangeCount ).to.equal( 1 );
			} );
		} );

		describe( 'convertCollapsedSelection', () => {
			it( 'should remove all ranges before adding new range', () => {
				test(
					[ 2, 2 ],
					'foobar',
					'fo{}obar'
				);

				test(
					[ 3, 3 ],
					'foobar',
					'foo{}bar'
				);

				expect( viewSelection.rangeCount ).to.equal( 1 );
			} );
		} );

		describe( 'clearAttributes', () => {
			it( 'should remove all ranges before adding new range', () => {
				test(
					[ 3, 3 ],
					'foobar',
					'foo<strong>[]</strong>bar',
					{ bold: 'true' }
				);

				view.change( writer => {
					const modelRange = model.createRange( model.createPositionAt( modelRoot, 1 ), model.createPositionAt( modelRoot, 1 ) );
					model.change( writer => {
						writer.setSelection( modelRange );
					} );

					dispatcher.convertSelection( modelDoc.selection, model.markers, writer );
				} );

				expect( viewSelection.rangeCount ).to.equal( 1 );

				const viewString = stringifyView( viewRoot, viewSelection, { showType: false } );
				expect( viewString ).to.equal( '<div>f{}oobar</div>' );
			} );

			it( 'should do nothing if the attribute element had been already removed', () => {
				test(
					[ 3, 3 ],
					'foobar',
					'foo<strong>[]</strong>bar',
					{ bold: 'true' }
				);

				view.change( writer => {
					// Remove <strong></strong> manually.
					writer.mergeAttributes( viewSelection.getFirstPosition() );

					const modelRange = model.createRange( model.createPositionAt( modelRoot, 1 ), model.createPositionAt( modelRoot, 1 ) );
					model.change( writer => {
						writer.setSelection( modelRange );
					} );

					dispatcher.convertSelection( modelDoc.selection, model.markers, writer );
				} );

				expect( viewSelection.rangeCount ).to.equal( 1 );

				const viewString = stringifyView( viewRoot, viewSelection, { showType: false } );
				expect( viewString ).to.equal( '<div>f{}oobar</div>' );
			} );

			it( 'should clear fake selection', () => {
				const modelRange = model.createRange( model.createPositionAt( modelRoot, 1 ), model.createPositionAt( modelRoot, 1 ) );

				view.change( writer => {
					writer.setSelection( modelRange, { fake: true } );

					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );
				expect( viewSelection.isFake ).to.be.false;
			} );
		} );
	} );

	describe( 'table cell selection converter', () => {
		beforeEach( () => {
			model.schema.register( 'table', { isLimit: true } );
			model.schema.register( 'tr', { isLimit: true } );
			model.schema.register( 'td', { isLimit: true } );

			model.schema.extend( 'table', { allowIn: '$root' } );
			model.schema.extend( 'tr', { allowIn: 'table' } );
			model.schema.extend( 'td', { allowIn: 'tr' } );
			model.schema.extend( '$text', { allowIn: 'td' } );

			// "Universal" converter to convert table structure.
			const containerCreator = ( modelElement, viewWriter ) => viewWriter.createContainerElement( modelElement.name );
			const tableConverter = insertElement( containerCreator );
			dispatcher.on( 'insert:table', tableConverter );
			dispatcher.on( 'insert:tr', tableConverter );
			dispatcher.on( 'insert:td', tableConverter );

			// Special converter for table cells.
			dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
				const selection = data.selection;

				if ( !conversionApi.consumable.test( selection, 'selection' ) || selection.isCollapsed ) {
					return;
				}

				for ( const range of selection.getRanges() ) {
					const node = range.start.parent;

					if ( !!node && node.is( 'td' ) ) {
						conversionApi.consumable.consume( selection, 'selection' );

						const viewNode = conversionApi.mapper.toViewElement( node );
						conversionApi.writer.addClass( 'selected', viewNode );
					}
				}
			}, { priority: 'high' } );
		} );

		it( 'should not be used to convert selection that is not on table cell', () => {
			test(
				[ 1, 5 ],
				'f{o<$text bold="true">ob</$text>a}r',
				'f{o<strong>ob</strong>a}r'
			);
		} );

		it( 'should add a class to the selected table cell', () => {
			test(
				// table tr#0 td#0 [foo, table tr#0 td#0 bar]
				[ [ 0, 0, 0, 0 ], [ 0, 0, 0, 3 ] ],
				'<table><tr><td>foo</td></tr><tr><td>bar</td></tr></table>',
				'<table><tr><td class="selected">foo</td></tr><tr><td>bar</td></tr></table>'
			);
		} );

		it( 'should not be used if selection contains more than just a table cell', () => {
			test(
				// table tr td#1 f{oo bar, table tr#2 bar]
				[ [ 0, 0, 0, 1 ], [ 0, 0, 1, 3 ] ],
				'<table><tr><td>foo</td><td>bar</td></tr></table>',
				'[<table><tr><td>foo</td><td>bar</td></tr></table>]'
			);
		} );
	} );

	// Tests if the selection got correctly converted.
	// Because `setData` might use selection converters itself to set the selection, we can't use it
	// to set the selection (because then we would test converters using converters).
	// Instead, the `test` function expects to be passed `selectionPaths` which is an array containing two numbers or two arrays,
	// that are offsets or paths of selection positions in root element.
	function test( selectionPaths, modelInput, expectedView, selectionAttributes = {} ) {
		// Parse passed `modelInput` string and set it as current model.
		setModelData( model, modelInput );

		// Manually set selection ranges using passed `selectionPaths`.
		const startPath = typeof selectionPaths[ 0 ] == 'number' ? [ selectionPaths[ 0 ] ] : selectionPaths[ 0 ];
		const endPath = typeof selectionPaths[ 1 ] == 'number' ? [ selectionPaths[ 1 ] ] : selectionPaths[ 1 ];

		const startPos = model.createPositionFromPath( modelRoot, startPath );
		const endPos = model.createPositionFromPath( modelRoot, endPath );

		const isBackward = selectionPaths[ 2 ] === 'backward';
		model.change( writer => {
			writer.setSelection( writer.createRange( startPos, endPos ), { backward: isBackward } );

			// And add or remove passed attributes.
			for ( const key in selectionAttributes ) {
				const value = selectionAttributes[ key ];

				if ( value ) {
					writer.setSelectionAttribute( key, value );
				} else {
					writer.removeSelectionAttribute( key );
				}
			}
		} );

		// Remove view children manually (without firing additional conversion).
		viewRoot._removeChildren( 0, viewRoot.childCount );

		// Convert model to view.
		view.change( writer => {
			dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );
			dispatcher.convertSelection( docSelection, model.markers, writer );
		} );

		// Stringify view and check if it is same as expected.
		expect( stringifyView( viewRoot, viewSelection, { showType: false } ) ).to.equal( '<div>' + expectedView + '</div>' );
	}
} );
