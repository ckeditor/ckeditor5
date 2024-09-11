/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import BookmarkEditing from '../src/bookmarkediting.js';

import { Enter } from '@ckeditor/ckeditor5-enter';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Image } from '@ckeditor/ckeditor5-image';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Link } from '@ckeditor/ckeditor5-link';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { isWidget, getLabel } from '@ckeditor/ckeditor5-widget/src/utils.js';

describe( 'BookmarkEditing', () => {
	let editor, element, model, view, converter;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		const config = {
			language: 'en',
			plugins: [ BookmarkEditing, Enter, Image, Heading, Paragraph, Undo, Link ]
		};

		editor = await createEditor( element, config );

		model = editor.model;
		view = editor.editing.view;
		converter = view.domConverter;
	} );

	afterEach( async () => {
		element.remove();
		await editor.destroy();
	} );

	it( 'defines plugin name', () => {
		expect( BookmarkEditing.pluginName ).to.equal( 'BookmarkEditing' );
	} );

	describe( 'schema definition', () => {
		it( 'should set proper schema rules', () => {
			expect( model.schema.isRegistered( 'bookmark' ) ).to.be.true;
			expect( model.schema.isObject( 'bookmark' ) ).to.be.true;
			expect( model.schema.isInline( 'bookmark' ) ).to.be.true;

			expect( model.schema.checkAttribute( [ 'paragraph', 'bookmark' ], 'linkHref' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ 'paragraph', 'bookmark' ], 'id' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ 'paragraph', 'bookmark' ], 'bookmarkId' ) ).to.be.true;
			expect( model.schema.checkChild( [ 'paragraph' ], 'bookmark' ) ).to.be.true;
		} );
	} );

	describe( 'dataDowncast', () => {
		it( 'should properly downcast bookmark', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<a id="foo"></a>' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with text before', () => {
			setModelData( model, '<paragraph>Example text<bookmark bookmarkId="foo"></bookmark></paragraph>' );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'Example text' +
					'<a id="foo"></a>' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with text and space before', () => {
			setModelData( model, '<paragraph>text <bookmark bookmarkId="foo"></bookmark></paragraph>' );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'text' +
					' ' +
					'<a id="foo"></a>' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with text after', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark>Example text</paragraph>' );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<a id="foo"></a>' +
					'Example text' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with space and text after', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark> text</paragraph>' );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<a id="foo"></a>' +
					' ' +
					'text' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with surrounded text', () => {
			setModelData( model, '<paragraph>Example<bookmark bookmarkId="foo"></bookmark>text</paragraph>' );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'Example' +
					'<a id="foo"></a>' +
					'text' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with surrounded text with spaces before and after bookmark', () => {
			setModelData( model, '<paragraph>text <bookmark bookmarkId="foo"></bookmark> text</paragraph>' );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'text' +
					' ' +
					'<a id="foo"></a>' +
					' ' +
					'text' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark within a heading', () => {
			setModelData( model, '<heading1><bookmark bookmarkId="foo"></bookmark></heading1>' );

			expect( editor.getData() ).to.equal(
				'<h2>' +
					'<a id="foo"></a>' +
				'</h2>'
			);
		} );

		it( 'should properly change `bookmarkId` attribute of existing bookmark', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<a id="foo"></a>' +
				'</p>'
			);

			editor.model.change(
				writer => writer.setAttribute( 'bookmarkId', 'bar', writer.model.document.getRoot().getChild( 0 ).getChild( 0 ) )
			);

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<a id="bar"></a>' +
				'</p>'
			);
		} );
	} );

	describe( 'editingDowncast', () => {
		it( 'should properly downcast bookmark', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with text before', () => {
			setModelData( model, '<paragraph>Example text<bookmark bookmarkId="foo"></bookmark></paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'Example text' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with text and space before', () => {
			setModelData( model, '<paragraph>text[ ]<bookmark bookmarkId="foo"></bookmark></paragraph>' );

			// The setModelData() is stripping a whitespace before the bookmark element so we need to inject it manually.
			// editor.model.change( writer => {
			// 	writer.insert( ' ', editor.model.document.selection.getFirstPosition() );
			// } );

			const paragraph = editor.editing.view.document.getRoot();
			const domParagraph = converter.viewToDom( paragraph );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'text' +
					' ' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
				'</p>'
			);

			expect( domParagraph.innerHTML ).to.equal(
				'<p>' +
					'text' +
					' ' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo"></a>' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with text after', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark>Example text</paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
					'Example text' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with space and text after', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark> text</paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
					' ' +
					'text' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with surrounded text', () => {
			setModelData( model, '<paragraph>Example<bookmark bookmarkId="foo"></bookmark>text</paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'Example' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
					'text' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with surrounded text with spaces before and after bookmark', () => {
			setModelData( model, '<paragraph>Example <bookmark bookmarkId="foo"></bookmark> text</paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'Example' +
					' ' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
					' ' +
					'text' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark inside heading', () => {
			setModelData( model, '<heading1><bookmark bookmarkId="foo"></bookmark></heading1>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<h2>' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
				'</h2>'
			);
		} );

		it( 'should properly change `bookmarkId` attribute of existing bookmark', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
				'</p>'
			);

			editor.model.change(
				writer => writer.setAttribute( 'bookmarkId', 'bar', writer.model.document.getRoot().getChild( 0 ).getChild( 0 ) )
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="bar">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
				'</p>'
			);
		} );

		it( 'should properly downcast bookmark with proper type', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' );

			expect( getViewData( view, { withoutSelection: true, showType: true } ) ).to.equal(
				'<container:p>' +
					'<container:a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<ui:span class="ck-bookmark__icon"></ui:span>' +
					'</container:a>' +
				'</container:p>'
			);
		} );

		it( 'should have properly structured UI element', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' );

			// Get the `bookmark` widget.
			const bookmarkWidget = view.document.getRoot().getChild( 0 ).getChild( 0 );

			expect( isWidget( bookmarkWidget ) ).to.be.true;
			expect( getLabel( bookmarkWidget ) ).to.equal( 'foo bookmark widget' );

			expect( bookmarkWidget.name ).to.equal( 'a' );
			expect( bookmarkWidget.hasClass( 'ck-bookmark' ) ).to.be.true;
			expect( bookmarkWidget.childCount ).to.equal( 1 );

			const iconContainer = bookmarkWidget.getChild( 0 );

			expect( iconContainer.is( 'uiElement' ) ).to.be.true;
			expect( iconContainer.isEmpty ).to.be.true;

			expect( bookmarkWidget.getFillerOffset ).is.a( 'function' );
			expect( bookmarkWidget.getFillerOffset() ).to.equal( null );
		} );

		it( 'should not add any filler', () => {
			setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

			const element = view.document.selection.getSelectedElement();
			const domElement = converter.viewToDom( element );

			expect( domElement.outerHTML ).to.equal(
				'<a class="ck-bookmark ck-widget ck-widget_selected" id="foo" contenteditable="false">' +
					'<span class="ck-bookmark__icon">' +
					// eslint-disable-next-line max-len
					'<svg class="ck ck-icon ck-reset_all-excluded" viewBox="0 0 20 20"><path class="ck-icon__fill" d="m11.333 2 .19 2.263a5.899 5.899 0 0 1 1.458.604L14.714 3.4 16.6 5.286l-1.467 1.733c.263.452.468.942.605 1.46L18 8.666v2.666l-2.263.19a5.899 5.899 0 0 1-.604 1.458l1.467 1.733-1.886 1.886-1.733-1.467a5.899 5.899 0 0 1-1.46.605L11.334 18H8.667l-.19-2.263a5.899 5.899 0 0 1-1.458-.604L5.286 16.6 3.4 14.714l1.467-1.733a5.899 5.899 0 0 1-.604-1.458L2 11.333V8.667l2.262-.189a5.899 5.899 0 0 1 .605-1.459L3.4 5.286 5.286 3.4l1.733 1.467a5.899 5.899 0 0 1 1.46-.605L8.666 2h2.666zM10 6.267a3.733 3.733 0 1 0 0 7.466 3.733 3.733 0 0 0 0-7.466z"></path></svg>' +
					'</span>' +
				'</a>' );

			expect( domElement.children.length ).to.equal( 1 );
		} );
	} );

	describe( 'upcast', () => {
		it( 'should properly convert an `a` with `id` attribute', () => {
			editor.setData( '<p><a id="foo"></a></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>'
			);
		} );

		it( 'should properly convert an `a` with `id` attribute with text before', () => {
			editor.setData( '<p>Example text<a id="foo"></a></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>Example text<bookmark bookmarkId="foo"></bookmark></paragraph>'
			);
		} );

		it( 'should properly convert an `a` with `id` attribute with text before with space', () => {
			editor.setData( '<p>text <a id="foo"></a></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>text <bookmark bookmarkId="foo"></bookmark></paragraph>'
			);
		} );

		it( 'should properly convert an `a` with `id` attribute with text after', () => {
			editor.setData( '<p><a id="foo"></a>Example text</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><bookmark bookmarkId="foo"></bookmark>Example text</paragraph>'
			);
		} );

		it( 'should properly convert an `a` with `id` attribute with text after with space', () => {
			editor.setData( '<p><a id="foo"></a> text</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><bookmark bookmarkId="foo"></bookmark> text</paragraph>'
			);
		} );

		it( 'should properly convert an `a` with `id` attribute surrounded with text', () => {
			editor.setData( '<p>Example<a id="foo"></a>text</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>Example<bookmark bookmarkId="foo"></bookmark>text</paragraph>'
			);
		} );

		it( 'should properly convert an `a` with `id` attribute text with spaces before and after', () => {
			editor.setData( '<p>Example <a id="foo"></a> text</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>Example <bookmark bookmarkId="foo"></bookmark> text</paragraph>'
			);
		} );

		it( 'should not convert an `a` with `id` attribute and with text inside', () => {
			editor.setData( '<p><a id="foo">foobar</a></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foobar</paragraph>'
			);
		} );

		it( 'should not convert an `a` with `id` and `href` attribute and without text inside', () => {
			editor.setData( '<p><a id="foo" href="www.ckeditor.com"></a></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph></paragraph>'
			);
		} );

		it( 'should not convert `a` with `id` and `href` attribute and with text inside', () => {
			editor.setData( '<p><a id="foo" href="www.ckeditor.com">foobar</a></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text linkHref="www.ckeditor.com">foobar</$text></paragraph>'
			);
		} );

		it( 'should not convert `p` with `id` attribute', () => {
			editor.setData( '<p id="foo"></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph></paragraph>'
			);
		} );

		it( 'should not convert `p` with `id` attribute and text inside', () => {
			editor.setData( '<p id="foo">bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>bar</paragraph>'
			);
		} );

		it( 'should not convert `h2` with `id` attribute', () => {
			editor.setData( '<h2 id="foo"></h2>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<heading1></heading1>'
			);
		} );

		it( 'should not convert `h2` with `id` attribute and text inside', () => {
			editor.setData( '<h2 id="foo">bar</h2>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<heading1>bar</heading1>'
			);
		} );
	} );
} );

async function createEditor( element, config ) {
	const editor = await ClassicTestEditor.create( element, config );

	return editor;
}
