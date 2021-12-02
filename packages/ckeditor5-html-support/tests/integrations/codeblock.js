/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import GeneralHtmlSupport from '../../src/generalhtmlsupport';
import { getModelDataWithAttributes } from '../_utils/utils';

/* global document */

describe( 'CodeBlockElementSupport', () => {
	let editor, model, editorElement, dataFilter;

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

	it( 'should allow attributes', () => {
		dataFilter.allowElement( /^(pre|code)$/ );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, attributes: { 'data-foo': /[\s\S]+/ } } );

		editor.setData( '<pre data-foo="foo"><code data-foo="foo">foobar</code></pre>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<codeBlock htmlAttributes="(1)" htmlContentAttributes="(2)" language="plaintext">foobar</codeBlock>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'foo'
					}
				},
				2: {
					attributes: {
						'data-foo': 'foo'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<pre data-foo="foo">' +
			'<code class="language-plaintext" data-foo="foo">foobar</code>' +
			'</pre>' );
	} );

	it( 'should allow attributes (classes)', () => {
		dataFilter.allowElement( /^(pre|code)$/ );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, classes: [ 'foo' ] } );

		editor.setData( '<pre class="foo"><code class="foo">foobar</code></pre>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<codeBlock htmlAttributes="(1)" htmlContentAttributes="(2)" language="plaintext">foobar</codeBlock>',
			attributes: {
				1: {
					classes: [ 'foo' ]
				},
				2: {
					classes: [ 'foo' ]
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<pre class="foo">' +
			'<code class="language-plaintext foo">foobar</code>' +
			'</pre>' );
	} );

	it( 'should allow attributes (styles)', () => {
		dataFilter.allowElement( /^(pre|code)$/ );
		dataFilter.allowAttributes( { name: 'pre', styles: { background: 'blue' } } );
		dataFilter.allowAttributes( { name: 'code', styles: { color: 'red' } } );

		editor.setData( '<pre style="background:blue;"><code style="color:red;">foobar</code></pre>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<codeBlock htmlAttributes="(1)" htmlContentAttributes="(2)" language="plaintext">foobar</codeBlock>',
			attributes: {
				1: {
					styles: {
						background: 'blue'
					}
				},
				2: {
					styles: {
						color: 'red'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<pre style="background:blue;">' +
			'<code class="language-plaintext" style="color:red;">foobar</code>' +
			'</pre>' );
	} );

	it( 'should disallow attributes', () => {
		dataFilter.allowElement( /^(pre|code)$/ );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, attributes: { 'data-foo': /[\s\S]+/ } } );
		dataFilter.disallowAttributes( { name: /^(pre|code)$/, attributes: { 'data-foo': /[\s\S]+/ } } );

		editor.setData( '<pre data-foo="foo"><code data-foo="foo">foobar</code></pre>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<codeBlock language="plaintext">foobar</codeBlock>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<pre><code class="language-plaintext">foobar</code></pre>' );
	} );

	it( 'should disallow attributes (classes)', () => {
		dataFilter.allowElement( /^(pre|code)$/ );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, classes: [ 'foo' ] } );
		dataFilter.disallowAttributes( { name: /^(pre|code)$/, classes: [ 'foo' ] } );

		editor.setData( '<pre data-foo="foo"><code data-foo="foo">foobar</code></pre>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<codeBlock language="plaintext">foobar</codeBlock>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<pre><code class="language-plaintext">foobar</code></pre>' );
	} );

	it( 'should disallow attributes (styles)', () => {
		dataFilter.allowElement( /^(pre|code)$/ );

		dataFilter.allowAttributes( { name: 'pre', styles: { background: 'blue' } } );
		dataFilter.allowAttributes( { name: 'code', styles: { color: 'red' } } );

		dataFilter.disallowAttributes( { name: 'pre', styles: { background: 'blue' } } );
		dataFilter.disallowAttributes( { name: 'code', styles: { color: 'red' } } );

		editor.setData( '<pre style="background:blue;"><code style="color:red;">foobar</code></pre>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<codeBlock language="plaintext">foobar</codeBlock>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<pre><code class="language-plaintext">foobar</code></pre>' );
	} );

	it( 'should allow attributes on code element existing alone', () => {
		dataFilter.allowElement( /^(pre|code)$/ );
		dataFilter.allowAttributes( { name: 'code', attributes: { 'data-foo': /[\s\S]+/ } } );

		editor.setData( '<p><code data-foo="foo">foobar</code></p>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<paragraph><$text htmlCode="(1)">foobar</$text></paragraph>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'foo'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<p><code data-foo="foo">foobar</code></p>' );
	} );

	it( 'should not consume attributes already consumed (downcast)', () => {
		[ 'htmlAttributes', 'htmlContentAttributes' ].forEach( attributeName => {
			editor.conversion.for( 'downcast' ).add( dispatcher => {
				dispatcher.on( `attribute:${ attributeName }:codeBlock`, ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, evt.name );
				}, { priority: 'high' } );
			} );
		} );

		dataFilter.allowElement( /^(pre|code)$/ );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, attributes: { 'data-foo': true } } );

		editor.setData( '<pre data-foo><code data-foo>foobar</code></section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<codeBlock htmlAttributes="(1)" htmlContentAttributes="(2)" language="plaintext">foobar</codeBlock>',
			// At this point, attribute should still be in the model, as we are testing downcast conversion.
			attributes: {
				1: {
					attributes: {
						'data-foo': ''
					}
				},
				2: {
					attributes: {
						'data-foo': ''
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<pre><code class="language-plaintext">foobar</code></pre>' );
	} );
} );
