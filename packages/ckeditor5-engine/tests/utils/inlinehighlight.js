/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import setupHighlight, { findElementRange } from '../../src/utils/inlinehighlight';

import Model from '../../src/model/model';
import Range from '../../src/model/range';
import { setData, getData as getModelData } from '../../src/dev-utils/model';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getViewData } from '../../src/dev-utils/view';

/* global document */

describe( 'setupHighlight', () => {
	let element, editor, model, view;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element );

		model = editor.model;
		view = editor.editing.view;

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		editor.conversion.elementToElement( { model: 'paragraph', view: 'p' } );

		model.schema.extend( '$text', { allowAttributes: 'linkHref' } );

		editor.conversion.for( 'editingDowncast' )
			.attributeToElement( { model: 'linkHref', view: ( href, writer ) => {
				return writer.createAttributeElement( 'a', { href } );
			} } );

		// Setup highlight over selected link.
		setupHighlight( editor, editor.editing.view, 'linkHref', 'a', 'ck-link_selected' );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	describe( 'link highlighting', () => {
		it( 'should convert the highlight to a proper view classes', () => {
			setData( model,
				'<paragraph>foo <$text linkHref="url">b{}ar</$text> baz</paragraph>'
			);

			expect( model.document.selection.hasAttribute( 'linkHref' ) ).to.be.true;
			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">b{}ar</a> baz</p>'
			);
		} );

		it( 'should work whenever selection has linkHref attribute - link start', () => {
			setData( model,
				'<paragraph>foo {}<$text linkHref="url">bar</$text> baz</paragraph>'
			);

			expect( model.document.selection.hasAttribute( 'linkHref' ) ).to.be.false;

			model.change( writer => {
				writer.setSelectionAttribute( 'linkHref', 'url' );
			} );

			expect( model.document.selection.hasAttribute( 'linkHref' ) ).to.be.true;
			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">{}bar</a> baz</p>'
			);
		} );

		it( 'should work whenever selection has linkHref attribute - link end', () => {
			setData( model,
				'<paragraph>foo <$text linkHref="url">bar</$text>{} baz</paragraph>'
			);

			expect( model.document.selection.hasAttribute( 'linkHref' ) ).to.be.true;
			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">bar{}</a> baz</p>'
			);
		} );

		it( 'should render highlight correctly after splitting the link', () => {
			setData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			model.change( writer => {
				const splitPos = model.document.selection.getFirstRange().start;

				writer.split( splitPos );
				writer.setSelection( splitPos.parent.nextSibling, 0 );

				writer.setSelectionAttribute( 'linkHref', 'url' );
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo <$text linkHref="url">li</$text></paragraph>' +
				'<paragraph><$text linkHref="url">[]nk</$text> baz</paragraph>'
			);

			expect( model.document.selection.hasAttribute( 'linkHref' ) ).to.be.true;

			expect( getViewData( view ) ).to.equal(
				'<p>foo <a href="url">li</a></p>' +
				'<p><a class="ck-link_selected" href="url">{}nk</a> baz</p>'
			);
		} );

		it( 'should remove classes when selection is moved out from the link', () => {
			setData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 0 ) );

			expect( getViewData( view ) ).to.equal(
				'<p>{}foo <a href="url">link</a> baz</p>'
			);
		} );

		it( 'should work correctly when selection is moved inside link', () => {
			setData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 5 ) );

			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">l{}ink</a> baz</p>'
			);
		} );

		describe( 'downcast conversion integration', () => {
			it( 'works for the #insert event', () => {
				setData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.insertText( 'FOO', { linkHref: 'url' }, model.document.selection.getFirstPosition() );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">liFOO{}nk</a> baz</p>'
				);
			} );

			it( 'works for the #remove event', () => {
				setData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.remove( writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					) );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p><a class="ck-link_selected" href="url">i{}nk</a> baz</p>'
				);
			} );

			it( 'works for the #attribute event', () => {
				setData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.setAttribute( 'linkHref', 'new-url', writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a href="url">l</a><a class="ck-link_selected" href="new-url">i{}n</a><a href="url">k</a> baz</p>'
				);
			} );

			it( 'works for the #selection event', () => {
				setData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.setSelection( writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">l{in}k</a> baz</p>'
				);
			} );

			it( 'works for the addMarker and removeMarker events', () => {
				editor.conversion.for( 'editingDowncast' ).markerToHighlight( { model: 'fooMarker', view: {} } );

				setData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					const range = writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					);

					writer.addMarker( 'fooMarker', { range, usingOperation: true } );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p><span>foo </span><a class="ck-link_selected" href="url"><span>l</span>i{}nk</a> baz</p>'
				);

				model.change( writer => writer.removeMarker( 'fooMarker' ) );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
				);
			} );
		} );
	} );
} );

describe( 'findElementRange', () => {
	let model, document, root;

	beforeEach( () => {
		model = new Model();
		document = model.document;
		root = document.createRoot();
		model.schema.extend( '$text', { allowIn: '$root' } );
		model.schema.register( 'p', { inheritAllFrom: '$block' } );
	} );

	it( 'should find link range searching from the center of the link #1', () => {
		setData( model, '<$text linkHref="url">foobar</$text>' );

		const startPosition = model.createPositionAt( root, [ 3 ] );
		const result = findElementRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 6 ) ) ) ).to.true;
	} );

	it( 'should find link range searching from the center of the link #2', () => {
		setData( model, 'abc <$text linkHref="url">foobar</$text> abc' );

		const startPosition = model.createPositionAt( root, [ 7 ] );
		const result = findElementRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 4 ), model.createPositionAt( root, 10 ) ) ) ).to.true;
	} );

	it( 'should find link range searching from the beginning of the link #1', () => {
		setData( model, '<$text linkHref="url">foobar</$text>' );

		const startPosition = model.createPositionAt( root, [ 0 ] );
		const result = findElementRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 6 ) ) ) ).to.true;
	} );

	it( 'should find link range searching from the beginning of the link #2', () => {
		setData( model, 'abc <$text linkHref="url">foobar</$text> abc' );

		const startPosition = model.createPositionAt( root, [ 4 ] );
		const result = findElementRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 4 ), model.createPositionAt( root, 10 ) ) ) ).to.true;
	} );

	it( 'should find link range searching from the end of the link #1', () => {
		setData( model, '<$text linkHref="url">foobar</$text>' );

		const startPosition = model.createPositionAt( root, [ 6 ] );
		const result = findElementRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 6 ) ) ) ).to.true;
	} );

	it( 'should find link range searching from the end of the link #2', () => {
		setData( model, 'abc <$text linkHref="url">foobar</$text> abc' );

		const startPosition = model.createPositionAt( root, [ 10 ] );
		const result = findElementRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 4 ), model.createPositionAt( root, 10 ) ) ) ).to.true;
	} );

	it( 'should find link range when link stick to other link searching from the center of the link', () => {
		setData( model, '<$text linkHref="other">abc</$text><$text linkHref="url">foobar</$text><$text linkHref="other">abc</$text>' );

		const startPosition = model.createPositionAt( root, [ 6 ] );
		const result = findElementRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 9 ) ) ) ).to.true;
	} );

	it( 'should find link range when link stick to other link searching from the beginning of the link', () => {
		setData( model, '<$text linkHref="other">abc</$text><$text linkHref="url">foobar</$text><$text linkHref="other">abc</$text>' );

		const startPosition = model.createPositionAt( root, [ 3 ] );
		const result = findElementRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 9 ) ) ) ).to.true;
	} );

	it( 'should find link range when link stick to other link searching from the end of the link', () => {
		setData( model, '<$text linkHref="other">abc</$text><$text linkHref="url">foobar</$text><$text linkHref="other">abc</$text>' );

		const startPosition = model.createPositionAt( root, [ 9 ] );
		const result = findElementRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 9 ) ) ) ).to.true;
	} );

	it( 'should find link range only inside current parent', () => {
		setData(
			model,
			'<p><$text linkHref="url">foobar</$text></p>' +
			'<p><$text linkHref="url">foobar</$text></p>' +
			'<p><$text linkHref="url">foobar</$text></p>'
		);

		const startPosition = model.createPositionAt( root.getNodeByPath( [ 1 ] ), 3 );
		const result = findElementRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		const expectedRange = model.createRange(
			model.createPositionAt( root.getNodeByPath( [ 1 ] ), 0 ),
			model.createPositionAt( root.getNodeByPath( [ 1 ] ), 6 )
		);
		expect( result.isEqual( expectedRange ) ).to.true;
	} );
} );
