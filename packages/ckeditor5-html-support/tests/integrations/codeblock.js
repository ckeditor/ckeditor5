/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';
import { getModelDataWithAttributes } from '../_utils/utils.js';
import CodeBlockElementSupport from '../../src/integrations/codeblock.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CodeBlockElementSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CodeBlockElementSupport.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be named', () => {
		expect( editor.plugins.has( 'CodeBlockElementSupport' ) ).to.be.true;
	} );

	it( 'should allow attributes', () => {
		dataFilter.allowElement( /^(pre|code)$/ );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, attributes: { 'data-foo': /[\s\S]+/ } } );

		editor.setData( '<pre data-foo="foo"><code data-foo="foo">foobar</code></pre>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<codeBlock htmlContentAttributes="(1)" htmlPreAttributes="(2)" language="plaintext">foobar</codeBlock>',
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
			data: '<codeBlock htmlContentAttributes="(1)" htmlPreAttributes="(2)" language="plaintext">foobar</codeBlock>',
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
			data: '<codeBlock htmlContentAttributes="(1)" htmlPreAttributes="(2)" language="plaintext">foobar</codeBlock>',
			attributes: {
				1: {
					styles: {
						color: 'red'
					}
				},
				2: {
					styles: {
						background: 'blue'
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
		[ 'htmlPreAttributes', 'htmlContentAttributes' ].forEach( attributeName => {
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
			data: '<codeBlock htmlContentAttributes="(1)" htmlPreAttributes="(2)" language="plaintext">foobar</codeBlock>',
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

	// describe( 'attributes modifications', () => {
	// 	let root;

	// 	beforeEach( () => {
	// 		root = model.document.getRoot();

	// 		dataFilter.allowElement( /^(pre|code)$/ );
	// 		dataFilter.allowAttributes( { name: /^(pre|code)$/, styles: true } );
	// 		dataFilter.allowAttributes( { name: /^(pre|code)$/, classes: true } );
	// 		dataFilter.allowAttributes( { name: /^(pre|code)$/, attributes: true } );
	// 	} );

	// 	describe( 'on the <pre> element', () => {
	// 		it( 'should add new styles', () => {
	// 			editor.setData( '<pre><code>foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', {
	// 					'background-color': 'blue',
	// 					color: 'red'
	// 				} );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						styles: {
	// 							'background-color': 'blue',
	// 							color: 'red'
	// 						}
	// 					}
	// 				}
	// 			} );

	// 			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
	// 				'<pre data-language="Plain text" spellcheck="false" style="background-color:blue;color:red">' +
	// 					'<code class="language-plaintext">foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre style="background-color:blue;color:red;"><code class="language-plaintext">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should add new classes', () => {
	// 			editor.setData( '<pre><code>foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', [ 'foo' ] );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						classes: [ 'foo' ]
	// 					}
	// 				}
	// 			} );

	// 			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
	// 				'<pre class="foo" data-language="Plain text" spellcheck="false">' +
	// 					'<code class="language-plaintext">foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre class="foo"><code class="language-plaintext">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should add new attributes', () => {
	// 			editor.setData( '<pre><code>foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', {
	// 					'data-foo': 'bar'
	// 				} );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						attributes: {
	// 							'data-foo': 'bar'
	// 						}
	// 					}
	// 				}
	// 			} );

	// 			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
	// 				'<pre data-foo="bar" data-language="Plain text" spellcheck="false">' +
	// 					'<code class="language-plaintext">foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre data-foo="bar"><code class="language-plaintext">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should remove some styles', () => {
	// 			editor.setData( '<pre style="background-color:blue;color:red;"><code>foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', {
	// 					'background-color': 'blue'
	// 				} );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						styles: {
	// 							'background-color': 'blue'
	// 						}
	// 					}
	// 				}
	// 			} );

	// 			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
	// 				'<pre data-language="Plain text" spellcheck="false" style="background-color:blue">' +
	// 					'<code class="language-plaintext">foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre style="background-color:blue;"><code class="language-plaintext">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should remove some classes', () => {
	// 			editor.setData( '<pre class="foo bar"><code>foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', [ 'foo' ] );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						classes: [ 'foo' ]
	// 					}
	// 				}
	// 			} );

	// 			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
	// 				'<pre class="foo" data-language="Plain text" spellcheck="false">' +
	// 					'<code class="language-plaintext">foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre class="foo"><code class="language-plaintext">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should remove some attributes', () => {
	// 			editor.setData( '<pre data-foo="bar" data-bar="baz"><code>foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', {
	// 					'data-foo': 'bar'
	// 				} );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						attributes: {
	// 							'data-foo': 'bar'
	// 						}
	// 					}
	// 				}
	// 			} );

	// 			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
	// 				'<pre data-foo="bar" data-language="Plain text" spellcheck="false">' +
	// 					'<code class="language-plaintext">foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre data-foo="bar"><code class="language-plaintext">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should remove some classes, styles and attributes', () => {
	// 			editor.setData(
	// 				'<pre class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">' +
	// 					'<code>foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', [ 'foo' ] );
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', {
	// 					'background-color': 'blue'
	// 				} );
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', {
	// 					'data-foo': 'bar'
	// 				} );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						attributes: {
	// 							'data-foo': 'bar'
	// 						},
	// 						classes: [ 'foo' ],
	// 						styles: {
	// 							'background-color': 'blue'
	// 						}
	// 					}
	// 				}
	// 			} );

	// 			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
	// 				'<pre class="foo" data-foo="bar" data-language="Plain text" spellcheck="false" style="background-color:blue">' +
	// 					'<code class="language-plaintext">foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre class="foo" style="background-color:blue;" data-foo="bar"><code class="language-plaintext">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should remove all classes, styles and attributes', () => {
	// 			editor.setData(
	// 				'<pre class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">' +
	// 					'<code>foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', null );
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', null );
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', null );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock language="plaintext">foobar</codeBlock>',
	// 				attributes: {}
	// 			} );

	// 			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
	// 				'<pre data-language="Plain text" spellcheck="false">' +
	// 					'<code class="language-plaintext">foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre><code class="language-plaintext">foobar</code></pre>'
	// 			);
	// 		} );
	// 	} );

	// 	describe( 'on the <code> element', () => {
	// 		it( 'should add new styles', () => {
	// 			editor.setData( '<pre><code>foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'styles', {
	// 					'background-color': 'blue',
	// 					color: 'red'
	// 				} );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlContentAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						styles: {
	// 							'background-color': 'blue',
	// 							color: 'red'
	// 						}
	// 					}
	// 				}
	// 			} );

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre><code class="language-plaintext" style="background-color:blue;color:red;">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should add new classes', () => {
	// 			editor.setData( '<pre><code>foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'classes', [ 'foo' ] );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlContentAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						classes: [ 'foo' ]
	// 					}
	// 				}
	// 			} );

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre><code class="language-plaintext foo">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should add new attributes', () => {
	// 			editor.setData( '<pre><code>foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'attributes', {
	// 					'data-foo': 'bar'
	// 				} );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlContentAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						attributes: {
	// 							'data-foo': 'bar'
	// 						}
	// 					}
	// 				}
	// 			} );

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre><code class="language-plaintext" data-foo="bar">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should remove some styles', () => {
	// 			editor.setData( '<pre><code style="background-color:blue;color:red;">foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'styles', {
	// 					'background-color': 'blue'
	// 				} );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlContentAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						styles: {
	// 							'background-color': 'blue'
	// 						}
	// 					}
	// 				}
	// 			} );

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre><code class="language-plaintext" style="background-color:blue;">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should remove some classes', () => {
	// 			editor.setData( '<pre><code class="foo bar">foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'classes', [ 'foo' ] );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlContentAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						classes: [ 'foo' ]
	// 					}
	// 				}
	// 			} );

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre><code class="language-plaintext foo">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should remove some attributes', () => {
	// 			editor.setData( '<pre><code data-foo="bar" data-bar="baz">foobar</code></pre>' );

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'attributes', {
	// 					'data-foo': 'bar'
	// 				} );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlContentAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						attributes: {
	// 							'data-foo': 'bar'
	// 						}
	// 					}
	// 				}
	// 			} );

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre><code class="language-plaintext" data-foo="bar">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should remove some classes, styles and attributes', () => {
	// 			editor.setData(
	// 				'<pre>' +
	// 					'<code class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'classes', [ 'foo' ] );
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'styles', {
	// 					'background-color': 'blue'
	// 				} );
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'attributes', {
	// 					'data-foo': 'bar'
	// 				} );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock htmlContentAttributes="(1)" language="plaintext">foobar</codeBlock>',
	// 				attributes: {
	// 					1: {
	// 						attributes: {
	// 							'data-foo': 'bar'
	// 						},
	// 						classes: [ 'foo' ],
	// 						styles: {
	// 							'background-color': 'blue'
	// 						}
	// 					}
	// 				}
	// 			} );

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre><code class="language-plaintext foo" style="background-color:blue;" data-foo="bar">foobar</code></pre>'
	// 			);
	// 		} );

	// 		it( 'should remove all classes, styles and attributes', () => {
	// 			editor.setData(
	// 				'<pre>' +
	// 					'<code class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">foobar</code>' +
	// 				'</pre>'
	// 			);

	// 			model.change( writer => {
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'classes', null );
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'styles', null );
	// 				setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlContentAttributes', 'attributes', null );
	// 			} );

	// 			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
	// 				data: '<codeBlock language="plaintext">foobar</codeBlock>',
	// 				attributes: {}
	// 			} );

	// 			expect( editor.getData() ).to.equal(
	// 				'<pre><code class="language-plaintext">foobar</code></pre>'
	// 			);
	// 		} );
	// 	} );
	// } );
} );
