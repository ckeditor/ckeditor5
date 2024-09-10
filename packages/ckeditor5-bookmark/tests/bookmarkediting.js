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
import { ViewUIElement } from '@ckeditor/ckeditor5-engine';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

describe( 'BookmarkEditing', () => {
	let editor, element, model, view, converter;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor
			.create( element, {
				language: 'en',
				plugins: [ BookmarkEditing, Enter, Image, Heading, Paragraph, Undo, Link ]
			} );

		model = editor.model;
		view = editor.editing.view;
		converter = view.domConverter;
	} );

	afterEach( () => {
		return editor.destroy().then( () => element.remove() );
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

		it( 'should properly downcast bookmark with text after', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark>Example text</paragraph>' );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<a id="foo"></a>' +
					'Example text' +
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

		it( 'should properly downcast bookmark within a heading', () => {
			setModelData( model, '<heading1><bookmark bookmarkId="foo"></bookmark></heading1>' );

			expect( editor.getData() ).to.equal(
				'<h2>' +
					'<a id="foo"></a>' +
				'</h2>'
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

			expect( bookmarkWidget.name ).to.equal( 'a' );
			expect( bookmarkWidget.hasClass( 'ck-bookmark' ) ).to.be.true;
			expect( bookmarkWidget.childCount ).to.equal( 1 );

			const UIElement = bookmarkWidget.getChild( 0 );

			expect( UIElement ).to.be.instanceof( ViewUIElement );
			expect( UIElement.isEmpty ).to.be.true;

			expect( bookmarkWidget.getFillerOffset() ).to.equal( null );
			expect( bookmarkWidget.getFillerOffset ).is.a( 'function' );
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
} );
