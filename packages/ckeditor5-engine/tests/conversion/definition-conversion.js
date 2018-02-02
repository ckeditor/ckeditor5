/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	modelElementIsViewElement, modelAttributeIsViewElement, modelAttributeIsViewAttribute
} from '../../src/conversion/definition-conversion';

import Conversion from '../../src/conversion/conversion';
import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';

import { convertText, convertToModelFragment } from '../../src/conversion/view-to-model-converters';

import EditingController from '../../src/controller/editingcontroller';

import Model from '../../src/model/model';
import ModelRange from '../../src/model/range';

import { stringify as viewStringify, parse as viewParse } from '../../src/dev-utils/view';
import { stringify as modelStringify } from '../../src/dev-utils/model';

describe( 'definition-conversion', () => {
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

		viewDispatcher = new ViewConversionDispatcher( model, { schema } );
		viewDispatcher.on( 'text', convertText() );
		viewDispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
		viewDispatcher.on( 'documentFragment', convertToModelFragment(), { priority: 'lowest' } );

		conversion = new Conversion();
		conversion.register( 'view', [ viewDispatcher ] );
		conversion.register( 'model', [ controller.modelToView ] );
	} );

	describe( 'modelElementIsViewElement', () => {
		it( 'config.view is a string', () => {
			modelElementIsViewElement( conversion, { model: 'paragraph', view: 'p' } );

			test( '<p>Foo</p>', '<paragraph>Foo</paragraph>' );
		} );

		it( 'config.view is an object', () => {
			schema.register( 'fancyParagraph', {
				inheritAllFrom: 'paragraph'
			} );

			modelElementIsViewElement( conversion, {
				model: 'fancyParagraph',
				view: {
					name: 'p',
					class: 'fancy'
				}
			} );

			test( '<p class="fancy">Foo</p>', '<fancyParagraph>Foo</fancyParagraph>' );
		} );

		it( 'config.view is an object with alternative view', () => {
			schema.register( 'blockquote', {
				inheritAllFrom: '$block'
			} );

			modelElementIsViewElement( conversion, {
				model: 'blockquote',
				view: 'blockquote',
				alternativeView: [
					{
						name: 'div',
						class: 'blockquote'
					}
				]
			} );

			test( '<blockquote>Foo</blockquote>', '<blockquote>Foo</blockquote>' );
			test( '<div class="blockquote">Foo</div>', '<blockquote>Foo</blockquote>', '<blockquote>Foo</blockquote>' );
		} );
	} );

	describe( 'modelAttributeIsViewElement', () => {
		beforeEach( () => {
			modelElementIsViewElement( conversion, { model: 'paragraph', view: 'p' } );
		} );

		it( 'config.view is a string', () => {
			modelAttributeIsViewElement( conversion, 'bold', { view: 'strong' } );

			test( '<p><strong>Foo</strong> bar</p>', '<paragraph><$text bold="true">Foo</$text> bar</paragraph>' );
		} );

		it( 'config.view is an object', () => {
			modelAttributeIsViewElement( conversion, 'bold', {
				view: {
					name: 'span',
					class: 'bold'
				}
			} );

			test( '<p><span class="bold">Foo</span> bar</p>', '<paragraph><$text bold="true">Foo</$text> bar</paragraph>' );
		} );

		it( 'config.view is an object with alternative view', () => {
			modelAttributeIsViewElement( conversion, 'bold', {
				view: 'strong',
				alternativeView: [
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
		} );

		it( 'config.model is a string', () => {
			schema.extend( '$text', {
				allowAttributes: [ 'styled' ]
			} );

			modelAttributeIsViewElement( conversion, 'styled', {
				model: 'dark',
				view: {
					name: 'span',
					class: [ 'styled', 'styled-dark' ]
				}
			} );

			test( '<p><span class="styled styled-dark">Foo</span> bar</p>', '<paragraph><$text styled="dark">Foo</$text> bar</paragraph>' );
		} );

		it( 'config is an array', () => {
			schema.extend( '$text', {
				allowAttributes: [ 'fontSize' ]
			} );

			modelAttributeIsViewElement( conversion, 'fontSize', [
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

		it( 'config is an array with alternative view', () => {
			schema.extend( '$text', {
				allowAttributes: [ 'fontSize' ]
			} );

			modelAttributeIsViewElement( conversion, 'fontSize', [
				{
					model: 'big',
					view: {
						name: 'span',
						style: {
							'font-size': '1.2em'
						}
					},
					alternativeView: [
						{
							name: 'span',
							style: {
								'font-size': '12px'
							}
						}
					]
				},
				{
					model: 'small',
					view: {
						name: 'span',
						style: {
							'font-size': '0.8em'
						}
					},
					alternativeView: [
						{
							name: 'span',
							style: {
								'font-size': '8px'
							}
						}
					]
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
		} );
	} );

	describe( 'modelAttributeIsViewAttribute', () => {
		beforeEach( () => {
			modelElementIsViewElement( conversion, { model: 'image', view: 'img' } );

			schema.register( 'image', {
				inheritAllFrom: '$block',
			} );
		} );

		it( 'config is not set', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'src' ]
			} );

			modelAttributeIsViewAttribute( conversion, 'src' );

			test( '<img src="foo.jpg"></img>', '<image src="foo.jpg"></image>' );
		} );

		it( 'config.view is a string', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'source' ]
			} );

			modelAttributeIsViewAttribute( conversion, 'source', { view: 'src' } );

			test( '<img src="foo.jpg"></img>', '<image source="foo.jpg"></image>' );
		} );

		it( 'config.view is an object', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'aside' ]
			} );

			modelAttributeIsViewAttribute( conversion, 'aside', {
				model: true,
				view: {
					key: 'class',
					value: 'aside half-size'
				}
			} );

			test( '<img class="aside half-size"></img>', '<image aside="true"></image>' );
		} );

		it( 'config is an array', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'styled' ]
			} );

			modelAttributeIsViewAttribute( conversion, 'styled', [
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

		it( 'config is an array with alternative view', () => {
			modelElementIsViewElement( conversion, { model: 'paragraph', view: 'p' } );
			schema.extend( 'paragraph', {
				allowAttributes: [ 'align' ]
			} );

			modelAttributeIsViewAttribute( conversion, 'align', [
				{
					model: 'right',
					view: {
						key: 'class',
						value: 'align-right'
					},
					alternativeView: [
						{
							key: 'style',
							value: 'text-align:right;'
						}
					]
				},
				{
					model: 'center',
					view: {
						key: 'class',
						value: 'align-center'
					},
					alternativeView: [
						{
							key: 'style',
							value: 'text-align:center;'
						}
					]
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
