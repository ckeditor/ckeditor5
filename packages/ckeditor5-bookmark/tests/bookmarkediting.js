/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import BookmarkEditing from '../src/bookmarkediting.js';

import { Enter } from '@ckeditor/ckeditor5-enter';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Link } from '@ckeditor/ckeditor5-link';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

describe( 'BookmarkEditing', () => {
	let editor, element, model, view;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor
			.create( element, {
				language: 'en',
				plugins: [ BookmarkEditing, Enter, Paragraph, Undo, Link ]
			} );

		model = editor.model;
		view = editor.editing.view;
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
	} );

	describe( 'editingDowncast', () => {
		it( 'should properly downcast bookmark', () => {
			setModelData( model, '<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<a class="ck-bookmark ck-widget" contenteditable="false" id="foo">' +
						'<span></span>' +
					'</a>' +
				'</p>'
			);
		} );
	} );
} );
