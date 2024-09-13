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
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { isWidget, getLabel } from '@ckeditor/ckeditor5-widget/src/utils.js';

describe( 'BookmarkEditing', () => {
	// eslint-disable-next-line max-len
	const domUIElement = '<span class="ck-bookmark__icon"><svg class="ck ck-icon ck-reset_all-excluded" viewBox="0 0 20 20" fill="none">\n<path d="M4.5 16.9343V3C4.5 2.44772 4.94771 2 5.5 2H14.5C15.0523 2 15.5 2.44772 15.5 3V16.9343C15.5 17.3579 15.0062 17.5896 14.6804 17.3188L10.3196 13.6942C10.1344 13.5402 9.86565 13.5402 9.6804 13.6942L5.3196 17.3188C4.99382 17.5896 4.5 17.3579 4.5 16.9343Z" stroke="#333333" stroke-width="1.5"></path>\n</svg></span>';

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
			// The setModelData() is stripping a whitespace before the bookmark element.
			// Problem is solved when selection markers are placed after the whitespace.
			setModelData( model, '<paragraph>text []<bookmark bookmarkId="foo"></bookmark></paragraph>' );

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
			// The setModelData() is stripping a whitespace after the bookmark element.
			// Problem is solved when selection markers are placed before the whitespace.
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark>[] text</paragraph>' );

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
			// The setModelData() is stripping a whitespace before/after the bookmark element.
			// Problem is solved when selection markers are placed before/after the whitespace.
			setModelData( model, '<paragraph>text []<bookmark bookmarkId="foo"></bookmark>[] text</paragraph>' );

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
			// The setModelData() is stripping a whitespace before the bookmark element.
			// Problem is solved when selection markers are placed after the whitespace.
			setModelData( model, '<paragraph>text []<bookmark bookmarkId="foo"></bookmark></paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'text' +
					' ' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span class="ck-bookmark__icon"></span>' +
					'</a>' +
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
			// The setModelData() is stripping a whitespace after the bookmark element.
			// Problem is solved when selection markers are placed before the whitespace.
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark>[] text</paragraph>' );

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
			// The setModelData() is stripping a whitespace before/after the bookmark element.
			// Problem is solved when selection markers are placed before/after the whitespace.
			setModelData( model, '<paragraph>Example []<bookmark bookmarkId="foo"></bookmark>[] text</paragraph>' );

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
					domUIElement +
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

		describe( 'with GHS enabled', () => {
			let element, editor, model;
			beforeEach( async () => {
				element = document.createElement( 'div' );
				document.body.appendChild( element );

				const config = {
					language: 'en',
					plugins: [ BookmarkEditing, Enter, Image, Heading, Paragraph, Undo, Link, GeneralHtmlSupport ],
					htmlSupport: {
						allow: [
							{
								name: /^.*$/,
								styles: true,
								attributes: true,
								classes: true
							}
						]
					}
				};

				editor = await createEditor( element, config );

				model = editor.model;
			} );

			afterEach( async () => {
				element.remove();
				await editor.destroy();
			} );

			it( 'should properly convert an `a` with `id` attribute', () => {
				editor.setData( '<p><a id="foo"></a></p>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>'
				);
			} );

			it( 'should not convert an `a` with `id` attribute and with text inside', () => {
				editor.setData( '<p><a id="foo">foobar</a></p>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><$text htmlA="{"attributes":{"id":"foo"}}">foobar</$text></paragraph>'
				);
			} );
		} );
	} );
} );

async function createEditor( element, config ) {
	const editor = await ClassicTestEditor.create( element, config );

	return editor;
}
