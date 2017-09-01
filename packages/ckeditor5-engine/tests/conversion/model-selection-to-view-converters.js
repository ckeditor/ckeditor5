/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelDocument from '../../src/model/document';
import ModelElement from '../../src/model/element';
import ModelRange from '../../src/model/range';
import ModelPosition from '../../src/model/position';

import ViewDocument from '../../src/view/document';
import ViewContainerElement from '../../src/view/containerelement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewUIElement from '../../src/view/uielement';
import { mergeAttributes } from '../../src/view/writer';

import Mapper from '../../src/conversion/mapper';
import ModelConversionDispatcher from '../../src/conversion/modelconversiondispatcher';
import {
	convertRangeSelection,
	convertCollapsedSelection,
	convertSelectionAttribute,
	convertSelectionMarker,
	clearAttributes,
	clearFakeSelection
} from '../../src/conversion/model-selection-to-view-converters';

import {
	insertElement,
	insertText,
	wrapItem,
	highlightText,
	highlightElement
} from '../../src/conversion/model-to-view-converters';

import { stringify as stringifyView } from '../../src/dev-utils/view';
import { setData as setModelData } from '../../src/dev-utils/model';

describe( 'model-selection-to-view-converters', () => {
	let dispatcher, mapper, modelDoc, modelRoot, modelSelection, viewDoc, viewRoot, viewSelection, highlightDescriptor;

	beforeEach( () => {
		modelDoc = new ModelDocument();
		modelRoot = modelDoc.createRoot();
		modelSelection = modelDoc.selection;

		modelDoc.schema.allow( { name: '$text', inside: '$root' } );

		viewDoc = new ViewDocument();
		viewRoot = viewDoc.createRoot( 'div' );
		viewSelection = viewDoc.selection;

		mapper = new Mapper();
		mapper.bindElements( modelRoot, viewRoot );

		highlightDescriptor = { class: 'marker', priority: 1 };

		dispatcher = new ModelConversionDispatcher( modelDoc, { mapper, viewSelection } );

		dispatcher.on( 'insert:$text', insertText() );
		dispatcher.on( 'addAttribute:bold', wrapItem( new ViewAttributeElement( 'strong' ) ) );

		dispatcher.on( 'addMarker:marker', highlightText( highlightDescriptor ) );
		dispatcher.on( 'addMarker:marker', highlightElement( highlightDescriptor ) );
		dispatcher.on( 'removeMarker:marker', highlightText( highlightDescriptor ) );
		dispatcher.on( 'removeMarker:marker', highlightElement( highlightDescriptor ) );

		// Default selection converters.
		dispatcher.on( 'selection', clearAttributes(), { priority: 'low' } );
		dispatcher.on( 'selection', convertRangeSelection(), { priority: 'low' } );
		dispatcher.on( 'selection', convertCollapsedSelection(), { priority: 'low' } );
	} );

	afterEach( () => {
		viewDoc.destroy();
	} );

	describe( 'default converters', () => {
		beforeEach( () => {
			// Selection converters for selection attributes.
			dispatcher.on( 'selectionAttribute:bold', convertSelectionAttribute( new ViewAttributeElement( 'strong' ) ) );
			dispatcher.on( 'selectionAttribute:italic', convertSelectionAttribute( new ViewAttributeElement( 'em' ) ) );
			dispatcher.on( 'selectionMarker:marker', convertSelectionMarker( highlightDescriptor ) );
		} );

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
				dispatcher.on( 'selection', ( evt, data, consumable ) => {
					expect( consumable.consume( data.selection, 'selection' ) ).to.be.true;
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

			it( 'in container with extra attributes', () => {
				test(
					[ 1, 1 ],
					'foobar',
					'f<em>[]</em>oobar',
					{ italic: true }
				);
			} );

			it( 'in attribute with extra attributes', () => {
				test(
					[ 3, 3 ],
					'f<$text bold="true">ooba</$text>r',
					'f<strong>oo</strong><em><strong>[]</strong></em><strong>ba</strong>r',
					{ italic: true }
				);
			} );

			it( 'in attribute and marker', () => {
				setModelData( modelDoc, 'fo<$text bold="true">ob</$text>ar' );
				const marker = modelDoc.markers.set( 'marker', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 5 ) );

				modelSelection.setRanges( [ new ModelRange( ModelPosition.createAt( modelRoot, 3 ) ) ] );

				// Update selection attributes according to model.
				modelSelection.refreshAttributes();

				// Remove view children manually (without firing additional conversion).
				viewRoot.removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );
				dispatcher.convertMarker( 'addMarker', marker.name, marker.getRange() );

				const markers = Array.from( modelDoc.markers.getMarkersAtPosition( modelSelection.getFirstPosition() ) );
				dispatcher.convertSelection( modelSelection, markers );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) ).to.equal(
					'<div>f<span class="marker">o<strong>o{}b</strong>a</span>r</div>'
				);
			} );

			it( 'in attribute and marker - no attribute', () => {
				setModelData( modelDoc, 'fo<$text bold="true">ob</$text>ar' );
				const marker = modelDoc.markers.set( 'marker', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 5 ) );

				modelSelection.setRanges( [ new ModelRange( ModelPosition.createAt( modelRoot, 3 ) ) ] );

				// Update selection attributes according to model.
				modelSelection.refreshAttributes();

				modelSelection.removeAttribute( 'bold' );

				// Remove view children manually (without firing additional conversion).
				viewRoot.removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );
				dispatcher.convertMarker( 'addMarker', marker.name, marker.getRange() );

				const markers = Array.from( modelDoc.markers.getMarkersAtPosition( modelSelection.getFirstPosition() ) );
				dispatcher.convertSelection( modelSelection, markers );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>f<span class="marker">o<strong>o</strong>[]<strong>b</strong>a</span>r</div>' );
			} );

			it( 'in marker - using highlight descriptor creator', () => {
				dispatcher.on( 'selectionMarker:marker2', convertSelectionMarker(
					data => ( { 'class': data.markerName } )
				) );

				setModelData( modelDoc, 'foobar' );
				const marker = modelDoc.markers.set( 'marker2', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 5 ) );

				modelSelection.setRanges( [ new ModelRange( ModelPosition.createAt( modelRoot, 3 ) ) ] );

				// Remove view children manually (without firing additional conversion).
				viewRoot.removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );
				dispatcher.convertMarker( 'addMarker', marker.name, marker.getRange() );

				const markers = Array.from( modelDoc.markers.getMarkersAtPosition( modelSelection.getFirstPosition() ) );
				dispatcher.convertSelection( modelSelection, markers );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>foo<span class="marker2">[]</span>bar</div>' );
			} );

			it( 'in marker - should merge with the rest of attribute elements', () => {
				dispatcher.on( 'addMarker:marker2', highlightText( data => ( { 'class': data.markerName } ) ) );
				dispatcher.on( 'selectionMarker:marker2', convertSelectionMarker( data => ( { 'class': data.markerName } ) ) );

				setModelData( modelDoc, 'foobar' );
				const marker = modelDoc.markers.set( 'marker2', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 5 ) );

				modelSelection.setRanges( [ new ModelRange( ModelPosition.createAt( modelRoot, 3 ) ) ] );

				// Remove view children manually (without firing additional conversion).
				viewRoot.removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );
				dispatcher.convertMarker( 'addMarker', marker.name, marker.getRange() );

				const markers = Array.from( modelDoc.markers.getMarkersAtPosition( modelSelection.getFirstPosition() ) );
				dispatcher.convertSelection( modelSelection, markers );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>f<span class="marker2">oo{}ba</span>r</div>' );
			} );

			it( 'should do nothing if creator return null', () => {
				dispatcher.on( 'selectionMarker:marker3', convertSelectionMarker( () => {

				} ) );

				setModelData( modelDoc, 'foobar' );
				const marker = modelDoc.markers.set( 'marker3', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 5 ) );

				modelSelection.setRanges( [ new ModelRange( ModelPosition.createAt( modelRoot, 3 ) ) ] );

				// Remove view children manually (without firing additional conversion).
				viewRoot.removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );
				dispatcher.convertMarker( 'addMarker', marker.name, marker.getRange() );

				const markers = Array.from( modelDoc.markers.getMarkersAtPosition( modelSelection.getFirstPosition() ) );
				dispatcher.convertSelection( modelSelection, markers );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>foo{}bar</div>' );
			} );

			// #1072 - if the container has only ui elements, collapsed selection attribute should be rendered after those ui elements.
			it( 'selection with attribute before ui element - no non-ui children', () => {
				setModelData( modelDoc, '' );

				// Add two ui elements to view.
				viewRoot.appendChildren( [
					new ViewUIElement( 'span' ),
					new ViewUIElement( 'span' )
				] );

				modelSelection.setRanges( [ new ModelRange( new ModelPosition( modelRoot, [ 0 ] ) ) ] );
				modelSelection.setAttribute( 'bold', true );

				// Convert model to view.
				dispatcher.convertSelection( modelSelection, [] );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div><span></span><span></span><strong>[]</strong></div>' );
			} );

			// #1072.
			it( 'selection with attribute before ui element - has non-ui children #1', () => {
				setModelData( modelDoc, 'x' );

				modelSelection.setRanges( [ new ModelRange( new ModelPosition( modelRoot, [ 1 ] ) ) ] );
				modelSelection.setAttribute( 'bold', true );

				// Convert model to view.
				dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

				// Add ui element to view.
				const uiElement = new ViewUIElement( 'span' );
				viewRoot.insertChildren( 1, uiElement );

				dispatcher.convertSelection( modelSelection, [] );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>x<strong>[]</strong><span></span></div>' );
			} );

			// #1072.
			it( 'selection with attribute before ui element - has non-ui children #2', () => {
				setModelData( modelDoc, '<$text bold="true">x</$text>y' );

				modelSelection.setRanges( [ new ModelRange( new ModelPosition( modelRoot, [ 1 ] ) ) ] );
				modelSelection.setAttribute( 'bold', true );

				// Convert model to view.
				dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

				// Add ui element to view.
				const uiElement = new ViewUIElement( 'span' );
				viewRoot.insertChildren( 1, uiElement );

				dispatcher.convertSelection( modelSelection, [] );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div><strong>x{}</strong><span></span>y</div>' );
			} );

			it( 'consumes consumable values properly', () => {
				// Add callbacks that will fire before default ones.
				// This should prevent default callbacks doing anything.
				dispatcher.on( 'selection', ( evt, data, consumable ) => {
					expect( consumable.consume( data.selection, 'selection' ) ).to.be.true;
				}, { priority: 'high' } );

				dispatcher.on( 'selectionAttribute:bold', ( evt, data, consumable ) => {
					expect( consumable.consume( data.selection, 'selectionAttribute:bold' ) ).to.be.true;
				}, { priority: 'high' } );

				// Similar test case as above.
				test(
					[ 3, 3 ],
					'f<$text bold="true">ooba</$text>r',
					'f<strong>ooba</strong>r' // No selection in view.
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
				dispatcher.on( 'selectionAttribute:bold', convertSelectionAttribute( new ViewAttributeElement( 'b' ) ) );
				dispatcher.on( 'addAttribute:style', wrapItem( new ViewAttributeElement( 'b' ) ) );

				test(
					[ 3, 3 ],
					'foobar',
					'foo<b>[]</b>bar',
					{ bold: 'true' }
				);

				const modelRange = ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 1 );
				modelDoc.selection.setRanges( [ modelRange ] );

				dispatcher.convertSelection( modelDoc.selection, [] );

				expect( viewSelection.rangeCount ).to.equal( 1 );

				const viewString = stringifyView( viewRoot, viewSelection, { showType: false } );
				expect( viewString ).to.equal( '<div>f{}oobar</div>' );
			} );

			it( 'should do nothing if the attribute element had been already removed', () => {
				dispatcher.on( 'selectionAttribute:bold', convertSelectionAttribute( new ViewAttributeElement( 'b' ) ) );
				dispatcher.on( 'addAttribute:style', wrapItem( new ViewAttributeElement( 'b' ) ) );

				test(
					[ 3, 3 ],
					'foobar',
					'foo<b>[]</b>bar',
					{ bold: 'true' }
				);

				// Remove <b></b> manually.
				mergeAttributes( viewSelection.getFirstPosition() );

				const modelRange = ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 1 );
				modelDoc.selection.setRanges( [ modelRange ] );

				dispatcher.convertSelection( modelDoc.selection, [] );

				expect( viewSelection.rangeCount ).to.equal( 1 );

				const viewString = stringifyView( viewRoot, viewSelection, { showType: false } );
				expect( viewString ).to.equal( '<div>f{}oobar</div>' );
			} );
		} );

		describe( 'clearFakeSelection', () => {
			it( 'should clear fake selection', () => {
				dispatcher.on( 'selection', clearFakeSelection() );
				viewSelection.setFake( true );

				dispatcher.convertSelection( modelSelection, [] );

				expect( viewSelection.isFake ).to.be.false;
			} );
		} );
	} );

	describe( 'using element creator for attributes conversion', () => {
		beforeEach( () => {
			function themeElementCreator( themeValue ) {
				if ( themeValue == 'important' ) {
					return new ViewAttributeElement( 'strong', { style: 'text-transform:uppercase;' } );
				} else if ( themeValue == 'gold' ) {
					return new ViewAttributeElement( 'span', { style: 'color:yellow;' } );
				}
			}

			dispatcher.on( 'selectionAttribute:theme', convertSelectionAttribute( themeElementCreator ) );
			dispatcher.on( 'addAttribute:theme', wrapItem( themeElementCreator ) );

			dispatcher.on( 'selectionAttribute:italic', convertSelectionAttribute( new ViewAttributeElement( 'em' ) ) );
		} );

		describe( 'range selection', () => {
			it( 'in same container, over attribute', () => {
				test(
					[ 1, 5 ],
					'fo<$text theme="gold">ob</$text>ar',
					'f{o<span style="color:yellow;">ob</span>a}r'
				);
			} );

			it( 'in same attribute', () => {
				test(
					[ 2, 4 ],
					'f<$text theme="gold">ooba</$text>r',
					'f<span style="color:yellow;">o{ob}a</span>r'
				);
			} );

			it( 'in same attribute, selection same as attribute', () => {
				test(
					[ 2, 4 ],
					'fo<$text theme="important">ob</$text>ar',
					'fo{<strong style="text-transform:uppercase;">ob</strong>}ar'
				);
			} );

			it( 'starts in attribute, ends in text node', () => {
				test(
					[ 3, 5 ],
					'fo<$text theme="important">ob</$text>ar',
					'fo<strong style="text-transform:uppercase;">o{b</strong>a}r'
				);
			} );
		} );

		describe( 'collapsed selection', () => {
			it( 'in attribute', () => {
				test(
					[ 3, 3 ],
					'f<$text theme="gold">ooba</$text>r',
					'f<span style="color:yellow;">oo{}ba</span>r'
				);
			} );

			it( 'in container with theme attribute', () => {
				test(
					[ 1, 1 ],
					'foobar',
					'f<strong style="text-transform:uppercase;">[]</strong>oobar',
					{ theme: 'important' }
				);
			} );

			it( 'in theme attribute with extra attributes #1', () => {
				test(
					[ 3, 3 ],
					'f<$text theme="gold">ooba</$text>r',
					'f<span style="color:yellow;">oo</span>' +
					'<em><span style="color:yellow;">[]</span></em>' +
					'<span style="color:yellow;">ba</span>r',
					{ italic: true }
				);
			} );

			it( 'in theme attribute with extra attributes #2', () => {
				// In contrary to test above, we don't have strong + span on the selection.
				// This is because strong and span are both created by the same attribute.
				// Since style="important" overwrites style="gold" on selection, we have only strong element.
				// In example above, selection has both style and italic attribute.
				test(
					[ 3, 3 ],
					'f<$text theme="gold">ooba</$text>r',
					'f<span style="color:yellow;">oo</span>' +
					'<strong style="text-transform:uppercase;">[]</strong>' +
					'<span style="color:yellow;">ba</span>r',
					{ theme: 'important' }
				);
			} );

			it( 'convertSelectionAttribute should do nothing if creator return null', () => {
				dispatcher.on( 'selectionAttribute:bold', convertSelectionAttribute( () => {

				} ) );

				test(
					[ 3, 3 ],
					'foobar',
					'foo{}bar',
					{ bold: 'true' }
				);
			} );
		} );
	} );

	describe( 'table cell selection converter', () => {
		beforeEach( () => {
			modelDoc.schema.registerItem( 'table' );
			modelDoc.schema.registerItem( 'tr' );
			modelDoc.schema.registerItem( 'td' );

			modelDoc.schema.allow( { name: 'table', inside: '$root' } );
			modelDoc.schema.allow( { name: 'tr', inside: 'table' } );
			modelDoc.schema.allow( { name: 'td', inside: 'tr' } );
			modelDoc.schema.allow( { name: '$text', inside: 'td' } );

			// "Universal" converter to convert table structure.
			const tableConverter = insertElement( data => new ViewContainerElement( data.item.name ) );
			dispatcher.on( 'insert:table', tableConverter );
			dispatcher.on( 'insert:tr', tableConverter );
			dispatcher.on( 'insert:td', tableConverter );

			// Special converter for table cells.
			dispatcher.on( 'selection', ( evt, data, consumable, conversionApi ) => {
				const selection = data.selection;

				if ( !consumable.test( selection, 'selection' ) || selection.isCollapsed ) {
					return;
				}

				for ( const range of selection.getRanges() ) {
					const node = range.start.nodeAfter;

					if ( node == range.end.nodeBefore && node instanceof ModelElement && node.name == 'td' ) {
						consumable.consume( selection, 'selection' );

						const viewNode = conversionApi.mapper.toViewElement( node );
						viewNode.addClass( 'selected' );
					}
				}
			} );
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
				// table tr#0 |td#0, table tr#0 td#0|
				[ [ 0, 0, 0 ], [ 0, 0, 1 ] ],
				'<table><tr><td>foo</td></tr><tr><td>bar</td></tr></table>',
				'<table><tr><td class="selected">foo</td></tr><tr><td>bar</td></tr></table>'
			);
		} );

		it( 'should not be used if selection contains more than just a table cell', () => {
			test(
				// table tr td#1, table tr#2
				[ [ 0, 0, 0, 1 ], [ 0, 0, 2 ] ],
				'<table><tr><td>foo</td><td>bar</td></tr></table>',
				'<table><tr><td>f{oo</td><td>bar</td>]</tr></table>'
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
		setModelData( modelDoc, modelInput );

		// Manually set selection ranges using passed `selectionPaths`.
		const startPath = typeof selectionPaths[ 0 ] == 'number' ? [ selectionPaths[ 0 ] ] : selectionPaths[ 0 ];
		const endPath = typeof selectionPaths[ 1 ] == 'number' ? [ selectionPaths[ 1 ] ] : selectionPaths[ 1 ];

		const startPos = new ModelPosition( modelRoot, startPath );
		const endPos = new ModelPosition( modelRoot, endPath );

		const isBackward = selectionPaths[ 2 ] === 'backward';
		modelSelection.setRanges( [ new ModelRange( startPos, endPos ) ], isBackward );

		// Update selection attributes according to model.
		modelSelection.refreshAttributes();

		// And add or remove passed attributes.
		for ( const key in selectionAttributes ) {
			const value = selectionAttributes[ key ];

			if ( value ) {
				modelSelection.setAttribute( key, value );
			} else {
				modelSelection.removeAttribute( key );
			}
		}

		// Remove view children manually (without firing additional conversion).
		viewRoot.removeChildren( 0, viewRoot.childCount );

		// Convert model to view.
		dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );
		dispatcher.convertSelection( modelSelection, [] );

		// Stringify view and check if it is same as expected.
		expect( stringifyView( viewRoot, viewSelection, { showType: false } ) ).to.equal( '<div>' + expectedView + '</div>' );
	}
} );
