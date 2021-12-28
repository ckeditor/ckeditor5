/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListWalker from '../../../src/documentlist/utils/listwalker';
import { modelList } from '../_utils/utils';

import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import { parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DocumentList - utils - ListWalker', () => {
	let model, schema;

	beforeEach( () => {
		model = new Model();
		schema = model.schema;

		schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
	} );

	it( 'should return no blocks (sameIndent = false, lowerIndent = false, higherIndent = false)', () => {
		const input =
			'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
			'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
			'<paragraph listType="bulleted" listItemId="c" listIndent="0">2</paragraph>';

		const fragment = parseModel( input, schema );
		const walker = new ListWalker( fragment.getChild( 0 ), {
			direction: 'forward',
			includeSelf: true
			// sameIndent: false -> default
			// lowerIndent: false -> default
			// higherIndent: false -> default

		} );
		const blocks = Array.from( walker );

		expect( blocks.length ).to.equal( 0 );
	} );

	describe( 'same level iterating (sameIndent = true)', () => {
		it( 'should iterate on nodes with `listItemId` attribute', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 0 ), {
				direction: 'forward',
				sameIndent: true,
				includeSelf: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should stop iterating on first node without `listItemId` attribute', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
				'<paragraph>2</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 0 ), {
				direction: 'forward',
				sameIndent: true,
				includeSelf: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should not iterate over nodes without `listItemId` attribute', () => {
			const input =
				'<paragraph>x</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 0 ), {
				direction: 'forward',
				sameIndent: true,
				includeSelf: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 0 );
		} );

		it( 'should skip start block (includeSelf = false, direction = forward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 0 ), {
				direction: 'forward',
				sameIndent: true
				// includeSelf: false -> default
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should skip start block (includeSelf = false, direction = backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 2 ), {
				direction: 'backward',
				sameIndent: true
				// includeSelf: false -> default
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 0 ) );
		} );

		it( 'should return items with the same ID', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 0 ), {
				direction: 'forward',
				sameIndent: true,
				includeSelf: true,
				sameItemId: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should return items of the same type', () => {
			const input = modelList( [
				'* 0',
				'* 1',
				'# 2'
			] );

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 0 ), {
				direction: 'forward',
				sameIndent: true,
				includeSelf: true,
				sameItemType: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should return items while iterating over a nested list', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'forward',
				sameIndent: true,
				includeSelf: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should skip nested items (higherIndent = false)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 0 ), {
				direction: 'forward',
				sameIndent: true,
				includeSelf: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include nested items (higherIndent = true)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="0">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'forward',
				sameIndent: true,
				higherIndent: true,
				includeSelf: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 4 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 4 ) );
		} );

		it( 'should include nested items (higherIndent = true, sameItemId = true, forward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'forward',
				sameIndent: true,
				higherIndent: true,
				includeSelf: true,
				sameItemId: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 4 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 4 ) );
		} );

		it( 'should include nested items (higherIndent = true, sameItemId = true, backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 4 ), {
				direction: 'backward',
				sameIndent: true,
				higherIndent: true,
				includeSelf: true,
				sameItemId: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 4 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 4 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should not include nested items from other item (higherIndent = true, sameItemId = true, backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="1">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 4 ), {
				direction: 'backward',
				sameIndent: true,
				higherIndent: true,
				includeSelf: true,
				sameItemId: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 1 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 4 ) );
		} );

		it( 'should return all list blocks (higherIndent = true, sameIndent = true, lowerIndent = true)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'forward',
				sameIndent: true,
				lowerIndent: true,
				higherIndent: true,
				includeSelf: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 5 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 4 ) );
			expect( blocks[ 4 ] ).to.equal( fragment.getChild( 5 ) );
		} );

		describe( 'first()', () => {
			it( 'should return first sibling block', () => {
				const input =
					'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
					'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
					'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
					'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
					'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
					'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

				const fragment = parseModel( input, schema );
				const block = ListWalker.first( fragment.getChild( 2 ), {
					direction: 'forward',
					sameIndent: true
				} );

				expect( block ).to.equal( fragment.getChild( 3 ) );
			} );

			it( 'should return first block on the same indent level (forward)', () => {
				const input =
					'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
					'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
					'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
					'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
					'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
					'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

				const fragment = parseModel( input, schema );
				const block = ListWalker.first( fragment.getChild( 1 ), {
					direction: 'forward',
					sameIndent: true
				} );

				expect( block ).to.equal( fragment.getChild( 4 ) );
			} );

			it( 'should return first block on the same indent level (backward)', () => {
				const input =
					'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
					'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
					'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
					'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
					'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
					'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

				const fragment = parseModel( input, schema );
				const block = ListWalker.first( fragment.getChild( 4 ), {
					direction: 'backward',
					sameIndent: true
				} );

				expect( block ).to.equal( fragment.getChild( 1 ) );
			} );
		} );
	} );

	describe( 'nested level iterating (higherIndent = true )', () => {
		it( 'should return nested list blocks (higherIndent = true, sameIndent = false)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'forward',
				higherIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should return all nested blocks (higherIndent = true, sameIndent = false)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 0 ), {
				direction: 'forward',
				higherIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 4 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 4 ) );
		} );

		it( 'should return all nested blocks (higherIndent = true, sameIndent = false, backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 5 ), {
				direction: 'backward',
				higherIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 4 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 4 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should return nested blocks next to the start element', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="1">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 0 ), {
				direction: 'forward',
				higherIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should return nested blocks next to the start element (backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="1">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 5 ), {
				direction: 'backward',
				higherIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 4 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should return nothing there is no nested sibling', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'forward',
				higherIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 0 );
		} );

		it( 'should return nothing there is no nested sibling (backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 2 ), {
				direction: 'backward',
				higherIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 0 );
		} );

		it( 'should return nothing if a the end of nested list', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 2 ), {
				direction: 'forward',
				higherIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 0 );
		} );

		it( 'should return nothing if a the start of nested list (backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'backward',
				higherIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 0 );
		} );

		describe( 'first()', () => {
			it( 'should return nested sibling block', () => {
				const input =
					'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
					'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
					'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
					'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
					'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
					'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

				const fragment = parseModel( input, schema );
				const block = ListWalker.first( fragment.getChild( 1 ), {
					direction: 'forward',
					higherIndent: true
				} );

				expect( block ).to.equal( fragment.getChild( 2 ) );
			} );

			it( 'should return nested sibling block (backward)', () => {
				const input =
					'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
					'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
					'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
					'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
					'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
					'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

				const fragment = parseModel( input, schema );
				const block = ListWalker.first( fragment.getChild( 4 ), {
					direction: 'backward',
					higherIndent: true
				} );

				expect( block ).to.equal( fragment.getChild( 3 ) );
			} );
		} );
	} );

	describe( 'parent level iterating (lowerIndent = true )', () => {
		it( 'should return nothing if at the start of top level list (backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 0 ), {
				direction: 'backward',
				lowerIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 0 );
		} );

		it( 'should return nothing if at top level list (backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'backward',
				lowerIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 0 );
		} );

		it( 'should return nothing if at top level list (forward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'forward',
				lowerIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 0 );
		} );

		it( 'should return parent block if at the first block of nested list (backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'backward',
				lowerIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 1 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
		} );

		it( 'should return parent block if at the following block of nested list (backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 2 ), {
				direction: 'backward',
				lowerIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 1 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
		} );

		it( 'should return parent block even when there is a nested list (backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 4 ), {
				direction: 'backward',
				lowerIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 1 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
		} );

		it( 'should return parent block even when there is a nested list (forward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 1 ), {
				direction: 'forward',
				lowerIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 1 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 5 ) );
		} );

		it( 'should return parent blocks (backward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="3">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 4 ), {
				direction: 'backward',
				lowerIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should return parent blocks (forward)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="3">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="2">4</paragraph>' +
				'<paragraph listType="bulleted" listItemId="f" listIndent="2">5</paragraph>' +
				'<paragraph listType="bulleted" listItemId="g" listIndent="0">6</paragraph>';

			const fragment = parseModel( input, schema );
			const walker = new ListWalker( fragment.getChild( 3 ), {
				direction: 'forward',
				lowerIndent: true
			} );
			const blocks = Array.from( walker );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 4 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 6 ) );
		} );

		describe( 'first()', () => {
			it( 'should return nested sibling block', () => {
				const input =
					'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
					'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
					'<paragraph listType="bulleted" listItemId="c" listIndent="1">2</paragraph>' +
					'<paragraph listType="bulleted" listItemId="d" listIndent="2">3</paragraph>' +
					'<paragraph listType="bulleted" listItemId="e" listIndent="1">4</paragraph>' +
					'<paragraph listType="bulleted" listItemId="f" listIndent="0">5</paragraph>';

				const fragment = parseModel( input, schema );
				const block = ListWalker.first( fragment.getChild( 4 ), {
					direction: 'backward',
					lowerIndent: true
				} );

				expect( block ).to.equal( fragment.getChild( 1 ) );
			} );
		} );
	} );
} );
