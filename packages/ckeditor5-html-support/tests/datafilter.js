/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import FontColorEditing from '@ckeditor/ckeditor5-font/src/fontcolor/fontcolorediting';
import DataFilter from '../src/datafilter';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { getModelDataWithAttributes } from './_utils/utils';
import { addBackgroundRules } from '@ckeditor/ckeditor5-engine/src/view/styles/background';
import { getLabel } from '@ckeditor/ckeditor5-widget/src/utils';

import GeneralHtmlSupport from '../src/generalhtmlsupport';

describe( 'DataFilter', () => {
	let editor, model, editorElement, dataFilter, dataSchema, htmlSupport;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, FontColorEditing, LinkEditing, GeneralHtmlSupport ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				dataFilter = editor.plugins.get( 'DataFilter' );
				dataSchema = editor.plugins.get( 'DataSchema' );
				htmlSupport = editor.plugins.get( 'GeneralHtmlSupport' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'initialization', () => {
		let initEditor, initEditorElement, initModel;

		beforeEach( () => {
			initEditorElement = document.createElement( 'div' );
			document.body.appendChild( initEditorElement );

			return ClassicTestEditor
				.create( initEditorElement, {
					// Keep FakeRTCPlugin before FakeExtentedHtmlPlugin, so it's registered first.
					plugins: [ Paragraph, FakeRTCPlugin, FakeExtentedHtmlPlugin ]
				} )
				.then( newEditor => {
					initEditor = newEditor;
					initModel = newEditor.model;
				} );
		} );

		afterEach( () => {
			initEditorElement.remove();

			return initEditor.destroy();
		} );

		it( 'should allow element registered in init() method', () => {
			initEditor.setData( '<article><p>foobar</p></article>' );

			expect( getModelData( initModel, { withoutSelection: true } ) ).to.equal(
				'<htmlArticle><paragraph>foobar</paragraph></htmlArticle>'
			);

			expect( initEditor.getData() ).to.equal( '<article><p>foobar</p></article>' );
		} );

		it( 'should allow element registered in afterInit() method', () => {
			initEditor.setData( '<section><p>foobar</p></section>' );

			expect( getModelData( initModel, { withoutSelection: true } ) ).to.equal(
				'<htmlSection><paragraph>foobar</paragraph></htmlSection>'
			);

			expect( initEditor.getData() ).to.equal( '<section><p>foobar</p></section>' );
		} );

		it( 'should allow element registered after editor initialization', () => {
			const dataFilter = initEditor.plugins.get( DataFilter );

			dataFilter.allowElement( 'span' );

			initEditor.setData( '<p><span>foobar</span></p>' );

			expect( getModelDataWithAttributes( initModel, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlSpan="(1)">foobar</$text></paragraph>',
				attributes: {
					1: {}
				}
			} );

			expect( initEditor.getData() ).to.equal( '<p><span>foobar</span></p>' );
		} );

		class FakeRTCPlugin extends Plugin {
			constructor( editor ) {
				super( editor );

				// Fake listener to simulate RTC one. Registering in constructor to
				// register it before DataFilter listener.
				this.editor.data.on( 'init', evt => {
					evt.stop();
				}, {
					// The actual RTC client listens on 'high' but in these tests we're making a point
					// of GHS registering its converters before anything else triggers the downcast conversion.
					// See https://github.com/ckeditor/ckeditor5/issues/11356.
					priority: 'highest'
				} );
			}
		}

		class FakeExtentedHtmlPlugin extends Plugin {
			static get requires() {
				return [ GeneralHtmlSupport ];
			}

			init() {
				const dataFilter = this.editor.plugins.get( DataFilter );
				dataFilter.allowElement( 'article' );
			}

			afterInit() {
				const dataFilter = this.editor.plugins.get( DataFilter );
				dataFilter.allowElement( 'section' );
			}
		}
	} );

	describe( 'object', () => {
		it( 'should allow element', () => {
			dataFilter.allowElement( 'input' );

			editor.setData( '<p><input></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><htmlInput htmlContent=""></htmlInput></paragraph>'
			);

			expect( editor.getData() ).to.equal( '<p><input></p>' );
		} );

		it( 'should allow element content', () => {
			dataFilter.allowElement( 'video' );

			editor.setData( '<p><video>' +
				'<source src="https://example.com/video.mp4" type="video/mp4">' +
				' Your browser does not support the video tag.</video>' +
				'</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>' +
				'<htmlVideo htmlContent="<source src="https://example.com/video.mp4" type="video/mp4">' +
				' Your browser does not support the video tag."></htmlVideo>' +
				'</paragraph>'
			);

			expect( editor.getData() ).to.equal( '<p><video>' +
				'<source src="https://example.com/video.mp4" type="video/mp4">' +
				' Your browser does not support the video tag.</video>' +
				'</p>'
			);
		} );

		it( 'should filter the editing view', () => {
			testUtils.sinon.stub( console, 'warn' )
				.withArgs( sinon.match( /^domconverter-unsafe-attribute-detected/ ) )
				.callsFake( () => {} );

			dataFilter.allowElement( 'video' );

			editor.setData( '<p><video>' +
				'<source src="https://example.com/video.mp4" type="video/mp4" onclick="action()">' +
					'Your browser does not support the video tag.</video>' +
				'</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>' +
					'<htmlVideo htmlContent="<source src="https://example.com/video.mp4" type="video/mp4" onclick="action()">' +
					'Your browser does not support the video tag."></htmlVideo>' +
				'</paragraph>'
			);

			expect( getViewData( editor.editing.view, {
				withoutSelection: true,
				renderRawElements: true,
				domConverter: editor.editing.view.domConverter
			} ) ).to.equal(
				'<p>' +
					'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
						'<video class="html-object-embed__content">' +
							'<source src="https://example.com/video.mp4" type="video/mp4" data-ck-unsafe-attribute-onclick="action()">' +
							'Your browser does not support the video tag.' +
						'</video>' +
					'</span>' +
				'</p>'
			);
		} );

		it( 'should recognize block elements', () => {
			dataSchema.registerBlockElement( {
				model: 'htmlXyz',
				view: 'xyz',
				isObject: true,
				modelSchema: {
					inheritAllFrom: '$blockObject'
				}
			} );

			dataFilter.allowElement( 'xyz' );

			editor.setData( '<xyz>foobar</xyz>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<htmlXyz htmlContent="foobar"></htmlXyz>'
			);

			expect( editor.getData() ).to.equal( '<xyz>foobar</xyz>' );
		} );

		it( 'should allow attributes', () => {
			dataFilter.allowElement( 'input' );
			dataFilter.allowAttributes( { name: 'input', attributes: { type: 'text' } } );

			editor.setData( '<p><input type="text"></p>' );

			expect( getObjectModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
				attributes: {
					1: {
						attributes: {
							type: 'text'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><input type="text"></p>' );
		} );

		it( 'should allow attributes (styles)', () => {
			dataFilter.allowElement( 'input' );
			dataFilter.allowAttributes( { name: 'input', styles: { color: 'red' } } );

			editor.setData( '<p><input style="color:red;"></p>' );

			expect( getObjectModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
				attributes: {
					1: {
						styles: {
							color: 'red'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><input style="color:red;"></p>' );
		} );

		it( 'should allow attributes (classes)', () => {
			dataFilter.allowElement( 'input' );
			dataFilter.allowAttributes( { name: 'input', classes: [ 'foobar' ] } );

			editor.setData( '<p><input class="foobar"></p>' );

			expect( getObjectModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
				attributes: {
					1: {
						classes: [ 'foobar' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><input class="foobar"></p>' );
		} );

		it( 'should disallow attributes', () => {
			dataFilter.allowElement( 'input' );
			dataFilter.allowAttributes( { name: 'input', attributes: { type: true } } );
			dataFilter.disallowAttributes( { name: 'input', attributes: { type: 'hidden' } } );

			editor.setData( '<p><input type="text"><input type="hidden"></p>' );

			expect( getObjectModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
				'<htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput>' +
				'<htmlInput htmlContent=""></htmlInput>' +
				'</paragraph>',
				attributes: {
					1: {
						attributes: {
							type: 'text'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><input type="text"><input></p>' );
		} );

		it( 'should disallow attributes (styles)', () => {
			dataFilter.allowElement( 'input' );
			dataFilter.allowAttributes( { name: 'input', styles: { color: /^(red|blue)$/ } } );
			dataFilter.disallowAttributes( { name: 'input', styles: { color: 'red' } } );

			editor.setData( '<p><input style="color:blue;"><input style="color:red;"</p>' );

			expect( getObjectModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
				'<htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput>' +
				'<htmlInput htmlContent=""></htmlInput>' +
				'</paragraph>',
				attributes: {
					1: {
						styles: {
							color: 'blue'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><input style="color:blue;"><input></p>' );
		} );

		it( 'should disallow attributes (classes)', () => {
			dataFilter.allowElement( 'input' );
			dataFilter.allowAttributes( { name: 'input', classes: [ 'foo', 'bar' ] } );
			dataFilter.disallowAttributes( { name: 'input', classes: [ 'bar' ] } );

			editor.setData( '<p><input class="foo bar"><input class="bar"></p>' );

			expect( getObjectModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
				'<htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput>' +
				'<htmlInput htmlContent=""></htmlInput>' +
				'</paragraph>',
				attributes: {
					1: {
						classes: [ 'foo' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><input class="foo"><input></p>' );
		} );

		it( 'should apply attributes to correct editing element', () => {
			dataFilter.allowElement( 'input' );
			dataFilter.allowAttributes( { name: 'input', attributes: 'type' } );

			editor.setData( '<p><input type="number"/></p>' );

			const input = editor.editing.view.document.getRoot()
				.getChild( 0 ) // <p>
				.getChild( 0 ) // <span>
				.getChild( 0 ); // <input>

			expect( input.getAttribute( 'type' ) ).to.equal( 'number' );
		} );

		it( 'should consume htmlAttributes attribute (editing downcast)', () => {
			let consumable;

			editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
				dispatcher.on( 'insert:htmlInput', ( evt, data, conversionApi ) => {
					consumable = conversionApi.consumable;
				} );
			} );

			dataFilter.allowElement( 'input' );
			dataFilter.allowAttributes( { name: 'input', attributes: 'type' } );

			editor.setData( '<p><input type="number"/></p>' );

			expect( consumable.test( model.document.getRoot().getChild( 0 ).getChild( 0 ), 'attribute:htmlAttributes' ) ).to.be.false;
		} );

		it( 'should add widget label', () => {
			dataFilter.allowElement( 'input' );

			editor.setData( '<p><input></p>' );

			const element = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 );

			expect( getLabel( element ) ).to.equal( 'HTML object' );
		} );

		function getObjectModelDataWithAttributes( model, options ) {
			options.excludeAttributes = [ 'htmlContent' ];
			return getModelDataWithAttributes( model, options );
		}
	} );

	describe( 'block', () => {
		it( 'should allow element', () => {
			dataFilter.allowElement( 'article' );

			editor.setData( '<article>' +
				'<section><paragraph>section1</paragraph></section>' +
				'<section><paragraph>section2</paragraph></section></article>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<htmlArticle><paragraph>section1section2</paragraph></htmlArticle>'
			);

			expect( editor.getData() ).to.equal(
				'<article><p>section1section2</p></article>'
			);

			dataFilter.allowElement( 'section' );

			editor.setData( '<article>' +
				'<section><paragraph>section1</paragraph></section>' +
				'<section><paragraph>section2</paragraph></section></article>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<htmlArticle>' +
				'<htmlSection><paragraph>section1</paragraph></htmlSection>' +
				'<htmlSection><paragraph>section2</paragraph></htmlSection></htmlArticle>'
			);

			expect( editor.getData() ).to.equal(
				'<article>' +
				'<section><p>section1</p></section>' +
				'<section><p>section2</p></section></article>'
			);
		} );

		it( 'should allow deeply nested structure', () => {
			dataFilter.allowElement( 'section' );

			editor.setData(
				'<section><p>1</p>' +
				'<section><p>2</p>' +
				'<section><p>3</p>' +
				'</section></section></section>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<htmlSection><paragraph>1</paragraph>' +
				'<htmlSection><paragraph>2</paragraph>' +
				'<htmlSection><paragraph>3</paragraph>' +
				'</htmlSection></htmlSection></htmlSection>'
			);

			expect( editor.getData() ).to.equal(
				'<section><p>1</p>' +
				'<section><p>2</p>' +
				'<section><p>3</p>' +
				'</section></section></section>'
			);
		} );

		it( 'should allow attributes', () => {
			dataFilter.allowElement( 'section' );
			dataFilter.allowAttributes( {
				name: 'section',
				attributes: {
					'data-foo': 'foobar'
				}
			} );

			editor.setData( '<section data-foo="foobar"><p>foobar</p></section>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foobar'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section data-foo="foobar"><p>foobar</p></section>'
			);
		} );

		it( 'should allow attributes (styles)', () => {
			dataFilter.allowElement( 'section' );
			dataFilter.allowAttributes( {
				name: 'section',
				styles: {
					'color': 'red',
					'background-color': 'blue'
				}
			} );

			editor.setData( '<section style="background-color:blue;color:red;"><p>foobar</p></section>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
				attributes: {
					1: {
						styles: {
							'background-color': 'blue',
							color: 'red'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section style="background-color:blue;color:red;"><p>foobar</p></section>'
			);
		} );

		it( 'should allow attributes (classes)', () => {
			dataFilter.allowElement( 'section' );
			dataFilter.allowAttributes( { name: 'section', classes: [ 'foo', 'bar' ] } );

			editor.setData( '<section class="foo bar"><p>foobar</p></section>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
				attributes: {
					1: { classes: [ 'foo', 'bar' ] }
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section class="foo bar"><p>foobar</p></section>'
			);
		} );

		it( 'should allow nested attributes', () => {
			dataFilter.allowElement( /^(article|section)$/ );
			dataFilter.allowAttributes( { name: /[\s\S]+/, attributes: { 'data-foo': /foo|bar/ } } );

			editor.setData( '<article data-foo="foo">' +
				'<section data-foo="bar"><p>section1</p></section>' +
				'<section data-foo="foo"><p>section2</p></section>' +
				'</article>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlArticle htmlAttributes="(1)">' +
					'<htmlSection htmlAttributes="(2)"><paragraph>section1</paragraph></htmlSection>' +
					'<htmlSection htmlAttributes="(3)"><paragraph>section2</paragraph></htmlSection>' +
					'</htmlArticle>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo'
						}
					},
					2: {
						attributes: {
							'data-foo': 'bar'
						}
					},
					3: {
						attributes: {
							'data-foo': 'foo'
						}
					}
				}
			} );
		} );

		it( 'should allow attributes for all allowed definitions', () => {
			dataFilter.allowElement( /^(section|article)$/ );

			dataFilter.allowAttributes( { name: /^(section|article)$/, attributes: { 'data-foo': 'foo' } } );
			dataFilter.allowAttributes( { name: /^(section|article)$/, attributes: { 'data-bar': 'bar' } } );

			editor.setData(
				'<section data-foo="foo"><p>foo</p></section>' +
				'<article data-bar="bar"><p>bar</p></article>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foo</paragraph></htmlSection>' +
					'<htmlArticle htmlAttributes="(2)"><paragraph>bar</paragraph></htmlArticle>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo'
						}
					},
					2: {
						attributes: {
							'data-bar': 'bar'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section data-foo="foo"><p>foo</p></section>' +
				'<article data-bar="bar"><p>bar</p></article>'
			);
		} );

		it( 'should not change order of attributes', () => {
			dataFilter.allowElement( 'section' );
			dataFilter.allowAttributes( {
				name: 'section',
				attributes: true
			} );

			editor.setData( '<section data-foo="a" data-bar="b"><p>foobar</p></section>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.deep.equal(
				'<htmlSection htmlAttributes="{"attributes":{"data-foo":"a","data-bar":"b"}}"><paragraph>foobar</paragraph></htmlSection>'
			);

			expect( editor.getData() ).to.equal(
				'<section data-foo="a" data-bar="b"><p>foobar</p></section>'
			);
		} );

		it( 'should disallow attributes', () => {
			dataFilter.allowElement( 'section' );
			dataFilter.allowAttributes( { name: 'section', attributes: { 'data-foo': /[\s\S]+/ } } );
			dataFilter.disallowAttributes( { name: 'section', attributes: { 'data-foo': 'bar' } } );

			editor.setData(
				'<section data-foo="foo"><p>foo</p></section>' +
				'<section data-foo="bar"><p>bar</p></section>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foo</paragraph></htmlSection>' +
					'<htmlSection><paragraph>bar</paragraph></htmlSection>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section data-foo="foo"><p>foo</p></section>' +
				'<section><p>bar</p></section>'
			);
		} );

		it( 'should disallow attributes (styles)', () => {
			dataFilter.allowElement( 'section' );
			dataFilter.allowAttributes( { name: 'section', styles: { color: /[\s\S]+/ } } );
			dataFilter.disallowAttributes( { name: 'section', styles: { color: 'red' } } );

			editor.setData(
				'<section style="color:blue;"><p>foo</p></section>' +
				'<section style="color:red"><p>bar</p></section>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foo</paragraph></htmlSection>' +
					'<htmlSection><paragraph>bar</paragraph></htmlSection>',
				attributes: {
					1: {
						styles: {
							color: 'blue'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section style="color:blue;"><p>foo</p></section>' +
				'<section><p>bar</p></section>'
			);
		} );

		it( 'should disallow attributes (classes)', () => {
			dataFilter.allowElement( 'section' );
			dataFilter.allowAttributes( { name: 'section', classes: [ 'foo', 'bar' ] } );
			dataFilter.disallowAttributes( { name: 'section', classes: [ 'bar' ] } );

			editor.setData(
				'<section class="foo bar"><p>foo</p></section>' +
				'<section class="bar"><p>bar</p></section>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foo</paragraph></htmlSection>' +
					'<htmlSection><paragraph>bar</paragraph></htmlSection>',
				attributes: {
					1: {
						classes: [ 'foo' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section class="foo"><p>foo</p></section>' +
				'<section><p>bar</p></section>'
			);
		} );

		it( 'should extend allowed children only if specified model schema exists', () => {
			dataSchema.registerBlockElement( {
				view: 'xyz',
				model: 'htmlXyz',
				allowChildren: 'not-exists',
				schema: {
					inheritAllFrom: '$container'
				}
			} );

			expect( () => {
				dataFilter.allowElement( 'xyz' );
			} ).to.not.throw();
		} );

		it( 'should not consume attribute already consumed (upcast)', () => {
			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:section', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { attributes: [ 'data-foo' ] } );
				} );
			} );

			dataFilter.allowElement( 'section' );
			dataFilter.allowAttributes( { name: 'section', attributes: { 'data-foo': true } } );

			editor.setData( '<section data-foo><p>foo</p></section>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection><paragraph>foo</paragraph></htmlSection>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal( '<section><p>foo</p></section>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/11000
		it( 'should not consume element attributes if the element was consumed into a collapsed range', () => {
			dataFilter.allowElement( 'input' );
			dataFilter.allowAttributes( { name: 'input', attributes: true } );

			editor.data.upcastDispatcher.on( 'element:input', ( evt, data, conversionApi ) => {
				if ( conversionApi.consumable.consume( data.viewItem, { name: true } ) ) {
					data.modelRange = conversionApi.writer.createRange( data.modelCursor );
				}
			} );

			editor.data.upcastDispatcher.on( 'element:input', ( evt, data, conversionApi ) => {
				const areConsumable = conversionApi.consumable.test( data.viewItem, { attributes: [ 'type', 'disabled' ] } );

				expect( areConsumable ).to.be.true;
			}, { priority: 'lowest' } );

			editor.setData( '<p>foo<input type="checkbox" disabled="disabled">bar</p>' );
		} );

		it( 'should not create empty htmlA (upcast)', () => {
			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { name: true, attributes: [ 'href' ] } );

					if ( !data.modelRange ) {
						Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
					}
				} );
			} );

			dataFilter.allowElement( 'a' );
			dataFilter.allowAttributes( { name: 'a', attributes: { 'href': true } } );

			editor.setData( '<a href="example.com"><p>foo</p></a>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>foo</paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'should not consume attribute already consumed (downcast)', () => {
			editor.conversion.for( 'downcast' ).add( dispatcher => {
				dispatcher.on( 'attribute:htmlAttributes:htmlSection', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, evt.name );
				}, { priority: 'high' } );
			} );

			dataFilter.allowElement( 'section' );
			dataFilter.allowAttributes( { name: 'section', attributes: { 'data-foo': true } } );

			editor.setData( '<section data-foo><p>foo</p></section>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foo</paragraph></htmlSection>',
				// At this point, attribute should still be in the model, as we are testing downcast conversion.
				attributes: {
					1: {
						attributes: {
							'data-foo': ''
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<section><p>foo</p></section>' );
		} );

		it( 'should not convert attributes if the model schema item definition is not registered', () => {
			dataSchema.registerBlockElement( { view: 'xyz', model: 'modelXyz' } );

			dataFilter.allowElement( 'xyz' );
			dataFilter.allowAttributes( { name: 'xyz', attributes: { 'data-foo': 'foo' } } );

			// We are not registering model schema anywhere, to check if upcast
			// converter will be able to detect this case.
			// editor.model.schema.register( 'modelXyz', { ... } );

			editor.setData( '<xyz>foo</xyz>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>foo</paragraph>',
				attributes: {}
			} );
		} );

		it( 'should not register converters if element definition was already registered', () => {
			dataSchema.registerBlockElement( {
				model: 'htmlXyz',
				view: 'xyz',
				modelSchema: { inheritAllFrom: '$block' }
			} );

			editor.model.schema.register( 'htmlXyz', { inheritAllFrom: '$block' } );

			dataFilter.allowElement( 'xyz' );

			editor.setData( '<xyz>foo</xyz>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foo</paragraph>' );
		} );

		it( 'should not register view converters for existing features if a view has not been provided', () => {
			// Skipping `view` property on purpose.
			dataSchema.registerBlockElement( {
				model: 'htmlFoo',
				modelSchema: { inheritAllFrom: '$block' }
			} );

			dataSchema.registerBlockElement( {
				model: 'htmlBar',
				view: 'bar',
				modelSchema: { inheritAllFrom: 'htmlFoo' }
			} );

			editor.model.schema.register( 'htmlFoo', { inheritAllFrom: '$block' } );

			// At this point we will be trying to register converter without valid view name.
			expect( () => {
				dataFilter.allowElement( 'bar' );

				// Apply filtering rules added after initial data load.
				editor.setData( '' );
			} ).to.not.throw();
		} );

		it( 'should not allow invalid attributes', () => {
			dataFilter.allowElement( 'p' );
			dataFilter.allowAttributes( {
				name: 'p',
				attributes: true
			} );

			editor.setData( '<p zzz="a" ab?cd="2">x</p><p foo="a" bar' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph htmlAttributes="(1)">x</paragraph><paragraph htmlAttributes="(2)"></paragraph>',
				attributes: {
					1: {
						attributes: {
							zzz: 'a'
						}
					},
					2: {
						attributes: {
							body: '',
							foo: 'a'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p zzz="a">x</p><p foo="a" body="">&nbsp;</p>'
			);
		} );
	} );

	describe( 'inline', () => {
		it( 'should allow element', () => {
			dataFilter.allowElement( 'cite' );

			editor.setData( '<p><cite>foobar</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
				attributes: {
					1: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite>foobar</cite></p>' );
		} );

		it( 'should allow deeply nested structure', () => {
			dataFilter.allowElement( 'cite' );

			editor.setData( '<p><cite>foo<cite>bar<cite>baz</cite></cite></cite>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobarbaz</$text></paragraph>',
				attributes: {
					1: {},
					2: {},
					3: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite>foobarbaz</cite></p>' );
		} );

		it( 'should allow attributes', () => {
			dataFilter.allowElement( 'cite' );
			dataFilter.allowAttributes( {
				name: 'cite',
				attributes: {
					'data-foo': 'foobar'
				}
			} );

			editor.setData( '<p><cite data-foo="foobar">foobar</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foobar'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite data-foo="foobar">foobar</cite></p>' );
		} );

		it( 'should allow attributes (styles)', () => {
			dataFilter.allowElement( 'cite' );
			dataFilter.allowAttributes( {
				name: 'cite',
				styles: {
					'color': 'red',
					'background-color': 'blue'
				}
			} );

			editor.setData( '<p><cite style="background-color:blue;color:red;">foobar</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
				attributes: {
					1: {
						styles: {
							'background-color': 'blue',
							color: 'red'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p><cite style="background-color:blue;color:red;">foobar</cite></p>'
			);
		} );

		it( 'should allow attributes (classes)', () => {
			dataFilter.allowElement( 'cite' );
			dataFilter.allowAttributes( { name: 'cite', classes: [ 'foo', 'bar' ] } );

			editor.setData( '<p><cite class="foo bar">foobar</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
				attributes: {
					1: { classes: [ 'foo', 'bar' ] }
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite class="foo bar">foobar</cite></p>' );
		} );

		it( 'should allow nested attributes', () => {
			dataFilter.allowElement( /^(span|cite)$/ );
			dataFilter.allowAttributes( { name: /^(span|cite)$/, attributes: { 'data-foo': 'foo' } } );
			dataFilter.allowAttributes( { name: /^(span|cite)$/, attributes: { 'data-bar': 'bar' } } );

			editor.setData( '<p><cite data-foo="foo">' +
					'<cite data-bar="bar">cite</cite>' +
					'<span data-bar="bar">span</span>' +
				'</cite></p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
					'<$text htmlCite="(1)">cite</$text>' +
					'<$text htmlCite="(2)" htmlSpan="(3)">span</$text>' +
				'</paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo',
							'data-bar': 'bar'
						}
					},
					2: {
						attributes: {
							'data-foo': 'foo'
						}
					},
					3: {
						attributes: {
							'data-bar': 'bar'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p>' +
				'<cite data-foo="foo" data-bar="bar">cite</cite>' +
				'<cite data-foo="foo"><span data-bar="bar">span</span></cite>' +
				'</p>' );
		} );

		it( 'should disallow attributes', () => {
			dataFilter.allowElement( 'cite' );
			dataFilter.allowAttributes( { name: 'cite', attributes: { 'data-foo': /[\s\S]+/ } } );
			dataFilter.disallowAttributes( { name: 'cite', attributes: { 'data-foo': 'bar' } } );

			editor.setData( '<p><cite data-foo="foo">foo</cite><cite data-bar="bar">bar</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foo</$text><$text htmlCite="(2)">bar</$text></paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo'
						}
					},
					2: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite data-foo="foo">foo</cite><cite>bar</cite></p>' );
		} );

		it( 'should disallow attributes (styles)', () => {
			dataFilter.allowElement( 'cite' );
			dataFilter.allowAttributes( { name: 'cite', styles: { color: /[\s\S]+/ } } );
			dataFilter.disallowAttributes( { name: 'cite', styles: { color: 'red' } } );

			editor.setData(
				'<p>' +
				'<cite style="color:blue;">foo</cite>' +
				'<cite style="color:red;">bar</cite>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foo</$text><$text htmlCite="(2)">bar</$text></paragraph>',
				attributes: {
					1: {
						styles: {
							color: 'blue'
						}
					},
					2: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p><cite style="color:blue;">foo</cite><cite>bar</cite></p>'
			);
		} );

		it( 'should disallow attributes (classes)', () => {
			dataFilter.allowElement( 'cite' );
			dataFilter.allowAttributes( { name: 'cite', classes: [ 'foo', 'bar' ] } );
			dataFilter.disallowAttributes( { name: 'cite', classes: [ 'bar' ] } );

			editor.setData(
				'<p>' +
				'<cite class="foo bar">foo</cite>' +
				'<cite class="bar">bar</cite>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foo</$text><$text htmlCite="(2)">bar</$text></paragraph>',
				attributes: {
					1: {
						classes: [ 'foo' ]
					},
					2: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite class="foo">foo</cite><cite>bar</cite></p>' );
		} );

		it( 'should not consume attribute already consumed (upcast)', () => {
			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:cite', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { attributes: [ 'data-foo' ] } );
				} );
			} );

			dataFilter.allowElement( 'cite' );
			dataFilter.allowAttributes( { name: 'cite', attributes: { 'data-foo': true } } );

			editor.setData( '<p><cite data-foo>foo</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foo</$text></paragraph>',
				attributes: {
					1: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite>foo</cite></p>' );
		} );

		it( 'should not convert element already consumed (upcast)', () => {
			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { name: true, attributes: [ 'href' ] } );

					if ( !data.modelRange ) {
						Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
					}
				} );
			} );

			dataFilter.allowElement( 'a' );
			dataFilter.allowAttributes( { name: 'a', attributes: { 'href': true } } );
			dataFilter.allowElement( 'span' );

			editor.setData( '<p><a href="example.com">foo <span>bar</span></a></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>foo <$text htmlSpan="(1)">bar</$text></paragraph>',
				attributes: {
					1: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p>foo <span>bar</span></p>' );
		} );

		it( 'should not consume attribute already consumed (downcast)', () => {
			editor.conversion.for( 'downcast' ).add( dispatcher => {
				dispatcher.on( 'attribute:htmlCite:$text', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, evt.name );
				}, { priority: 'high' } );
			} );

			dataFilter.allowElement( 'cite' );
			dataFilter.allowAttributes( { name: 'cite', attributes: { 'data-foo': true } } );

			editor.setData( '<p><cite data-foo>foo</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foo</$text></paragraph>',
				// At this point, attribute should still be in the model, as we are testing downcast conversion.
				attributes: {
					1: {
						attributes: {
							'data-foo': ''
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'should correctly merge class names', () => {
			dataFilter.allowElement( 'span' );
			dataFilter.allowAttributes( { name: 'span', classes: /[\s\S]+/ } );

			editor.setData( '<p><span class="foo">foo<span class="bar">bar<span class="baz">baz</span></span></span></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">foo</$text>' +
						'<$text htmlSpan="(2)">bar</$text>' +
						'<$text htmlSpan="(3)">baz</$text>' +
					'</paragraph>',
				attributes: {
					1: {
						classes: [ 'foo' ]
					},
					2: {
						classes: [ 'foo', 'bar' ]
					},
					3: {
						classes: [ 'foo', 'bar', 'baz' ]
					}
				}
			} );
		} );

		// #10657.
		// #11450.
		// #11477.
		it( 'should not throw exception when outer element doesn\'t have attributes', () => {
			dataFilter.allowElement( 'span' );
			dataFilter.allowAttributes( { name: 'span', classes: /[\s\S]+/ } );

			editor.setData( '<p><span>foo<span class="test">bar</span></span></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">foo</$text>' +
						'<$text htmlSpan="(2)">bar</$text>' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {
						classes: [ 'test' ]
					}
				}
			} );
		} );

		describe( 'attribute properties', () => {
			it( 'should set if given', () => {
				dataSchema.registerInlineElement( {
					view: 'xyz',
					model: 'htmlXyz',
					attributeProperties: {
						copyOnEnter: true
					}
				} );

				dataFilter.allowElement( 'xyz' );

				// Apply filtering rules added after initial data load.
				editor.setData( '' );

				expect( editor.model.schema.getAttributeProperties( 'htmlXyz' ) ).to.deep.equal( { copyOnEnter: true } );
			} );

			it( 'should not set if missing', () => {
				dataSchema.registerInlineElement( {
					view: 'xyz',
					model: 'htmlXyz'
				} );

				dataFilter.allowElement( 'xyz' );

				// Apply filtering rules added after initial data load.
				editor.setData( '' );

				expect( editor.model.schema.getAttributeProperties( 'htmlXyz' ) ).to.deep.equal( {} );
			} );
		} );

		it( 'should not set attribute if disallowed by schema', () => {
			editor.model.schema.addAttributeCheck( ( context, attributeName ) => {
				if ( context.endsWith( '$text' ) && attributeName === 'htmlXyz' ) {
					return false;
				}
			} );

			dataSchema.registerInlineElement( {
				view: 'xyz',
				model: 'htmlXyz',
				attributeProperties: {
					copyOnEnter: true
				}
			} );

			dataFilter.allowElement( 'xyz' );

			editor.setData( '<p><xyz>foobar</xyz></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );

			editor.getData( '<p>foobar</p>' );
		} );

		it( 'should use correct priority level for existing features', () => {
			// 'a' element is registered by data schema with priority 5.
			// We are checking if this element will be correctly nested due to different
			// AttributeElement priority than default.
			dataFilter.allowElement( 'a' );
			dataFilter.allowAttributes( { name: 'a', attributes: { 'data-foo': 'foo' } } );

			editor.setData( '<p><a href="example.com" data-foo="foo">link</a></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlA="(1)" linkHref="example.com">link</$text></paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><a href="example.com" data-foo="foo">link</a></p>' );
		} );
	} );

	describe( 'attributes modifications', () => {
		let root;

		beforeEach( () => {
			root = model.document.getRoot();
		} );

		describe( 'on object elements', () => {
			beforeEach( () => {
				root = model.document.getRoot();

				dataFilter.allowElement( 'input' );
				dataFilter.allowAttributes( { name: 'input', styles: true } );
				dataFilter.allowAttributes( { name: 'input', classes: true } );
				dataFilter.allowAttributes( { name: 'input', attributes: true } );
			} );

			it( 'should add new styles if no html attributes applied', () => {
				editor.setData( '<p><input></p>' );

				htmlSupport.setModelHtmlStyles( 'input', {
					'background-color': 'blue',
					color: 'red'
				}, root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input style="background-color:blue;color:red;"></p>'
				);
			} );

			it( 'should add new styles if no classes or other attributes are present', () => {
				editor.setData( '<p><input style="background-color:blue;color:red;"></p>' );

				htmlSupport.setModelHtmlStyles( 'input', {
					'font-size': '10px'
				}, root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								color: 'red',
								'font-size': '10px'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input style="background-color:blue;color:red;font-size:10px;"></p>'
				);
			} );

			it( 'should update existing styles if no classes or other attributes are present', () => {
				editor.setData( '<p><input style="background-color:blue;color:red;"></p>' );

				htmlSupport.setModelHtmlStyles( 'input', {
					'background-color': 'green'
				}, root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							styles: {
								'background-color': 'green',
								color: 'red'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input style="background-color:green;color:red;"></p>'
				);
			} );

			it( 'should remove some styles if no classes or other attributes are present', () => {
				editor.setData( '<p><input style="background-color:blue;color:red;font-size:10px;"></p>' );

				htmlSupport.removeModelHtmlStyles( 'input', 'color', root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								'font-size': '10px'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input style="background-color:blue;font-size:10px;"></p>'
				);
			} );

			it( 'should remove the attribute when removing all styles and no other classes or attributes are present', () => {
				editor.setData( '<p><input style="background-color:blue;color:red;font-size:10px;"></p>' );

				htmlSupport.removeModelHtmlStyles( 'input', [
					'background-color',
					'color',
					'font-size'
				], root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input></p>'
				);
			} );

			it( 'should add new styles if there are other classes or attributes', () => {
				editor.setData(
					'<p><input style="background-color:blue;color:red;" class="foo bar" data-foo="bar"></p>'
				);

				htmlSupport.setModelHtmlStyles( 'input', {
					'font-size': '10px'
				}, root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								color: 'red',
								'font-size': '10px'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo bar" style="background-color:blue;color:red;font-size:10px;" data-foo="bar"></p>'
				);
			} );

			it( 'should remove some styles if there are already other classes or attributes', () => {
				editor.setData(
					'<p><input style="background-color:blue;color:red;font-size:10px;" class="foo bar" data-foo="bar"></p>'
				);

				htmlSupport.removeModelHtmlStyles( 'input', 'color', root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								'font-size': '10px'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo bar" style="background-color:blue;font-size:10px;" data-foo="bar"></p>'
				);
			} );

			it( 'should remove all styles if there are already other classes or attributes', () => {
				editor.setData(
					'<p><input style="background-color:blue;color:red;font-size:10px;" class="foo bar" data-foo="bar"></p>'
				);

				htmlSupport.removeModelHtmlStyles( 'input', [
					'background-color',
					'color',
					'font-size'
				], root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ]
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo bar" data-foo="bar"></p>'
				);
			} );

			it( 'should add new classes if no html attributes applied', () => {
				editor.setData( '<p><input></p>' );

				htmlSupport.addModelHtmlClass( 'input', [
					'foo',
					'bar'
				], root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							classes: [ 'foo', 'bar' ]
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo bar"></p>'
				);
			} );

			it( 'should add new classes if no styles or other attributes are present', () => {
				editor.setData( '<p><input class="foo"></p>' );

				htmlSupport.addModelHtmlClass( 'input', 'bar', root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							classes: [ 'foo', 'bar' ]
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo bar"></p>'
				);
			} );

			it( 'should update existing classes if no styles or other attributes are present', () => {
				editor.setData( '<p><input class="foo bar"></p>' );

				htmlSupport.addModelHtmlClass( 'input', 'baz', root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							classes: [ 'foo', 'bar', 'baz' ]
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo bar baz"></p>'
				);
			} );

			it( 'should remove some classes if no styles or other attributes are present', () => {
				editor.setData( '<p><input class="foo bar baz"></p>' );

				htmlSupport.removeModelHtmlClass( 'input', 'bar', root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							classes: [ 'foo', 'baz' ]
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo baz"></p>'
				);
			} );

			it( 'should remove the attribute when removing all classes and no other styles or attributes are present', () => {
				editor.setData( '<p><input class="foo bar"></p>' );

				htmlSupport.removeModelHtmlClass( 'input', [
					'foo',
					'bar'
				], root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input></p>'
				);
			} );

			it( 'should add new classes if there are other styles or attributes', () => {
				editor.setData(
					'<p><input style="background-color:blue;color:red;" class="foo" data-foo="bar"></p>'
				);

				htmlSupport.addModelHtmlClass( 'input', 'bar', root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo bar" style="background-color:blue;color:red;" data-foo="bar"></p>'
				);
			} );

			it( 'should remove some classes if there are already other styles or attributes', () => {
				editor.setData(
					'<p><input style="background-color:blue;color:red;font-size:10px;" class="foo bar" data-foo="bar"></p>'
				);

				htmlSupport.removeModelHtmlClass( 'input', 'bar', root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo' ],
							styles: {
								'background-color': 'blue',
								color: 'red',
								'font-size': '10px'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo" style="background-color:blue;color:red;font-size:10px;" data-foo="bar"></p>'
				);
			} );

			it( 'should remove all classes if there are already other classes or attributes', () => {
				editor.setData(
					'<p><input style="background-color:blue;color:red;font-size:10px;" class="foo bar" data-foo="bar"></p>'
				);

				htmlSupport.removeModelHtmlClass( 'input', [
					'foo',
					'bar'
				], root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							styles: {
								'background-color': 'blue',
								color: 'red',
								'font-size': '10px'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input style="background-color:blue;color:red;font-size:10px;" data-foo="bar"></p>'
				);
			} );

			it( 'should add new attributes if no html attributes applied', () => {
				editor.setData( '<p><input></p>' );

				htmlSupport.setModelHtmlAttributes( 'input', {
					'data-foo': 'bar',
					'data-bar': 'baz'
				}, root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar',
								'data-bar': 'baz'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input data-foo="bar" data-bar="baz"></p>'
				);
			} );

			it( 'should add new attributes if no classes or styles are present', () => {
				editor.setData( '<p><input data-foo="bar"></p>' );

				htmlSupport.setModelHtmlAttributes( 'input', {
					'data-bar': 'baz'
				}, root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar',
								'data-bar': 'baz'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input data-foo="bar" data-bar="baz"></p>'
				);
			} );

			it( 'should update existing attributes if no classes or styles are present', () => {
				editor.setData( '<p><input data-foo="bar" data-bar="baz"></p>' );

				htmlSupport.setModelHtmlAttributes( 'input', {
					'data-foo': 'baz',
					'data-bar': 'bar'
				}, root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'baz',
								'data-bar': 'bar'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input data-foo="baz" data-bar="bar"></p>'
				);
			} );

			it( 'should remove some attributes if no classes or styles are present', () => {
				editor.setData( '<p><input data-foo="bar" data-bar="baz"></p>' );

				htmlSupport.removeModelHtmlAttributes( 'input', 'data-bar', root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input data-foo="bar"></p>'
				);
			} );

			it( 'should remove the attribute when removing all attributes and no other classes or styles are present', () => {
				editor.setData( '<p><input data-foo="bar" data-bar="baz"></p>' );

				htmlSupport.removeModelHtmlAttributes( 'input', [
					'data-foo',
					'data-bar'
				], root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input></p>'
				);
			} );

			it( 'should add new attributes if there are other classes or styles', () => {
				editor.setData(
					'<p><input style="background-color:blue;color:red;" class="foo bar" data-foo="bar"></p>'
				);

				htmlSupport.setModelHtmlAttributes( 'input', {
					'data-foo': 'bar',
					'data-bar': 'baz'
				}, root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar',
								'data-bar': 'baz'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz"></p>'
				);
			} );

			it( 'should remove some attributes if there are already other classes or styles', () => {
				editor.setData(
					'<p><input style="background-color:blue;font-size:10px;" class="foo bar" data-foo="bar" data-bar="baz"></p>'
				);

				htmlSupport.removeModelHtmlAttributes( 'input', 'data-bar', root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								'font-size': '10px'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo bar" style="background-color:blue;font-size:10px;" data-foo="bar"></p>'
				);
			} );

			it( 'should remove all attributes if there are already other classes or styles', () => {
				editor.setData(
					'<p><input style="background-color:blue;font-size:10px;" class="foo bar" data-foo="bar"></p>'
				);

				htmlSupport.removeModelHtmlAttributes( 'input', 'data-foo', root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><htmlInput htmlAttributes="(1)" htmlContent=""></htmlInput></paragraph>',
					attributes: {
						1: {
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								'font-size': '10px'
							}
						},
						2: ''
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><input class="foo bar" style="background-color:blue;font-size:10px;"></p>'
				);
			} );
		} );

		describe( 'on block elements', () => {
			beforeEach( () => {
				root = model.document.getRoot();

				dataFilter.allowElement( 'section' );
				dataFilter.allowAttributes( { name: 'section', styles: true } );
				dataFilter.allowAttributes( { name: 'section', classes: true } );
				dataFilter.allowAttributes( { name: 'section', attributes: true } );
			} );

			it( 'should add new styles if no html attributes applied', () => {
				editor.setData( '<section><p>foobar</p></section>' );

				htmlSupport.setModelHtmlStyles( 'section', {
					'background-color': 'blue',
					color: 'red'
				}, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section style="background-color:blue;color:red;"><p>foobar</p></section>'
				);
			} );

			it( 'should add new styles if no classes or other attributes are present', () => {
				editor.setData( '<section style="background-color:blue;color:red;"><p>foobar</p></section>' );

				htmlSupport.setModelHtmlStyles( 'section', {
					'font-size': '10px'
				}, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								color: 'red',
								'font-size': '10px'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section style="background-color:blue;color:red;font-size:10px;"><p>foobar</p></section>'
				);
			} );

			it( 'should update existing styles if no classes or other attributes are present', () => {
				editor.setData( '<section style="background-color:blue;color:red;"><p>foobar</p></section>' );

				htmlSupport.setModelHtmlStyles( 'section', {
					'background-color': 'green'
				}, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							styles: {
								'background-color': 'green',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section style="background-color:green;color:red;"><p>foobar</p></section>'
				);
			} );

			it( 'should remove some styles if no classes or other attributes are present', () => {
				editor.setData( '<section style="background-color:blue;color:red;font-size:10px;"><p>foobar</p></section>' );

				htmlSupport.removeModelHtmlStyles( 'section', 'color', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								'font-size': '10px'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section style="background-color:blue;font-size:10px;"><p>foobar</p></section>'
				);
			} );

			it( 'should remove the attribute when removing all styles and no other classes or attributes are present', () => {
				editor.setData( '<section style="background-color:blue;color:red;font-size:10px;"><p>foobar</p></section>' );

				htmlSupport.removeModelHtmlStyles( 'section', [ 'background-color', 'color', 'font-size' ], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection><paragraph>foobar</paragraph></htmlSection>',
					attributes: {}
				} );

				expect( editor.getData() ).to.equal(
					'<section><p>foobar</p></section>'
				);
			} );

			it( 'should add new styles if there are other classes or attributes', () => {
				editor.setData(
					'<section style="background-color:blue;color:red;" class="foo bar" data-foo="bar"><p>foobar</p></section>'
				);

				htmlSupport.setModelHtmlStyles( 'section', {
					'font-size': '10px'
				}, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								color: 'red',
								'font-size': '10px'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo bar" style="background-color:blue;color:red;font-size:10px;" data-foo="bar">' +
						'<p>foobar</p>' +
					'</section>'
				);
			} );

			it( 'should remove some styles if there are already other classes or attributes', () => {
				editor.setData(
					'<section style="background-color:blue;color:red;font-size:10px;" class="foo" data-foo="bar"><p>foobar</p></section>'
				);

				htmlSupport.removeModelHtmlStyles( 'section', [ 'color' ], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo' ],
							styles: {
								'background-color': 'blue',
								'font-size': '10px'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo" style="background-color:blue;font-size:10px;" data-foo="bar">' +
						'<p>foobar</p>' +
					'</section>'
				);
			} );

			it( 'should remove all styles if there are already other classes or attributes', () => {
				editor.setData(
					'<section style="background-color:blue;color:red;font-size:10px;" class="foo" data-foo="bar"><p>foobar</p></section>'
				);

				htmlSupport.removeModelHtmlStyles( 'section', [ 'background-color', 'color', 'font-size' ], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo' ]
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo" data-foo="bar"><p>foobar</p></section>'
				);
			} );

			it( 'should add new classes if no html attributes applied', () => {
				editor.setData( '<section><p>foobar</p></section>' );

				htmlSupport.addModelHtmlClass( 'section', [ 'foo', 'bar' ], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							classes: [ 'foo', 'bar' ]
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo bar"><p>foobar</p></section>'
				);
			} );

			it( 'should add new classes if no styles or other attributes are present', () => {
				editor.setData( '<section class="foo bar"><p>foobar</p></section>' );

				htmlSupport.addModelHtmlClass( 'section', 'baz', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: { classes: [ 'foo', 'bar', 'baz' ] }
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo bar baz"><p>foobar</p></section>'
				);
			} );

			it( 'should update existing classes if no other styles or attributes are present', () => {
				editor.setData( '<section class="foo bar"><p>foobar</p></section>' );

				htmlSupport.addModelHtmlClass( 'section', 'baz', root.getChild( 0 ), 'htmlAttributes' );
				htmlSupport.removeModelHtmlClass( 'section', 'bar', root.getChild( 0 ), 'htmlAttributes' );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: { classes: [ 'foo', 'baz' ] }
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo baz"><p>foobar</p></section>'
				);
			} );

			it( 'should remove some classes if no other styles or attributes are present', () => {
				editor.setData( '<section class="foo bar baz"><p>foobar</p></section>' );

				htmlSupport.removeModelHtmlClass( 'section', 'bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: { classes: [ 'foo', 'baz' ] }
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo baz"><p>foobar</p></section>'
				);
			} );

			it( 'should remove all attributes when removing all classes and no other styles or attributes are present', () => {
				editor.setData( '<section class="foo bar baz"><p>foobar</p></section>' );

				htmlSupport.removeModelHtmlClass( 'section', [ 'foo', 'bar', 'baz' ], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection><paragraph>foobar</paragraph></htmlSection>',
					attributes: {}
				} );

				expect( editor.getData() ).to.equal(
					'<section><p>foobar</p></section>'
				);
			} );

			it( 'should add new classes if there are other styles and attributes', () => {
				editor.setData(
					'<section style="background-color:blue;color:red;" class="foo bar" data-foo="bar"><p>foobar</p></section>'
				);

				htmlSupport.addModelHtmlClass( 'section', 'baz', root.getChild( 0 ) );
				htmlSupport.removeModelHtmlClass( 'section', 'bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'baz' ],
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo baz" style="background-color:blue;color:red;" data-foo="bar">' +
						'<p>foobar</p>' +
					'</section>'
				);
			} );

			it( 'should remove some classes if there are already other styles and attributes', () => {
				editor.setData(
					'<section style="background-color:blue;color:red;" class="foo bar baz" data-foo="bar"><p>foobar</p></section>'
				);

				htmlSupport.removeModelHtmlClass( 'section', [ 'bar', 'baz' ], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo' ],
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo" style="background-color:blue;color:red;" data-foo="bar">' +
						'<p>foobar</p>' +
					'</section>'
				);
			} );

			it( 'should remove all classes if there are already other styles and attributes', () => {
				editor.setData(
					'<section style="background-color:blue;color:red;" class="foo bar baz" data-foo="bar"><p>foobar</p></section>'
				);

				htmlSupport.removeModelHtmlClass( 'section', [ 'foo', 'bar', 'baz' ], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section style="background-color:blue;color:red;" data-foo="bar">' +
						'<p>foobar</p>' +
					'</section>'
				);
			} );

			it( 'should add new attributes if no html attributes applied', () => {
				editor.setData( '<section><p>foobar</p></section>' );

				htmlSupport.setModelHtmlAttributes( 'section', { 'data-foo': 'bar' }, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: { 'data-foo': 'bar' }
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section data-foo="bar"><p>foobar</p></section>'
				);
			} );

			it( 'should add new attributes if no styles or classes are present', () => {
				editor.setData( '<section data-foo="bar"><p>foobar</p></section>' );

				htmlSupport.setModelHtmlAttributes( 'section', { 'data-bar': 'baz' }, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar',
								'data-bar': 'baz'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section data-foo="bar" data-bar="baz"><p>foobar</p></section>'
				);
			} );

			it( 'should update existing attributes if no styles or classes are present', () => {
				editor.setData( '<section data-foo="bar" data-bar="baz"><p>foobar</p></section>' );

				htmlSupport.setModelHtmlAttributes( 'section', {
					'data-foo': 'bar baz',
					'data-bar': 'baz bar'
				}, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar baz',
								'data-bar': 'baz bar'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section data-foo="bar baz" data-bar="baz bar"><p>foobar</p></section>'
				);
			} );

			it( 'should remove some attributes if no other styles or classes are present', () => {
				editor.setData( '<section data-foo="bar" data-bar="baz"><p>foobar</p></section>' );

				htmlSupport.removeModelHtmlAttributes( 'section', 'data-bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section data-foo="bar"><p>foobar</p></section>'
				);
			} );

			it( 'should remove attribute element when removing all attributes and no other styles or classes are present', () => {
				editor.setData( '<section data-foo="bar" data-bar="baz"><p>foobar</p></section>' );

				htmlSupport.removeModelHtmlAttributes( 'section', [ 'data-bar', 'data-foo' ], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection><paragraph>foobar</paragraph></htmlSection>',
					attributes: {}
				} );

				expect( editor.getData() ).to.equal(
					'<section><p>foobar</p></section>'
				);
			} );

			it( 'should modify attributes if there are other styles and classes', () => {
				editor.setData(
					'<section style="background-color:blue;color:red;" class="foo bar" data-foo="bar"><p>foobar</p></section>'
				);

				htmlSupport.setModelHtmlAttributes( 'section', { 'data-bar': 'baz' }, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar',
								'data-bar': 'baz'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">' +
						'<p>foobar</p>' +
					'</section>'
				);
			} );

			it( 'should remove some attributes if there are other styles and classes', () => {
				editor.setData(
					'<section class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">' +
						'<p>foobar</p>' +
					'</section>'
				);

				htmlSupport.removeModelHtmlAttributes( 'section', 'data-bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo bar" style="background-color:blue;color:red;" data-foo="bar">' +
						'<p>foobar</p>' +
					'</section>'
				);
			} );

			it( 'should remove all attributes if there are other styles and classes', () => {
				editor.setData(
					'<section class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">' +
						'<p>foobar</p>' +
					'</section>'
				);

				htmlSupport.removeModelHtmlAttributes( 'section', [ 'data-bar', 'data-foo' ], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
					attributes: {
						1: {
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<section class="foo bar" style="background-color:blue;color:red;">' +
						'<p>foobar</p>' +
					'</section>'
				);
			} );

			it( 'should do nothing if trying to unset attribute when no attributes are present', () => {
				editor.setData(
					'<section><p>foobar</p></section>'
				);

				htmlSupport.removeModelHtmlAttributes( 'section', 'data-bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlSection><paragraph>foobar</paragraph></htmlSection>',
					attributes: {}
				} );

				expect( editor.getData() ).to.equal( '<section><p>foobar</p></section>' );
			} );
		} );

		describe( 'on inline elements', () => {
			beforeEach( () => {
				root = model.document.getRoot();

				dataFilter.allowElement( 'cite' );
				dataFilter.allowAttributes( { name: 'cite', styles: true } );
				dataFilter.allowAttributes( { name: 'cite', classes: true } );
				dataFilter.allowAttributes( { name: 'cite', attributes: true } );

				// Apply filtering rules added after initial data load.
				editor.setData( '' );
			} );

			it( 'should add new styles if no attribute element is present', () => {
				setModelData( model, '<paragraph>[foobar]</paragraph>' );

				htmlSupport.setModelHtmlStyles( 'cite', {
					'background-color': 'blue',
					color: 'red'
				}, model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite style="background-color:blue;color:red;">foobar</cite></p>'
				);
			} );

			it( 'should add new styles if no classes or other attributes are present', () => {
				setModelData( model, '<paragraph>[<$text>foobar</$text>]</paragraph>' );

				htmlSupport.setModelHtmlStyles( 'cite', {
					'background-color': 'blue',
					color: 'red'
				}, model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite style="background-color:blue;color:red;">foobar</cite></p>'
				);
			} );

			it( 'should update existing styles if no classes or other attributes are present', () => {
				editor.setData( '<p><cite style="background-color:blue;">foobar</cite></p>' );

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.setModelHtmlStyles( 'cite', {
					color: 'red'
				}, model.document.selection );
				htmlSupport.removeModelHtmlStyles( 'cite', [], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite style="background-color:blue;color:red;">foobar</cite></p>'
				);
			} );

			it( 'should remove some styles if no classes or other attributes are present', () => {
				editor.setData( '<p><cite style="background-color:blue;color:red;font-size:10px;">foobar</cite></p>' );

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlStyles( 'cite', [ 'color' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								'font-size': '10px'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite style="background-color:blue;font-size:10px;">foobar</cite></p>'
				);
			} );

			it( 'should remove the attribute element when removing all styles and no other classes or attributes are present', () => {
				editor.setData( '<p><cite style="background-color:blue;color:red;font-size:10px;">foobar</cite></p>' );

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlStyles( 'cite', [ 'background-color', 'color', 'font-size' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph>foobar</paragraph>',
					attributes: {}
				} );

				expect( editor.getData() ).to.equal(
					'<p>foobar</p>'
				);
			} );

			it( 'should add new styles if there are other classes or attributes', () => {
				editor.setData(
					'<p><cite style="background-color:blue;color:red;" class="foo bar" data-foo="bar">foobar</cite></p>'
				);

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.setModelHtmlStyles( 'cite', {
					'font-size': '10px'
				}, model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								color: 'red',
								'font-size': '10px'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo bar" style="background-color:blue;color:red;font-size:10px;" data-foo="bar">foobar</cite></p>'
				);
			} );

			it( 'should remove some styles if there are other classes or attributes', () => {
				editor.setData(
					'<p><cite style="background-color:blue;color:red;font-size:10px;" class="foo bar" data-foo="bar">foobar</cite></p>'
				);

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlStyles( 'cite', [ 'color' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								'font-size': '10px'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo bar" style="background-color:blue;font-size:10px;" data-foo="bar">foobar</cite></p>'
				);
			} );

			it( 'should remove all styles if there are other classes or attributes', () => {
				editor.setData(
					'<p><cite style="background-color:blue;color:red;font-size:10px;" class="foo bar" data-foo="bar">foobar</cite></p>'
				);

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlStyles( 'cite', [ 'background-color', 'color', 'font-size' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ]
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo bar" data-foo="bar">foobar</cite></p>'
				);
			} );

			it( 'should add new classes if no attribute element is present', () => {
				setModelData( model, '<paragraph>[foobar]</paragraph>' );

				htmlSupport.addModelHtmlClass( 'cite', [ 'foo', 'bar' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							classes: [ 'foo', 'bar' ]
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo bar">foobar</cite></p>'
				);
			} );

			it( 'should add new classes to a collapsed selection', () => {
				setModelData( model, '<paragraph>foo[]bar</paragraph>' );

				htmlSupport.addModelHtmlClass( 'cite', [ 'foo', 'bar' ], model.document.selection );

				expect( getModelData( model ) ).to.deep.equal(
					'<paragraph>foo<$text htmlCite="{"classes":["foo","bar"]}">[]</$text>bar</paragraph>'
				);

				expect( editor.getData() ).to.equal(
					'<p>foobar</p>'
				);
			} );

			it( 'should remove classes from a collapsed selection', () => {
				setModelData( model, '<paragraph>foo[]bar</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'htmlCite', {
						classes: [ 'foo', 'bar' ]
					} );
				} );

				htmlSupport.removeModelHtmlClass( 'cite', 'bar', model.document.selection );

				expect( getModelData( model ) ).to.deep.equal(
					'<paragraph>foo<$text htmlCite="{"classes":["foo"]}">[]</$text>bar</paragraph>'
				);

				expect( editor.getData() ).to.equal(
					'<p>foobar</p>'
				);
			} );

			it( 'should remove all classes from a collapsed selection', () => {
				setModelData( model, '<paragraph>foo[]bar</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'htmlCite', {
						classes: [ 'foo', 'bar' ]
					} );
				} );

				htmlSupport.removeModelHtmlClass( 'cite', [ 'foo', 'bar' ], model.document.selection );

				expect( getModelData( model ) ).to.deep.equal(
					'<paragraph>foo[]bar</paragraph>'
				);

				expect( editor.getData() ).to.equal(
					'<p>foobar</p>'
				);
			} );

			it( 'should add new classes if no styles or other attributes are present', () => {
				setModelData( model, '<paragraph>[<$text>foobar</$text>]</paragraph>' );

				htmlSupport.addModelHtmlClass( 'cite', [ 'foo', 'bar' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							classes: [ 'foo', 'bar' ]
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo bar">foobar</cite></p>'
				);
			} );

			it( 'should update existing classes if no styles or other attributes are present', () => {
				editor.setData( '<p><cite class="foo">foobar</cite></p>' );

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.addModelHtmlClass( 'cite', 'bar', model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							classes: [ 'foo', 'bar' ]
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo bar">foobar</cite></p>'
				);
			} );

			it( 'should remove some classes if no styles or other attributes are present', () => {
				editor.setData( '<p><cite class="foo bar baz">foobar</cite></p>' );

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlClass( 'cite', 'bar', model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							classes: [ 'foo', 'baz' ]
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo baz">foobar</cite></p>'
				);
			} );

			it( 'should remove the attribute element when removing all classes and no other styles or attributes are present', () => {
				editor.setData( '<p><cite class="foo bar">foobar</cite></p>' );

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlClass( 'cite', [ 'foo', 'bar' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph>foobar</paragraph>',
					attributes: {}
				} );

				expect( editor.getData() ).to.equal(
					'<p>foobar</p>'
				);
			} );

			it( 'should add new classes if there are other styles or attributes', () => {
				editor.setData(
					'<p><cite style="background-color:blue;color:red;" class="foo bar" data-foo="bar">foobar</cite></p>'
				);

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.addModelHtmlClass( 'cite', [ 'baz' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar', 'baz' ],
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo bar baz" style="background-color:blue;color:red;" data-foo="bar">foobar</cite></p>'
				);
			} );

			it( 'should remove some classes if there are other styles or attributes', () => {
				editor.setData(
					'<p><cite style="background-color:blue;font-size:10px;" class="foo bar" data-foo="bar">foobar</cite></p>'
				);

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlClass( 'cite', [ 'bar' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo' ],
							styles: {
								'background-color': 'blue',
								'font-size': '10px'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo" style="background-color:blue;font-size:10px;" data-foo="bar">foobar</cite></p>'
				);
			} );

			it( 'should remove all classes if there are other styles or attributes', () => {
				editor.setData(
					'<p><cite style="background-color:blue;color:red;font-size:10px;" class="foo bar" data-foo="bar">foobar</cite></p>'
				);

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlClass( 'cite', [ 'foo', 'bar' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							styles: {
								'background-color': 'blue',
								color: 'red',
								'font-size': '10px'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite style="background-color:blue;color:red;font-size:10px;" data-foo="bar">foobar</cite></p>'
				);
			} );

			it( 'should add new attributes if no attribute element is present', () => {
				setModelData( model, '<paragraph>[foobar]</paragraph>' );

				htmlSupport.setModelHtmlAttributes( 'cite', {
					'data-foo': 'bar',
					'data-bar': 'baz'
				}, model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar',
								'data-bar': 'baz'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite data-foo="bar" data-bar="baz">foobar</cite></p>'
				);
			} );

			it( 'should add new attributes if no classes or styles are present', () => {
				setModelData( model, '<paragraph>[<$text>foobar</$text>]</paragraph>' );

				htmlSupport.setModelHtmlAttributes( 'cite', {
					'data-foo': 'bar',
					'data-bar': 'baz'
				}, model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar',
								'data-bar': 'baz'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite data-foo="bar" data-bar="baz">foobar</cite></p>'
				);
			} );

			it( 'should update existing attributes if no classes or styles are present', () => {
				editor.setData( '<p><cite data-foo="bar">foobar</cite></p>' );

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.setModelHtmlAttributes( 'cite', {
					'data-foo': 'bar baz'
				}, model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar baz'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite data-foo="bar baz">foobar</cite></p>'
				);
			} );

			it( 'should remove some attributes if no classes or styles are present', () => {
				editor.setData( '<p><cite data-foo="bar" data-bar="baz">foobar</cite></p>' );

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlAttributes( 'cite', [ 'data-bar' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite data-foo="bar">foobar</cite></p>'
				);
			} );

			it( 'should remove the attribute element when removing all attributes and no other classes or styles are present', () => {
				editor.setData( '<p><cite data-foo="bar" data-bar="baz">foobar</cite></p>' );

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlAttributes( 'cite', [ 'data-foo', 'data-bar' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph>foobar</paragraph>',
					attributes: {}
				} );

				expect( editor.getData() ).to.equal(
					'<p>foobar</p>'
				);
			} );

			it( 'should add new attributes if there are other classes or styles', () => {
				editor.setData(
					'<p><cite style="background-color:blue;color:red;" class="foo bar" data-foo="bar">foobar</cite></p>'
				);

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.setModelHtmlAttributes( 'cite', {
					'data-bar': 'baz'
				}, model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar',
								'data-bar': 'baz'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">foobar</cite></p>'
				);
			} );

			it( 'should remove some attributes if there are other classes or styles', () => {
				editor.setData(
					'<p><cite style="background-color:blue;color:red;" class="foo bar" data-foo="bar" data-bar="baz">foobar</cite></p>'
				);

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlAttributes( 'cite', [ 'data-bar' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo bar" style="background-color:blue;color:red;" data-foo="bar">foobar</cite></p>'
				);
			} );

			it( 'should remove all attributes if there are other classes or styles', () => {
				editor.setData(
					'<p><cite style="background-color:blue;font-size:10px;" class="foo bar" data-foo="bar">foobar</cite></p>'
				);

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
				} );

				htmlSupport.removeModelHtmlAttributes( 'cite', [ 'data-foo' ], model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
					attributes: {
						1: {
							classes: [ 'foo', 'bar' ],
							styles: {
								'background-color': 'blue',
								'font-size': '10px'
							}
						}
					}
				} );

				expect( editor.getData() ).to.equal(
					'<p><cite class="foo bar" style="background-color:blue;font-size:10px;">foobar</cite></p>'
				);
			} );

			it( 'should not add new styles if the attribute is forbidden', () => {
				setModelData( model, '<paragraph>[foobar]</paragraph>' );

				model.schema.addAttributeCheck( ( context, attributeName ) => {
					if ( attributeName == 'htmlCite' ) {
						return false;
					}
				} );

				htmlSupport.setModelHtmlStyles( 'cite', {
					'background-color': 'blue',
					color: 'red'
				}, root.getChild( 0 ).getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph>foobar</paragraph>',
					attributes: {}
				} );

				expect( editor.getData() ).to.equal(
					'<p>foobar</p>'
				);
			} );

			it( 'should not add new styles if the attribute is forbidden (collapsed selection)', () => {
				setModelData( model, '<paragraph>foo[]bar</paragraph>' );

				model.schema.addAttributeCheck( ( context, attributeName ) => {
					if ( attributeName == 'htmlCite' ) {
						return false;
					}
				} );

				htmlSupport.setModelHtmlStyles( 'cite', {
					'background-color': 'blue',
					color: 'red'
				}, model.document.selection );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<paragraph>foobar</paragraph>',
					attributes: {}
				} );

				expect( editor.getData() ).to.equal(
					'<p>foobar</p>'
				);
			} );

			describe( 'on ranges', () => {
				beforeEach( () => {
					root = model.document.getRoot();

					dataFilter.allowElement( 'cite' );
					dataFilter.allowAttributes( { name: 'cite', styles: true } );
					dataFilter.allowAttributes( { name: 'cite', classes: true } );
					dataFilter.allowAttributes( { name: 'cite', attributes: true } );
				} );

				it( 'should add new classes', () => {
					editor.setData( '<p>foobar</p>' );

					htmlSupport.addModelHtmlClass( 'cite', [ 'foo', 'bar' ], model.createRange(
						model.createPositionAt( root.getChild( 0 ), 1 ),
						model.createPositionAt( root.getChild( 0 ), 4 )
					) );

					expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
						data: '<paragraph>f<$text htmlCite="(1)">oob</$text>ar</paragraph>',
						attributes: {
							1: {
								classes: [ 'foo', 'bar' ]
							}
						}
					} );

					expect( editor.getData() ).to.equal(
						'<p>f<cite class="foo bar">oob</cite>ar</p>'
					);
				} );

				it( 'should remove classes', () => {
					editor.setData( '<p><cite class="foo">foobar</cite></p>' );

					htmlSupport.removeModelHtmlClass( 'cite', 'foo', model.createRange(
						model.createPositionAt( root.getChild( 0 ), 1 ),
						model.createPositionAt( root.getChild( 0 ), 6 )
					) );

					expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
						data: '<paragraph><$text htmlCite="(1)">f</$text>oobar</paragraph>',
						attributes: {
							1: {
								classes: [ 'foo' ]
							}
						}
					} );

					expect( editor.getData() ).to.equal(
						'<p><cite class="foo">f</cite>oobar</p>'
					);
				} );
			} );
		} );
	} );

	it( 'should correctly resolve attributes nesting order', () => {
		dataFilter.allowElement( 'span' );
		dataFilter.allowAttributes( { name: 'span', styles: { 'font-weight': /[\s\S]+/ } } );

		editor.setData( '<p><span style="font-weight:700;"><span style="font-weight:400;">foobar</span></span>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<paragraph><$text htmlSpan="(1)">foobar</$text></paragraph>',
			attributes: {
				1: {
					styles: { 'font-weight': '400' }
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<p><span style="font-weight:400;">foobar</span></p>' );
	} );

	it( 'should allow using attributes by other features', () => {
		dataFilter.allowElement( 'span' );
		dataFilter.allowAttributes( { name: 'span', styles: { 'color': /[\s\S]+/, 'font-size': /[\s\S]+/ } } );

		editor.setData( '<p><span style="color:blue;font-size:30px;">foobar</span></p>' );

		// Font feature should take over color CSS property.
		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<paragraph><$text fontColor="blue" htmlSpan="(1)">foobar</$text></paragraph>',
			attributes: {
				1: {
					styles: { 'font-size': '30px' }
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<p><span style="color:blue;"><span style="font-size:30px;">foobar</span></span></p>' );
	} );

	describe( 'existing features', () => {
		it( 'should allow additional attributes', () => {
			dataFilter.allowElement( 'p' );
			dataFilter.allowAttributes( { name: 'p', attributes: { 'data-foo': 'foo' } } );

			editor.setData( '<p data-foo="foo">foo</p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph htmlAttributes="(1)">foo</paragraph>',
				attributes: {
					1: {
						attributes: { 'data-foo': 'foo' }
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p data-foo="foo">foo</p>' );
		} );

		it( 'should allow additional attributes (classes)', () => {
			dataFilter.allowElement( 'p' );
			dataFilter.allowAttributes( { name: 'p', classes: /[\s\S]+/ } );

			editor.setData( '<p class="foo">foo</p><p class="bar">bar</p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph htmlAttributes="(1)">foo</paragraph><paragraph htmlAttributes="(2)">bar</paragraph>',
				attributes: {
					1: {
						classes: [ 'foo' ]
					},
					2: {
						classes: [ 'bar' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p class="foo">foo</p><p class="bar">bar</p>' );
		} );

		it( 'should allow additional attributes (styles)', () => {
			dataFilter.allowElement( 'p' );
			dataFilter.allowAttributes( { name: 'p', styles: { 'color': /[\s\S]+/ } } );

			editor.setData( '<p style="color:red;">foo</p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph htmlAttributes="(1)">foo</paragraph>',
				attributes: {
					1: {
						styles: { color: 'red' }
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p style="color:red;">foo</p>' );
		} );

		it( 'should disallow attributes', () => {
			dataFilter.allowElement( 'p' );
			dataFilter.allowAttributes( { name: 'p', attributes: { 'data-foo': /[\s\S]+/ } } );
			dataFilter.disallowAttributes( { name: 'p', attributes: { 'data-foo': 'bar' } } );

			editor.setData( '<p data-foo="foo">foo</p><p data-foo="bar">bar</p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph htmlAttributes="(1)">foo</paragraph><paragraph>bar</paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p data-foo="foo">foo</p><p>bar</p>' );
		} );

		it( 'should disallow attributes (styles)', () => {
			dataFilter.allowElement( 'p' );
			dataFilter.allowAttributes( { name: 'p', styles: { color: /[\s\S]+/ } } );
			dataFilter.disallowAttributes( { name: 'p', styles: { color: 'red' } } );

			editor.setData( '<p style="color:blue;">foo</p><p style="color:red">bar</p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph htmlAttributes="(1)">foo</paragraph><paragraph>bar</paragraph>',
				attributes: {
					1: {
						styles: {
							color: 'blue'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p style="color:blue;">foo</p><p>bar</p>' );
		} );

		it( 'should disallow attributes (classes)', () => {
			dataFilter.allowElement( 'p' );
			dataFilter.allowAttributes( { name: 'p', classes: [ 'foo', 'bar' ] } );
			dataFilter.disallowAttributes( { name: 'p', classes: [ 'bar' ] } );

			editor.setData( '<p class="foo bar">foo</p><p class="bar">bar</p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph htmlAttributes="(1)">foo</paragraph><paragraph>bar</paragraph>',
				attributes: {
					1: {
						classes: [ 'foo' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p class="foo">foo</p><p>bar</p>' );
		} );

		it( 'should preserve partially consumed attributes by other features', () => {
			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:span', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { attributes: [ 'data-foo' ] } );
				} );
			} );

			dataFilter.allowElement( 'span' );
			dataFilter.allowAttributes( { name: 'span', attributes: true } );

			editor.setData( '<p><span data-foo data-bar>foobar</span></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlSpan="(1)">foobar</$text></paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-bar': ''
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><span data-bar="">foobar</span></p>' );
		} );
	} );

	it( 'should preserve attributes not used by other features', () => {
		dataFilter.allowElement( 'span' );
		dataFilter.allowAttributes( { name: 'span', styles: { 'color': /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: 'span', classes: [ 'foo', 'bar' ] } );

		editor.setData( '<p><span style="color:blue;" class="foo bar">foobar</span></p>' );

		// Font feature should take over color CSS property.
		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<paragraph><$text fontColor="blue" htmlSpan="(1)">foobar</$text></paragraph>',
			attributes: {
				1: {
					classes: [ 'foo', 'bar' ]
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<p><span style="color:blue;"><span class="foo bar">foobar</span></span></p>' );
	} );

	it( 'should throw error if definition has no specified element type', () => {
		const definition = {
			view: 'xyz',
			model: 'htmlXyz'
		};

		sinon.stub( dataSchema, 'getDefinitionsForView' ).returns( new Set( [ definition ] ) );

		expectToThrowCKEditorError( () => {
			dataFilter.allowElement( 'xyz' );

			// Apply filtering rules added after initial data load.
			editor.setData( '' );
		}, /data-filter-invalid-definition/, null, definition );
	} );

	it( 'should handle expanded styles by matcher', () => {
		editor.data.addStyleProcessorRules( addBackgroundRules );

		dataFilter.allowElement( 'p' );
		dataFilter.allowAttributes( { name: 'p', styles: true } );

		editor.setData( '<p style="background:red;">foobar</p>' );

		expect( editor.getData() ).to.equal( '<p style="background-color:red;">foobar</p>' );
	} );

	describe( 'attribute coupling', () => {
		it( 'should remove GHS attribute for the same range as a coupled feature attribute was removed', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^.*$/,
				styles: true,
				attributes: true,
				classes: true
			} ] );

			editor.setData( '<p><a href="foo" class="bar">foobar</a></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlA="(1)" linkHref="foo">foobar</$text></paragraph>',
				attributes: {
					1: {
						classes: [ 'bar' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><a class="bar" href="foo">foobar</a></p>' );

			model.change( writer => {
				const root = model.document.getRoot();
				const range = model.createRange(
					model.createPositionAt( root.getChild( 0 ), 3 ),
					model.createPositionAt( root.getChild( 0 ), 'end' )
				);

				writer.removeAttribute( 'linkHref', range );
			} );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlA="(1)" linkHref="foo">foo</$text>bar</paragraph>',
				attributes: {
					1: {
						classes: [ 'bar' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><a class="bar" href="foo">foo</a>bar</p>' );
		} );

		it( 'should not remove other GHS attribute when other coupled one is removed', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^.*$/,
				styles: true,
				attributes: true,
				classes: true
			} ] );

			editor.setData( '<p><span style="color:red;text-transform:uppercase;"><strong>foobar</strong></span></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text fontColor="red" htmlSpan="(1)" htmlStrong="(2)">foobar</$text></paragraph>',
				attributes: {
					1: {
						styles: {
							'text-transform': 'uppercase'
						}
					},
					2: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p><span style="color:red;"><span style="text-transform:uppercase;"><strong>foobar</strong></span></span></p>'
			);

			model.change( writer => {
				const root = model.document.getRoot();
				const range = model.createRange(
					model.createPositionAt( root.getChild( 0 ), 0 ),
					model.createPositionAt( root.getChild( 0 ), 3 )
				);

				writer.removeAttribute( 'fontColor', range );
			} );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph>' +
						'<$text htmlSpan="(1)" htmlStrong="(2)">foo</$text>' +
						'<$text fontColor="red" htmlSpan="(3)" htmlStrong="(4)">bar</$text>' +
					'</paragraph>',
				attributes: {
					1: {
						styles: {
							'text-transform': 'uppercase'
						}
					},
					2: {},
					3: {
						styles: {
							'text-transform': 'uppercase'
						}
					},
					4: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span style="text-transform:uppercase;"><strong>foo</strong></span>' +
					'<span style="color:red;"><span style="text-transform:uppercase;"><strong>bar</strong></span></span>' +
				'</p>'
			);
		} );
	} );

	describe( 'loadAllowedConfig', () => {
		it( 'should allow match all elements by omitting pattern name', () => {
			dataSchema.registerBlockElement( {
				model: 'htmlXyz',
				view: 'xyz',
				modelSchema: {
					inheritAllFrom: '$block'
				}
			} );

			const config = [ {} ];

			dataFilter.loadAllowedConfig( config );

			editor.setData( '<xyz>foobar</xyz>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<htmlXyz>foobar</htmlXyz>' );
			expect( editor.getData() ).to.equal( '<xyz>foobar</xyz>' );
		} );

		it( 'should load config and match whenever a single match has been found', () => {
			const config = [
				{
					name: 'span',
					styles: { color: true },
					classes: [ 'foo', 'bar', 'test' ],
					attributes: [ { key: /^data-foo.*$/, value: true } ]
				}
			];

			dataFilter.loadAllowedConfig( config );

			editor.setData(
				'<p>' +
					'<span style="line-height: 1em; font-weight:400" class="foo bar">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaa</$text>' +
						'<$text htmlSpan="(2)">bbb</$text>' +
						'<$text htmlSpan="(3)">ccc</$text>' +
					'</paragraph>',
				attributes: {
					1: {
						classes: [ 'foo', 'bar' ]
					},
					2: {
						attributes: {
							'data-foo': 'foo data'
						}
					},
					3: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span class="foo bar">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span>ccc</span>' +
				'</p>'
			);
		} );

		it( 'should match all values - across styles, classes and attributes', () => {
			// Sanity check test for splitting patterns that are not objects nor arrays.

			const config = [
				{
					name: 'span',
					styles: true,
					classes: true,
					attributes: true
				}
			];

			dataFilter.loadAllowedConfig( config );

			editor.setData(
				'<p>' +
					'<span style="line-height: 1em; font-weight:400" class="foo bar">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaa</$text>' +
						'<$text htmlSpan="(2)">bbb</$text>' +
						'<$text htmlSpan="(3)">ccc</$text>' +
					'</paragraph>',
				attributes: {
					1: {
						classes: [
							'foo',
							'bar'
						],
						styles: {
							'font-weight': '400',
							'line-height': '1em'
						}
					},
					2: {
						attributes: {
							'data-foo': 'foo data'
						}
					},
					3: {
						attributes: {
							'data-bar': 'bar data'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span class="foo bar" style="font-weight:400;line-height:1em;">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);
		} );

		it( 'should match all values - array of values', () => {
			const config = [
				{
					name: 'span',
					classes: [ 'foo', 'bar' ]
				}
			];

			dataFilter.loadAllowedConfig( config );

			editor.setData(
				'<p>' +
					'<span class="foo bar">aaa</span>' +
					'<span class="foo">bbb</span>' +
					'<span class="bar">ccc</span>' +
					'<span class="bar baz">ddd</span>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaa</$text>' +
						'<$text htmlSpan="(2)">bbb</$text>' +
						'<$text htmlSpan="(3)">cccddd</$text>' +
					'</paragraph>',
				attributes: {
					1: {
						classes: [ 'foo', 'bar' ]
					},
					2: {
						classes: [ 'foo' ]
					},
					3: {
						classes: [ 'bar' ]
					},
					4: {
						classes: [ 'bar' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span class="foo bar">aaa</span>' +
					'<span class="foo">bbb</span>' +
					'<span class="bar">cccddd</span>' +
				'</p>'
			);
		} );

		it( 'should match all values - array of objects', () => {
			const config = [
				{
					name: 'span',
					styles: [
						{ key: 'position', value: true },
						{ key: 'visibility', value: true }
					]
				}
			];

			dataFilter.loadAllowedConfig( config );

			editor.setData(
				'<p>' +
					'<span style="position: absolute; visibility: hidden;">aaa</span>' +
					'<span style="position: absolute;">bbb</span>' +
					'<span style="visibility: hidden;">ccc</span>' +
					'<span style="visibility: hidden; margin-left: 1px;">ddd</span>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaa</$text>' +
						'<$text htmlSpan="(2)">bbb</$text>' +
						'<$text htmlSpan="(3)">cccddd</$text>' +
					'</paragraph>',
				attributes: {
					1: {
						styles: {
							position: 'absolute',
							visibility: 'hidden'
						}
					},
					2: {
						styles: {
							position: 'absolute'
						}
					},
					3: {
						styles: {
							visibility: 'hidden'
						}
					},
					4: {
						styles: {
							visibility: 'hidden'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span style="position:absolute;visibility:hidden;">aaa</span>' +
					'<span style="position:absolute;">bbb</span>' +
					'<span style="visibility:hidden;">cccddd</span>' +
				'</p>'
			);
		} );

		it( 'should match all values - object', () => {
			const config = [
				{
					name: 'span',
					styles: {
						position: true,
						visibility: true
					}
				}
			];

			dataFilter.loadAllowedConfig( config );

			editor.setData(
				'<p>' +
					'<span style="position: absolute; visibility: hidden;">aaa</span>' +
					'<span style="position: absolute;">bbb</span>' +
					'<span style="visibility: hidden;">ccc</span>' +
					'<span style="visibility: hidden; margin-left: 1px;">ddd</span>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaa</$text>' +
						'<$text htmlSpan="(2)">bbb</$text>' +
						'<$text htmlSpan="(3)">cccddd</$text>' +
					'</paragraph>',
				attributes: {
					1: {
						styles: {
							position: 'absolute',
							visibility: 'hidden'
						}
					},
					2: {
						styles: {
							position: 'absolute'
						}
					},
					3: {
						styles: {
							visibility: 'hidden'
						}
					},
					4: {
						styles: {
							visibility: 'hidden'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span style="position:absolute;visibility:hidden;">aaa</span>' +
					'<span style="position:absolute;">bbb</span>' +
					'<span style="visibility:hidden;">cccddd</span>' +
				'</p>'
			);
		} );

		it( 'should match attributes', () => {
			const config = [
				{
					name: 'span',
					attributes: [ { key: /^data-foo.*$/, value: true } ]
				}
			];

			dataFilter.loadAllowedConfig( config );

			editor.setData(
				'<p>' +
					'<span style="line-height: 1em; font-weight:400" class="foo bar">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaa</$text>' +
						'<$text htmlSpan="(2)">bbb</$text>' +
						'<$text htmlSpan="(3)">ccc</$text>' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {
						attributes: {
							'data-foo': 'foo data'
						}
					},
					3: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span>aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span>ccc</span>' +
				'</p>'
			);
		} );

		it( 'should match classes', () => {
			const config = [
				{
					name: 'span',
					classes: [ 'foo', 'bar', 'test' ]
				}
			];

			dataFilter.loadAllowedConfig( config );

			editor.setData(
				'<p>' +
					'<span style="line-height: 1em; font-weight:400" class="foo bar">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaa</$text>' +
						'<$text htmlSpan="(2)">bbbccc</$text>' +
					'</paragraph>',
				attributes: {
					1: {
						classes: [ 'foo', 'bar' ]
					},
					2: {},
					3: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span class="foo bar">aaa</span>' +
					'<span>bbbccc</span>' +
				'</p>'
			);
		} );

		it( 'should match styles', () => {
			const config = [
				{
					name: 'span',
					styles: { 'line-height': true }
				}
			];

			dataFilter.loadAllowedConfig( config );

			editor.setData(
				'<p>' +
					'<span style="line-height: 1em; font-weight:400" class="foo bar">aaa</span>' +
					'<span style="font-weight: 400;">bbb</span>' +
					'<span style="line-height: 2em;">ccc</span>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaa</$text>' +
						'<$text htmlSpan="(2)">bbb</$text>' +
						'<$text htmlSpan="(3)">ccc</$text>' +
					'</paragraph>',
				attributes: {
					1: {
						styles: {
							'line-height': '1em'
						}
					},
					2: {},
					3: {
						styles: {
							'line-height': '2em'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span style="line-height:1em;">aaa</span>' +
					'<span>bbb</span>' +
					'<span style="line-height:2em;">ccc</span>' +
				'</p>'
			);
		} );
	} );

	describe( 'loadDisallowedConfig', () => {
		it( 'should load config and match whenever a single match has been found', () => {
			const config = [
				{
					name: 'span',
					styles: { color: true },
					classes: [ 'foo', 'bar', 'test' ],
					attributes: [ { key: /^data-foo.*$/, value: true } ]
				}
			];

			// First, allow all the elements matching config.
			dataFilter.loadAllowedConfig( config );

			// Then, disallow and verify it's actually working.
			dataFilter.loadDisallowedConfig( config );

			editor.setData(
				'<p>' +
					'<span style="line-height: 1em; font-weight:400" class="foo bar">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaabbbccc</$text>' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {},
					3: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span>aaabbbccc</span>' +
				'</p>'
			);
		} );

		it( 'should match all values', () => {
			// Sanity check test for splitting patterns that are not objects nor arrays.

			const config = [
				{
					name: 'span',
					styles: true,
					classes: true,
					attributes: true
				}
			];

			// First, allow all the elements matching config.
			dataFilter.loadAllowedConfig( config );

			// Then, disallow and verify it's actually working.
			dataFilter.loadDisallowedConfig( config );

			editor.setData(
				'<p>' +
					'<span style="line-height: 1em; font-weight:400" class="foo bar">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaabbbccc</$text>' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {},
					3: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span>aaabbbccc</span>' +
				'</p>'
			);
		} );

		it( 'should match attributes', () => {
			const config = [
				{
					name: 'span',
					attributes: [ { key: /^data-foo.*$/, value: true } ]
				}
			];

			// First, allow all the elements matching config.
			dataFilter.loadAllowedConfig( config );

			// Then, disallow and verify it's actually working.
			dataFilter.loadDisallowedConfig( config );

			editor.setData(
				'<p>' +
					'<span style="line-height: 1em; font-weight:400" class="foo bar">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaabbbccc</$text>' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {},
					3: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span>aaabbbccc</span>' +
				'</p>'
			);
		} );

		it( 'should match attributes on any element', () => {
			// First, allow all the elements matching config.
			dataFilter.loadAllowedConfig( [
				{
					name: /.*/,
					attributes: true
				}
			] );

			// Then, disallow and verify it's actually working.
			dataFilter.loadDisallowedConfig( [
				{
					attributes: [ { key: /^data-foo.*$/, value: true } ]
				}
			] );

			editor.setData(
				'<p>' +
					'<span data-foo="foo data">aaa</span>' +
					'<span data-bar="bar data">bbb</span>' +
				'</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlSpan="(1)">aaa</$text><$text htmlSpan="(2)">bbb</$text></paragraph>',
				attributes: {
					1: {},
					2: {
						attributes: {
							'data-bar': 'bar data'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span>aaa</span>' +
					'<span data-bar="bar data">bbb</span>' +
				'</p>'
			);
		} );

		it( 'should match classes', () => {
			const allowedConfig = [
				{
					name: 'span',
					attributes: /^data-.*$/,
					// Allow it to really verify that the disallowing works.
					classes: [ 'foo', 'bar', 'test' ]
				}
			];
			const disallowedConfig = [
				{
					name: 'span',
					classes: [ 'foo', 'bar', 'test' ]
				}
			];

			dataFilter.loadAllowedConfig( allowedConfig );
			dataFilter.loadDisallowedConfig( disallowedConfig );

			editor.setData(
				'<p>' +
					'<span style="line-height: 1em; font-weight:400" class="foo bar">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaa</$text>' +
						'<$text htmlSpan="(2)">bbb</$text>' +
						'<$text htmlSpan="(3)">ccc</$text>' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {
						attributes: {
							'data-foo': 'foo data'
						}
					},
					3: {
						attributes: {
							'data-bar': 'bar data'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span>aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);
		} );

		it( 'should match styles', () => {
			const allowedConfig = [
				{
					name: 'span',
					attributes: true,
					// Allow it to really verify that the disallowing works.
					styles: { 'line-height': true }
				}
			];
			const disallowedConfig = [
				{
					name: 'span',
					styles: { 'line-height': true }
				}
			];

			// First, allow all the elements matching config.
			dataFilter.loadAllowedConfig( allowedConfig );

			// Then, disallow and verify it's actually working.
			dataFilter.loadDisallowedConfig( disallowedConfig );

			editor.setData(
				'<p>' +
					'<span style="line-height:1em;">aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
						'<$text htmlSpan="(1)">aaa</$text>' +
						'<$text htmlSpan="(2)">bbb</$text>' +
						'<$text htmlSpan="(3)">ccc</$text>' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {
						attributes: {
							'data-foo': 'foo data'
						}
					},
					3: {
						attributes: {
							'data-bar': 'bar data'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span>aaa</span>' +
					'<span data-foo="foo data">bbb</span>' +
					'<span data-bar="bar data">ccc</span>' +
				'</p>'
			);
		} );

		it( 'should match disallowed block element', () => {
			// First, allow all the elements matching config.
			dataFilter.loadAllowedConfig( [
				{
					name: /.*/,
					styles: true,
					classes: true,
					attributes: true
				}
			] );

			// Then, disallow and verify it's actually working.
			dataFilter.loadDisallowedConfig( [
				{
					name: 'div'
				}
			] );

			editor.setData(
				'<p>foo</p>' +
				'<div>bar</div>' +
				'<p>baz</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph>foo</paragraph>' +
					'<paragraph>bar</paragraph>' +
					'<paragraph>baz</paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<p>foo</p>' +
				'<p>bar</p>' +
				'<p>baz</p>'
			);
		} );

		it( 'should match disallowed inline element', () => {
			// First, allow all the elements matching config.
			dataFilter.loadAllowedConfig( [
				{
					name: /.*/,
					styles: true,
					classes: true,
					attributes: true
				}
			] );

			// Then, disallow and verify it's actually working.
			dataFilter.loadDisallowedConfig( [
				{
					name: 'abbr'
				}
			] );

			editor.setData(
				'<p>foo <abbr>bar</abbr> baz</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>foo bar baz</paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<p>foo bar baz</p>'
			);
		} );

		it( 'should match disallowed object element', () => {
			// First, allow all the elements matching config.
			dataFilter.loadAllowedConfig( [
				{
					name: /.*/,
					styles: true,
					classes: true,
					attributes: true
				}
			] );

			// Then, disallow and verify it's actually working.
			dataFilter.loadDisallowedConfig( [
				{
					name: 'button'
				}
			] );

			editor.setData(
				'<p>foo <button>bar</button> baz</p>'
			);

			// Font feature should take over color CSS property.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>foo bar baz</paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<p>foo bar baz</p>'
			);
		} );
	} );
} );
