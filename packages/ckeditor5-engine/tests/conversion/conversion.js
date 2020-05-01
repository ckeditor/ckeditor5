/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Conversion from '../../src/conversion/conversion';

import UpcastDispatcher from '../../src/conversion/upcastdispatcher';

import UpcastHelpers, { convertText, convertToModelFragment } from '../../src/conversion/upcasthelpers';
import DowncastHelpers from '../../src/conversion/downcasthelpers';

import EditingController from '../../src/controller/editingcontroller';

import Model from '../../src/model/model';

import { parse as viewParse, stringify as viewStringify } from '../../src/dev-utils/view';
import { stringify as modelStringify } from '../../src/dev-utils/model';
import ConversionHelpers from '../../src/conversion/conversionhelpers';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'Conversion', () => {
	let conversion, downcastDispA, upcastDispaA, downcastDispB;

	beforeEach( () => {
		// Placeholders. Will be used only to see if their were given as attribute for a spy function.
		downcastDispA = Symbol( 'downA' );
		downcastDispB = Symbol( 'downB' );

		upcastDispaA = Symbol( 'upA' );

		conversion = new Conversion( [ downcastDispA, downcastDispB ], [ upcastDispaA ] );
	} );

	describe( 'addAlias()', () => {
		it( 'should throw when trying to use same group name twice', () => {
			expectToThrowCKEditorError( () => {
				conversion.addAlias( 'upcast', upcastDispaA );
			}, /conversion-group-exists/ );
		} );

		it( 'should throw when trying to add not registered dispatcher', () => {
			expectToThrowCKEditorError( () => {
				conversion.addAlias( 'foo', {} );
			}, /conversion-add-alias-dispatcher-not-registered/ );
		} );
	} );

	describe( 'for()', () => {
		it( 'should return ConversionHelpers', () => {
			expect( conversion.for( 'upcast' ) ).to.be.instanceof( ConversionHelpers );
			expect( conversion.for( 'downcast' ) ).to.be.instanceof( ConversionHelpers );
		} );

		it( 'should throw if non-existing group name has been used', () => {
			expectToThrowCKEditorError( () => {
				conversion.for( 'foo' );
			}, /conversion-for-unknown-group/ );
		} );

		it( 'should return proper helpers for group', () => {
			expect( conversion.for( 'upcast' ) ).to.be.instanceof( UpcastHelpers );

			conversion.addAlias( 'foo', upcastDispaA );
			expect( conversion.for( 'foo' ) ).to.be.instanceof( UpcastHelpers );

			expect( conversion.for( 'downcast' ) ).to.be.instanceof( DowncastHelpers );

			conversion.addAlias( 'bar', downcastDispB );
			expect( conversion.for( 'bar' ) ).to.be.instanceof( DowncastHelpers );
		} );
	} );

	describe( 'add()', () => {
		let helperA, helperB;

		beforeEach( () => {
			helperA = sinon.stub();
			helperB = sinon.stub();
		} );

		it( 'should be chainable', () => {
			const helpers = conversion.for( 'upcast' );
			const addResult = helpers.add( () => {} );

			expect( addResult ).to.equal( helpers );
		} );

		it( 'should fire given helper for every dispatcher in given group', () => {
			conversion.for( 'downcast' ).add( helperA );

			expect( helperA.calledWithExactly( downcastDispA ) ).to.be.true;
			expect( helperA.calledWithExactly( downcastDispB ) ).to.be.true;
			expect( helperA.calledWithExactly( upcastDispaA ) ).to.be.false;

			conversion.for( 'upcast' ).add( helperB );

			expect( helperB.calledWithExactly( downcastDispA ) ).to.be.false;
			expect( helperB.calledWithExactly( downcastDispB ) ).to.be.false;
			expect( helperB.calledWithExactly( upcastDispaA ) ).to.be.true;
		} );
	} );

	it( 'constructor() should be able to take singular objects instead of arrays', () => {
		const helperA = sinon.stub();
		const helperB = sinon.stub();

		conversion = new Conversion( downcastDispA, upcastDispaA );

		conversion.for( 'downcast' ).add( helperA );

		expect( helperA.calledWithExactly( downcastDispA ) ).to.be.true;

		conversion.for( 'upcast' ).add( helperB );

		expect( helperB.calledWithExactly( upcastDispaA ) ).to.be.true;
	} );

	describe( 'converters', () => {
		let viewDispatcher, model, schema, conversion, modelRoot, viewRoot;

		beforeEach( () => {
			model = new Model();
			const controller = new EditingController( model, new StylesProcessor() );

			const modelDoc = model.document;
			modelRoot = modelDoc.createRoot();

			viewRoot = controller.view.document.getRoot();
			// Set name of view root the same as dom root.
			// This is a mock of attaching view root to dom root.
			viewRoot._name = 'div';

			schema = model.schema;

			schema.extend( '$text', {
				allowIn: '$root',
				allowAttributes: [ 'bold' ]
			} );

			schema.register( 'paragraph', {
				inheritAllFrom: '$block'
			} );

			viewDispatcher = new UpcastDispatcher( model, { schema } );
			viewDispatcher.on( 'text', convertText() );
			viewDispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
			viewDispatcher.on( 'documentFragment', convertToModelFragment(), { priority: 'lowest' } );

			conversion = new Conversion( controller.downcastDispatcher, viewDispatcher );
		} );

		describe( 'elementToElement', () => {
			it( 'config.view is a string', () => {
				conversion.elementToElement( { model: 'paragraph', view: 'p' } );

				testConversion( '<p>Foo</p>', '<paragraph>Foo</paragraph>' );
			} );

			it( 'config.converterPriority is defined (override downcast)', () => {
				conversion.elementToElement( { model: 'paragraph', view: 'p' } );
				conversion.elementToElement( { model: 'paragraph', view: 'div', converterPriority: 'high' } );

				testConversion( '<div>Foo</div>', '<paragraph>Foo</paragraph>' );
				testConversion( '<p>Foo</p>', '<paragraph>Foo</paragraph>', '<div>Foo</div>' );
			} );

			it( 'config.converterPriority is defined (override upcast)', () => {
				schema.register( 'foo', {
					inheritAllFrom: '$block'
				} );
				conversion.elementToElement( { model: 'paragraph', view: 'p' } );
				conversion.elementToElement( { model: 'foo', view: 'p', converterPriority: 'high' } );

				testConversion( '<p>Foo</p>', '<foo>Foo</foo>', '<p>Foo</p>' );
			} );

			it( 'config.view is an object', () => {
				schema.register( 'fancyParagraph', {
					inheritAllFrom: 'paragraph'
				} );

				conversion.elementToElement( {
					model: 'fancyParagraph',
					view: {
						name: 'p',
						classes: 'fancy'
					}
				} );

				testConversion( '<p class="fancy">Foo</p>', '<fancyParagraph>Foo</fancyParagraph>' );
			} );

			it( 'config.view is an object with upcastAlso defined', () => {
				conversion.elementToElement( {
					model: 'paragraph',
					view: 'p',
					upcastAlso: [
						'div',
						{
							// Any element with `display: block` style.
							styles: {
								display: 'block'
							}
						}
					]
				} );

				testConversion( '<p>Foo</p>', '<paragraph>Foo</paragraph>' );
				testConversion( '<div>Foo</div>', '<paragraph>Foo</paragraph>', '<p>Foo</p>' );
				testConversion( '<span style="display:block">Foo</span>', '<paragraph>Foo</paragraph>', '<p>Foo</p>' );
			} );

			it( 'upcastAlso given as a function', () => {
				schema.register( 'heading', {
					inheritAllFrom: '$block'
				} );

				conversion.elementToElement( {
					model: 'heading',
					view: 'h2',
					upcastAlso: viewElement => {
						const fontSize = viewElement.getStyle( 'font-size' );

						if ( !fontSize ) {
							return null;
						}

						const match = fontSize.match( /(\d+)\s*px/ );

						if ( !match ) {
							return null;
						}

						const size = Number( match[ 1 ] );

						if ( size >= 26 ) {
							return { name: true, style: [ 'font-size' ] };
						}

						return null;
					}
				} );

				conversion.elementToElement( {
					model: 'paragraph',
					view: 'p'
				} );

				testConversion( '<p></p>', '<paragraph></paragraph>' );
				testConversion( '<p style="font-size:20px"></p>', '<paragraph></paragraph>', '<p></p>' );

				testConversion( '<h2></h2>', '<heading></heading>' );
				testConversion( '<p style="font-size:26px"></p>', '<heading></heading>', '<h2></h2>' );
			} );
		} );

		describe( 'attributeToElement', () => {
			beforeEach( () => {
				conversion.elementToElement( { model: 'paragraph', view: 'p' } );
			} );

			it( 'config.view is a string', () => {
				conversion.attributeToElement( { model: 'bold', view: 'strong' } );

				testConversion( '<p><strong>Foo</strong> bar</p>', '<paragraph><$text bold="true">Foo</$text> bar</paragraph>' );
			} );

			it( 'config.converterPriority is defined (override downcast)', () => {
				conversion.attributeToElement( { model: 'bold', view: 'strong' } );
				conversion.attributeToElement( { model: 'bold', view: 'b', converterPriority: 'high' } );

				testConversion( '<p><b>Foo</b></p>', '<paragraph><$text bold="true">Foo</$text></paragraph>' );
				testConversion(
					'<p><strong>Foo</strong></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>',
					'<p><b>Foo</b></p>'
				);
			} );

			it( 'config.converterPriority is defined (override upcast)', () => {
				schema.extend( '$text', {
					allowAttributes: [ 'foo' ]
				} );
				conversion.attributeToElement( { model: 'bold', view: 'strong' } );
				conversion.attributeToElement( { model: 'foo', view: 'strong', converterPriority: 'high' } );

				testConversion(
					'<p><strong>Foo</strong></p>',
					'<paragraph><$text foo="true">Foo</$text></paragraph>',
					'<p><strong>Foo</strong></p>'
				);
			} );

			it( 'config.view is an object', () => {
				conversion.attributeToElement( {
					model: 'bold',
					view: {
						name: 'span',
						classes: 'bold'
					}
				} );

				testConversion( '<p><span class="bold">Foo</span> bar</p>', '<paragraph><$text bold="true">Foo</$text> bar</paragraph>' );
			} );

			it( 'config.view is an object with upcastAlso defined', () => {
				schema.extend( '$text', {
					allowAttributes: [ 'bold', 'xBold' ]
				} );
				conversion.attributeToElement( {
					model: 'xBold',
					view: 'x-bold'
				} );

				conversion.attributeToElement( {
					model: 'bold',
					view: 'strong',
					upcastAlso: [
						'b',
						{
							name: 'span',
							classes: 'bold'
						},
						viewElement => {
							const fontWeight = viewElement.getStyle( 'font-weight' );

							if ( fontWeight == 'bold' || Number( fontWeight ) > 500 ) {
								return {
									styles: [ 'font-weight' ]
								};
							}
						},
						// Duplicates the `x-bold` from above to test if only one attribute would be converted.
						// It should not convert to both bold & x-bold.
						viewElement => viewElement.is( 'x-bold' ) ? { name: 'x-bold' } : null
					]
				} );

				testConversion(
					'<p><strong>Foo</strong></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>'
				);

				testConversion(
					'<p><b>Foo</b></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>',
					'<p><strong>Foo</strong></p>'
				);

				testConversion(
					'<p><span class="bold">Foo</span></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>',
					'<p><strong>Foo</strong></p>'
				);

				testConversion(
					'<p><span style="font-weight: bold;">Foo</span></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>',
					'<p><strong>Foo</strong></p>'
				);

				testConversion(
					'<p><span style="font-weight: 500;">Foo</span></p>',
					'<paragraph>Foo</paragraph>',
					'<p>Foo</p>'
				);

				testConversion(
					'<p><span style="font-weight: 600;">Foo</span></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>',
					'<p><strong>Foo</strong></p>'
				);

				testConversion(
					'<p style="font-weight: 600;">Foo</p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>',
					'<p><strong>Foo</strong></p>'
				);

				testConversion(
					'<p><x-bold style="font-wieght:bold">Foo</x-bold></p>',
					'<paragraph><$text xBold="true">Foo</$text></paragraph>',
					'<p><x-bold>Foo</x-bold></p>'
				);
			} );

			it( 'model attribute value is enumerable', () => {
				schema.extend( '$text', {
					allowAttributes: [ 'fontSize' ]
				} );

				conversion.attributeToElement( {
					model: {
						key: 'fontSize',
						values: [ 'big', 'small' ]
					},
					view: {
						big: {
							name: 'span',
							styles: {
								'font-size': '1.2em'
							}
						},
						small: {
							name: 'span',
							styles: {
								'font-size': '0.8em'
							}
						}
					},
					upcastAlso: {
						big: viewElement => {
							const fontSize = viewElement.getStyle( 'font-size' );

							if ( !fontSize ) {
								return null;
							}

							const match = fontSize.match( /(\d+)\s*px/ );

							if ( !match ) {
								return null;
							}

							const size = Number( match[ 1 ] );

							if ( viewElement.is( 'span' ) && size > 10 ) {
								return { name: true, style: [ 'font-size' ] };
							}

							return null;
						},
						small: viewElement => {
							const fontSize = viewElement.getStyle( 'font-size' );

							if ( !fontSize ) {
								return null;
							}

							const match = fontSize.match( /(\d+)\s*px/ );

							if ( !match ) {
								return null;
							}

							const size = Number( match[ 1 ] );

							if ( viewElement.is( 'span' ) && size < 10 ) {
								return { name: true, style: [ 'font-size' ] };
							}

							return null;
						}
					}
				} );

				testConversion(
					'<p><span style="font-size:1.2em">Foo</span> bar</p>',
					'<paragraph><$text fontSize="big">Foo</$text> bar</paragraph>'
				);

				testConversion(
					'<p><span style="font-size:12px">Foo</span> bar</p>',
					'<paragraph><$text fontSize="big">Foo</$text> bar</paragraph>',
					'<p><span style="font-size:1.2em">Foo</span> bar</p>'
				);

				testConversion(
					'<p><span style="font-size:0.8em">Foo</span> bar</p>',
					'<paragraph><$text fontSize="small">Foo</$text> bar</paragraph>'
				);

				testConversion(
					'<p><span style="font-size:8px">Foo</span> bar</p>',
					'<paragraph><$text fontSize="small">Foo</$text> bar</paragraph>',
					'<p><span style="font-size:0.8em">Foo</span> bar</p>'
				);

				testConversion(
					'<p><span style="font-size:10px">Foo</span> bar</p>',
					'<paragraph>Foo bar</paragraph>',
					'<p>Foo bar</p>'
				);
			} );

			it( 'config.model.name is given', () => {
				schema.extend( '$text', {
					allowAttributes: [ 'textDecoration' ]
				} );

				conversion.attributeToElement( {
					model: {
						key: 'textDecoration',
						values: [ 'underline', 'lineThrough' ],
						name: '$text'
					},
					view: {
						underline: {
							name: 'span',
							styles: {
								'text-decoration': 'underline'
							}
						},
						lineThrough: {
							name: 'span',
							styles: {
								'text-decoration': 'line-through'
							}
						}
					}
				} );

				testConversion(
					'<p><span style="text-decoration:underline">Foo</span></p>',
					'<paragraph><$text textDecoration="underline">Foo</$text></paragraph>'
				);

				testConversion(
					'<p><span style="text-decoration:line-through">Foo</span></p>',
					'<paragraph><$text textDecoration="lineThrough">Foo</$text></paragraph>'
				);

				testConversion(
					'<p><span style="text-decoration:underline">Foo</span></p>',
					'<paragraph><$text textDecoration="underline">Foo</$text></paragraph>'
				);
			} );
		} );

		describe( 'attributeToAttribute', () => {
			beforeEach( () => {
				conversion.elementToElement( { model: 'image', view: 'img' } );

				schema.register( 'image', {
					inheritAllFrom: '$block'
				} );
			} );

			it( 'config.view and config.model are strings', () => {
				schema.extend( 'image', {
					allowAttributes: [ 'source' ]
				} );

				conversion.attributeToAttribute( { model: 'source', view: 'src' } );

				testConversion( '<img src="foo.jpg"></img>', '<image source="foo.jpg"></image>' );
			} );

			it( 'config.view and config.model are objects', () => {
				schema.extend( 'image', {
					allowAttributes: [ 'aside' ]
				} );

				conversion.attributeToAttribute( {
					model: {
						name: 'image',
						key: 'aside',
						values: [ 'aside' ]
					},
					view: {
						aside: {
							name: 'img',
							key: 'class',
							value: [ 'aside', 'half-size' ]
						}
					}
				} );

				conversion.elementToElement( { model: 'paragraph', view: 'p' } );

				testConversion( '<img class="aside half-size"></img>', '<image aside="aside"></image>' );
				testConversion( '<p class="aside half-size"></p>', '<paragraph></paragraph>', '<p></p>' );
			} );

			it( 'config.view and config.model are objects - convert to style attribute', () => {
				schema.extend( 'image', {
					allowAttributes: [ 'aside' ]
				} );

				conversion.attributeToAttribute( {
					model: {
						name: 'image',
						key: 'aside',
						values: [ 'aside' ]
					},
					view: {
						aside: {
							name: 'img',
							key: 'style',
							value: {
								float: 'right',
								width: '50%',
								margin: '5px'
							}
						}
					}
				} );

				conversion.elementToElement( { model: 'paragraph', view: 'p' } );

				testConversion( '<img style="float:right;margin:5px;width:50%"></img>', '<image aside="aside"></image>' );
				testConversion( '<p style="float:right;margin:5px;width:50%"></p>', '<paragraph></paragraph>', '<p></p>' );
			} );

			it( 'config is an array with upcastAlso defined', () => {
				conversion.elementToElement( { model: 'paragraph', view: 'p' } );

				schema.extend( 'paragraph', {
					allowAttributes: [ 'align' ]
				} );

				conversion.attributeToAttribute( {
					model: {
						key: 'align',
						values: [ 'right', 'center' ]
					},
					view: {
						right: {
							key: 'class',
							value: 'align-right'
						},
						center: {
							key: 'class',
							value: 'align-center'
						}
					},
					upcastAlso: {
						right: {
							styles: {
								'text-align': 'right'
							}
						},
						center: {
							styles: {
								'text-align': 'center'
							}
						}
					}
				} );

				testConversion(
					'<p class="align-right">Foo</p>',
					'<paragraph align="right">Foo</paragraph>'
				);

				testConversion(
					'<p style="text-align:right">Foo</p>',
					'<paragraph align="right">Foo</paragraph>',
					'<p class="align-right">Foo</p>'
				);

				testConversion(
					'<p class="align-center">Foo</p>',
					'<paragraph align="center">Foo</paragraph>'
				);

				testConversion(
					'<p style="text-align:center">Foo</p>',
					'<paragraph align="center">Foo</paragraph>',
					'<p class="align-center">Foo</p>'
				);
			} );

			it( 'config.view and config.model have name and key set', () => {
				schema.extend( 'image', {
					allowAttributes: [ 'source' ]
				} );

				conversion.attributeToAttribute( {
					model: {
						name: 'image',
						key: 'source'
					},
					view: {
						name: 'img',
						key: 'src'
					}
				} );

				testConversion( '<img src="foo.jpg"></img>', '<image source="foo.jpg"></image>' );
			} );

			// #1443.
			it( 'should not set attributes on the element\'s children', () => {
				schema.register( 'div', {
					inheritAllFrom: '$root',
					allowWhere: '$block',
					isLimit: true,
					allowAttributes: [ 'border', 'shade' ]
				} );

				conversion.elementToElement(
					{ model: 'div', view: 'div' }
				);

				conversion.attributeToAttribute( { model: 'border', view: { key: 'class', value: 'border' } } );
				conversion.attributeToAttribute( { model: 'shade', view: { key: 'class', value: 'shade' } } );

				testConversion(
					'<div class="border"><div class="shade"></div></div>',
					'<div border="border"><div shade="shade"></div></div>'
				);
			} );

			it( 'config.converterPriority is defined (override downcast)', () => {
				schema.extend( 'image', {
					allowAttributes: [ 'foo' ]
				} );

				conversion.attributeToAttribute( { model: 'foo', view: 'foo' } );
				conversion.attributeToAttribute( { model: 'foo', view: 'foofoo', converterPriority: 'high' } );

				testConversion( '<img foo="foo"></img>', '<image foo="foo"></image>', '<img foofoo="foo"></img>' );
			} );
		} );

		function testConversion( input, expectedModel, expectedView = null ) {
			loadData( input );

			expect( modelStringify( model.document.getRoot() ) ).to.equal( expectedModel );
			expect( viewStringify( viewRoot, null, { ignoreRoot: true } ) ).to.equal( expectedView || input );
		}

		function loadData( input ) {
			const parsedView = viewParse( input );
			let convertedModel;

			model.change( writer => {
				convertedModel = viewDispatcher.convert( parsedView, writer );
			} );

			model.change( writer => {
				writer.remove( writer.createRange(
					writer.createPositionAt( modelRoot, 0 ),
					writer.createPositionAt( modelRoot, modelRoot.maxOffset ) )
				);
				writer.insert( convertedModel, modelRoot, 0 );
			} );
		}
	} );
} );
