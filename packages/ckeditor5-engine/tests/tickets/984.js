/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../src/model/model.js';
import Element from '../../src/model/element.js';
import Text from '../../src/model/text.js';
import Position from '../../src/model/position.js';
import LiveRange from '../../src/model/liverange.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData } from '../../src/dev-utils/model.js';

import { stringifyBlocks } from '../model/_utils/utils.js';

describe( '#984', () => {
	let model, doc, root, liveRange;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		root._appendChild( [
			new Element( 'p' ),
			new Element( 'p' ),
			new Element( 'p', [], new Text( 'foobar' ) ),
			new Element( 'p' ),
			new Element( 'p' ),
			new Element( 'p' ),
			new Element( 'p', [], new Text( 'foobar' ) )
		] );

		liveRange = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );

		model.schema.register( 'p', { inheritAllFrom: '$block' } );
		model.schema.register( 'h', { inheritAllFrom: '$block' } );

		model.schema.register( 'blockquote' );
		model.schema.extend( 'blockquote', { allowIn: '$root' } );
		model.schema.extend( '$block', { allowIn: 'blockquote' } );

		model.schema.register( 'imageBlock', {
			allowIn: [ '$root', '$block' ],
			allowChildren: '$text'
		} );

		// Special block which can contain another blocks.
		model.schema.register( 'nestedBlock', { inheritAllFrom: '$block' } );
		model.schema.extend( 'nestedBlock', { allowIn: '$block' } );

		model.schema.register( 'table', { isBlock: true, isLimit: true, isObject: true, allowIn: '$root' } );
		model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
		model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );

		model.schema.extend( 'p', { allowIn: 'tableCell' } );
	} );

	afterEach( () => {
		model.destroy();
		liveRange.detach();
	} );

	it( 'does not return the last block if none of its content is selected', () => {
		setData( model, '<p>[a</p><p>b</p><p>]c</p>' );

		expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#a', 'p#b' ] );
	} );

	it( 'returns no blocks if selection spanning two blocks has no content', () => {
		setData( model, '<p>a</p><h>b[</h><p>]c</p><p>d</p>' );

		expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [] );
	} );

	it( 'does not return the last block if none of its content is selected (nested case)', () => {
		setData( model, '<p>[a</p><nestedBlock><nestedBlock>]b</nestedBlock></nestedBlock>' );

		expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#a' ] );
	} );

	// As a super edge case, we can live with this behavior as I don't even know what we could expect here
	// since only the innermost block is considered a block to return (so the <nB>b...</nB> needs to be ignored).
	it( 'does not return the last block if none of its content is selected (nested case, wrapper with a content)', () => {
		setData( model, '<p>[a</p><nestedBlock>b<nestedBlock>]c</nestedBlock></nestedBlock>' );

		expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#a' ] );
	} );

	it( 'returns the last block if at least one of its child nodes is selected', () => {
		setData( model, '<p>[a</p><p>b</p><p><imageBlock></imageBlock>]c</p>' );

		expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#a', 'p#b', 'p#c' ] );
	} );

	// I needed these last 2 cases to justify the use of isTouching() instead of simple `offset == 0` check.
	it( 'returns the last block if at least one of its child nodes is selected (end in an inline element)', () => {
		setData( model, '<p>[a</p><p>b</p><p><imageBlock>x]</imageBlock>c</p>' );

		expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#a', 'p#b', 'p#c' ] );
	} );

	it(
		'does not return the last block if at least one of its child nodes is selected ' +
		'(end in an inline element, no content selected)',
		() => {
			setData( model, '<p>[a</p><p>b</p><p><imageBlock>]x</imageBlock>c</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#a', 'p#b' ] );
		}
	);
} );
