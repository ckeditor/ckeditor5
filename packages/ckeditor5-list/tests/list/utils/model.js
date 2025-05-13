/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	expandListBlocksToCompleteItems,
	expandListBlocksToCompleteList,
	getAllListItemBlocks,
	getListItemBlocks,
	getListItems,
	getNestedListBlocks,
	indentBlocks,
	isFirstBlockOfListItem,
	isLastBlockOfListItem,
	isSingleListItem,
	ListItemUid,
	mergeListItemBefore,
	outdentBlocksWithMerge,
	outdentFollowingItems,
	removeListAttributes,
	splitListItemBefore
} from '../../../src/list/utils/model.js';
import { modelList } from '../_utils/utils.js';
import stubUid from '../_utils/uid.js';

import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { stringify as stringifyModel, parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'List - utils - model', () => {
	let model, schema;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		model = new Model();
		schema = model.schema;

		schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
	} );

	describe( 'ListItemUid.next()', () => {
		it( 'should generate UIDs', () => {
			stubUid( 0 );

			expect( ListItemUid.next() ).to.equal( '000' );
			expect( ListItemUid.next() ).to.equal( '001' );
			expect( ListItemUid.next() ).to.equal( '002' );
			expect( ListItemUid.next() ).to.equal( '003' );
			expect( ListItemUid.next() ).to.equal( '004' );
			expect( ListItemUid.next() ).to.equal( '005' );
		} );
	} );

	describe( 'getAllListItemBlocks()', () => {
		it( 'should return a single item if it meets conditions', () => {
			const input = modelList( [
				'foo',
				'* 0.',
				'* 1.',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );
			const foundElements = getAllListItemBlocks( listItem );

			expect( foundElements.length ).to.equal( 1 );
			expect( foundElements[ 0 ] ).to.be.equal( listItem );
		} );

		it( 'should return a items if started looking from the first list item block', () => {
			const input = modelList( [
				'foo',
				'* 0a.',
				'  1b.',
				'  1c.',
				'* 2.',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );
			const foundElements = getAllListItemBlocks( listItem );

			expect( foundElements.length ).to.equal( 3 );
			expect( foundElements[ 0 ] ).to.be.equal( listItem );
			expect( foundElements[ 1 ] ).to.be.equal( fragment.getChild( 2 ) );
			expect( foundElements[ 2 ] ).to.be.equal( fragment.getChild( 3 ) );
		} );

		it( 'should return a items if started looking from the last list item block', () => {
			const input = modelList( [
				'foo',
				'* 0a.',
				'  1b.',
				'  1c.',
				'* 2.',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 3 );
			const foundElements = getAllListItemBlocks( listItem );

			expect( foundElements.length ).to.equal( 3 );
			expect( foundElements[ 0 ] ).to.be.equal( fragment.getChild( 1 ) );
			expect( foundElements[ 1 ] ).to.be.equal( fragment.getChild( 2 ) );
			expect( foundElements[ 2 ] ).to.be.equal( listItem );
		} );

		it( 'should return a items if started looking from the middle list item block', () => {
			const input = modelList( [
				'foo',
				'* 0a.',
				'  1b.',
				'  1c.',
				'* 2.',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );
			const foundElements = getAllListItemBlocks( listItem );

			expect( foundElements.length ).to.equal( 3 );
			expect( foundElements[ 0 ] ).to.be.equal( fragment.getChild( 1 ) );
			expect( foundElements[ 1 ] ).to.be.equal( listItem );
			expect( foundElements[ 2 ] ).to.be.equal( fragment.getChild( 3 ) );
		} );

		it( 'should ignore nested list blocks', () => {
			const input = modelList( [
				'foo',
				'* a',
				'* b1',
				'  * b1.c',
				'  b2',
				'  * b2.d',
				'  b3',
				'* e',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 4 );
			const foundElements = getAllListItemBlocks( listItem );

			expect( foundElements.length ).to.equal( 3 );
			expect( foundElements[ 0 ] ).to.be.equal( fragment.getChild( 2 ) );
			expect( foundElements[ 1 ] ).to.be.equal( listItem );
			expect( foundElements[ 2 ] ).to.be.equal( fragment.getChild( 6 ) );
		} );
	} );

	describe( 'getListItemBlocks()', () => {
		it( 'should return a single item if it meets conditions', () => {
			const input = modelList( [
				'foo',
				'* 0.',
				'* 1.',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 0 );
			expect( forwardElements.length ).to.equal( 1 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
		} );

		it( 'should return a items if started looking from the first list item block', () => {
			const input = modelList( [
				'foo',
				'* 0a.',
				'  1b.',
				'  1c.',
				'* 2.',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 0 );
			expect( forwardElements.length ).to.equal( 3 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
			expect( forwardElements[ 1 ] ).to.be.equal( fragment.getChild( 2 ) );
			expect( forwardElements[ 2 ] ).to.be.equal( fragment.getChild( 3 ) );
		} );

		it( 'should return a items if started looking from the last list item block', () => {
			const input = modelList( [
				'foo',
				'* 0a.',
				'  1b.',
				'  1c.',
				'* 2.',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 3 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 2 );
			expect( backwardElements[ 0 ] ).to.be.equal( fragment.getChild( 1 ) );
			expect( backwardElements[ 1 ] ).to.be.equal( fragment.getChild( 2 ) );

			expect( forwardElements.length ).to.equal( 1 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
		} );

		it( 'should return a items if started looking from the middle list item block', () => {
			const input = modelList( [
				'foo',
				'* 0a.',
				'  1b.',
				'  1c.',
				'* 2.',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 1 );
			expect( backwardElements[ 0 ] ).to.be.equal( fragment.getChild( 1 ) );

			expect( forwardElements.length ).to.equal( 2 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
			expect( forwardElements[ 1 ] ).to.be.equal( fragment.getChild( 3 ) );
		} );

		it( 'should ignore nested list blocks', () => {
			const input = modelList( [
				'foo',
				'* a',
				'* b1',
				'  * b1.c',
				'  b2',
				'  * b2.d',
				'  b3',
				'* e',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 4 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 1 );
			expect( backwardElements[ 0 ] ).to.be.equal( fragment.getChild( 2 ) );

			expect( forwardElements.length ).to.equal( 2 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
			expect( forwardElements[ 1 ] ).to.be.equal( fragment.getChild( 6 ) );
		} );

		it( 'should break if exited nested list', () => {
			const input = modelList( [
				'foo',
				'* a',
				'  * b',
				'    b',
				'* c',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 0 );

			expect( forwardElements.length ).to.equal( 2 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
			expect( forwardElements[ 1 ] ).to.be.equal( fragment.getChild( 3 ) );
		} );

		it( 'should search backward by default', () => {
			const input = modelList( [
				'foo',
				'* a',
				'* b',
				'  b',
				'* c',
				'bar'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 3 );
			const backwardElements = getListItemBlocks( listItem );

			expect( backwardElements.length ).to.equal( 1 );
			expect( backwardElements[ 0 ] ).to.equal( fragment.getChild( 2 ) );
		} );
	} );

	describe( 'getNestedListBlocks()', () => {
		it( 'should return empty array if there is no nested blocks', () => {
			const input = modelList( [
				'* a',
				'* b'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );
			const blocks = getNestedListBlocks( listItem );

			expect( blocks.length ).to.equal( 0 );
		} );

		it( 'should return blocks that have a greater indent than the given item', () => {
			const input = modelList( [
				'* a',
				'  * b',
				'    * c',
				'    * d',
				'* e'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );
			const blocks = getNestedListBlocks( listItem );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should return blocks that have a greater indent than the given item (nested one)', () => {
			const input = modelList( [
				'* a',
				'  * b',
				'    * c',
				'    * d',
				'* e'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );
			const blocks = getNestedListBlocks( listItem );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should not include items from other subtrees', () => {
			const input = modelList( [
				'* a',
				'  * b',
				'    * c',
				'* d',
				'  * e'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );
			const blocks = getNestedListBlocks( listItem );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
		} );
	} );

	describe( 'getListItems()', () => {
		it( 'should return all list items for a single flat list (when given the first list item)', () => {
			const input = modelList( [
				'0',
				'* 1',
				'* 2',
				'* 3',
				'4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items for a single flat list (when given the last list item)', () => {
			const input = modelList( [
				'0',
				'* 1',
				'* 2',
				'* 3',
				'4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 3 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items for a single flat list (when given the middle list item)', () => {
			const input = modelList( [
				'0',
				'* 1',
				'* 2',
				'* 3',
				'4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items for a nested list', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'  * 2',
				'  * 3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items of the same type', () => {
			const input = modelList( [
				'# 0',
				'* 1',
				'* 2',
				'* 3',
				'# 4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items and ignore nested lists', () => {
			const input = modelList( [
				'0',
				'* 1',
				'  * 2',
				'* 3',
				'4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items with following blocks belonging to the same item', () => {
			const input = modelList( [
				'0',
				'* 1',
				'  2',
				'* 3',
				'  4',
				'5'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 )
			] );
		} );

		describe( 'modify backward and forward iterator with options', () => {
			it( 'should return all list items and nested lists (higherIndent: true)', () => {
				const input = modelList( [
					'0',
					'* 1',
					'  * 2',
					'    * 3',
					'  * 4',
					'    * 5',
					'  * 6',
					'7'
				] );

				const fragment = parseModel( input, schema );
				const listItem = fragment.getChild( 4 );

				expect( getListItems( listItem, { higherIndent: true } ) ).to.deep.equal( [
					fragment.getChild( 2 ),
					fragment.getChild( 3 ),
					fragment.getChild( 4 ),
					fragment.getChild( 5 ),
					fragment.getChild( 6 )
				] );
			} );

			it( 'should return all list items of all types (sameAttributes: [])', () => {
				const input = modelList( [
					'# 0',
					'* 1',
					'* 2',
					'* 3',
					'# 4'
				] );

				const fragment = parseModel( input, schema );
				const listItem = fragment.getChild( 2 );

				expect( getListItems( listItem, { sameAttributes: [] } ) ).to.deep.equal( [
					fragment.getChild( 0 ),
					fragment.getChild( 1 ),
					fragment.getChild( 2 ),
					fragment.getChild( 3 ),
					fragment.getChild( 4 )
				] );
			} );
		} );
	} );

	describe( 'isFirstBlockOfListItem()', () => {
		it( 'should return true for the first list item', () => {
			const input = modelList( [
				'* a',
				'* b'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );

			expect( isFirstBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return true for the second list item', () => {
			const input = modelList( [
				'* a',
				'* b'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( isFirstBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return false for the second block of list item', () => {
			const input = modelList( [
				'* a',
				'  b'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( isFirstBlockOfListItem( listItem ) ).to.be.false;
		} );

		it( 'should return true if the previous block has lower indent', () => {
			const input = modelList( [
				'* a',
				'  * b'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( isFirstBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return false if the previous block has higher indent but it is a part of bigger list item', () => {
			const input = modelList( [
				'* a',
				'  * b',
				'  c'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );

			expect( isFirstBlockOfListItem( listItem ) ).to.be.false;
		} );
	} );

	describe( 'isLastBlockOfListItem()', () => {
		it( 'should return true for the last list item', () => {
			const input = modelList( [
				'* a',
				'* b'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( isLastBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return true for the first list item', () => {
			const input = modelList( [
				'* a',
				'* b'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );

			expect( isLastBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return false for the first block of list item', () => {
			const input = modelList( [
				'* a',
				'  b'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );

			expect( isLastBlockOfListItem( listItem ) ).to.be.false;
		} );

		it( 'should return true if the next block has lower indent', () => {
			const input = modelList( [
				'* a',
				'  * b',
				'* c'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( isLastBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return false if the next block has higher indent but it is a part of bigger list item', () => {
			const input = modelList( [
				'* a',
				'  * b',
				'  c'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );

			expect( isLastBlockOfListItem( listItem ) ).to.be.false;
		} );
	} );

	describe( 'expandListBlocksToCompleteItems()', () => {
		it( 'should not modify list for a single block of a single-block list item', () => {
			const input = modelList( [
				'* a',
				'* b',
				'* c',
				'* d'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 0 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 1 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
		} );

		it( 'should include all blocks for single list item', () => {
			const input = modelList( [
				'* 0',
				'  1',
				'  2'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 0 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should include all blocks for only first list item block', () => {
			const input = modelList( [
				'* 0',
				'* 1',
				'  2',
				'  3',
				'* 3'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 1 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all blocks for only last list item block', () => {
			const input = modelList( [
				'* 0',
				'* 1',
				'  2',
				'  3',
				'* 3'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 3 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all blocks for only middle list item block', () => {
			const input = modelList( [
				'* 0',
				'* 1',
				'  2',
				'  3',
				'* 3'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all blocks in nested list item', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'    2',
				'    3',
				'* 3'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all blocks including nested items (start from first item)', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'  2'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 0 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should include all blocks including nested items (start from last item)', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'  2'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should expand first and last items', () => {
			const input = modelList( [
				'* x',
				'* 0',
				'  1',
				'* 2',
				'  3',
				'* y'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 4 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 4 ) );
		} );

		it( 'should not include nested items from other item', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'* 2',
				'  * 3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all blocks even if not at the same indent level from the edge block', () => {
			const fragment = parseModel( modelList( [
				'* 0',
				'  * 1',
				'    * 2',
				'    3',
				'  * 4',
				'    * 5',
				'    6',
				'  * 7'
			] ), schema );

			let blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 ),
				fragment.getChild( 5 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 6 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 4 ) );
			expect( blocks[ 4 ] ).to.equal( fragment.getChild( 5 ) );
			expect( blocks[ 5 ] ).to.equal( fragment.getChild( 6 ) );
		} );
	} );

	describe( 'expandListBlocksToCompleteList()', () => {
		it( 'should not include anything (no blocks given)', () => {
			let blocks = [];

			blocks = expandListBlocksToCompleteList( blocks, [ 'listType' ] );

			expect( blocks.length ).to.equal( 0 );
		} );

		it( 'should include all list items (single item given)', () => {
			const input = modelList( [
				'* a',
				'* b', // <--
				'* c',
				'* d'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 1 )
			];

			blocks = expandListBlocksToCompleteList( blocks, [ 'listType' ] );

			expect( blocks.length ).to.equal( 4 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all list item (two items given)', () => {
			const input = modelList( [
				'* a',
				'* b', // <--
				'* c',
				'* d' // <--
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 1 ),
				fragment.getChild( 3 )
			];

			blocks = expandListBlocksToCompleteList( blocks, [ 'listType' ] );

			expect( blocks.length ).to.equal( 4 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all list item (part of list item given)', () => {
			const input = modelList( [
				'* a',
				'* b',
				'  c', // <--
				'* d',
				'  e'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 )
			];

			blocks = expandListBlocksToCompleteList( blocks, [ 'listType' ] );

			expect( blocks.length ).to.equal( 5 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 4 ] ).to.equal( fragment.getChild( 4 ) );
		} );

		it( 'should include all list item of nested list', () => {
			const input = modelList( [
				'* a',
				'* b',
				'  # b1',
				'  # b2', // <--
				'  # b3',
				'* c',
				'* d'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 3 )
			];

			blocks = expandListBlocksToCompleteList( blocks, [ 'listType' ] );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 4 ) );
		} );

		it( 'should include all list item from many lists', () => {
			const input = modelList( [
				'* a',
				'* b',
				'  # b1', // <--
				'    * b1a', // <--
				'    * b1b',
				'      # b1b1',
				'    * b1c',
				'  # b2',
				'  # b3',
				'* c',
				'* d'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			];

			blocks = expandListBlocksToCompleteList( blocks, [ 'listType' ] );

			expect( blocks.length ).to.equal( 6 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 4 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 6 ) );
			expect( blocks[ 4 ] ).to.equal( fragment.getChild( 7 ) );
			expect( blocks[ 5 ] ).to.equal( fragment.getChild( 8 ) );
		} );

		it( 'should not include any item from other list', () => {
			const input = modelList( [
				'* 1a',
				'* 1b',
				'# 2a',
				'# 2b', // <--
				'# 2c',
				'* 3a',
				'* 3b'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 3 )
			];

			blocks = expandListBlocksToCompleteList( blocks, [ 'listType' ] );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 4 ) );
		} );

		it( 'should not include any item that is not a list', () => {
			const input = modelList( [
				'<paragraph listItemId="01" listType="bulleted">1a</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph listItemId="01" listType="bulleted">2a</paragraph>' +
				'<paragraph listItemId="01" listType="bulleted">2b</paragraph>' + // This one.
				'<paragraph listItemId="01" listType="bulleted">2c</paragraph>' +
				'<paragraph>Bar</paragraph>' +
				'<paragraph listItemId="01" listType="bulleted">3a</paragraph>'
			] );

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 3 )
			];

			blocks = expandListBlocksToCompleteList( blocks, [ 'listType' ] );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 4 ) );
		} );
	} );

	describe( 'splitListItemBefore()', () => {
		it( 'should replace all blocks ids for first block given', () => {
			const input = modelList( [
				'* a',
				'  b',
				'  c'
			] );

			const fragment = parseModel( input, schema );

			stubUid();
			model.change( writer => splitListItemBefore( fragment.getChild( 0 ), writer ) );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* a{id:a00}',
				'  b',
				'  c'
			] ) );
		} );

		it( 'should replace blocks ids for second block given', () => {
			const input = modelList( [
				'* a',
				'  b',
				'  c'
			] );

			const fragment = parseModel( input, schema );

			stubUid();
			model.change( writer => splitListItemBefore( fragment.getChild( 1 ), writer ) );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* a',
				'* b{id:a00}',
				'  c'
			] ) );
		} );

		it( 'should not modify other items', () => {
			const input = modelList( [
				'* x',
				'* a',
				'  b',
				'  c',
				'* y'
			] );

			const fragment = parseModel( input, schema );

			stubUid();
			model.change( writer => splitListItemBefore( fragment.getChild( 2 ), writer ) );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* x',
				'* a',
				'* b{id:a00}',
				'  c',
				'* y'
			] ) );
		} );

		it( 'should not modify nested items', () => {
			const input = modelList( [
				'* a',
				'  b',
				'  * c',
				'  d'
			] );

			const fragment = parseModel( input, schema );

			stubUid();
			model.change( writer => splitListItemBefore( fragment.getChild( 1 ), writer ) );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* a',
				'* b{id:a00}',
				'  * c',
				'  d'
			] ) );
		} );

		it( 'should not modify parent items', () => {
			const input = modelList( [
				'* a',
				'  * b',
				'    c',
				'    d',
				'  e'
			] );

			const fragment = parseModel( input, schema );

			stubUid();
			model.change( writer => splitListItemBefore( fragment.getChild( 2 ), writer ) );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* a',
				'  * b',
				'  * c{id:a00}',
				'    d',
				'  e'
			] ) );
		} );
	} );

	describe( 'mergeListItemBefore()', () => {
		it( 'should apply parent list attributes to the given list block', () => {
			const input = modelList( [
				'* 0',
				'  # 1',
				'* 2'
			] );

			const fragment = parseModel( input, schema );
			let changedBlocks;

			model.change( writer => {
				changedBlocks = mergeListItemBefore( fragment.getChild( 1 ), fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'  1',
				'* 2'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 )
			] );
		} );

		it( 'should apply parent list attributes to the given list block and all blocks of the same item', () => {
			const input = modelList( [
				'* 0',
				'  # 1',
				'    2',
				'* 3'
			] );

			const fragment = parseModel( input, schema );
			let changedBlocks;

			model.change( writer => {
				changedBlocks = mergeListItemBefore( fragment.getChild( 1 ), fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'  1',
				'  2',
				'* 3'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 )
			] );
		} );

		it( 'should not apply non-list attributes', () => {
			const input = modelList( [
				'* <paragraph alignment="right">0</paragraph>',
				'  * 1',
				'* 2'
			] );

			const fragment = parseModel( input, schema );
			let changedBlocks;

			model.change( writer => {
				changedBlocks = mergeListItemBefore( fragment.getChild( 1 ), fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* <paragraph alignment="right">0</paragraph>',
				'  1',
				'* 2'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 )
			] );
		} );
	} );

	describe( 'indentBlocks()', () => {
		describe( 'indentBy = 1', () => {
			it( 'flat items', () => {
				const input = modelList( [
					'* a',
					'  b',
					'* c',
					'  d'
				] );

				const fragment = parseModel( input, schema );
				const blocks = [
					fragment.getChild( 2 ),
					fragment.getChild( 3 )
				];

				stubUid();

				model.change( writer => indentBlocks( blocks, writer ) );

				expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'  * c',
					'    d'
				] ) );
			} );

			it( 'nested lists should keep structure', () => {
				const input = modelList( [
					'* a',
					'  * b',
					'    * c',
					'  * d',
					'* e'
				] );

				const fragment = parseModel( input, schema );
				const blocks = [
					fragment.getChild( 1 ),
					fragment.getChild( 2 ),
					fragment.getChild( 3 )
				];

				stubUid();

				model.change( writer => indentBlocks( blocks, writer ) );

				expect( stringifyModel( fragment ) ).to.equal( modelList( [
					'* a',
					'    * b',
					'      * c',
					'    * d',
					'* e'
				] ) );
			} );

			it( 'should apply indentation on all blocks of given items (expand = true)', () => {
				const input = modelList( [
					'* 0',
					'* 1',
					'  2',
					'* 3',
					'  4',
					'* 5'
				] );

				const fragment = parseModel( input, schema );
				const blocks = [
					fragment.getChild( 2 ),
					fragment.getChild( 3 )
				];

				model.change( writer => indentBlocks( blocks, writer, { expand: true } ) );

				expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
					'* 0',
					'  * 1',
					'    2',
					'  * 3',
					'    4',
					'* 5'
				] ) );
			} );
		} );

		describe( 'indentBy = -1', () => {
			it( 'should handle outdenting', () => {
				const input = modelList( [
					'* 0',
					'  * 1',
					'    * 2',
					'  * 3',
					'* 4'
				] );

				const fragment = parseModel( input, schema );
				const blocks = [
					fragment.getChild( 1 ),
					fragment.getChild( 2 ),
					fragment.getChild( 3 )
				];

				let changedBlocks;

				model.change( writer => {
					changedBlocks = indentBlocks( blocks, writer, { indentBy: -1 } );
				} );

				expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
					'* 0',
					'* 1',
					'  * 2',
					'* 3',
					'* 4'
				] ) );

				expect( changedBlocks ).to.deep.equal( blocks );
			} );

			it( 'should remove list attributes if outdented below 0', () => {
				const input = modelList( [
					'* 0',
					'* 1',
					'* 2',
					'  * 3',
					'* 4'
				] );

				const fragment = parseModel( input, schema );
				const blocks = [
					fragment.getChild( 2 ),
					fragment.getChild( 3 ),
					fragment.getChild( 4 )
				];

				let changedBlocks;

				model.change( writer => {
					changedBlocks = indentBlocks( blocks, writer, { indentBy: -1 } );
				} );

				expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
					'* 0',
					'* 1',
					'2',
					'* 3',
					'4'
				] ) );

				expect( changedBlocks ).to.deep.equal( blocks );
			} );

			it( 'should not remove attributes other than lists if outdented below 0', () => {
				const input = modelList( [
					'* <paragraph alignment="right">0</paragraph>',
					'* <paragraph alignment="right">1</paragraph>',
					'  * <paragraph alignment="right">2</paragraph>',
					'* <paragraph alignment="right">3</paragraph>',
					'  * <paragraph alignment="right">4</paragraph>'
				] );

				const fragment = parseModel( input, schema );
				const blocks = [
					fragment.getChild( 2 ),
					fragment.getChild( 3 ),
					fragment.getChild( 4 )
				];

				let changedBlocks;

				model.change( writer => {
					changedBlocks = indentBlocks( blocks, writer, { indentBy: -1 } );
				} );

				expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
					'* <paragraph alignment="right">0</paragraph>',
					'* <paragraph alignment="right">1</paragraph>',
					'* <paragraph alignment="right">2</paragraph>',
					'<paragraph alignment="right">3</paragraph>',
					'* <paragraph alignment="right">4</paragraph>'
				] ) );

				expect( changedBlocks ).to.deep.equal( blocks );
			} );

			it( 'should apply indentation on all blocks of given items (expand = true)', () => {
				const input = modelList( [
					'* 0',
					'  * 1',
					'    2',
					'  * 3',
					'    4',
					'  * 5'
				] );

				const fragment = parseModel( input, schema );
				const blocks = [
					fragment.getChild( 2 ),
					fragment.getChild( 3 )
				];

				let changedBlocks;

				model.change( writer => {
					changedBlocks = indentBlocks( blocks, writer, { expand: true, indentBy: -1 } );
				} );

				expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
					'* 0',
					'* 1',
					'  2',
					'* 3',
					'  4',
					'  * 5'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					fragment.getChild( 1 ),
					fragment.getChild( 2 ),
					fragment.getChild( 3 ),
					fragment.getChild( 4 )
				] );
			} );
		} );
	} );

	describe( 'outdentBlocksWithMerge()', () => {
		it( 'should merge nested items to the parent item if nested block is not the last block of parent list item', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'    2',
				'  3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentBlocksWithMerge( blocks, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'  1',
				'  2',
				'  3',
				'* 4'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 )
			] );
		} );

		it( 'should not merge nested items to the parent item if nested block is the last block of parent list item', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'    2',
				'* 3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentBlocksWithMerge( blocks, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'  2',
				'* 3',
				'* 4'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 )
			] );
		} );

		it( 'should merge nested items but not deeper nested lists', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'    * 2',
				'    * 3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentBlocksWithMerge( blocks, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'  * 2',
				'  * 3',
				'* 4'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );
	} );

	describe( 'removeListAttributes()', () => {
		it( 'should remove all list attributes on a given blocks', () => {
			const input = modelList( [
				'* 0',
				'* 1',
				'  * 2',
				'    3',
				'  * 4',
				'* 5'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = removeListAttributes( blocks, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'2',
				'3',
				'4',
				'* 5'
			] ) );

			expect( changedBlocks ).to.deep.equal( blocks );
		} );

		it( 'should not remove non-list attributes', () => {
			const input = modelList( [
				'* 0',
				'* 1',
				'  * <paragraph alignmnent="right">2</paragraph>',
				'    3',
				'  * 4',
				'* 5'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = removeListAttributes( blocks, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'<paragraph alignmnent="right">2</paragraph>',
				'3',
				'4',
				'* 5'
			] ) );

			expect( changedBlocks ).to.deep.equal( blocks );
		} );
	} );

	describe( 'isSingleListItem()', () => {
		it( 'should return false if no blocks are given', () => {
			expect( isSingleListItem( [] ) ).to.be.false;
		} );

		it( 'should return false if first block is not a list item', () => {
			const input = modelList( [
				'0',
				'1'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 )
			];

			expect( isSingleListItem( blocks ) ).to.be.false;
		} );

		it( 'should return false if any block has a different ID', () => {
			const input = modelList( [
				'* 0',
				'  1',
				'* 2'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 0 ),
				fragment.getChild( 1 ),
				fragment.getChild( 2 )
			];

			expect( isSingleListItem( blocks ) ).to.be.false;
		} );

		it( 'should return true if all block has the same ID', () => {
			const input = modelList( [
				'* 0',
				'  1',
				'* 2'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 0 ),
				fragment.getChild( 1 )
			];

			expect( isSingleListItem( blocks ) ).to.be.true;
		} );
	} );

	describe( 'outdentFollowingItems()', () => {
		it( 'should outdent all items and keep nesting structure where possible', () => {
			/* eslint-disable @stylistic/no-multi-spaces */
			const input = modelList( [
				'0',
				'* 1',
				'  * 2',
				'    * 3', 			// <- this is turned off.
				'      * 4', 		// <- this has to become indent = 0, because it will be first item on a new list.
				'        * 5', 		// <- this should be still be a child of item above, so indent = 1.
				'    * 6', 			// <- this has to become indent = 0, because it should not be a child of any of items above.
				'      * 7', 		// <- this should be still be a child of item above, so indent = 1.
				'  * 8', 			// <- this has to become indent = 0.
				'    * 9', 			// <- this should still be a child of item above, so indent = 1.
				'      * 10', 		// <- this should still be a child of item above, so indent = 2.
				'      * 11', 		// <- this should still be at the same level as item above, so indent = 2.
				'* 12', 			// <- this and all below are left unchanged.
				'  * 13',
				'    * 14'
			] );
			/* eslint-enable @stylistic/no-multi-spaces */

			const fragment = parseModel( input, schema );
			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentFollowingItems( fragment.getChild( 3 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'0',
				'* 1',
				'  * 2',
				'    * 3',
				'* 4',
				'  * 5',
				'* 6',
				'  * 7',
				'* 8',
				'  * 9',
				'    * 10',
				'    * 11',
				'* 12',
				'  * 13',
				'    * 14'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 4 ),
				fragment.getChild( 5 ),
				fragment.getChild( 6 ),
				fragment.getChild( 7 ),
				fragment.getChild( 8 ),
				fragment.getChild( 9 ),
				fragment.getChild( 10 ),
				fragment.getChild( 11 )
			] );
		} );
	} );
} );
