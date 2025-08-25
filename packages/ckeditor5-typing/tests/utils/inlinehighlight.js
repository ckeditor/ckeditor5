/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { inlineHighlight } from '../../src/utils/inlinehighlight.js';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

describe( 'inlineHighlight', () => {
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
			.attributeToElement( { model: 'linkHref', view: ( href, { writer } ) => {
				return writer.createAttributeElement( 'a', { href } );
			} } );

		// Setup highlight over selected link.
		inlineHighlight( editor, 'linkHref', 'a', 'ck-link_selected' );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	describe( 'attribute highlighting', () => {
		it( 'should convert the highlight to a proper view classes', () => {
			_setModelData( model,
				'<paragraph>foo <$text linkHref="url">b{}ar</$text> baz</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">b{}ar</a> baz</p>'
			);
		} );

		it( 'should work whenever selection has linkHref attribute - link start', () => {
			_setModelData( model,
				'<paragraph>foo {}<$text linkHref="url">bar</$text> baz</paragraph>'
			);

			expect( model.document.selection ).to.not.have.attribute( 'linkHref' );

			model.change( writer => {
				writer.setSelectionAttribute( 'linkHref', 'url' );
			} );

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">{}bar</a> baz</p>'
			);
		} );

		it( 'should work whenever selection has linkHref attribute - link end', () => {
			_setModelData( model,
				'<paragraph>foo <$text linkHref="url">bar</$text>{} baz</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">bar{}</a> baz</p>'
			);
		} );

		it( 'should render highlight correctly after splitting the link', () => {
			_setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			model.change( writer => {
				const splitPos = model.document.selection.getFirstRange().start;

				writer.split( splitPos );
				writer.setSelection( splitPos.parent.nextSibling, 0 );
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>foo <$text linkHref="url">li</$text></paragraph>' +
				'<paragraph><$text linkHref="url">[]nk</$text> baz</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a href="url">li</a></p>' +
				'<p><a class="ck-link_selected" href="url">{}nk</a> baz</p>'
			);
		} );

		it( 'should remove classes when selection is moved out from the link', () => {
			_setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 0 ) );

			expect( _getViewData( view ) ).to.equal(
				'<p>{}foo <a href="url">link</a> baz</p>'
			);
		} );

		it( 'should work correctly when selection is moved inside link', () => {
			_setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 5 ) );

			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">l{}ink</a> baz</p>'
			);
		} );

		describe( 'downcast conversion integration', () => {
			it( 'works for the #insert event', () => {
				_setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.insertText( 'FOO', { linkHref: 'url' }, model.document.selection.getFirstPosition() );
				} );

				expect( _getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">liFOO{}nk</a> baz</p>'
				);
			} );

			it( 'works for the #remove event', () => {
				_setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.remove( writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					) );
				} );

				expect( _getViewData( view ) ).to.equal(
					'<p><a class="ck-link_selected" href="url">i{}nk</a> baz</p>'
				);
			} );

			it( 'works for the #attribute event', () => {
				_setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.setAttribute( 'linkHref', 'new-url', writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( _getViewData( view ) ).to.equal(
					'<p>foo <a href="url">l</a><a class="ck-link_selected" href="new-url">i{}n</a><a href="url">k</a> baz</p>'
				);
			} );

			it( 'works for the #selection event', () => {
				_setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.setSelection( writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( _getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">l{in}k</a> baz</p>'
				);
			} );

			it( 'works for the addMarker and removeMarker events', () => {
				editor.conversion.for( 'editingDowncast' ).markerToHighlight( { model: 'fooMarker', view: {} } );

				_setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					const range = writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					);

					writer.addMarker( 'fooMarker', { range, usingOperation: true } );
				} );

				expect( _getViewData( view ) ).to.equal(
					'<p><span>foo </span><a class="ck-link_selected" href="url"><span>l</span>i{}nk</a> baz</p>'
				);

				model.change( writer => writer.removeMarker( 'fooMarker' ) );

				expect( _getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
				);
			} );
		} );
	} );
} );
