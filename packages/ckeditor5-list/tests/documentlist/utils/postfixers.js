/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	findAndAddListHeadToMap,
	fixListIndents,
	fixListItemIds
} from '../../../src/documentlist/utils/postfixers';
import stubUid from '../_utils/uid';

import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { stringify as stringifyModel, parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DocumentList - utils', () => {
	let model, schema;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		model = new Model();
		schema = model.schema;

		schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
	} );

	describe( 'findAndAddListHeadToMap()', () => {
		it( 'should find list that starts just after the given position', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>';

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 1 );
			const itemToListHead = new Map();

			findAndAddListHeadToMap( position, itemToListHead );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should find list that starts just before the given position', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>';

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 2 );
			const itemToListHead = new Map();

			findAndAddListHeadToMap( position, itemToListHead );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should find list that ends just before the given position', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>';

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 3 );
			const itemToListHead = new Map();

			findAndAddListHeadToMap( position, itemToListHead );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should reuse data from map if first item was previously mapped to head', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">c</paragraph>';

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 3 );
			const itemToListHead = new Map();

			itemToListHead.set( fragment.getChild( 2 ), fragment.getChild( 1 ) );

			findAndAddListHeadToMap( position, itemToListHead );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should reuse data from map if found some item that was previously mapped to head', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">c</paragraph>';

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 4 );
			const itemToListHead = new Map();

			itemToListHead.set( fragment.getChild( 2 ), fragment.getChild( 1 ) );

			findAndAddListHeadToMap( position, itemToListHead );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should not mix 2 lists separated by some non-list element', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">c</paragraph>';

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 4 );
			const itemToListHead = new Map();

			findAndAddListHeadToMap( position, itemToListHead );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should find list head even for mixed indents, ids, and types', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="numbered" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">c</paragraph>';

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 5 );
			const itemToListHead = new Map();

			findAndAddListHeadToMap( position, itemToListHead );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should not find a list if position is between plain paragraphs', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>' +
				'<paragraph>foo</paragraph>' +
				'<paragraph>bar</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">d</paragraph>';

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 3 );
			const itemToListHead = new Map();

			findAndAddListHeadToMap( position, itemToListHead );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 0 );
		} );
	} );

	describe( 'fixListIndents()', () => {
		it( 'should fix indentation of first list item', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listIndent="1" listItemId="a" listType="bulleted">a</paragraph>';

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( fragment.getChild( 1 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>'
			);
		} );

		it( 'should fix indentation of to deep nested items', () => {
			const input =
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="4" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="4" listItemId="c" listType="bulleted">c</paragraph>';

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>'
			);
		} );

		it( 'should not affect properly indented items after fixed item', () => {
			const input =
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="4" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>';

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>'
			);
		} );

		it( 'should fix rapid indent spikes', () => {
			const input =
				'<paragraph listIndent="10" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="3" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="10" listItemId="c" listType="bulleted">c</paragraph>';

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>'
			);
		} );

		it( 'should fix rapid indent spikes after some item', () => {
			const input =
				'<paragraph listIndent="1" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="10" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="15" listItemId="d" listType="bulleted">d</paragraph>';

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="2" listItemId="d" listType="bulleted">d</paragraph>'
			);
		} );

		it( 'should fix indentation keeping the relative indentations', () => {
			const input =
				'<paragraph listIndent="10" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="11" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="12" listItemId="c" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="13" listItemId="d" listType="bulleted">d</paragraph>' +
				'<paragraph listIndent="12" listItemId="e" listType="bulleted">e</paragraph>' +
				'<paragraph listIndent="11" listItemId="f" listType="bulleted">f</paragraph>' +
				'<paragraph listIndent="10" listItemId="g" listType="bulleted">g</paragraph>';

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="3" listItemId="d" listType="bulleted">d</paragraph>' +
				'<paragraph listIndent="2" listItemId="e" listType="bulleted">e</paragraph>' +
				'<paragraph listIndent="1" listItemId="f" listType="bulleted">f</paragraph>' +
				'<paragraph listIndent="0" listItemId="g" listType="bulleted">g</paragraph>'
			);
		} );

		it( 'should flatten the leading indentation spike', () => {
			const input =
				'<paragraph listIndent="3" listItemId="e" listType="numbered">e</paragraph>' +
				'<paragraph listIndent="2" listItemId="f" listType="bulleted">f</paragraph>' +
				'<paragraph listIndent="3" listItemId="g" listType="bulleted">g</paragraph>' +
				'<paragraph listIndent="1" listItemId="h" listType="bulleted">h</paragraph>' +
				'<paragraph listIndent="2" listItemId="i" listType="numbered">i</paragraph>' +
				'<paragraph listIndent="0" listItemId="j" listType="numbered">j</paragraph>';

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="e" listType="numbered">e</paragraph>' +
				'<paragraph listIndent="0" listItemId="f" listType="bulleted">f</paragraph>' +
				'<paragraph listIndent="1" listItemId="g" listType="bulleted">g</paragraph>' +
				'<paragraph listIndent="0" listItemId="h" listType="bulleted">h</paragraph>' +
				'<paragraph listIndent="1" listItemId="i" listType="numbered">i</paragraph>' +
				'<paragraph listIndent="0" listItemId="j" listType="numbered">j</paragraph>'
			);
		} );

		it( 'list nested in blockquote', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<blockQuote listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">' +
					'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>' +
					'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">bar</paragraph>' +
				'</blockQuote>';

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( fragment.getChild( 1 ).getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<blockQuote listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">bar</paragraph>' +
				'</blockQuote>'
			);
		} );
	} );

	describe( 'fixListItemIds()', () => {
		it( 'should update nested item ID', () => {
			const input =
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="1" listItemId="a" listType="bulleted">1</paragraph>';

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( fragment.getChild( 0 ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">1</paragraph>'
			);
		} );

		it( 'should update nested item ID (middle element of bigger list item)', () => {
			const input =
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="1" listItemId="a" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">2</paragraph>';

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( fragment.getChild( 0 ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">2</paragraph>'
			);
		} );

		it( 'should use same new ID if multiple items were indented', () => {
			const input =
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="1" listItemId="a" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="1" listItemId="a" listType="bulleted">2</paragraph>';

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( fragment.getChild( 0 ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">2</paragraph>'
			);
		} );

		it( 'should update item ID if middle item of bigger block changed type', () => {
			const input =
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">2</paragraph>';

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( fragment.getChild( 0 ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">2</paragraph>'
			);
		} );

		it( 'should use same new ID if multiple items changed type', () => {
			const input =
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">2</paragraph>';

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( fragment.getChild( 0 ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">2</paragraph>'
			);
		} );

		it( 'should fix ids of list with nested lists', () => {
			const input =
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">1</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">2</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">3</paragraph>';

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( fragment.getChild( 0 ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">1</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">2</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">3</paragraph>'
			);
		} );

		it( 'should fix ids of list with altered types of multiple items of a single bigger list item', () => {
			const input =
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">2</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">3</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">4</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">5</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">6</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">7</paragraph>';

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( fragment.getChild( 0 ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">2</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">3</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">4</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">5</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="numbered">6</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="numbered">7</paragraph>'
			);
		} );

		it( 'should use new ID if some ID was spot before in the other list', () => {
			const input =
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">2</paragraph>';

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			seenIds.add( 'b' );

			model.change( writer => {
				fixListItemIds( fragment.getChild( 0 ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">2</paragraph>'
			);
		} );
	} );
} );
