/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import UpcastDispatcher from '../../src/conversion/upcastdispatcher';

import ViewContainerElement from '../../src/view/containerelement';
import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewText from '../../src/view/text';
import ViewUIElement from '../../src/view/uielement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewDocument from '../../src/view/document';

import Model from '../../src/model/model';
import ModelDocumentFragment from '../../src/model/documentfragment';
import ModelElement from '../../src/model/element';
import ModelText from '../../src/model/text';
import ModelRange from '../../src/model/range';
import ModelPosition from '../../src/model/position';

import UpcastHelpers, { convertToModelFragment, convertText, convertSelectionChange } from '../../src/conversion/upcasthelpers';

import { getData as modelGetData, setData as modelSetData, stringify } from '../../src/dev-utils/model';
import View from '../../src/view/view';
import createViewRoot from '../view/_utils/createroot';
import { setData as viewSetData, parse as viewParse } from '../../src/dev-utils/view';
import Mapper from '../../src/conversion/mapper';
import ViewSelection from '../../src/view/selection';
import ViewRange from '../../src/view/range';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'UpcastHelpers', () => {
	let upcastDispatcher, model, schema, upcastHelpers, viewDocument;

	beforeEach( () => {
		model = new Model();
		viewDocument = new ViewDocument( new StylesProcessor() );

		schema = model.schema;

		schema.extend( '$text', {
			allowIn: '$root',
			allowAttributes: [ 'bold', 'attribA', 'attribB' ]
		} );

		schema.register( 'paragraph', {
			inheritAllFrom: '$block'
		} );

		upcastDispatcher = new UpcastDispatcher( { schema } );
		upcastDispatcher.on( 'text', convertText() );
		upcastDispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
		upcastDispatcher.on( 'documentFragment', convertToModelFragment(), { priority: 'lowest' } );

		upcastHelpers = new UpcastHelpers( [ upcastDispatcher ] );
	} );

	describe( 'elementToElement()', () => {
		it( 'should be chainable', () => {
			expect( upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } ) ).to.equal( upcastHelpers );
		} );

		it( 'config.view is a string', () => {
			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );

			expectResult( new ViewContainerElement( viewDocument, 'p' ), '<paragraph></paragraph>' );
		} );

		it( 'can be overwritten using converterPriority', () => {
			schema.register( 'p', {
				inheritAllFrom: '$block'
			} );

			upcastHelpers.elementToElement( { view: 'p', model: 'p' } );
			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph', converterPriority: 'high' } );

			expectResult( new ViewContainerElement( viewDocument, 'p' ), '<paragraph></paragraph>' );
		} );

		it( 'config.view is an object', () => {
			schema.register( 'fancyParagraph', {
				inheritAllFrom: '$block'
			} );

			upcastHelpers.elementToElement( {
				view: {
					name: 'p',
					classes: 'fancy'
				},
				model: 'fancyParagraph'
			} );

			expectResult( new ViewContainerElement( viewDocument, 'p', { class: 'fancy' } ), '<fancyParagraph></fancyParagraph>' );
			expectResult( new ViewContainerElement( viewDocument, 'p' ), '' );
		} );

		it( 'config.model is a function', () => {
			schema.register( 'heading', {
				inheritAllFrom: '$block',
				allowAttributes: [ 'level' ]
			} );

			upcastHelpers.elementToElement( {
				view: {
					name: 'p',
					classes: 'heading'
				},
				model: ( viewElement, modelWriter ) => {
					return modelWriter.createElement( 'heading', { level: viewElement.getAttribute( 'data-level' ) } );
				}
			} );

			expectResult(
				new ViewContainerElement( viewDocument, 'p', { class: 'heading', 'data-level': 2 } ),
				'<heading level="2"></heading>'
			);
			expectResult( new ViewContainerElement( viewDocument, 'p', { 'data-level': 2 } ), '' );
		} );

		it( 'config.view is not set - should fire conversion for every element', () => {
			upcastHelpers.elementToElement( {
				model: 'paragraph'
			} );

			expectResult( new ViewContainerElement( viewDocument, 'p' ), '<paragraph></paragraph>' );
			expectResult( new ViewContainerElement( viewDocument, 'foo' ), '<paragraph></paragraph>' );
		} );

		it( 'should fire conversion of the element children', () => {
			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );

			expectResult(
				new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'foo' ) ),
				'<paragraph>foo</paragraph>'
			);
		} );

		it( 'should not insert a model element if it is not allowed by schema', () => {
			upcastHelpers.elementToElement( { view: 'h2', model: 'heading' } );

			expectResult( new ViewContainerElement( viewDocument, 'h2' ), '' );
		} );

		it( 'should auto-break elements', () => {
			schema.register( 'heading', {
				inheritAllFrom: '$block'
			} );

			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );
			upcastHelpers.elementToElement( { view: 'h2', model: 'heading' } );

			expectResult(
				new ViewContainerElement( viewDocument, 'p', null, [
					new ViewText( viewDocument, 'Foo' ),
					new ViewContainerElement( viewDocument, 'h2', null, new ViewText( viewDocument, 'Xyz' ) ),
					new ViewText( viewDocument, 'Bar' )
				] ),
				'<paragraph>Foo</paragraph><heading>Xyz</heading><paragraph>Bar</paragraph>'
			);
		} );

		it( 'should not do anything if returned model element is null', () => {
			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );
			upcastHelpers.elementToElement( { view: 'p', model: () => null, converterPriority: 'high' } );

			expectResult( new ViewContainerElement( viewDocument, 'p' ), '<paragraph></paragraph>' );
		} );
	} );

	describe( 'elementToAttribute()', () => {
		it( 'should be chainable', () => {
			expect( upcastHelpers.elementToAttribute( { view: 'strong', model: 'bold' } ) ).to.equal( upcastHelpers );
		} );

		it( 'config.view is string', () => {
			upcastHelpers.elementToAttribute( { view: 'strong', model: 'bold' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'strong', null, new ViewText( viewDocument, 'foo' ) ),
				'<$text bold="true">foo</$text>'
			);
		} );

		it( 'can be overwritten using converterPriority', () => {
			upcastHelpers.elementToAttribute( { view: 'strong', model: 'strong' } );
			upcastHelpers.elementToAttribute( { view: 'strong', model: 'bold', converterPriority: 'high' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'strong', null, new ViewText( viewDocument, 'foo' ) ),
				'<$text bold="true">foo</$text>'
			);
		} );

		it( 'config.view is an object', () => {
			upcastHelpers.elementToAttribute( {
				view: {
					name: 'span',
					classes: 'bold'
				},
				model: 'bold'
			} );

			expectResult(
				new ViewAttributeElement( viewDocument, 'span', { class: 'bold' }, new ViewText( viewDocument, 'foo' ) ),
				'<$text bold="true">foo</$text>'
			);

			expectResult( new ViewAttributeElement( viewDocument, 'span', {}, new ViewText( viewDocument, 'foo' ) ), 'foo' );
		} );

		it( 'model attribute value is given', () => {
			schema.extend( '$text', {
				allowAttributes: [ 'styled' ]
			} );

			upcastHelpers.elementToAttribute( {
				view: {
					name: 'span',
					classes: [ 'styled', 'styled-dark' ]
				},
				model: {
					key: 'styled',
					value: 'dark'
				}
			} );

			expectResult(
				new ViewAttributeElement( viewDocument, 'span', { class: 'styled styled-dark' }, new ViewText( viewDocument, 'foo' ) ),
				'<$text styled="dark">foo</$text>'
			);

			expectResult( new ViewAttributeElement( viewDocument, 'span', {}, new ViewText( viewDocument, 'foo' ) ), 'foo' );
		} );

		it( 'model attribute value is a function', () => {
			schema.extend( '$text', {
				allowAttributes: [ 'fontSize' ]
			} );

			upcastHelpers.elementToAttribute( {
				view: {
					name: 'span',
					styles: {
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

			expectResult(
				new ViewAttributeElement( viewDocument, 'span', { style: 'font-size:9px' }, new ViewText( viewDocument, 'foo' ) ),
				'<$text fontSize="small">foo</$text>'
			);

			expectResult(
				new ViewAttributeElement( viewDocument, 'span', { style: 'font-size:12px' }, new ViewText( viewDocument, 'foo' ) ),
				'foo'
			);

			expectResult(
				new ViewAttributeElement( viewDocument, 'span', { style: 'font-size:14px' }, new ViewText( viewDocument, 'foo' ) ),
				'<$text fontSize="big">foo</$text>'
			);
		} );

		it( 'should not set an attribute if it is not allowed by schema', () => {
			upcastHelpers.elementToAttribute( { view: 'em', model: 'italic' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'em', null, new ViewText( viewDocument, 'foo' ) ),
				'foo'
			);
		} );

		it( 'should not do anything if returned model attribute is null', () => {
			upcastHelpers.elementToAttribute( { view: 'strong', model: 'bold' } );
			upcastHelpers.elementToAttribute( {
				view: 'strong',
				model: {
					key: 'bold',
					value: () => null
				},
				converterPriority: 'high'
			} );

			expectResult(
				new ViewAttributeElement( viewDocument, 'strong', null, new ViewText( viewDocument, 'foo' ) ),
				'<$text bold="true">foo</$text>'
			);
		} );

		it( 'should allow two converters to convert attributes on the same element', () => {
			upcastHelpers.elementToAttribute( {
				model: 'attribA',
				view: { name: 'span', classes: 'attrib-a' }
			} );

			upcastHelpers.elementToAttribute( {
				model: 'attribB',
				view: { name: 'span', styles: { color: 'attrib-b' } }
			} );

			expectResult(
				new ViewAttributeElement(
					viewDocument,
					'span',
					{ class: 'attrib-a', style: 'color:attrib-b;' },
					new ViewText( viewDocument, 'foo' )
				),
				'<$text attribA="true" attribB="true">foo</$text>'
			);
		} );

		it( 'should consume element only when only is name specified', () => {
			upcastHelpers.elementToAttribute( {
				model: 'bold',
				view: { name: 'strong' }
			} );

			upcastHelpers.elementToAttribute( {
				model: 'attribA',
				view: { name: 'strong' }
			} );

			upcastHelpers.elementToAttribute( {
				model: 'attribB',
				view: { name: 'strong', classes: 'foo' }
			} );

			expectResult(
				new ViewAttributeElement( viewDocument, 'strong', { class: 'foo' }, new ViewText( viewDocument, 'foo' ) ),
				'<$text attribB="true" bold="true">foo</$text>'
			);
		} );

		// #1443.
		it( 'should set attributes on the element\'s children', () => {
			upcastHelpers.elementToAttribute( {
				model: 'bold',
				view: { name: 'strong' }
			} );

			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );

			expectResult(
				new ViewAttributeElement(
					viewDocument,
					'strong',
					null,
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'Foo' ) )
				),
				'<paragraph><$text bold="true">Foo</$text></paragraph>'
			);
		} );
	} );

	describe( 'attributeToAttribute()', () => {
		beforeEach( () => {
			upcastHelpers.elementToElement( { view: 'img', model: 'image' } );

			schema.register( 'image', {
				inheritAllFrom: '$block'
			} );
		} );

		it( 'should be chainable', () => {
			expect( upcastHelpers.attributeToAttribute( { view: 'src', model: 'source' } ) ).to.equal( upcastHelpers );
		} );

		it( 'config.view is a string', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'source' ]
			} );

			upcastHelpers.attributeToAttribute( { view: 'src', model: 'source' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { src: 'foo.jpg' } ),
				'<image source="foo.jpg"></image>'
			);
		} );

		it( 'config.view has only key set', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'source' ]
			} );

			upcastHelpers.attributeToAttribute( { view: { key: 'src' }, model: 'source' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { src: 'foo.jpg' } ),
				'<image source="foo.jpg"></image>'
			);
		} );

		it( 'config.view has only key and name set', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'source' ]
			} );

			upcastHelpers.attributeToAttribute( { view: { name: 'img', key: 'src' }, model: { name: 'image', key: 'source' } } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { src: 'foo.jpg' } ),
				'<image source="foo.jpg"></image>'
			);
		} );

		it( 'can be overwritten using converterPriority', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'src', 'source' ]
			} );

			upcastHelpers.attributeToAttribute( { view: { key: 'src' }, model: 'src' } );
			upcastHelpers.attributeToAttribute( { view: { key: 'src' }, model: 'source', converterPriority: 'normal' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { src: 'foo.jpg' } ),
				'<image source="foo.jpg"></image>'
			);
		} );

		it( 'config.view has value set', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'styled' ]
			} );

			upcastHelpers.attributeToAttribute( {
				view: {
					key: 'data-style',
					value: /[\s\S]*/
				},
				model: 'styled'
			} );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { 'data-style': 'dark' } ),
				'<image styled="dark"></image>'
			);
		} );

		it( 'model attribute value is a string', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'styled' ]
			} );

			upcastHelpers.attributeToAttribute( {
				view: {
					name: 'img',
					key: 'class',
					value: 'styled-dark'
				},
				model: {
					key: 'styled',
					value: 'dark'
				}
			} );

			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );

			expectResult(
				new ViewContainerElement( viewDocument, 'img', { class: 'styled-dark' } ),
				'<image styled="dark"></image>'
			);

			expectResult(
				new ViewContainerElement( viewDocument, 'img', { class: 'styled-xxx' } ),
				'<image></image>'
			);

			expectResult(
				new ViewContainerElement( viewDocument, 'p', { class: 'styled-dark' } ),
				'<paragraph></paragraph>'
			);
		} );

		it( 'model attribute value is a function', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'styled' ]
			} );

			upcastHelpers.attributeToAttribute( {
				view: {
					key: 'class',
					value: /styled-[\S]+/
				},
				model: {
					key: 'styled',
					value: viewElement => {
						const regexp = /styled-([\S]+)/;
						const match = viewElement.getAttribute( 'class' ).match( regexp );

						return match[ 1 ];
					}
				}
			} );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { 'class': 'styled-dark' } ),
				'<image styled="dark"></image>'
			);
		} );

		it( 'should not set an attribute if it is not allowed by schema', () => {
			upcastHelpers.attributeToAttribute( { view: 'src', model: 'source' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { src: 'foo.jpg' } ),
				'<image></image>'
			);
		} );

		it( 'should not do anything if returned model attribute is null', () => {
			schema.extend( 'image', {
				allowAttributes: [ 'styled' ]
			} );

			upcastHelpers.attributeToAttribute( {
				view: {
					key: 'class',
					value: 'styled'
				},
				model: {
					key: 'styled',
					value: true
				}
			} );

			upcastHelpers.attributeToAttribute( {
				view: {
					key: 'class',
					value: 'styled'
				},
				model: {
					key: 'styled',
					value: () => null
				}
			} );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { class: 'styled' } ),
				'<image styled="true"></image>'
			);
		} );

		// #1443.
		it( 'should not set attributes on the element\'s children', () => {
			schema.register( 'div', {
				inheritAllFrom: '$root',
				allowWhere: '$block',
				isLimit: true,
				allowAttributes: [ 'border', 'shade' ]
			} );

			upcastHelpers.elementToElement( { view: 'div', model: 'div' } );

			upcastHelpers.attributeToAttribute( { view: { key: 'class', value: 'shade' }, model: 'shade' } );
			upcastHelpers.attributeToAttribute( { view: { key: 'class', value: 'border' }, model: 'border' } );

			expectResult(
				new ViewContainerElement(
					viewDocument,
					'div',
					{ class: 'border' },
					new ViewContainerElement( viewDocument, 'div', { class: 'shade' } )
				),
				'<div border="border"><div shade="shade"></div></div>'
			);
		} );
	} );

	describe( 'elementToMarker()', () => {
		it( 'should be chainable', () => {
			expect( upcastHelpers.elementToMarker( { view: 'marker-search', model: 'search' } ) ).to.equal( upcastHelpers );
		} );

		it( 'config.view is a string', () => {
			upcastHelpers.elementToMarker( { view: 'marker-search', model: 'search' } );

			const frag = new ViewDocumentFragment( viewDocument, [
				new ViewText( viewDocument, 'fo' ),
				new ViewUIElement( viewDocument, 'marker-search' ),
				new ViewText( viewDocument, 'oba' ),
				new ViewUIElement( viewDocument, 'marker-search' ),
				new ViewText( viewDocument, 'r' )
			] );

			const marker = { name: 'search', start: [ 2 ], end: [ 5 ] };

			expectResult( frag, 'foobar', marker );
		} );

		it( 'can be overwritten using converterPriority', () => {
			upcastHelpers.elementToMarker( { view: 'marker-search', model: 'search-result' } );
			upcastHelpers.elementToMarker( { view: 'marker-search', model: 'search', converterPriority: 'high' } );

			const frag = new ViewDocumentFragment( viewDocument, [
				new ViewText( viewDocument, 'fo' ),
				new ViewUIElement( viewDocument, 'marker-search' ),
				new ViewText( viewDocument, 'oba' ),
				new ViewUIElement( viewDocument, 'marker-search' ),
				new ViewText( viewDocument, 'r' )
			] );

			const marker = { name: 'search', start: [ 2 ], end: [ 5 ] };

			expectResult( frag, 'foobar', marker );
		} );

		it( 'config.view is an object', () => {
			upcastHelpers.elementToMarker( {
				view: {
					name: 'span',
					'data-marker': 'search'
				},
				model: 'search'
			} );

			const frag = new ViewDocumentFragment( viewDocument, [
				new ViewText( viewDocument, 'f' ),
				new ViewUIElement( viewDocument, 'span', { 'data-marker': 'search' } ),
				new ViewText( viewDocument, 'oob' ),
				new ViewUIElement( viewDocument, 'span', { 'data-marker': 'search' } ),
				new ViewText( viewDocument, 'ar' )
			] );

			const marker = { name: 'search', start: [ 1 ], end: [ 4 ] };

			expectResult( frag, 'foobar', marker );
		} );

		it( 'config.model is a function', () => {
			upcastHelpers.elementToMarker( {
				view: 'comment',
				model: viewElement => 'comment:' + viewElement.getAttribute( 'data-comment-id' )
			} );

			const frag = new ViewDocumentFragment( viewDocument, [
				new ViewText( viewDocument, 'foo' ),
				new ViewUIElement( viewDocument, 'comment', { 'data-comment-id': 4 } ),
				new ViewText( viewDocument, 'b' ),
				new ViewUIElement( viewDocument, 'comment', { 'data-comment-id': 4 } ),
				new ViewText( viewDocument, 'ar' )
			] );

			const marker = { name: 'comment:4', start: [ 3 ], end: [ 4 ] };

			expectResult( frag, 'foobar', marker );
		} );

		it( 'marker is in a block element', () => {
			upcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			upcastHelpers.elementToMarker( { view: 'marker-search', model: 'search' } );

			const element = new ViewContainerElement( viewDocument, 'p', null, [
				new ViewText( viewDocument, 'fo' ),
				new ViewUIElement( viewDocument, 'marker-search' ),
				new ViewText( viewDocument, 'oba' ),
				new ViewUIElement( viewDocument, 'marker-search' ),
				new ViewText( viewDocument, 'r' )
			] );

			const marker = { name: 'search', start: [ 0, 2 ], end: [ 0, 5 ] };

			expectResult( element, '<paragraph>foobar</paragraph>', marker );
		} );
	} );

	describe( 'dataToMarker()', () => {
		beforeEach( () => {
			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );
		} );

		it( 'should be chainable', () => {
			expect( upcastHelpers.dataToMarker( { view: 'search' } ) ).to.equal( upcastHelpers );
		} );

		it( 'default conversion, inside text, non-collapsed, no name', () => {
			upcastHelpers.dataToMarker( { view: 'search' } );

			expectResult(
				viewParse( '<p>Fo<search-start></search-start>ob<search-end></search-end>ar</p>' ),
				'<paragraph>Foobar</paragraph>',
				{ name: 'search', start: [ 0, 2 ], end: [ 0, 4 ] }
			);
		} );

		it( 'default conversion, inside text, non-collapsed, name', () => {
			upcastHelpers.dataToMarker( { view: 'group' } );

			expectResult(
				viewParse( '<p>Fo<group-start name="foo:bar:baz"></group-start>ob<group-end name="foo:bar:baz"></group-end>ar</p>' ),
				'<paragraph>Foobar</paragraph>',
				{ name: 'group:foo:bar:baz', start: [ 0, 2 ], end: [ 0, 4 ] }
			);
		} );

		it( 'default conversion, inside text, collapsed, no name', () => {
			upcastHelpers.dataToMarker( { view: 'search' } );

			expectResult(
				viewParse( '<p>Foo<search-start></search-start><search-end></search-end>bar</p>' ),
				'<paragraph>Foobar</paragraph>',
				{ name: 'search', start: [ 0, 3 ], end: [ 0, 3 ] }
			);
		} );

		it( 'default conversion, inside text, collapsed, multiple markers, no name', () => {
			upcastHelpers.dataToMarker( { view: 'group' } );

			expectResult(
				viewParse(
					'<p>' +
						'Foo' +
						'<group-start name="abc"></group-start><group-end name="abc"></group-end>' +
						'<group-start name="foo"></group-start><group-end name="foo"></group-end>' +
						'bar' +
					'</p>'
				),
				'<paragraph>Foobar</paragraph>',
				[
					{ name: 'group:abc', start: [ 0, 3 ], end: [ 0, 3 ] },
					{ name: 'group:foo', start: [ 0, 3 ], end: [ 0, 3 ] }
				]
			);
		} );

		it( 'default conversion, on two elements, no name', () => {
			upcastHelpers.dataToMarker( { view: 'search' } );

			expectResult(
				viewParse( '<p data-search-start-before="">Foo</p><p data-search-end-after="">Bar</p>' ),
				'<paragraph>Foo</paragraph><paragraph>Bar</paragraph>',
				{ name: 'search', start: [ 0 ], end: [ 2 ] }
			);
		} );

		it( 'default conversion, on two elements, name', () => {
			upcastHelpers.dataToMarker( { view: 'group' } );

			expectResult(
				viewParse( '<p data-group-start-before="foo:bar:baz">Foo</p><p data-group-end-after="foo:bar:baz">Bar</p>' ),
				'<paragraph>Foo</paragraph><paragraph>Bar</paragraph>',
				{ name: 'group:foo:bar:baz', start: [ 0 ], end: [ 2 ] }
			);
		} );

		it( 'default conversion, on one element, name', () => {
			upcastHelpers.dataToMarker( { view: 'group' } );

			expectResult(
				viewParse( '<p data-group-end-after="foo:bar:baz" data-group-start-before="foo:bar:baz">Foobar</p>' ),
				'<paragraph>Foobar</paragraph>',
				{ name: 'group:foo:bar:baz', start: [ 0 ], end: [ 1 ] }
			);
		} );

		it( 'default conversion, collapsed before element, name', () => {
			upcastHelpers.dataToMarker( { view: 'group' } );

			expectResult(
				viewParse( '<p data-group-end-before="foo:bar:baz" data-group-start-before="foo:bar:baz">Foobar</p>' ),
				'<paragraph>Foobar</paragraph>',
				{ name: 'group:foo:bar:baz', start: [ 0 ], end: [ 0 ] }
			);
		} );

		it( 'default conversion, collapsed after element, name', () => {
			upcastHelpers.dataToMarker( { view: 'group' } );

			expectResult(
				viewParse( '<p data-group-end-after="foo:bar:baz" data-group-start-after="foo:bar:baz">Foobar</p>' ),
				'<paragraph>Foobar</paragraph>',
				{ name: 'group:foo:bar:baz', start: [ 1 ], end: [ 1 ] }
			);
		} );

		it( 'default conversion, mixed, multiple markers, name', () => {
			upcastHelpers.dataToMarker( { view: 'group' } );

			expectResult(
				viewParse(
					'<p data-group-start-before="abc:xyz,foo:bar">Foo</p>' +
					'<p>Ba<group-end name="abc:xyz"></group-end><group-end name="foo:bar"></group-end>r</p>'
				),
				'<paragraph>Foo</paragraph><paragraph>Bar</paragraph>',
				[
					{ name: 'group:foo:bar', start: [ 0 ], end: [ 1, 2 ] },
					{ name: 'group:abc:xyz', start: [ 0 ], end: [ 1, 2 ] }
				]
			);
		} );

		it( 'default conversion, mixed #2, multiple markers, name', () => {
			upcastHelpers.dataToMarker( { view: 'group' } );

			expectResult(
				viewParse(
					'<p>F<group-start name="abc:xyz"></group-start><group-start name="foo:bar"></group-start>oo</p>' +
					'<p data-group-end-after="abc:xyz,foo:bar">Bar</p>'
				),
				'<paragraph>Foo</paragraph><paragraph>Bar</paragraph>',
				[
					{ name: 'group:foo:bar', start: [ 0, 1 ], end: [ 2 ] },
					{ name: 'group:abc:xyz', start: [ 0, 1 ], end: [ 2 ] }
				]
			);
		} );

		it( 'conversion callback, mixed, multiple markers, name', () => {
			upcastHelpers.dataToMarker( { view: 'g', model: name => 'group:' + name.split( '_' )[ 0 ] } );

			expectResult(
				viewParse(
					'<p data-g-start-before="abc_xyz,foo_bar">Foo</p>' +
					'<p>Ba<g-end name="abc_xyz"></g-end><g-end name="foo_bar"></g-end>r</p>'
				),
				'<paragraph>Foo</paragraph><paragraph>Bar</paragraph>',
				[
					{ name: 'group:foo', start: [ 0 ], end: [ 1, 2 ] },
					{ name: 'group:abc', start: [ 0 ], end: [ 1, 2 ] }
				]
			);
		} );

		it( 'can be overwritten using converterPriority', () => {
			upcastHelpers.dataToMarker( { view: 'group' } );
			upcastHelpers.dataToMarker( { view: 'group', model: name => 'g:' + name, converterPriority: 'high' } );

			expectResult(
				viewParse( '<p>Foo<group-start name="foo"></group-start><group-end name="foo"></group-end>bar</p>' ),
				'<paragraph>Foobar</paragraph>',
				{ name: 'g:foo', start: [ 0, 3 ], end: [ 0, 3 ] }
			);
		} );
	} );

	function expectResult( viewToConvert, modelString, markers ) {
		const conversionResult = model.change( writer => upcastDispatcher.convert( viewToConvert, writer ) );

		if ( markers ) {
			markers = Array.isArray( markers ) ? markers : [ markers ];

			for ( const marker of markers ) {
				expect( conversionResult.markers.has( marker.name ) ).to.be.true;

				const convertedMarker = conversionResult.markers.get( marker.name );

				expect( convertedMarker.start.path ).to.deep.equal( marker.start );
				expect( convertedMarker.end.path ).to.deep.equal( marker.end );
			}
		}

		expect( stringify( conversionResult ) ).to.equal( modelString );
	}
} );

describe( 'upcast-converters', () => {
	let dispatcher, schema, context, model, viewDocument;

	beforeEach( () => {
		model = new Model();
		viewDocument = new ViewDocument( new StylesProcessor() );
		schema = model.schema;

		schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		schema.extend( '$text', { allowIn: '$root' } );

		context = [ '$root' ];

		dispatcher = new UpcastDispatcher( { schema } );
	} );

	describe( 'convertText()', () => {
		it( 'should return converter converting ViewText to ModelText', () => {
			const viewText = new ViewText( viewDocument, 'foobar' );

			dispatcher.on( 'text', convertText() );

			const conversionResult = model.change( writer => dispatcher.convert( viewText, writer ) );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should not convert already consumed texts', () => {
			const viewText = new ViewText( viewDocument, 'foofuckbafuckr' );

			// Default converter for elements. Returns just converted children. Added with lowest priority.
			dispatcher.on( 'text', convertText(), { priority: 'lowest' } );
			// Added with normal priority. Should make the above converter not fire.
			dispatcher.on( 'text', ( evt, data, conversionApi ) => {
				if ( conversionApi.consumable.consume( data.viewItem ) ) {
					const text = conversionApi.writer.createText( data.viewItem.data.replace( /fuck/gi, '****' ) );
					conversionApi.writer.insert( text, data.modelCursor );
					data.modelRange = ModelRange._createFromPositionAndShift( data.modelCursor, text.offsetSize );
					data.modelCursor = data.modelRange.end;
				}
			} );

			const conversionResult = model.change( writer => dispatcher.convert( viewText, writer, context ) );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foo****ba****r' );
		} );

		it( 'should not convert text if it is wrong with schema', () => {
			schema.addChildCheck( ( ctx, childDef ) => {
				if ( childDef.name == '$text' && ctx.endsWith( '$root' ) ) {
					return false;
				}
			} );

			const viewText = new ViewText( viewDocument, 'foobar' );
			dispatcher.on( 'text', convertText() );
			let conversionResult = model.change( writer => dispatcher.convert( viewText, writer, context ) );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.childCount ).to.equal( 0 );

			conversionResult = model.change( writer => dispatcher.convert( viewText, writer, [ '$block' ] ) );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.childCount ).to.equal( 1 );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should support unicode', () => {
			const viewText = new ViewText( viewDocument, 'நிலைக்கு' );

			dispatcher.on( 'text', convertText() );

			const conversionResult = model.change( writer => dispatcher.convert( viewText, writer, context ) );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'நிலைக்கு' );
		} );
	} );

	describe( 'convertToModelFragment()', () => {
		it( 'should return converter converting whole ViewDocumentFragment to ModelDocumentFragment', () => {
			const viewFragment = new ViewDocumentFragment( viewDocument, [
				new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'foo' ) ),
				new ViewText( viewDocument, 'bar' )
			] );

			// To get any meaningful results we have to actually convert something.
			dispatcher.on( 'text', convertText() );
			// This way P element won't be converted per-se but will fire converting it's children.
			dispatcher.on( 'element', convertToModelFragment() );
			dispatcher.on( 'documentFragment', convertToModelFragment() );

			const conversionResult = model.change( writer => dispatcher.convert( viewFragment, writer, context ) );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.maxOffset ).to.equal( 6 );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should not convert already consumed (converted) changes', () => {
			const viewP = new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'foo' ) );

			// To get any meaningful results we have to actually convert something.
			dispatcher.on( 'text', convertText() );
			// Default converter for elements. Returns just converted children. Added with lowest priority.
			dispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
			// Added with normal priority. Should make the above converter not fire.
			dispatcher.on( 'element:p', ( evt, data, conversionApi ) => {
				if ( conversionApi.consumable.consume( data.viewItem, { name: true } ) ) {
					const paragraph = conversionApi.writer.createElement( 'paragraph' );

					conversionApi.writer.insert( paragraph, data.modelCursor );
					conversionApi.convertChildren( data.viewItem, ModelPosition._createAt( paragraph, 0 ) );

					data.modelRange = ModelRange._createOn( paragraph );
					data.modelCursor = data.modelRange.end;
				}
			} );

			const conversionResult = model.change( writer => dispatcher.convert( viewP, writer, context ) );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelElement );
			expect( conversionResult.getChild( 0 ).name ).to.equal( 'paragraph' );
			expect( conversionResult.getChild( 0 ).maxOffset ).to.equal( 3 );
			expect( conversionResult.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
		} );

		it( 'should forward correct modelCursor', () => {
			const spy = sinon.spy();
			const view = new ViewDocumentFragment( viewDocument, [
				new ViewContainerElement( viewDocument, 'div', null, [
					new ViewText( viewDocument, 'abc' ),
					new ViewContainerElement( viewDocument, 'foo' )
				] ),
				new ViewContainerElement( viewDocument, 'bar' )
			] );
			const position = ModelPosition._createAt( new ModelElement( 'element' ), 0 );

			dispatcher.on( 'documentFragment', convertToModelFragment() );
			dispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
			dispatcher.on( 'element:foo', ( evt, data ) => {
				// Be sure that current cursor is not the same as custom.
				expect( data.modelCursor ).to.not.equal( position );
				// Set custom cursor as a result of docFrag last child conversion.
				// This cursor should be forwarded by a documentFragment converter.
				data.modelCursor = position;
				// Be sure that callback was fired.
				spy();
			} );

			dispatcher.on( 'element:bar', ( evt, data ) => {
				expect( data.modelCursor ).to.equal( position );
				spy();
			} );

			model.change( writer => dispatcher.convert( view, writer ) );

			sinon.assert.calledTwice( spy );
		} );
	} );

	describe( 'convertSelectionChange()', () => {
		let model, view, viewDocument, mapper, convertSelection, modelRoot, viewRoot;

		beforeEach( () => {
			model = new Model();
			modelRoot = model.document.createRoot();
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			modelSetData( model, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			view = new View( new StylesProcessor() );
			viewDocument = view.document;
			viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			viewSetData( view, '<p>foo</p><p>bar</p>' );

			mapper = new Mapper();
			mapper.bindElements( modelRoot, viewRoot );
			mapper.bindElements( modelRoot.getChild( 0 ), viewRoot.getChild( 0 ) );
			mapper.bindElements( modelRoot.getChild( 1 ), viewRoot.getChild( 1 ) );

			convertSelection = convertSelectionChange( model, mapper );
		} );

		afterEach( () => {
			view.destroy();
		} );

		it( 'should convert collapsed selection', () => {
			const viewSelection = new ViewSelection();
			viewSelection.setTo( ViewRange._createFromParentsAndOffsets(
				viewRoot.getChild( 0 ).getChild( 0 ), 1, viewRoot.getChild( 0 ).getChild( 0 ), 1 ) );

			convertSelection( null, { newSelection: viewSelection } );

			expect( modelGetData( model ) ).to.equals( '<paragraph>f[]oo</paragraph><paragraph>bar</paragraph>' );
			expect( modelGetData( model ) ).to.equal( '<paragraph>f[]oo</paragraph><paragraph>bar</paragraph>' );
		} );

		it( 'should support unicode', () => {
			modelSetData( model, '<paragraph>நிலைக்கு</paragraph>' );
			viewSetData( view, '<p>நிலைக்கு</p>' );

			// Re-bind elements that were just re-set.
			mapper.bindElements( modelRoot.getChild( 0 ), viewRoot.getChild( 0 ) );

			const viewSelection = new ViewSelection( [
				ViewRange._createFromParentsAndOffsets( viewRoot.getChild( 0 ).getChild( 0 ), 2, viewRoot.getChild( 0 ).getChild( 0 ), 6 )
			] );

			convertSelection( null, { newSelection: viewSelection } );

			expect( modelGetData( model ) ).to.equal( '<paragraph>நி[லைக்]கு</paragraph>' );
		} );

		it( 'should convert multi ranges selection', () => {
			const viewSelection = new ViewSelection( [
				ViewRange._createFromParentsAndOffsets(
					viewRoot.getChild( 0 ).getChild( 0 ), 1, viewRoot.getChild( 0 ).getChild( 0 ), 2 ),
				ViewRange._createFromParentsAndOffsets(
					viewRoot.getChild( 1 ).getChild( 0 ), 1, viewRoot.getChild( 1 ).getChild( 0 ), 2 )
			] );

			convertSelection( null, { newSelection: viewSelection } );

			expect( modelGetData( model ) ).to.equal(
				'<paragraph>f[o]o</paragraph><paragraph>b[a]r</paragraph>' );

			const ranges = Array.from( model.document.selection.getRanges() );
			expect( ranges.length ).to.equal( 2 );

			expect( ranges[ 0 ].start.parent ).to.equal( modelRoot.getChild( 0 ) );
			expect( ranges[ 0 ].start.offset ).to.equal( 1 );
			expect( ranges[ 0 ].end.parent ).to.equal( modelRoot.getChild( 0 ) );
			expect( ranges[ 0 ].end.offset ).to.equal( 2 );

			expect( ranges[ 1 ].start.parent ).to.equal( modelRoot.getChild( 1 ) );
			expect( ranges[ 1 ].start.offset ).to.equal( 1 );
			expect( ranges[ 1 ].end.parent ).to.equal( modelRoot.getChild( 1 ) );
			expect( ranges[ 1 ].end.offset ).to.equal( 2 );
		} );

		it( 'should convert reverse selection', () => {
			const viewSelection = new ViewSelection( [
				ViewRange._createFromParentsAndOffsets(
					viewRoot.getChild( 0 ).getChild( 0 ), 1, viewRoot.getChild( 0 ).getChild( 0 ), 2 ),
				ViewRange._createFromParentsAndOffsets(
					viewRoot.getChild( 1 ).getChild( 0 ), 1, viewRoot.getChild( 1 ).getChild( 0 ), 2 )
			], { backward: true } );

			convertSelection( null, { newSelection: viewSelection } );

			expect( modelGetData( model ) ).to.equal( '<paragraph>f[o]o</paragraph><paragraph>b[a]r</paragraph>' );
			expect( model.document.selection.isBackward ).to.true;
		} );

		it( 'should not enqueue changes if selection has not changed', () => {
			const viewSelection = new ViewSelection( [
				ViewRange._createFromParentsAndOffsets(
					viewRoot.getChild( 0 ).getChild( 0 ), 1, viewRoot.getChild( 0 ).getChild( 0 ), 1 )
			] );

			convertSelection( null, { newSelection: viewSelection } );

			const spy = sinon.spy();

			model.on( 'change', spy );

			convertSelection( null, { newSelection: viewSelection } );

			expect( spy.called ).to.be.false;
		} );
	} );
} );
