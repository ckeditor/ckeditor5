/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';
import { getModelDataWithAttributes } from '../_utils/utils.js';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import StyleElementSupport from '../../src/integrations/style.js';

describe( 'StyleElementSupport', () => {
	const STYLE = 'div { color: red; }';

	let editor, model, editorElement, dataFilter, warnStub;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, GeneralHtmlSupport ]
		} );
		model = editor.model;
		dataFilter = editor.plugins.get( 'DataFilter' );

		dataFilter.allowElement( 'style' );

		warnStub = sinon.stub( console, 'warn' );
	} );

	afterEach( () => {
		warnStub.restore();
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( editor.plugins.has( 'StyleElementSupport' ) ).to.be.true;
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( StyleElementSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( StyleElementSupport.isPremiumPlugin ).to.be.false;
	} );

	it( 'should allow element', () => {
		editor.setData( `<p>Foo</p><style>${ STYLE }</style>` );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			`<paragraph>Foo</paragraph><htmlStyle htmlContent="${ STYLE }"></htmlStyle>`
		);

		expect( editor.getData() ).to.equal( `<p>Foo</p><style>${ STYLE }</style>` );
	} );

	it( 'should allow attributes', () => {
		dataFilter.allowAttributes( { name: 'style', attributes: [ 'type', 'nonce' ] } );

		editor.setData( `<p>Foo</p><style type="c++" nonce="qwerty">${ STYLE }</style>` );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: `<paragraph>Foo</paragraph><htmlStyle htmlContent="${ STYLE }" htmlStyleAttributes="(1)"></htmlStyle>`,
			attributes: {
				1: STYLE,
				2: {
					attributes: {
						nonce: 'qwerty',
						type: 'c++'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( `<p>Foo</p><style type="c++" nonce="qwerty">${ STYLE }</style>` );
	} );

	it( 'should disallow attributes', () => {
		dataFilter.allowAttributes( { name: 'style', attributes: true } );
		dataFilter.disallowAttributes( { name: 'style', attributes: 'nonce' } );

		editor.setData( `<p>Foo</p><style type="c++" nonce="qwerty">${ STYLE }</style>` );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: `<paragraph>Foo</paragraph><htmlStyle htmlContent="${ STYLE }" htmlStyleAttributes="(1)"></htmlStyle>`,
			attributes: {
				1: STYLE,
				2: {
					attributes: {
						type: 'c++'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( `<p>Foo</p><style type="c++">${ STYLE }</style>` );
	} );

	// See: https://github.com/ckeditor/ckeditor5/issues/11247
	it( 'should allow element in the empty editor', () => {
		editor.setData( `<style>${ STYLE }</style>` );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			`<htmlStyle htmlContent="${ STYLE }"></htmlStyle>`
		);

		expect( editor.getData() ).to.equal( `<style>${ STYLE }</style>` );
	} );

	describe( 'element position', () => {
		const testCases = [ {
			name: 'paragraph',
			data: `<article><section><p>Foo<style>${ STYLE }</style>Bar</p></section></article>`,
			model:
				'<htmlArticle>' +
					`<htmlSection><paragraph>Foo<htmlStyle htmlContent="${ STYLE }"></htmlStyle>Bar</paragraph></htmlSection>` +
				'</htmlArticle>'
		}, {
			name: 'section',
			data: `<article><section><p>Foo</p><style>${ STYLE }</style></section></article>`,
			model:
				'<htmlArticle>' +
					`<htmlSection><paragraph>Foo</paragraph><htmlStyle htmlContent="${ STYLE }"></htmlStyle></htmlSection>` +
				'</htmlArticle>'
		}, {
			name: 'article',
			data: `<article><section><p>Foo</p></section><style>${ STYLE }</style></article>`,
			model:
				'<htmlArticle>' +
					`<htmlSection><paragraph>Foo</paragraph></htmlSection><htmlStyle htmlContent="${ STYLE }"></htmlStyle>` +
				'</htmlArticle>'
		}, {
			name: 'root',
			data: `<article><section><p>Foo</p></section></article><style>${ STYLE }</style>`,
			model:
				'<htmlArticle><htmlSection><paragraph>Foo</paragraph></htmlSection></htmlArticle>' +
				`<htmlStyle htmlContent="${ STYLE }"></htmlStyle>`
		} ];

		for ( const { name, data, model: modelData } of testCases ) {
			it( `should allow element inside ${ name }`, () => {
				dataFilter.allowElement( 'article' );
				dataFilter.allowElement( 'section' );

				editor.setData( data );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( modelData );

				expect( editor.getData() ).to.equal( data );
			} );
		}
	} );

	it( 'should not consume attributes already consumed (downcast)', () => {
		dataFilter.allowAttributes( { name: 'style', attributes: true } );

		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:htmlStyleAttributes:htmlStyle', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			}, { priority: 'high' } );
		} );

		editor.setData( `<p>Foo</p><style nonce="qwerty">${ STYLE }</style>` );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: `<paragraph>Foo</paragraph><htmlStyle htmlContent="${ STYLE }" htmlStyleAttributes="(1)"></htmlStyle>`,
			attributes: {
				1: STYLE,
				2: { attributes: { nonce: 'qwerty' } }
			}
		} );

		expect( editor.getData() ).to.equal( `<p>Foo</p><style>${ STYLE }</style>` );
	} );

	it( 'should not consume attributes already consumed (upcast)', () => {
		dataFilter.allowAttributes( { name: 'style', attributes: true } );

		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:style', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { attributes: 'nonce' } );
			}, { priority: 'high' } );
		} );

		editor.setData( `<p>Foo</p><style type="text/css" nonce="qwerty">${ STYLE }</style>` );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: `<paragraph>Foo</paragraph><htmlStyle htmlContent="${ STYLE }" htmlStyleAttributes="(1)"></htmlStyle>`,
			attributes: {
				1: STYLE,
				2: { attributes: { type: 'text/css' } }
			}
		} );
	} );
} );
