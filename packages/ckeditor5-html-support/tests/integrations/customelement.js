/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import { Link } from '@ckeditor/ckeditor5-link';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { INLINE_FILLER } from '@ckeditor/ckeditor5-engine/src/view/filler.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';
import { getModelDataWithAttributes } from '../_utils/utils.js';
import CustomElementSupport from '../../src/integrations/customelement.js';

describe( 'CustomElementSupport', () => {
	let editor, model, editorElement, dataFilter;

	const excludeAttributes = [ 'htmlContent', 'htmlElementName' ];

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ CodeBlock, Paragraph, Link, GeneralHtmlSupport ]
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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CustomElementSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CustomElementSupport.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be named', () => {
		expect( editor.plugins.has( 'CustomElementSupport' ) ).to.be.true;
	} );

	it( 'should allow unknown custom element', () => {
		dataFilter.allowElement( /.*/ );
		editor.setData( '<custom-foo-element>bar</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement' +
				' htmlContent="bar"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<custom-foo-element>bar</custom-foo-element>' );
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/14933.
	it( 'should allow <template> element', () => {
		dataFilter.allowElement( /.*/ );
		editor.setData( '<template>bar</template>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement' +
				' htmlContent="bar"' +
				' htmlElementName="template"></htmlCustomElement>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<template>bar</template>' );
	} );

	it( 'should not allow unknown custom element if allow-all is not enabled', () => {
		// Note that this one does not match any element in the DataSchema. As a result, no upcast conversion will occur.
		dataFilter.allowElement( /custom-foo-element/ );
		editor.setData( '<custom-foo-element>bar</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<paragraph>bar</paragraph>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<p>bar</p>' );
	} );

	it( 'should convert only unknown elements (not defined in DataSchema)', () => {
		dataFilter.allowElement( '$customElement' );

		editor.setData( '<article>abc</article>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<paragraph>abc</paragraph>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<p>abc</p>' );
	} );

	it( 'should render in the editing view as an unsafe element', () => {
		dataFilter.allowElement( /.*/ );
		editor.setData( '<custom-foo-element>bar</custom-foo-element><custom-foo-element>baz</custom-foo-element>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement' +
				' htmlContent="bar"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>' +
				'<htmlCustomElement' +
				' htmlContent="baz"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<custom-foo-element>bar</custom-foo-element>' +
			'<custom-foo-element>baz</custom-foo-element>'
		);
		expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
			'<custom-foo-element></custom-foo-element>' +
			'<custom-foo-element></custom-foo-element>'
		);
		expect( editor.editing.view.domConverter.unsafeElements ).include( 'custom-foo-element' );
		expect( editor.editing.view.domConverter.unsafeElements )
			.deep.equal( Array.from( new Set( editor.editing.view.domConverter.unsafeElements ).values() ) );

		expect( editor.editing.view.getDomRoot().innerHTML ).equal(
			INLINE_FILLER +
			'<span data-ck-unsafe-element="custom-foo-element"></span>' +
			'<span data-ck-unsafe-element="custom-foo-element"></span>'
		);
	} );

	it( 'should render in the editing view as a pre block (whitespace handling)', () => {
		dataFilter.allowElement( /.*/ );
		editor.setData(
			'<custom-foo-element><nested> a </nested></custom-foo-element>' +
			'<custom-foo-element><nested> b </nested></custom-foo-element>'
		);

		// Note: Some white spaces were trimmed in the data processor but this is still better than injecting NBSPs instead of white spaces.
		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data:
				'<htmlCustomElement' +
				' htmlContent="<nested>a </nested>"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>' +
				'<htmlCustomElement' +
				' htmlContent="<nested>b</nested>"' +
				' htmlElementName="custom-foo-element"></htmlCustomElement>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<custom-foo-element><nested>a </nested></custom-foo-element>' +
			'<custom-foo-element><nested>b</nested></custom-foo-element>'
		);
		expect( editor.data.htmlProcessor.domConverter.preElements ).include( 'custom-foo-element' );
		expect( editor.data.htmlProcessor.domConverter.preElements )
			.deep.equal( Array.from( new Set( editor.data.htmlProcessor.domConverter.preElements ).values() ) );
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
								' htmlContent="abc"' +
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
							' htmlContent="abc"' +
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
						' htmlContent="abc"' +
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
					' htmlContent="abc"' +
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

	describe( 'content', () => {
		it( 'should preserve custom element content', () => {
			dataFilter.allowElement( /.*/ );
			editor.setData( 'foo <custom>  this is <p>some content</p> and more of it  </custom> bar' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
				data:
					'<paragraph>foo ' +
					'<htmlCustomElement' +
					' htmlContent="this is <p>some content</p>and more of it "' +
					' htmlElementName="custom"></htmlCustomElement>' +
					'bar</paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal( '<p>foo <custom>this is <p>some content</p>and more of it </custom>bar</p>' );
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/14933.
		it( 'should preserve <`template> element content', () => {
			dataFilter.allowElement( /.*/ );
			editor.setData( 'foo <template>this is <p>some content</p> and more of it</template> bar' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
				data:
					'<paragraph>foo ' +
					'<htmlCustomElement' +
					' htmlContent="this is <p>some content</p> and more of it"' +
					' htmlElementName="template"></htmlCustomElement> ' +
					'bar</paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal( '<p>foo&nbsp;<template>this is <p>some content</p> and more of it</template> bar</p>' );
		} );

		it( 'should not inject nbsp in the element content', () => {
			dataFilter.allowElement( /.*/ );
			editor.setData( '<custom><custom2> c </custom2></custom>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
				data: '<htmlCustomElement' +
					' htmlContent="<custom2>c</custom2>"' +
					' htmlElementName="custom"></htmlCustomElement>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal( '<custom><custom2>c</custom2></custom>' );
		} );
	} );

	describe( 'attributes', () => {
		it( 'should allow attributes', () => {
			dataFilter.allowElement( /.*/ );
			dataFilter.allowAttributes( { attributes: { 'data-foo': /.*/ } } );

			editor.setData( '<custom-foo-element data-foo="foo">bar</custom-foo-element>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
				data: '<htmlCustomElement' +
					' htmlContent="bar"' +
					' htmlCustomElementAttributes="(1)"' +
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

		it( 'should allow attributes without `data-` prefix', () => {
			dataFilter.allowElement( /.*/ );
			dataFilter.allowAttributes( { attributes: { 'foo': /.*/ } } );

			editor.setData( '<custom-foo-element foo="bar">baz</custom-foo-element>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
				data: '<htmlCustomElement' +
					' htmlContent="baz"' +
					' htmlCustomElementAttributes="(1)"' +
					' htmlElementName="custom-foo-element"></htmlCustomElement>',
				attributes: {
					1: {
						attributes: {
							'foo': 'bar'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<custom-foo-element foo="bar">baz</custom-foo-element>' );
		} );

		it( 'should ignore attributes with invalid name', () => {
			const consoleWarnStub = sinon.stub( console, 'warn' );

			dataFilter.allowElement( /.*/ );
			dataFilter.allowAttributes( { attributes: /.*/ } );

			editor.setData( '<custom-foo-element 200-abc="invalid" data-foo="bar">baz</custom-foo-element>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
				data: '<htmlCustomElement' +
					' htmlContent="baz"' +
					' htmlCustomElementAttributes="(1)"' +
					' htmlElementName="custom-foo-element"></htmlCustomElement>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'bar'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<custom-foo-element data-foo="bar">baz</custom-foo-element>' );

			expect( consoleWarnStub.calledOnce ).to.equal( true );
			expect( consoleWarnStub.firstCall.args[ 0 ] ).to.match( /domconverter-invalid-attribute-detected/ );
		} );

		it( 'should allow attributes (classes)', () => {
			dataFilter.allowElement( /.*/ );
			dataFilter.allowAttributes( { classes: 'foo' } );

			editor.setData( '<custom-foo-element class="foo">bar</custom-foo-element>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
				data: '<htmlCustomElement' +
					' htmlContent="bar"' +
					' htmlCustomElementAttributes="(1)"' +
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
					' htmlContent="bar"' +
					' htmlCustomElementAttributes="(1)"' +
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

		it( 'should allow linking custom element', () => {
			dataFilter.allowElement( /.*/ );

			editor.setData( '<a href="bar"><custom-foo-element>bar</custom-foo-element></a>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
				data: '<htmlCustomElement' +
					' htmlContent="bar"' +
					' htmlElementName="custom-foo-element"' +
					' linkHref="bar"' +
					'></htmlCustomElement>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal( '<a href="bar"><custom-foo-element>bar</custom-foo-element></a>' );
		} );

		it( 'should disallow attributes', () => {
			dataFilter.allowElement( /.*/ );
			dataFilter.allowAttributes( { attributes: { 'data-foo': /.*/ } } );
			dataFilter.disallowAttributes( { attributes: { 'data-foo': /.*/ } } );

			editor.setData( '<custom-foo-element data-foo="foo">bar</custom-foo-element>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
				data: '<htmlCustomElement' +
					' htmlContent="bar"' +
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
					' htmlContent="bar"' +
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
					' htmlContent="bar"' +
					' htmlElementName="custom-foo-element"></htmlCustomElement>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal( '<custom-foo-element>bar</custom-foo-element>' );
		} );
	} );

	it( 'should not convert html comments as a custom element', () => {
		dataFilter.allowElement( /.*/ );

		editor.data.processor.skipComments = false;
		editor.setData( '<!-- foo --><custom>bar</custom>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true, excludeAttributes } ) ).to.deep.equal( {
			data: '<htmlCustomElement htmlContent="bar" htmlElementName="custom"></htmlCustomElement>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<custom>bar</custom>' );
	} );

	const INVALID_ELEMENTS_TEST_DATA = [
		[ '<p', '' ],
		[ '<p ', '' ],
		[ '<xyz?abc>foo</xyz?abc>', 'foo' ],
		[ '<a!>bar</a!>', 'bar' ]
	];

	for ( const [ data, text ] of INVALID_ELEMENTS_TEST_DATA ) {
		it( `should not convert elements with invalid names (${ data })`, () => {
			dataFilter.allowElement( /.*/ );

			editor.setData( data );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( `<paragraph>${ text }</paragraph>` );

			expect( editor.getData() ).to.equal( text == '' ? '' : `<p>${ text }</p>` );
		} );
	}

	const VALID_ELEMENTS_TEST_DATA = [
		[
			'<xmlfoo>bar</xmlfoo>',
			'<htmlCustomElement htmlContent="bar" htmlElementName="xmlfoo"></htmlCustomElement>'
		],
		[
			'<foo:bar>baz</foo:bar>',
			'<htmlCustomElement htmlContent="baz" htmlElementName="foo:bar"></htmlCustomElement>'
		],
		[
			'<foo-bar>baz</foo-bar>',
			'<htmlCustomElement htmlContent="baz" htmlElementName="foo-bar"></htmlCustomElement>'
		],
		[
			'<foo-bar><h2>abc</h2></foo-bar>',
			'<htmlCustomElement htmlContent="<h2>abc</h2>" htmlElementName="foo-bar"></htmlCustomElement>'
		],
		[
			'<foo-bar>123<h2>abc</h2></foo-bar>',
			'<htmlCustomElement htmlContent="123<h2>abc</h2>" htmlElementName="foo-bar"></htmlCustomElement>'
		],
		[
			'<foo-bar><h2>abc</h2>456</foo-bar>',
			'<htmlCustomElement htmlContent="<h2>abc</h2>456" htmlElementName="foo-bar"></htmlCustomElement>'
		],
		[
			'<foo-bar>123<h2>abc</h2>456</foo-bar>',
			'<htmlCustomElement htmlContent="123<h2>abc</h2>456" htmlElementName="foo-bar"></htmlCustomElement>'
		]
	];

	for ( const [ data, modelData ] of VALID_ELEMENTS_TEST_DATA ) {
		it( `should convert element (${ data })`, () => {
			dataFilter.allowElement( /.*/ );

			editor.setData( data );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( modelData );

			expect( editor.getData() ).to.equal( data );
		} );
	}
} );
