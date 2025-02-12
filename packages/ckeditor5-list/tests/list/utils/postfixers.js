/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	findAndAddListHeadToMap,
	fixListIndents,
	fixListItemIds
} from '../../../src/list/utils/postfixers.js';
import {
	SiblingListBlocksIterator
} from '../../../src/list/utils/listwalker.js';
import stubUid from '../_utils/uid.js';
import { modelList } from '../_utils/utils.js';

import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { stringify as stringifyModel, parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'List - utils - postfixers', () => {
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
			const input = modelList( [
				'foo',
				'* a',
				'* b'
			] );

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 1 );
			const itemToListHead = new Set();
			const visited = new Set();

			findAndAddListHeadToMap( position, itemToListHead, visited );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should find list that starts just before the given position', () => {
			const input = modelList( [
				'foo',
				'* a',
				'* b'
			] );

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 2 );
			const itemToListHead = new Set();
			const visited = new Set();

			findAndAddListHeadToMap( position, itemToListHead, visited );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should find list that ends just before the given position', () => {
			const input = modelList( [
				'foo',
				'* a',
				'* b'
			] );

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 3 );
			const itemToListHead = new Set();
			const visited = new Set();

			findAndAddListHeadToMap( position, itemToListHead, visited );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should reuse data from map if first item was previously mapped to head', () => {
			const input = modelList( [
				'foo',
				'* a',
				'* b',
				'* c'
			] );

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 3 );
			const itemToListHead = new Set();
			const visited = new Set();

			itemToListHead.add( fragment.getChild( 1 ) );

			findAndAddListHeadToMap( position, itemToListHead, visited );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should reuse data from map if found some item that was previously mapped to head', () => {
			const input = modelList( [
				'foo',
				'* a',
				'* b',
				'* c'
			] );

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 4 );
			const itemToListHead = new Set();
			const visited = new Set();

			itemToListHead.add( fragment.getChild( 1 ) );

			findAndAddListHeadToMap( position, itemToListHead, visited );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should not mix 2 lists separated by some non-list element', () => {
			const input = modelList( [
				'* a',
				'foo',
				'* b',
				'* c'
			] );

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 4 );
			const itemToListHead = new Set();
			const visited = new Set();

			findAndAddListHeadToMap( position, itemToListHead, visited );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should find list head even for mixed indents, ids, and types', () => {
			const input = modelList( [
				'foo',
				'* a',
				'  a',
				'  # b',
				'* c'
			] );

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 5 );
			const itemToListHead = new Set();
			const visited = new Set();

			findAndAddListHeadToMap( position, itemToListHead, visited );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 1 );
			expect( heads[ 0 ] ).to.equal( fragment.getChild( 1 ) );
		} );

		it( 'should not find a list if position is between plain paragraphs', () => {
			const input = modelList( [
				'* a',
				'* b',
				'foo',
				'bar',
				'* c',
				'* d'
			] );

			const fragment = parseModel( input, schema );
			const position = model.createPositionAt( fragment, 3 );
			const itemToListHead = new Set();
			const visited = new Set();

			findAndAddListHeadToMap( position, itemToListHead, visited );

			const heads = Array.from( itemToListHead.values() );

			expect( heads.length ).to.equal( 0 );
		} );
	} );

	describe( 'fixListIndents()', () => {
		it( 'should fix indentation of first list item', () => {
			const input = modelList( [
				'foo',
				'  * a'
			] );

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( new SiblingListBlocksIterator( fragment.getChild( 1 ) ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal( modelList( [
				'foo',
				'* a'
			] ) );
		} );

		it( 'should fix indentation of to deep nested items', () => {
			const input = modelList( [
				'* a',
				'        * b',
				'        * c'
			] );

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal( modelList( [
				'* a',
				'  * b',
				'  * c'
			] ) );
		} );

		it( 'should not affect properly indented items after fixed item', () => {
			const input = modelList( [
				'* a',
				'        * b',
				'  * c'
			] );

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal( modelList( [
				'* a',
				'  * b',
				'  * c'
			] ) );
		} );

		it( 'should fix rapid indent spikes', () => {
			const input = modelList( [
				'                    * a',
				'      * b',
				'                    * c'
			] );

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal( modelList( [
				'* a',
				'* b',
				'  * c'
			] ) );
		} );

		it( 'should fix rapid indent spikes after some item', () => {
			const input = modelList( [
				'  * a',
				'                    * b',
				'    * c',
				'                              * d'
			] );

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal( modelList( [
				'* a',
				'  * b',
				'  * c',
				'    * d'
			] ) );
		} );

		it( 'should fix indentation keeping the relative indentations', () => {
			const input = modelList( [
				'                    * a',
				'                      * b',
				'                        * c',
				'                          * d',
				'                        * e',
				'                      * f',
				'                    * g'
			] );

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal( modelList( [
				'* a',
				'  * b',
				'    * c',
				'      * d',
				'    * e',
				'  * f',
				'* g'
			] ) );
		} );

		it( 'should flatten the leading indentation spike', () => {
			const input = modelList( [
				'      # e',
				'    * f',
				'      * g',
				'  * h',
				'    # i',
				'# j'
			] );

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal( modelList( [
				'# e',
				'* f',
				'  * g',
				'* h',
				'  # i',
				'# j'
			] ) );
		} );

		it( 'list nested in blockquote', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<blockQuote listIndent="0" listItemId="a02" listType="bulleted">' +
					modelList( [
						'  * foo',
						'  * bar'
					] ) +
				'</blockQuote>';

			const fragment = parseModel( input, schema );

			model.change( writer => {
				fixListIndents( new SiblingListBlocksIterator( fragment.getChild( 1 ).getChild( 0 ) ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<blockQuote listIndent="0" listItemId="a02" listType="bulleted">' +
					modelList( [
						'* foo',
						'* bar'
					] ) +
				'</blockQuote>'
			);
		} );
	} );

	describe( 'fixListItemIds()', () => {
		it( 'should update nested item ID', () => {
			const input = modelList( [
				'* 0',
				'  * 1'
			] );

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal( modelList( [
				'* 0',
				'  * 1'
			] ) );
		} );

		it( 'should update nested item ID (middle element of bigger list item)', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'  2'
			] );

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal( modelList( [
				'* 0',
				'  * 1',
				'  2'
			] ) );
		} );

		it( 'should use same new ID if multiple items were indented', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'    2'
			] );

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equal( modelList( [
				'* 0',
				'  * 1',
				'    2'
			] ) );
		} );

		it( 'should update item ID if middle item of bigger block changed type', () => {
			const input = modelList( [
				'* 0 {id:a}',
				'# 1 {id:a}',
				'* 2 {id:a}'
			], { ignoreIdConflicts: true } );

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0 {id:a}',
				'# 1 {id:a00}',
				'* 2 {id:a01}'
			] ) );
		} );

		it( 'should use same new ID if multiple items changed type', () => {
			const input = modelList( [
				'* 0 {id:a}',
				'# 1 {id:a}',
				'# 2 {id:a}'
			], { ignoreIdConflicts: true } );

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0 {id:a}',
				'# 1 {id:a00}',
				'  2'
			] ) );
		} );

		it( 'should fix ids of list with nested lists', () => {
			const input = modelList( [
				'* 0 {id:a}',
				'# 1 {id:a}',
				'  * 2 {id:b}',
				'# 3 {id:a}'
			], { ignoreIdConflicts: true } );

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0 {id:a}',
				'# 1 {id:a00}',
				'  * 2 {id:b}',
				'  3'
			] ) );
		} );

		it( 'should fix ids of list with altered types of multiple items of a single bigger list item', () => {
			const input = modelList( [
				'* 0{id:a}',
				'  1',
				'# 2{id:a}',
				'  3',
				'* 4{id:a}',
				'  5',
				'# 6{id:a}',
				'  7'
			], { ignoreIdConflicts: true } );

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			model.change( writer => {
				fixListItemIds( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0{id:a}',
				'  1',
				'# 2{id:a00}',
				'  3',
				'* 4{id:a01}',
				'  5',
				'# 6{id:a02}',
				'  7'
			] ) );
		} );

		it( 'should use new ID if some ID was spot before in the other list', () => {
			const input = modelList( [
				'* 0{id:a}',
				'  * 1{id:b}',
				'  2'
			] );

			const fragment = parseModel( input, model.schema );
			const seenIds = new Set();

			stubUid();

			seenIds.add( 'b' );

			model.change( writer => {
				fixListItemIds( new SiblingListBlocksIterator( fragment.getChild( 0 ) ), seenIds, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0{id:a}',
				'  * 1{id:a00}',
				'  2'
			] ) );
		} );
	} );
} );
