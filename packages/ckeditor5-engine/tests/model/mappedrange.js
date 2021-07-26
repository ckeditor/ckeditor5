/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../src/model/model';
import { stringify, setData } from '../../src/dev-utils/model';

describe.only( 'MappedRange', () => {
	let model, doc, root, ranges, reducedChanges, changedRanges;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();

		doc.on( 'change:data', () => {
			const changes = doc.differ.getChanges();

			doc.mappedRanges.applyChanges( changes );

			ranges = doc.mappedRanges.getRanges();
			changedRanges = doc.mappedRanges.getRangesChanges();
			reducedChanges = doc.mappedRanges.getReducedChanges( 'list', changes );

			doc.mappedRanges.clearChanges();
		}, { priority: 'low' } );

		model.schema.register( 'p', { inheritAllFrom: '$block' } );
		model.schema.register( 'bq', { allowWhere: '$block', allowContentOf: '$root' } );
		model.schema.extend( '$block', { allowAttributes: [ 'listType', 'listItem' ] } );
	} );

	describe( 'inserting elements with watched attribute', () => {
		describe( 'creating a new mapped range', () => {
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
					'[' +
						'<p listItem="x"></p>' +
					']' +
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
					'[' +
						'<p listItem="x"></p>' +
					']' +
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
					'[' +
						'<p listItem="x"></p>' +
					']'
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
					'[' +
						'<p listItem="x"></p>' +
						'<p listItem="y"></p>' +
					']' +
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
					'[' +
						'<p listItem="x"></p>' +
						'<p listItem="y"></p>' +
						'<p listItem="z"></p>' +
					']' +
					'<p>b</p>' +
					'<p>c</p>'
				);
			} );

			it( 'should handle 2 new mapped ranges', () => {
				setData( model,
					'<p>a</p>' +
					'<p>b</p>' +
					'<p>c</p>'
				);

				model.change( writer => {
					writer.insertElement( 'p', { listItem: 'x' }, root, 1 );
					writer.insertElement( 'p', { listItem: 'y' }, root, 3 );
				} );

				expect( ranges.length ).to.equal( 2 );
				expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
					'<p>a</p>' +
					'[' +
						'<p listItem="x"></p>' +
					']' +
					'<p>b</p>' +
					'[' +
						'<p listItem="y"></p>' +
					']' +
					'<p>c</p>'
				);
			} );

			it( 'should handle nested elements', () => {
				setData( model,
					'<p>a</p>' +
					'<p>b</p>' +
					'<p>c</p>'
				);

				model.change( writer => {
					const bq = writer.createElement( 'bq' );

					writer.insertElement( 'p', bq, 0 );
					writer.insertElement( 'p', { listItem: 'x' }, bq, 1 );
					writer.insertElement( 'p', { listItem: 'y' }, bq, 2 );
					writer.insertElement( 'p', bq, 3 );

					writer.insert( bq, root, 1 );
				} );

				expect( ranges.length ).to.equal( 1 );
				expect( stringify( root, ranges[ 0 ] ) ).to.equal(
					'<p>a</p>' +
					'<bq>' +
						'<p></p>' +
						'[' +
							'<p listItem="x"></p>' +
							'<p listItem="y"></p>' +
						']' +
						'<p></p>' +
					'</bq>' +
					'<p>b</p>' +
					'<p>c</p>'
				);
			} );

			it( 'should create new list if new element is not touching the previous one', () => {
				setData( model,
					'<p>a</p>' +
					'<p listItem="x">b</p>' +
					'<p listItem="y">c</p>' +
					'<p>d</p>'
				);

				model.change( writer => {
					writer.insertElement( 'p', { listItem: 'z' }, root, 0 );
				} );

				expect( ranges.length ).to.equal( 2 );
				expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
					'[' +
						'<p listItem="z"></p>' +
					']' +
					'<p>a</p>' +
					'[' +
						'<p listItem="x">b</p>' +
						'<p listItem="y">c</p>' +
					']' +
					'<p>d</p>'
				);
			} );
		} );

		it( 'should expand range when new element is inserted before the range', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="x">b</p>' +
				'<p listItem="y">c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', { listItem: 'z' }, root, 1 );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="z"></p>' +
					'<p listItem="x">b</p>' +
					'<p listItem="y">c</p>' +
				']' +
				'<p>d</p>'
			);
		} );

		it( 'should expand range when new element is inserted after the range', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="x">b</p>' +
				'<p listItem="y">c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', { listItem: 'z' }, root, 3 );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="x">b</p>' +
					'<p listItem="y">c</p>' +
					'<p listItem="z"></p>' +
				']' +
				'<p>d</p>'
			);
		} );

		it( 'should not mix roots', () => {
			const anotherRoot = doc.createRoot( undefined, 'another' );

			setData( model,
				'<p>a</p>' +
				'<p listItem="x">b</p>' +
				'<p listItem="y">c</p>' +
				'<p>d</p>'
			);

			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>',
				{ rootName: 'another' }
			);

			model.change( writer => {
				writer.insertElement( 'p', { listItem: 'z' }, anotherRoot, 2 );
			} );

			expect( ranges.length ).to.equal( 2 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="x">b</p>' +
					'<p listItem="y">c</p>' +
				']' +
				'<p>d</p>'
			);
			expect( stringify( anotherRoot, ranges[ 1 ] ) ).to.equal(
				'<p>a</p>' +
				'<p>b</p>' +
				'[' +
					'<p listItem="z"></p>' +
				']' +
				'<p>c</p>'
			);
		} );

		it( 'should not mix deeper nested lists', () => {
			setData( model,
				'<bq>' +
					'<p listItem="1">a</p>' +
					'<p listItem="2">b</p>' +
				'</bq>' +
				'<bq>' +
					'<p listItem="3">c</p>' +
					'<p listItem="4">d</p>' +
				'</bq>'
			);

			model.change( writer => {
				writer.insertElement( 'p', { listItem: 'foo' }, root.getChild( 0 ), 1 );
			} );

			expect( ranges.length ).to.equal( 2 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<bq>' +
					'[' +
						'<p listItem="1">a</p>' +
						'<p listItem="foo"></p>' +
						'<p listItem="2">b</p>' +
					']' +
				'</bq>' +
				'<bq>' +
					'[' +
						'<p listItem="3">c</p>' +
						'<p listItem="4">d</p>' +
					']' +
				'</bq>'
			);
		} );
	} );

	describe( 'inserting elements without watched attribute', () => {
		it( 'should not change range when new element is inserted before the list', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="x">b</p>' +
				'<p listItem="y">c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', root, 1 );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'<p></p>' +
				'[' +
					'<p listItem="x">b</p>' +
					'<p listItem="y">c</p>' +
				']' +
				'<p>d</p>'
			);
		} );

		it( 'should not change range when new element is inserted after the list', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="x">b</p>' +
				'<p listItem="y">c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', root, 3 );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="x">b</p>' +
					'<p listItem="y">c</p>' +
				']' +
				'<p></p>' +
				'<p>d</p>'
			);
		} );

		it( 'should split range when new element is inserted inside the list', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="x">b</p>' +
				'<p listItem="y">c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', root, 2 );
			} );

			expect( ranges.length ).to.equal( 2 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="x">b</p>' +
				']' +
				'<p></p>' +
				'[' +
					'<p listItem="y">c</p>' +
				']' +
				'<p>d</p>'
			);
		} );

		it( 'should split range when new element is inserted inside the longer list', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p listItem="3">d</p>' +
				'<p listItem="4">e</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.insertElement( 'p', root, 3 );
			} );

			expect( ranges.length ).to.equal( 2 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">b</p>' +
					'<p listItem="2">c</p>' +
				']' +
				'<p></p>' +
				'[' +
					'<p listItem="3">d</p>' +
					'<p listItem="4">e</p>' +
				']' +
				'<p>d</p>'
			);
		} );
	} );

	describe( 'removing elements', () => {
		it( 'should not modify mapped ranges if element was before a range', () => {
			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p listItem="1">c</p>' +
				'<p listItem="2">d</p>' +
				'<p>e</p>'
			);

			model.change( writer => {
				writer.remove( root.getChild( 1 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">c</p>' +
					'<p listItem="2">d</p>' +
				']' +
				'<p>e</p>'
			);
		} );

		it( 'should not modify mapped ranges if element was after a range', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p>d</p>' +
				'<p>e</p>'
			);

			model.change( writer => {
				writer.remove( root.getChild( 3 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">b</p>' +
					'<p listItem="2">c</p>' +
				']' +
				'<p>e</p>'
			);
		} );

		it( 'should shrink mapped range if its first element was removed', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p listItem="3">d</p>' +
				'<p>e</p>'
			);

			model.change( writer => {
				writer.remove( root.getChild( 1 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="2">c</p>' +
					'<p listItem="3">d</p>' +
				']' +
				'<p>e</p>'
			);
		} );

		it( 'should shrink mapped range if element from inside was removed', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p listItem="3">d</p>' +
				'<p>e</p>'
			);

			model.change( writer => {
				writer.remove( root.getChild( 2 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">b</p>' +
					'<p listItem="3">d</p>' +
				']' +
				'<p>e</p>'
			);
		} );

		it( 'should shrink mapped range if its last element was removed', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p listItem="3">d</p>' +
				'<p>e</p>'
			);

			model.change( writer => {
				writer.remove( root.getChild( 3 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">b</p>' +
					'<p listItem="2">c</p>' +
				']' +
				'<p>e</p>'
			);
		} );

		it( 'should remove mapped range if all its elements were removed', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p listItem="3">d</p>' +
				'<p>e</p>'
			);

			model.change( writer => {
				writer.remove( model.createRange(
					writer.createPositionAt( root, 1 ),
					writer.createPositionAt( root, 4 )
				) );
			} );

			expect( ranges.length ).to.equal( 0 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'<p>e</p>'
			);
		} );

		it( 'should remove mapped range if the whole nested content was removed', () => {
			setData( model,
				'<p>a</p>' +
				'<bq>' +
					'<p listItem="1">b</p>' +
					'<p listItem="2">c</p>' +
					'<p listItem="3">d</p>' +
				'</bq>' +
				'<p>e</p>'
			);

			model.change( writer => {
				writer.remove( root.getChild( 1 ) );
			} );

			expect( ranges.length ).to.equal( 0 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'<p>e</p>'
			);
		} );

		it( 'should not mix roots', () => {
			const anotherRoot = doc.createRoot( undefined, 'another' );

			setData( model,
				'<p>a</p>' +
				'<p listItem="x">b</p>' +
				'<p listItem="y">c</p>' +
				'<p>d</p>'
			);

			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>',
				{ rootName: 'another' }
			);

			model.change( writer => {
				writer.remove( anotherRoot.getChild( 1 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="x">b</p>' +
					'<p listItem="y">c</p>' +
				']' +
				'<p>d</p>'
			);
			expect( stringify( anotherRoot, ranges[ 1 ] ) ).to.equal(
				'<p>a</p>' +
				'<p>c</p>'
			);
		} );

		it( 'should join mapped ranges if element between them was removed', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p>d</p>' +
				'<p listItem="3">e</p>' +
				'<p listItem="4">f</p>' +
				'<p>g</p>'
			);

			model.change( writer => {
				writer.remove( root.getChild( 3 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">b</p>' +
					'<p listItem="2">c</p>' +
					'<p listItem="3">e</p>' +
					'<p listItem="4">f</p>' +
				']' +
				'<p>g</p>'
			);
		} );
	} );

	describe( 'changing attributes', () => {
		it( 'should create mapped range on attribute set', () => {
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

		it( 'should extend mapped range on attribute set on an element before list', () => {
			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p listItem="1">c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.setAttribute( 'listItem', 'x', root.getChild( 1 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="x">b</p>' +
					'<p listItem="1">c</p>' +
				']' +
				'<p>d</p>'
			);
		} );

		it( 'should extend mapped range on attribute set on an element after list', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p>c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.setAttribute( 'listItem', 'x', root.getChild( 2 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">b</p>' +
					'<p listItem="x">c</p>' +
				']' +
				'<p>d</p>'
			);
		} );

		it( 'should remove mapped range on attribute removed from the whole range', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.removeAttribute( 'listItem', model.createRange(
					writer.createPositionAt( root, 1 ),
					writer.createPositionAt( root, 3 )
				) );
			} );

			expect( ranges.length ).to.equal( 0 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>' +
				'<p>d</p>'
			);
		} );

		it( 'should join mapped ranges on attribute set on an element between them', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p>d</p>' +
				'<p listItem="3">e</p>' +
				'<p listItem="4">f</p>' +
				'<p>g</p>'
			);

			model.change( writer => {
				writer.setAttribute( 'listItem', 'x', root.getChild( 3 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">b</p>' +
					'<p listItem="2">c</p>' +
					'<p listItem="x">d</p>' +
					'<p listItem="3">e</p>' +
					'<p listItem="4">f</p>' +
				']' +
				'<p>g</p>'
			);
		} );

		it( 'should split mapped ranges on attribute removed on an element inside range', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p listItem="3">d</p>' +
				'<p listItem="4">e</p>' +
				'<p listItem="5">f</p>' +
				'<p>g</p>'
			);

			model.change( writer => {
				writer.removeAttribute( 'listItem', root.getChild( 3 ) );
			} );

			expect( ranges.length ).to.equal( 2 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">b</p>' +
					'<p listItem="2">c</p>' +
				']' +
				'<p>d</p>' +
				'[' +
					'<p listItem="4">e</p>' +
					'<p listItem="5">f</p>' +
				']' +
				'<p>g</p>'
			);
		} );

		it( 'should mark range as refreshed on attribute value change', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.setAttribute( 'listItem', 'x', root.getChild( 1 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="x">b</p>' +
					'<p listItem="2">c</p>' +
				']' +
				'<p>d</p>'
			);

			expect( changedRanges.length ).to.equal( 1 );
			// TODO check details
		} );

		it( 'should mark range as refreshed on other watched attribute set', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.setAttribute( 'listType', 'x', root.getChild( 1 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1" listType="x">b</p>' +
					'<p listItem="2">c</p>' +
				']' +
				'<p>d</p>'
			);

			expect( reducedChanges.length ).to.equal( 1 );
			// TODO check details
		} );

		it( 'should mark as refreshed only affected ranges', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p>d</p>' +
				'<p listItem="3">e</p>' +
				'<p listItem="4">f</p>' +
				'<p>g</p>'
			);

			model.change( writer => {
				writer.removeAttribute( 'listItem', root.getChild( 2 ) );
			} );

			expect( ranges.length ).to.equal( 2 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">b</p>' +
				']' +
				'<p>c</p>' +
				'<p>d</p>' +
				'[' +
					'<p listItem="3">e</p>' +
					'<p listItem="4">f</p>' +
				']' +
				'<p>g</p>'
			);
			expect( changedRanges.length ).to.equal( 1 );
			// TODO check details
		} );

		it( 'should mark only affected marked range on value change', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p>d</p>' +
				'<p listItem="3">e</p>' +
				'<p listItem="4">f</p>' +
				'<p>g</p>'
			);

			model.change( writer => {
				writer.setAttribute( 'listItem', 'x', root.getChild( 4 ) );
			} );

			expect( ranges.length ).to.equal( 2 );
			expect( stringify( root, model.createSelection( ranges ) ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="1">b</p>' +
					'<p listItem="2">c</p>' +
				']' +
				'<p>d</p>' +
				'[' +
					'<p listItem="x">e</p>' +
					'<p listItem="4">f</p>' +
				']' +
				'<p>g</p>'
			);
			expect( changedRanges.length ).to.equal( 1 );
			// TODO check details
		} );

		it( 'should handle lists nested in other elements', () => {
			setData( model,
				'<p>a</p>' +
				'<bq>' +
					'<bq>' +
						'<p listItem="1">b</p>' +
						'<p listItem="2">c</p>' +
					'</bq>' +
				'</bq>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.setAttribute( 'listItem', 'x', root.getChild( 1 ) );
			} );

			expect( ranges.length ).to.equal( 2 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'<bq listItem="x">' +
					'<bq>' +
						'[' +
							'<p listItem="1">b</p>' +
							'<p listItem="2">c</p>' +
						']' +
					'</bq>' +
				'</bq>' +
				'<p>d</p>'
			);

			expect( stringify( root, ranges[ 1 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<bq listItem="x">' +
						'<bq>' +
							'<p listItem="1">b</p>' +
							'<p listItem="2">c</p>' +
						'</bq>' +
					'</bq>' +
				']' +
				'<p>d</p>'
			);
		} );

		it( 'should not mix roots', () => {
			const anotherRoot = doc.createRoot( undefined, 'another' );

			setData( model,
				'<p>a</p>' +
				'<p listItem="x">b</p>' +
				'<p>c</p>' +
				'<p>d</p>'
			);

			setData( model,
				'<p>a</p>' +
				'<p>b</p>' +
				'<p>c</p>' +
				'<p>d</p>',
				{ rootName: 'another' }
			);

			model.change( writer => {
				writer.setAttribute( 'listItem', 'x', anotherRoot.getChild( 2 ) );
			} );

			expect( ranges.length ).to.equal( 2 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p listItem="x">b</p>' +
				']' +
				'<p>c</p>' +
				'<p>d</p>'
			);
			expect( stringify( anotherRoot, ranges[ 1 ] ) ).to.equal(
				'<p>a</p>' +
				'<p>b</p>' +
				'[' +
					'<p listItem="x">c</p>' +
				']' +
				'<p>d</p>'
			);
		} );

		it( 'should ignore not watched attribute changes', () => {
			setData( model,
				'<p>a</p>' +
				'<p listItem="1">b</p>' +
				'<p listItem="2">c</p>' +
				'<p>d</p>'
			);

			model.change( writer => {
				writer.setAttribute( 'foo', 'bar', root.getChild( 1 ) );
			} );

			expect( ranges.length ).to.equal( 1 );
			expect( stringify( root, ranges[ 0 ] ) ).to.equal(
				'<p>a</p>' +
				'[' +
					'<p foo="bar" listItem="1">b</p>' +
					'<p listItem="2">c</p>' +
				']' +
				'<p>d</p>'
			);
			expect( changedRanges.length ).to.equal( 0 );
		} );

		it( 'should handle text attribute', () => {
			setData( model,
				'<p>foobar</p>'
			);

			model.change( writer => {
				writer.setAttribute( 'listItem', 'x', root.getChild( 0 ).getChild( 0 ) );
			} );

			expect( ranges.length ).to.equal( 0 );
			expect( changedRanges.length ).to.equal( 0 );
		} );
	} );
} );
