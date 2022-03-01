/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import GeneralHtmlSupport from '../../src/generalhtmlsupport';
import { getModelDataWithAttributes } from '../_utils/utils';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/* global console, document */

describe( 'ScriptElementSupport', () => {
	const CODE = 'console.log( "Hello World" )';
	const CODE_CPP = 'cout << "Hello World" << endl;';

	let editor, model, editorElement, dataFilter, warnStub;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, GeneralHtmlSupport ]
		} );
		model = editor.model;
		dataFilter = editor.plugins.get( 'DataFilter' );

		dataFilter.allowElement( 'script' );

		warnStub = sinon.stub( console, 'warn' );
	} );

	afterEach( () => {
		warnStub.restore();
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should allow element', () => {
		editor.setData( `<p>Foo</p><script>${ CODE }</script>` );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			`<paragraph>Foo</paragraph><htmlScript htmlContent="${ CODE }"></htmlScript>`
		);

		expect( editor.getData() ).to.equal( `<p>Foo</p><script>${ CODE }</script>` );
	} );

	it( 'should allow attributes', () => {
		dataFilter.allowAttributes( { name: 'script', attributes: [ 'type', 'nonce' ] } );

		editor.setData( `<p>Foo</p><script type="c++" nonce="qwerty">${ CODE_CPP }</script>` );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: `<paragraph>Foo</paragraph><htmlScript htmlAttributes="(1)" htmlContent="${ CODE_CPP }"></htmlScript>`,
			attributes: {
				1: {
					attributes: {
						nonce: 'qwerty',
						type: 'c++'
					}
				},
				2: CODE_CPP
			}
		} );

		expect( editor.getData() ).to.equal( `<p>Foo</p><script type="c++" nonce="qwerty">${ CODE_CPP }</script>` );
	} );

	it( 'should disallow attributes', () => {
		dataFilter.allowAttributes( { name: 'script', attributes: true } );
		dataFilter.disallowAttributes( { name: 'script', attributes: 'nonce' } );

		editor.setData( `<p>Foo</p><script type="c++" nonce="qwerty">${ CODE_CPP }</script>` );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: `<paragraph>Foo</paragraph><htmlScript htmlAttributes="(1)" htmlContent="${ CODE_CPP }"></htmlScript>`,
			attributes: {
				1: {
					attributes: {
						type: 'c++'
					}
				},
				2: CODE_CPP
			}
		} );

		expect( editor.getData() ).to.equal( `<p>Foo</p><script type="c++">${ CODE_CPP }</script>` );
	} );

	// See: https://github.com/ckeditor/ckeditor5/issues/11247
	it( 'should allow element in the empty editor', () => {
		editor.setData( `<script>${ CODE }</script>` );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			`<htmlScript htmlContent="${ CODE }"></htmlScript>`
		);

		expect( editor.getData() ).to.equal( `<script>${ CODE }</script>` );
	} );

	describe( 'element position', () => {
		const testCases = [ {
			name: 'paragraph',
			data: `<article><section><p>Foo<script>${ CODE }</script>Bar</p></section></article>`,
			model:
				'<htmlArticle>' +
					`<htmlSection><paragraph>Foo<htmlScript htmlContent="${ CODE }"></htmlScript>Bar</paragraph></htmlSection>` +
				'</htmlArticle>'
		}, {
			name: 'section',
			data: `<article><section><p>Foo</p><script>${ CODE }</script></section></article>`,
			model:
				'<htmlArticle>' +
					`<htmlSection><paragraph>Foo</paragraph><htmlScript htmlContent="${ CODE }"></htmlScript></htmlSection>` +
				'</htmlArticle>'
		}, {
			name: 'article',
			data: `<article><section><p>Foo</p></section><script>${ CODE }</script></article>`,
			model:
				'<htmlArticle>' +
					`<htmlSection><paragraph>Foo</paragraph></htmlSection><htmlScript htmlContent="${ CODE }"></htmlScript>` +
				'</htmlArticle>'
		}, {
			name: 'root',
			data: `<article><section><p>Foo</p></section></article><script>${ CODE }</script>`,
			model:
				'<htmlArticle><htmlSection><paragraph>Foo</paragraph></htmlSection></htmlArticle>' +
				`<htmlScript htmlContent="${ CODE }"></htmlScript>`
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
		dataFilter.allowAttributes( { name: 'script', attributes: true } );

		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:htmlAttributes:htmlScript', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			}, { priority: 'high' } );
		} );

		editor.setData( `<p>Foo</p><script nonce="qwerty">${ CODE }</script>` );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: `<paragraph>Foo</paragraph><htmlScript htmlAttributes="(1)" htmlContent="${ CODE }"></htmlScript>`,
			attributes: {
				1: { attributes: { nonce: 'qwerty' } },
				2: CODE
			}
		} );

		expect( editor.getData() ).to.equal( `<p>Foo</p><script>${ CODE }</script>` );
	} );

	it( 'should not consume attributes already consumed (upcast)', () => {
		dataFilter.allowAttributes( { name: 'script', attributes: true } );

		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:script', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { attributes: 'nonce' } );
			}, { priority: 'high' } );
		} );

		editor.setData( `<p>Foo</p><script type="c++" nonce="qwerty">${ CODE_CPP }</script>` );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: `<paragraph>Foo</paragraph><htmlScript htmlAttributes="(1)" htmlContent="${ CODE_CPP }"></htmlScript>`,
			attributes: {
				1: { attributes: { type: 'c++' } },
				2: CODE_CPP
			}
		} );
	} );
} );
