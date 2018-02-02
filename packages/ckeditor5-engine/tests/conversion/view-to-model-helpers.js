/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	elementToElement, elementToAttribute, attributeToAttribute, elementToMarker
} from '../../src/conversion/view-to-model-helpers';

import Model from '../../src/model/model';
import Conversion from '../../src/conversion/conversion';
import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';

import ModelElement from '../../src/model/element';

import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewUIElement from '../../src/view/uielement';
import ViewContainerElement from '../../src/view/containerelement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewText from '../../src/view/text';

import { convertText, convertToModelFragment } from '../../src/conversion/view-to-model-converters';
import { stringify } from '../../src/dev-utils/model';

describe( 'view-to-model-helpers', () => {
	let dispatcher, model, schema, conversion;

	beforeEach( () => {
		model = new Model();

		schema = model.schema;

		schema.extend( '$text', {
			allowIn: '$root'
		} );

		schema.register( '$marker', {
			inheritAllFrom: '$block'
		} );

		schema.register( 'paragraph', {
			inheritAllFrom: '$block'
		} );

		schema.extend( '$text', {
			allowAttributes: [ 'bold' ]
		} );

		dispatcher = new ViewConversionDispatcher( model, { schema } );
		dispatcher.on( 'text', convertText() );
		dispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
		dispatcher.on( 'documentFragment', convertToModelFragment(), { priority: 'lowest' } );

		conversion = new Conversion();
		conversion.register( 'view', [ dispatcher ] );
	} );

	describe( 'elementToElement', () => {
		it( 'config.view is a string', () => {
			const helper = elementToElement( { view: 'p', model: 'paragraph' } );

			conversion.for( 'view' ).add( helper );

			expectResult( new ViewContainerElement( 'p' ), '<paragraph></paragraph>' );
		} );

		it( 'can be overwritten using priority', () => {
			schema.register( 'p', {
				inheritAllFrom: '$block'
			} );

			const helperA = elementToElement( { view: 'p', model: 'p' } );
			const helperB = elementToElement( { view: 'p', model: 'paragraph' }, 'high' );

			conversion.for( 'view' ).add( helperA ).add( helperB );

			expectResult( new ViewContainerElement( 'p' ), '<paragraph></paragraph>' );
		} );

		it( 'config.view is an object', () => {
			schema.register( 'fancyParagraph', {
				inheritAllFrom: '$block'
			} );

			const helperParagraph = elementToElement( { view: 'p', model: 'paragraph' } );
			const helperFancy = elementToElement( {
				view: {
					name: 'p',
					class: 'fancy'
				},
				model: 'fancyParagraph'
			}, 'high' );

			conversion.for( 'view' ).add( helperParagraph ).add( helperFancy );

			expectResult( new ViewContainerElement( 'p' ), '<paragraph></paragraph>' );
			expectResult( new ViewContainerElement( 'p', { class: 'fancy' } ), '<fancyParagraph></fancyParagraph>' );
		} );

		it( 'config.model is element instance', () => {
			schema.extend( 'paragraph', {
				allowAttributes: [ 'fancy' ]
			} );

			const helper = elementToElement( {
				view: {
					name: 'p',
					class: 'fancy'
				},
				model: new ModelElement( 'paragraph', { fancy: true } )
			} );

			conversion.for( 'view' ).add( helper );

			expectResult( new ViewContainerElement( 'p', { class: 'fancy' } ), '<paragraph fancy="true"></paragraph>' );
		} );

		it( 'config.model is a function', () => {
			schema.register( 'heading', {
				inheritAllFrom: '$block',
				allowAttributes: [ 'level' ]
			} );

			const helper = elementToElement( {
				view: {
					name: 'p',
					class: 'heading'
				},
				model: viewElement => new ModelElement( 'heading', { level: viewElement.getAttribute( 'data-level' ) } )
			} );

			conversion.for( 'view' ).add( helper );

			expectResult( new ViewContainerElement( 'p', { class: 'heading', 'data-level': 2 } ), '<heading level="2"></heading>' );
		} );

		it( 'should fire conversion of the element children', () => {
			const helper = elementToElement( { view: 'p', model: 'paragraph' } );

			conversion.for( 'view' ).add( helper );

			expectResult( new ViewContainerElement( 'p', null, new ViewText( 'foo' ) ), '<paragraph>foo</paragraph>' );
		} );

		it( 'should not insert a model element if it is not allowed by schema', () => {
			const helper = elementToElement( { view: 'h2', model: 'heading' } );

			conversion.for( 'view' ).add( helper );

			expectResult( new ViewContainerElement( 'h2' ), '' );
		} );

		it( 'should auto-break elements', () => {
			schema.register( 'heading', {
				inheritAllFrom: '$block'
			} );

			const helperParagraph = elementToElement( { view: 'p', model: 'paragraph' } );
			const helperHeading = elementToElement( { view: 'h2', model: 'heading' } );

			conversion.for( 'view' ).add( helperParagraph ).add( helperHeading );

			expectResult(
				new ViewContainerElement( 'p', null, [
					new ViewText( 'Foo' ),
					new ViewContainerElement( 'h2', null, new ViewText( 'Xyz' ) ),
					new ViewText( 'Bar' )
				] ),
				'<paragraph>Foo</paragraph><heading>Xyz</heading><paragraph>Bar</paragraph>'
			);
		} );

		it( 'should not do anything if returned model element is null', () => {
			const helperA = elementToElement( { view: 'p', model: 'paragraph' } );
			const helperB = elementToElement( { view: 'p', model: () => null }, 'high' );

			conversion.for( 'view' ).add( helperA ).add( helperB );

			expectResult( new ViewContainerElement( 'p' ), '<paragraph></paragraph>' );
		} );
	} );

	describe( 'elementToAttribute', () => {
		it( 'config.view is string', () => {
			const helper = elementToAttribute( { view: 'strong', model: 'bold' } );

			conversion.for( 'view' ).add( helper );

			expectResult(
				new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ),
				'<$text bold="true">foo</$text>'
			);
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = elementToAttribute( { view: 'strong', model: 'strong' } );
			const helperB = elementToAttribute( { view: 'strong', model: 'bold' }, 'high' );

			conversion.for( 'view' ).add( helperA ).add( helperB );

			expectResult(
				new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ),
				'<$text bold="true">foo</$text>'
			);
		} );

		it( 'config.view is an object', () => {
			const helper = elementToAttribute( {
				view: {
					name: 'span',
					class: 'bold'
				},
				model: 'bold'
			} );

			conversion.for( 'view' ).add( helper );

			expectResult(
				new ViewAttributeElement( 'span', { class: 'bold' }, new ViewText( 'foo' ) ),
				'<$text bold="true">foo</$text>'
			);
		} );

		it( 'model attribute value is given', () => {
			schema.extend( '$text', {
				allowAttributes: [ 'styled' ]
			} );

			const helper = elementToAttribute( {
				view: {
					name: 'span',
					class: [ 'styled', 'styled-dark' ]
				},
				model: {
					key: 'styled',
					value: 'dark'
				}
			} );

			conversion.for( 'view' ).add( helper );

			expectResult(
				new ViewAttributeElement( 'span', { class: 'styled styled-dark' }, new ViewText( 'foo' ) ),
				'<$text styled="dark">foo</$text>'
			);
		} );

		it( 'model attribute value is a function', () => {
			schema.extend( '$text', {
				allowAttributes: [ 'fontSize' ]
			} );

			const helper = elementToAttribute( {
				view: {
					name: 'span',
					style: {
						'font-size': /[\s\S]+/
					}
				},
				model: {
					key: 'fontSize',
					value: viewElement => {
						const fontSize = viewElement.getStyle( 'font-size' );
						const value = fontSize.substr( 0, fontSize.length - 2 );

						if ( value <= 10 ) {
							return 'small';
						} else if ( value > 12 ) {
							return 'big';
						}

						return null;
					}
				}
			} );

			conversion.for( 'view' ).add( helper );

			expectResult(
				new ViewAttributeElement( 'span', { style: 'font-size:9px' }, new ViewText( 'foo' ) ),
				'<$text fontSize="small">foo</$text>'
			);

			expectResult(
				new ViewAttributeElement( 'span', { style: 'font-size:12px' }, new ViewText( 'foo' ) ),
				'foo'
			);

			expectResult(
				new ViewAttributeElement( 'span', { style: 'font-size:14px' }, new ViewText( 'foo' ) ),
				'<$text fontSize="big">foo</$text>'
			);
		} );

		it( 'should not set an attribute if it is not allowed by schema', () => {
			const helper = elementToAttribute( { view: 'em', model: 'italic' } );

			conversion.for( 'view' ).add( helper );

			expectResult(
				new ViewAttributeElement( 'em', null, new ViewText( 'foo' ) ),
				'foo'
			);
		} );

		it( 'should not do anything if returned model attribute is null', () => {
			const helperA = elementToAttribute( { view: 'strong', model: 'bold' } );
			const helperB = elementToAttribute( {
				view: 'strong',
				model: {
					key: 'bold',
					value: () => null
				}
			}, 'high' );

			conversion.for( 'view' ).add( helperA ).add( helperB );

			expectResult(
				new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ),
				'<$text bold="true">foo</$text>'
			);
		} );
	} );

	describe( 'attributeToAttribute', () => {
		beforeEach( () => {
			conversion.for( 'view' ).add( elementToElement( { view: 'img', model: 'image' } ) );

			schema.register( 'image', {
				inheritAllFrom: '$block'
			} );
		} );

		it( 'config.view is a string', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'source' ]
			} );

			const helper = attributeToAttribute( { view: 'src', model: 'source' } );

			conversion.for( 'view' ).add( helper );

			expectResult(
				new ViewAttributeElement( 'img', { src: 'foo.jpg' } ),
				'<image source="foo.jpg"></image>'
			);
		} );

		it( 'can be overwritten using priority', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'src', 'source' ]
			} );

			const helperA = attributeToAttribute( { view: 'src', model: 'src' } );
			const helperB = attributeToAttribute( { view: 'src', model: 'source' }, 'normal' );

			conversion.for( 'view' ).add( helperA ).add( helperB );

			expectResult(
				new ViewAttributeElement( 'img', { src: 'foo.jpg' } ),
				'<image source="foo.jpg"></image>'
			);
		} );

		it( 'config.view is an object', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'styled' ]
			} );

			const helper = attributeToAttribute( {
				view: {
					key: 'data-style',
					value: /[\s\S]*/
				},
				model: 'styled'
			} );

			conversion.for( 'view' ).add( helper );

			expectResult(
				new ViewAttributeElement( 'img', { 'data-style': 'dark' } ),
				'<image styled="dark"></image>'
			);
		} );

		it( 'model attribute value is a string', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'styled' ]
			} );

			const helper = attributeToAttribute( {
				view: {
					key: 'class',
					value: 'styled-dark'
				},
				model: {
					key: 'styled',
					value: 'dark'
				}
			} );

			conversion.for( 'view' ).add( helper );

			expectResult(
				new ViewAttributeElement( 'img', { class: 'styled-dark' } ),
				'<image styled="dark"></image>'
			);

			expectResult(
				new ViewAttributeElement( 'img', { class: 'styled-xxx' } ),
				'<image></image>'
			);
		} );

		it( 'model attribute value is a function', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'styled' ]
			} );

			const helper = attributeToAttribute( {
				view: 'data-style',
				model: {
					key: 'styled',
					value: viewElement => viewElement.getAttribute( 'data-style' ).substr( 6 )
				}
			} );

			conversion.for( 'view' ).add( helper );

			expectResult(
				new ViewAttributeElement( 'img', { 'data-style': 'style-dark' } ),
				'<image styled="dark"></image>'
			);
		} );

		it( 'should not set an attribute if it is not allowed by schema', () => {
			const helper = attributeToAttribute( { view: 'src', model: 'source' } );

			conversion.for( 'view' ).add( helper );

			expectResult(
				new ViewAttributeElement( 'img', { src: 'foo.jpg' } ),
				'<image></image>'
			);
		} );

		it( 'should not do anything if returned model attribute is null', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'styled' ]
			} );

			const helperA = attributeToAttribute( {
				view: {
					key: 'class',
					value: 'styled'
				},
				model: {
					key: 'styled',
					value: true
				}
			} );

			const helperB = attributeToAttribute( {
				view: {
					key: 'class',
					value: 'styled'
				},
				model: {
					key: 'styled',
					value: () => null
				}
			} );

			conversion.for( 'view' ).add( helperA ).add( helperB );

			expectResult(
				new ViewAttributeElement( 'img', { class: 'styled' } ),
				'<image styled="true"></image>'
			);
		} );
	} );

	describe( 'elementToMarker', () => {
		it( 'config.view is a string', () => {
			const helper = elementToMarker( { view: 'marker-search', model: 'search' } );

			conversion.for( 'view' ).add( helper );

			const frag = new ViewDocumentFragment( [
				new ViewText( 'fo' ),
				new ViewUIElement( 'marker-search' ),
				new ViewText( 'oba' ),
				new ViewUIElement( 'marker-search' ),
				new ViewText( 'r' )
			] );

			const marker = { name: 'search', start: [ 2 ], end: [ 5 ] };

			expectResult( frag, 'foobar', marker );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = elementToMarker( { view: 'marker-search', model: 'search-result' } );
			const helperB = elementToMarker( { view: 'marker-search', model: 'search' }, 'high' );

			conversion.for( 'view' ).add( helperA ).add( helperB );

			const frag = new ViewDocumentFragment( [
				new ViewText( 'fo' ),
				new ViewUIElement( 'marker-search' ),
				new ViewText( 'oba' ),
				new ViewUIElement( 'marker-search' ),
				new ViewText( 'r' )
			] );

			const marker = { name: 'search', start: [ 2 ], end: [ 5 ] };

			expectResult( frag, 'foobar', marker );
		} );

		it( 'config.view is an object', () => {
			const helper = elementToMarker( {
				view: {
					name: 'span',
					'data-marker': 'search'
				},
				model: 'search'
			} );

			conversion.for( 'view' ).add( helper );

			const frag = new ViewDocumentFragment( [
				new ViewText( 'f' ),
				new ViewUIElement( 'span', { 'data-marker': 'search' } ),
				new ViewText( 'oob' ),
				new ViewUIElement( 'span', { 'data-marker': 'search' } ),
				new ViewText( 'ar' )
			] );

			const marker = { name: 'search', start: [ 1 ], end: [ 4 ] };

			expectResult( frag, 'foobar', marker );
		} );

		it( 'config.model is a function', () => {
			const helper = elementToMarker( {
				view: 'comment',
				model: viewElement => 'comment:' + viewElement.getAttribute( 'data-comment-id' )
			} );

			conversion.for( 'view' ).add( helper );

			const frag = new ViewDocumentFragment( [
				new ViewText( 'foo' ),
				new ViewUIElement( 'comment', { 'data-comment-id': 4 } ),
				new ViewText( 'b' ),
				new ViewUIElement( 'comment', { 'data-comment-id': 4 } ),
				new ViewText( 'ar' )
			] );

			const marker = { name: 'comment:4', start: [ 3 ], end: [ 4 ] };

			expectResult( frag, 'foobar', marker );
		} );
	} );

	function expectResult( viewToConvert, modelString, marker ) {
		const model = dispatcher.convert( viewToConvert );

		if ( marker ) {
			expect( model.markers.has( marker.name ) ).to.be.true;

			const convertedMarker = model.markers.get( marker.name );

			expect( convertedMarker.start.path ).to.deep.equal( marker.start );
			expect( convertedMarker.end.path ).to.deep.equal( marker.end );
		}

		expect( stringify( model ) ).to.equal( modelString );
	}
} );
