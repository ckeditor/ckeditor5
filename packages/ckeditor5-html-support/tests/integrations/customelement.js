/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import GeneralHtmlSupport from '../../src/generalhtmlsupport';
import { getModelDataWithAttributes } from '../_utils/utils';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/* global document */

describe( 'CustomElementSupport', () => {
	let editor, model, editorElement, dataFilter;

	const excludeAttributes = [ 'htmlContent', 'htmlElementName' ];

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ CodeBlock, Paragraph, GeneralHtmlSupport ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				dataFilter = editor.plugins.get( 'DataFilter' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should allow unknown custom element', () => {
		dataFilter.allowElement( /.*/ );
		editor.setData( '<custom-foo-element>bar</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement' +
				' htmlContent="<custom-foo-element>bar</custom-foo-element>"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<custom-foo-element>bar</custom-foo-element>' );
	} );

	it( 'should not allow unknown custom element if allow-all is not enabled', () => {
		dataFilter.allowElement( /custom-foo-element/ );
		editor.setData( '<custom-foo-element>bar</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<paragraph>bar</paragraph>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<p>bar</p>' );
	} );

	describe( 'element position', () => {
		const testCases = [ {
			name: 'paragraph',
			data: '<article><section><p>Foo<custom-foo-element>abc</custom-foo-element>Bar</p></section></article>',
			model:
				'<htmlArticle>' +
					'<htmlSection>' +
						'<paragraph>' +
							'Foo' +
							'<htmlCustomElement' +
								' htmlContent="<custom-foo-element>abc</custom-foo-element>"' +
								' htmlElementName="custom-foo-element">' +
							'</htmlCustomElement>' +
							'Bar' +
						'</paragraph>' +
					'</htmlSection>' +
				'</htmlArticle>'
		}, {
			name: 'section',
			data: '<article><section><p>Foo</p><custom-foo-element>abc</custom-foo-element></section></article>',
			model:
				'<htmlArticle>' +
					'<htmlSection>' +
						'<paragraph>Foo</paragraph>' +
						'<htmlCustomElement' +
							' htmlContent="<custom-foo-element>abc</custom-foo-element>"' +
							' htmlElementName="custom-foo-element">' +
						'</htmlCustomElement>' +
					'</htmlSection>' +
				'</htmlArticle>'
		}, {
			name: 'article',
			data: '<article><section><p>Foo</p></section><custom-foo-element>abc</custom-foo-element></article>',
			model:
				'<htmlArticle>' +
					'<htmlSection>' +
						'<paragraph>Foo</paragraph>' +
					'</htmlSection>' +
					'<htmlCustomElement' +
						' htmlContent="<custom-foo-element>abc</custom-foo-element>"' +
						' htmlElementName="custom-foo-element">' +
					'</htmlCustomElement>' +
				'</htmlArticle>'
		}, {
			name: 'root',
			data: '<article><section><p>Foo</p></section></article><custom-foo-element>abc</custom-foo-element>',
			model:
				'<htmlArticle>' +
					'<htmlSection>' +
						'<paragraph>Foo</paragraph>' +
					'</htmlSection>' +
				'</htmlArticle>' +
				'<htmlCustomElement' +
					' htmlContent="<custom-foo-element>abc</custom-foo-element>"' +
					' htmlElementName="custom-foo-element">' +
				'</htmlCustomElement>'
		} ];

		for ( const { name, data, model: modelData } of testCases ) {
			it( `should allow element inside ${ name }`, () => {
				dataFilter.allowElement( /.*/ );

				editor.setData( data );

				expect( getModelData( model, { withoutSelection: true, excludeAttributes } ) ).to.equal( modelData );

				expect( editor.getData() ).to.equal( data );
			} );
		}
	} );

	it( 'should not inject nbsp in the element content', () => {
		dataFilter.allowElement( /.*/ );
		editor.setData( '<custom><custom2> c </custom2></custom>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement htmlContent="<custom><custom2>c</custom2></custom>" htmlElementName="custom"></htmlCustomElement>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<custom><custom2>c</custom2></custom>' );
	} );

	it( 'should allow attributes', () => {
		dataFilter.allowElement( /.*/ );
		dataFilter.allowAttributes( { attributes: { 'data-foo': /.*/ } } );

		editor.setData( '<custom-foo-element data-foo="foo">bar</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement' +
				' htmlAttributes="(1)"' +
				' htmlContent="<custom-foo-element data-foo="foo">bar</custom-foo-element>"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'foo'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<custom-foo-element data-foo="foo">bar</custom-foo-element>' );
	} );

	it( 'should allow attributes (classes)', () => {
		dataFilter.allowElement( /.*/ );
		dataFilter.allowAttributes( { classes: 'foo' } );

		editor.setData( '<custom-foo-element class="foo">bar</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement' +
				' htmlAttributes="(1)"' +
				' htmlContent="<custom-foo-element class="foo">bar</custom-foo-element>"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>',
			attributes: {
				1: {
					classes: [ 'foo' ]
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<custom-foo-element class="foo">bar</custom-foo-element>' );
	} );

	it( 'should allow attributes (styles)', () => {
		dataFilter.allowElement( /.*/ );
		dataFilter.allowAttributes( { styles: { background: true } } );

		editor.setData( '<custom-foo-element style="background: red">bar</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement' +
				' htmlAttributes="(1)"' +
				' htmlContent="<custom-foo-element style="background:red;">bar</custom-foo-element>"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>',
			attributes: {
				1: {
					'styles': {
						'background': 'red'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<custom-foo-element style="background:red;">bar</custom-foo-element>' );
	} );

	it( 'should disallow attributes', () => {
		dataFilter.allowElement( /.*/ );
		dataFilter.allowAttributes( { attributes: { 'data-foo': /.*/ } } );
		dataFilter.disallowAttributes( { attributes: { 'data-foo': /.*/ } } );

		editor.setData( '<custom-foo-element data-foo="foo">bar</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement' +
				' htmlContent="<custom-foo-element data-foo="foo">bar</custom-foo-element>"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<custom-foo-element>bar</custom-foo-element>' );
	} );

	it( 'should disallow attributes (classes)', () => {
		dataFilter.allowElement( /.*/ );
		dataFilter.allowAttributes( { classes: 'foo' } );
		dataFilter.disallowAttributes( { classes: 'foo' } );

		editor.setData( '<custom-foo-element class="foo">bar</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement' +
				' htmlContent="<custom-foo-element class="foo">bar</custom-foo-element>"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<custom-foo-element>bar</custom-foo-element>' );
	} );

	it( 'should disallow attributes (styles)', () => {
		dataFilter.allowElement( /.*/ );
		dataFilter.allowAttributes( { styles: { background: true } } );
		dataFilter.disallowAttributes( { styles: { background: true } } );

		editor.setData( '<custom-foo-element style="background: red">bar</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement' +
				' htmlContent="<custom-foo-element style="background:red;">bar</custom-foo-element>"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<custom-foo-element>bar</custom-foo-element>' );
	} );

	// it( 'should not consume attributes already consumed (downcast)', () => {
	// 	dataFilter.allowAttributes( { name: 'script', attributes: true } );
	//
	// 	editor.conversion.for( 'downcast' ).add( dispatcher => {
	// 		dispatcher.on( 'attribute:htmlAttributes:htmlScript', ( evt, data, conversionApi ) => {
	// 			conversionApi.consumable.consume( data.item, evt.name );
	// 		}, { priority: 'high' } );
	// 	} );
	//
	// 	editor.setData( `<p>Foo</p><script nonce="qwerty">${ CODE }</script>` );
	//
	// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 		data: `<paragraph>Foo</paragraph><htmlScript htmlAttributes="(1)" htmlContent="${ CODE }"></htmlScript>`,
	// 		attributes: {
	// 			1: { attributes: { nonce: 'qwerty' } },
	// 			2: CODE
	// 		}
	// 	} );
	//
	// 	expect( editor.getData() ).to.equal( `<p>Foo</p><script>${ CODE }</script>` );
	// } );
	//
	// it( 'should not consume attributes already consumed (upcast)', () => {
	// 	dataFilter.allowAttributes( { name: 'script', attributes: true } );
	//
	// 	editor.conversion.for( 'upcast' ).add( dispatcher => {
	// 		dispatcher.on( 'element:script', ( evt, data, conversionApi ) => {
	// 			conversionApi.consumable.consume( data.viewItem, { attributes: 'nonce' } );
	// 		}, { priority: 'high' } );
	// 	} );
	//
	// 	editor.setData( `<p>Foo</p><script type="c++" nonce="qwerty">${ CODE_CPP }</script>` );
	//
	// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 		data: `<paragraph>Foo</paragraph><htmlScript htmlAttributes="(1)" htmlContent="${ CODE_CPP }"></htmlScript>`,
	// 		attributes: {
	// 			1: { attributes: { type: 'c++' } },
	// 			2: CODE_CPP
	// 		}
	// 	} );
	// } );
} );
