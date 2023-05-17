/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import AnchorEditing from '../src/anchorediting';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageInline from '@ckeditor/ckeditor5-image/src/imageinline';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

/* global document */

describe( 'AnchorEditing', () => {
	let element, editor, model;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, AnchorEditing, Enter, Clipboard, ImageInline ]
		} );

		editor.model.schema.extend( '$text', { allowAttributes: 'bold' } );

		editor.conversion.attributeToElement( {
			model: 'bold',
			view: 'b'
		} );
	} );

	afterEach( async () => {
		element.remove();
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( AnchorEditing.pluginName ).to.equal( 'AnchorEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( AnchorEditing ) ).to.be.instanceOf( AnchorEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$block', '$text' ], 'anchorName' ) ).to.be.true;
	} );

	describe( 'conversion', () => {
		describe( 'data pipeline', () => {
			describe( 'downcast', () => {
				it( 'works', () => {
					setModelData( editor.model, '<paragraph><$text anchorName="foo-bar">foo</$text>bar</paragraph>' );
					expect( editor.getData() ).to.equal( '<p><a name="foo-bar">foo</a>bar</p>' );
				} );
			} );

			describe( 'upcast', () => {
				it( 'works', () => {
					editor.setData( '<p><a name="foo-bar">foo</a>bar</p>' );

					const modelData = getModelData( editor.model, { withoutSelection: true } );

					expect( modelData ).to.equal( '<paragraph><$text anchorName="foo-bar">foo</$text>bar</paragraph>' );
				} );
			} );
		} );

		describe( 'editing pipeline', () => {
			describe( 'downcast', () => {
				it( 'works', () => {
					setModelData( editor.model, '<paragraph>foo <$text anchorName="anchor-name">bar</$text></paragraph>' );

					const viewMarkup = getViewData( editor.editing.view, { withoutSelection: true } );
					expect( viewMarkup ).to.equal( '<p>foo <a name="anchor-name">bar</a></p>' );
				} );
			} );

			describe( 'upcast', () => {
				// todo
			} );
		} );
	} );
} );
