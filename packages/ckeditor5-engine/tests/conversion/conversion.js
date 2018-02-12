/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Conversion from '../../src/conversion/conversion';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import UpcastDispatcher from '../../src/conversion/upcastdispatcher';

import { convertText, convertToModelFragment } from '../../src/conversion/upcast-converters';

import EditingController from '../../src/controller/editingcontroller';

import Model from '../../src/model/model';
import ModelRange from '../../src/model/range';

import { stringify as viewStringify, parse as viewParse } from '../../src/dev-utils/view';
import { stringify as modelStringify } from '../../src/dev-utils/model';

describe( 'Conversion', () => {
	let conversion, dispA, dispB;

	beforeEach( () => {
		conversion = new Conversion();

		// Placeholders. Will be used only to see if their were given as attribute for a spy function.
		dispA = Symbol( 'dispA' );
		dispB = Symbol( 'dispB' );

		conversion.register( 'ab', [ dispA, dispB ] );
		conversion.register( 'a', [ dispA ] );
		conversion.register( 'b', [ dispB ] );
	} );

	describe( 'register()', () => {
		it( 'should throw when trying to use same group name twice', () => {
			expect( () => {
				conversion.register( 'ab' );
			} ).to.throw( CKEditorError, /conversion-register-group-exists/ );
		} );
	} );

	describe( 'for()', () => {
		it( 'should return object with .add() method', () => {
			const forResult = conversion.for( 'ab' );

			expect( forResult.add ).to.be.instanceof( Function );
		} );

		it( 'should throw if non-existing group name has been used', () => {
			expect( () => {
				conversion.for( 'foo' );
			} ).to.throw( CKEditorError, /conversion-for-unknown-group/ );
		} );
	} );

	describe( 'add()', () => {
		let helperA, helperB;

		beforeEach( () => {
			helperA = sinon.stub();
			helperB = sinon.stub();
		} );

		it( 'should be chainable', () => {
			const forResult = conversion.for( 'ab' );
			const addResult = forResult.add( () => {} );

			expect( addResult ).to.equal( addResult.add( () => {} ) );
		} );

		it( 'should fire given helper for every dispatcher in given group', () => {
			conversion.for( 'ab' ).add( helperA );

			expect( helperA.calledWithExactly( dispA ) ).to.be.true;
			expect( helperA.calledWithExactly( dispB ) ).to.be.true;

			conversion.for( 'b' ).add( helperB );

			expect( helperB.calledWithExactly( dispA ) ).to.be.false;
			expect( helperB.calledWithExactly( dispB ) ).to.be.true;
		} );
	} );

	describe( 'converters', () => {
		let viewDispatcher, model, schema, conversion, modelRoot, viewRoot;

		beforeEach( () => {
			model = new Model();
			const controller = new EditingController( model );

			const modelDoc = model.document;
			modelRoot = modelDoc.createRoot();

			viewRoot = controller.view.getRoot();
			// Set name of view root the same as dom root.
			// This is a mock of attaching view root to dom root.
			viewRoot._name = 'div';

			schema = model.schema;

			schema.extend( '$text', {
				allowAttributes: [ 'bold' ]
			} );

			schema.register( 'paragraph', {
				inheritAllFrom: '$block'
			} );

			viewDispatcher = new UpcastDispatcher( model, { schema } );
			viewDispatcher.on( 'text', convertText() );
			viewDispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
			viewDispatcher.on( 'documentFragment', convertToModelFragment(), { priority: 'lowest' } );

			conversion = new Conversion();
			conversion.register( 'upcast', [ viewDispatcher ] );
			conversion.register( 'downcast', [ controller.downcastDispatcher ] );
		} );

		describe( 'elementToElement', () => {
			it( 'config.view is a string', () => {
				conversion.elementToElement( { model: 'paragraph', view: 'p' } );

				test( '<p>Foo</p>', '<paragraph>Foo</paragraph>' );
			} );

			it( 'config.view is an object', () => {
				schema.register( 'fancyParagraph', {
					inheritAllFrom: 'paragraph'
				} );

				conversion.elementToElement( {
					model: 'fancyParagraph',
					view: {
						name: 'p',
						class: 'fancy'
					}
				} );

				test( '<p class="fancy">Foo</p>', '<fancyParagraph>Foo</fancyParagraph>' );
			} );

			it( 'config.view is an object with upcastAlso defined', () => {
				conversion.elementToElement( {
					model: 'paragraph',
					view: 'p',
					upcastAlso: [
						'div',
						{
							// Match any name.
							name: /./,
							style: {
								display: 'block'
							}
						}
					]
				} );

				test( '<p>Foo</p>', '<paragraph>Foo</paragraph>' );
				test( '<div>Foo</div>', '<paragraph>Foo</paragraph>', '<p>Foo</p>' );
				test( '<span style="display:block">Foo</span>', '<paragraph>Foo</paragraph>', '<p>Foo</p>' );
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

				test( '<p></p>', '<paragraph></paragraph>' );
				test( '<p style="font-size:20px"></p>', '<paragraph></paragraph>', '<p></p>' );

				test( '<h2></h2>', '<heading></heading>' );
				test( '<p style="font-size:26px"></p>', '<heading></heading>', '<h2></h2>' );
			} );
		} );

		describe( 'attributeToElement', () => {
			beforeEach( () => {
				conversion.elementToElement( { model: 'paragraph', view: 'p' } );
			} );

			it( 'config.view is a string', () => {
				conversion.attributeToElement( 'bold', { view: 'strong' } );

				test( '<p><strong>Foo</strong> bar</p>', '<paragraph><$text bold="true">Foo</$text> bar</paragraph>' );
			} );

			it( 'config.view is an object', () => {
				conversion.attributeToElement( 'bold', {
					view: {
						name: 'span',
						class: 'bold'
					}
				} );

				test( '<p><span class="bold">Foo</span> bar</p>', '<paragraph><$text bold="true">Foo</$text> bar</paragraph>' );
			} );

			it( 'config.view is an object with upcastAlso defined', () => {
				conversion.attributeToElement( 'bold', {
					view: 'strong',
					upcastAlso: [
						'b',
						{
							name: 'span',
							class: 'bold'
						},
						{
							name: 'span',
							style: {
								'font-weight': 'bold'
							}
						},
						viewElement => {
							const fontWeight = viewElement.getStyle( 'font-weight' );

							if ( viewElement.is( 'span' ) && fontWeight && /\d+/.test( fontWeight ) && Number( fontWeight ) > 500 ) {
								return {
									name: true,
									style: [ 'font-weight' ]
								};
							}
						}
					]
				} );

				test(
					'<p><strong>Foo</strong></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>'
				);

				test(
					'<p><b>Foo</b></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>',
					'<p><strong>Foo</strong></p>'
				);

				test(
					'<p><span class="bold">Foo</span></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>',
					'<p><strong>Foo</strong></p>'
				);

				test(
					'<p><span style="font-weight: bold;">Foo</span></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>',
					'<p><strong>Foo</strong></p>'
				);

				test(
					'<p><span style="font-weight: 500;">Foo</span></p>',
					'<paragraph>Foo</paragraph>',
					'<p>Foo</p>'
				);

				test(
					'<p><span style="font-weight: 600;">Foo</span></p>',
					'<paragraph><$text bold="true">Foo</$text></paragraph>',
					'<p><strong>Foo</strong></p>'
				);
			} );

			it( 'config.model is a string', () => {
				schema.extend( '$text', {
					allowAttributes: [ 'styled' ]
				} );

				conversion.attributeToElement( 'styled', {
					model: 'dark',
					view: {
						name: 'span',
						class: [ 'styled', 'styled-dark' ]
					}
				} );

				test(
					'<p><span class="styled styled-dark">Foo</span> bar</p>',
					'<paragraph><$text styled="dark">Foo</$text> bar</paragraph>'
				);
			} );

			it( 'config is an array', () => {
				schema.extend( '$text', {
					allowAttributes: [ 'fontSize' ]
				} );

				conversion.attributeToElement( 'fontSize', [
					{
						model: 'big',
						view: {
							name: 'span',
							style: {
								'font-size': '1.2em'
							}
						}
					},
					{
						model: 'small',
						view: {
							name: 'span',
							style: {
								'font-size': '0.8em'
							}
						}
					}
				] );

				test(
					'<p><span style="font-size:1.2em">Foo</span> bar</p>',
					'<paragraph><$text fontSize="big">Foo</$text> bar</paragraph>'
				);

				test(
					'<p><span style="font-size:0.8em">Foo</span> bar</p>',
					'<paragraph><$text fontSize="small">Foo</$text> bar</paragraph>'
				);
			} );

			it( 'config is an array with upcastAlso defined', () => {
				schema.extend( '$text', {
					allowAttributes: [ 'fontSize' ]
				} );

				conversion.attributeToElement( 'fontSize', [
					{
						model: 'big',
						view: {
							name: 'span',
							style: {
								'font-size': '1.2em'
							}
						},
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

							if ( viewElement.is( 'span' ) && size > 10 ) {
								return { name: true, style: [ 'font-size' ] };
							}

							return null;
						}
					},
					{
						model: 'small',
						view: {
							name: 'span',
							style: {
								'font-size': '0.8em'
							}
						},
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

							if ( viewElement.is( 'span' ) && size < 10 ) {
								return { name: true, style: [ 'font-size' ] };
							}

							return null;
						}
					}
				] );

				test(
					'<p><span style="font-size:1.2em">Foo</span> bar</p>',
					'<paragraph><$text fontSize="big">Foo</$text> bar</paragraph>'
				);

				test(
					'<p><span style="font-size:12px">Foo</span> bar</p>',
					'<paragraph><$text fontSize="big">Foo</$text> bar</paragraph>',
					'<p><span style="font-size:1.2em">Foo</span> bar</p>'
				);

				test(
					'<p><span style="font-size:0.8em">Foo</span> bar</p>',
					'<paragraph><$text fontSize="small">Foo</$text> bar</paragraph>'
				);

				test(
					'<p><span style="font-size:8px">Foo</span> bar</p>',
					'<paragraph><$text fontSize="small">Foo</$text> bar</paragraph>',
					'<p><span style="font-size:0.8em">Foo</span> bar</p>'
				);

				test(
					'<p><span style="font-size:10px">Foo</span> bar</p>',
					'<paragraph>Foo bar</paragraph>',
					'<p>Foo bar</p>'
				);
			} );
		} );

		describe( 'attributeToAttribute', () => {
			beforeEach( () => {
				conversion.elementToElement( { model: 'image', view: 'img' } );

				schema.register( 'image', {
					inheritAllFrom: '$block',
				} );
			} );

			it( 'config is not set', () => {
				schema.extend( 'image', {
					allowAttributes: [ 'src' ]
				} );

				conversion.attributeToAttribute( 'src' );

				test( '<img src="foo.jpg"></img>', '<image src="foo.jpg"></image>' );
			} );

			it( 'config.view is a string', () => {
				schema.extend( 'image', {
					allowAttributes: [ 'source' ]
				} );

				conversion.attributeToAttribute( 'source', { view: 'src' } );

				test( '<img src="foo.jpg"></img>', '<image source="foo.jpg"></image>' );
			} );

			it( 'config.view is an object', () => {
				schema.extend( 'image', {
					allowAttributes: [ 'aside' ]
				} );

				conversion.attributeToAttribute( 'aside', {
					model: true,
					view: {
						name: 'img',
						key: 'class',
						value: 'aside half-size'
					}
				} );

				conversion.elementToElement( { model: 'paragraph', view: 'p' } );

				test( '<img class="aside half-size"></img>', '<image aside="true"></image>' );
				test( '<p class="aside half-size"></p>', '<paragraph></paragraph>', '<p></p>' );
			} );

			it( 'config is an array', () => {
				schema.extend( 'image', {
					allowAttributes: [ 'styled' ]
				} );

				conversion.attributeToAttribute( 'styled', [
					{
						model: 'dark',
						view: {
							key: 'class',
							value: 'styled styled-dark'
						}
					},
					{
						model: 'light',
						view: {
							key: 'class',
							value: 'styled styled-light'
						}
					}
				] );

				test( '<img class="styled styled-dark"></img>', '<image styled="dark"></image>' );
				test( '<img class="styled styled-light"></img>', '<image styled="light"></image>' );
			} );

			it( 'config is an array with upcastAlso defined', () => {
				conversion.elementToElement( { model: 'paragraph', view: 'p' } );

				schema.extend( 'paragraph', {
					allowAttributes: [ 'align' ]
				} );

				conversion.attributeToAttribute( 'align', [
					{
						model: 'right',
						view: {
							key: 'class',
							value: 'align-right'
						},
						upcastAlso: viewElement => {
							if ( viewElement.getStyle( 'text-align' ) == 'right' ) {
								return {
									style: [ 'text-align' ]
								};
							}

							return null;
						}
					},
					{
						model: 'center',
						view: {
							key: 'class',
							value: 'align-center'
						},
						upcastAlso: {
							style: {
								'text-align': 'center'
							}
						}
					}
				] );

				test(
					'<p class="align-right">Foo</p>',
					'<paragraph align="right">Foo</paragraph>'
				);

				test(
					'<p style="text-align:right">Foo</p>',
					'<paragraph align="right">Foo</paragraph>',
					'<p class="align-right">Foo</p>'
				);

				test(
					'<p class="align-center">Foo</p>',
					'<paragraph align="center">Foo</paragraph>'
				);

				test(
					'<p style="text-align:center">Foo</p>',
					'<paragraph align="center">Foo</paragraph>',
					'<p class="align-center">Foo</p>'
				);
			} );
		} );

		function test( input, expectedModel, expectedView = null ) {
			loadData( input );

			expect( modelStringify( model.document.getRoot() ) ).to.equal( expectedModel );
			expect( viewStringify( viewRoot, null, { ignoreRoot: true } ) ).to.equal( expectedView || input );
		}

		function loadData( input ) {
			const parsedView = viewParse( input );

			const convertedModel = viewDispatcher.convert( parsedView );

			model.change( writer => {
				writer.remove( ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, modelRoot.maxOffset ) );
				writer.insert( convertedModel, modelRoot, 0 );
			} );
		}
	} );
} );
