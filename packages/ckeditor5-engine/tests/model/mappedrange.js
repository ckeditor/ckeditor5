/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../src/model/model';
import { stringify, setData } from '../../src/dev-utils/model';

describe.only( 'MappedRange', () => {
	let model, doc, root, ranges, reducedChanges;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();

		doc.on( 'change:data', () => {
			const changes = doc.differ.getChanges();

			doc.mappedRanges.applyChanges( changes );

			ranges = doc.mappedRanges.getRanges();
			reducedChanges = doc.mappedRanges.getReducedChanges( 'list', changes );

			doc.mappedRanges.clearChanges();
		}, { priority: 'low' } );

		model.schema.register( 'p', { inheritAllFrom: '$block' } );
		model.schema.register( 'bg', { allowWhere: '$block', allowContentOf: '$root' } );
		model.schema.extend( '$block', { allowAttributes: [ 'listIndent', 'listItem' ] } );
	} );

	describe( 'inserting elements with watched attribute', () => {
		it( 'should handle new element at the beginning of root', () => {
			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', { listItem: 'x' }, root, 0 );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'[<p listItem="x"></p>]' +
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>'
			);
		} );

		it( 'should handle new element inside root', () => {
			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', { listItem: 'x' }, root, 1 );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[<p listItem="x"></p>]' +
				'<p>b</p>' +
				'<p>c</p>'
			);
		} );

		it( 'should handle new element at he end of root', () => {
			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', { listItem: 'x' }, root, 'end' );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>' +
				'[<p listItem="x"></p>]'
			);
		} );

		it( 'should handle 2 consecutive new elements', () => {
			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', { listItem: 'x' }, root, 1 );
				writer.insertElement( 'p', { listItem: 'y' }, root, 2 );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[<p listItem="x"></p>' +
				'<p listItem="y"></p>]' +
				'<p>b</p>' +
				'<p>c</p>'
			);
		} );

		it( 'should handle 3 consecutive new elements', () => {
			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', { listItem: 'x' }, root, 1 );
				writer.insertElement( 'p', { listItem: 'y' }, root, 2 );
				writer.insertElement( 'p', { listItem: 'z' }, root, 3 );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[<p listItem="x"></p>' +
				'<p listItem="y"></p>' +
				'<p listItem="z"></p>]' +
				'<p>b</p>' +
				'<p>c</p>'
			);
		} );
	} );

	describe( 'setting watched attribute', () => {
		it( 'aaaa', () => {
			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>'
			);

			model.change( writer => {
				writer.setAttribute( 'listItem', 'x', root.getChild( 1 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[<p listItem="x">b</p>]' +
				'<p>c</p>'
			);
		} );
	} );
} );
