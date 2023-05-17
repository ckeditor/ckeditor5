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
	let element, editor, anchorEditingPlugin;

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

		anchorEditingPlugin = editor.plugins.get( 'AnchorEditing' );
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
		expect( editor.model.schema.checkAttribute( [ '$block', '$text' ], 'anchorName' ) ).to.be.true;
	} );

	describe( 'getAnchors()', () => {
		it( 'returns proper value if there\'s no content', () => {
			const ret = anchorEditingPlugin.getAnchors();
			expect( ret ).to.be.an( 'array' );
			expect( ret.length ).to.equal( 0 );
		} );

		it( 'returns proper value for editor with one anchor', () => {
			setModelData( editor.model, '<paragraph>a <$text anchorName="foo-bar">b</$text> c</paragraph>' );
			const ret = anchorEditingPlugin.getAnchors();

			expect( ret ).to.be.an( 'array' );
			expect( ret.length ).to.equal( 1 );

			const firstAnchor = ret[ 0 ];

			expect( firstAnchor ).to.be.an( 'object' );
			expect( firstAnchor.key ).to.equal( 'foo-bar' );
			expect( firstAnchor.element.is( 'model:$textProxy' ) ).to.be.true;
		} );

		it( 'returns proper value for editor with multiple anchor', () => {
			setModelData( editor.model, '<paragraph>' +
				'a ' +
				'<$text anchorName="anchor1">b</$text> ' +
				'</paragraph><paragraph>' +
				'<$text anchorName="anchor2">c</$text> ' +
				'<$text anchorName="anchor3">d</$text> ' +
				' e' +
				'</paragraph>' );

			const ret = anchorEditingPlugin.getAnchors();

			expect( ret ).to.be.an( 'array' );
			expect( ret.length ).to.equal( 3 );

			for ( let i = 0; i < ret.length; i++ ) {
				expect( ret[ i ], `item ${ i }` ).to.be.an( 'object' );
				expect( ret[ i ].element.is( 'model:$textProxy' ), `item ${ i }` ).to.be.true;
			}

			const anchorKeys = ret.map( anchor => anchor.key );

			expect( anchorKeys ).to.eql( [ 'anchor1', 'anchor2', 'anchor3' ] );
		} );
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
