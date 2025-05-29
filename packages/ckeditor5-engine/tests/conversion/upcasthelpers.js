/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import UpcastDispatcher from '../../src/conversion/upcastdispatcher.js';

import ViewContainerElement from '../../src/view/containerelement.js';
import ViewDocumentFragment from '../../src/view/documentfragment.js';
import ViewText from '../../src/view/text.js';
import ViewUIElement from '../../src/view/uielement.js';
import ViewAttributeElement from '../../src/view/attributeelement.js';
import ViewDocument from '../../src/view/document.js';

import Model from '../../src/model/model.js';
import ModelDocumentFragment from '../../src/model/documentfragment.js';
import ModelElement from '../../src/model/element.js';
import ModelText from '../../src/model/text.js';
import ModelRange from '../../src/model/range.js';
import ModelPosition from '../../src/model/position.js';

import UpcastHelpers, { convertToModelFragment, convertText, convertSelectionChange } from '../../src/conversion/upcasthelpers.js';

import { getData as modelGetData, setData as modelSetData, stringify } from '../../src/dev-utils/model.js';
import View from '../../src/view/view.js';
import createViewRoot from '../view/_utils/createroot.js';
import { setData as viewSetData, parse as viewParse } from '../../src/dev-utils/view.js';
import Mapper from '../../src/conversion/mapper.js';
import ViewSelection from '../../src/view/selection.js';
import ViewRange from '../../src/view/range.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import Writer from '../../src/model/writer.js';

import toArray from '@ckeditor/ckeditor5-utils/src/toarray.js';

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
				model: ( viewElement, { writer } ) => {
					return writer.createElement( 'heading', { level: viewElement.getAttribute( 'data-level' ) } );
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
				model: 'paragraph',
				view: /.+/
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
					value: ( viewElement, conversionApi, data ) => {
						const fontSize = viewElement.getStyle( 'font-size' );
						const value = fontSize.substr( 0, fontSize.length - 2 );

						// To ensure conversion API is provided.
						expect( conversionApi.writer ).to.instanceof( Writer );

						// To ensure upcast conversion data is provided.
						expect( data.modelCursor ).to.be.instanceof( ModelPosition );
						expect( data.viewItem ).to.equal( viewElement );
						expect( data.modelRange ).to.be.null;

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

			// On a high priority, so we could check if it does not consume anything before the above converter.
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

		it( 'should not do anything if returned model attribute is undefined', () => {
			upcastHelpers.elementToAttribute( { view: 'strong', model: 'bold' } );

			// On a high priority, so we could check if it does not consume anything before the above converter.
			upcastHelpers.elementToAttribute( {
				view: 'strong',
				model: {
					key: 'bold',
					value: () => undefined
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

		it( 'should allow to convert an attribute if an element was already consumed', () => {
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

		it( 'should consume an element even if only attributes were converted', () => {
			upcastHelpers.elementToAttribute( {
				model: 'attribA',
				view: { name: 'strong', classes: 'foo' }
			} );

			upcastHelpers.elementToAttribute( {
				model: 'attribB',
				view: { name: 'strong', classes: 'bar' }
			} );

			// This one should not get converted because element itself is already consumed.
			upcastHelpers.elementToAttribute( {
				model: 'bold',
				view: { name: 'strong' }
			} );

			expectResult(
				new ViewAttributeElement( viewDocument, 'strong', { class: 'foo bar' }, new ViewText( viewDocument, 'foo' ) ),
				'<$text attribA="true" attribB="true">foo</$text>'
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

		// #8921.
		describe( 'overwriting attributes while converting nested elements', () => {
			beforeEach( () => {
				schema.extend( '$text', {
					allowAttributes: [ 'fontSize', 'fontColor' ]
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

							return Number( value );
						}
					}
				} );

				upcastHelpers.elementToAttribute( {
					view: {
						name: 'span',
						styles: {
							'color': /#[a-f0-9]{6}/
						}
					},
					model: {
						key: 'fontColor',
						value: viewElement => viewElement.getStyle( 'color' )
					}
				} );
			} );

			it( 'should not overwrite attributes if nested elements have the same attribute but different values', () => {
				const viewElement = viewParse( '<span style="font-size:9px"><span style="font-size:11px">Bar</span></span>' );

				expectResult(
					viewElement,
					'<$text fontSize="11">Bar</$text>'
				);
			} );

			it( 'should convert text before the nested duplicated attribute with the most outer value', () => {
				const viewElement = viewParse( '<span style="font-size:9px">Foo<span style="font-size:11px">Bar</span></span>' );

				expectResult(
					viewElement,
					'<$text fontSize="9">Foo</$text><$text fontSize="11">Bar</$text>'
				);
			} );

			it( 'should convert text after the nested duplicated attribute with the most outer values', () => {
				const viewElement = viewParse( '<span style="font-size:9px"><span style="font-size:11px">Bar</span>Bom</span>' );

				expectResult(
					viewElement,
					'<$text fontSize="11">Bar</$text><$text fontSize="9">Bom</$text>'
				);
			} );

			it( 'should convert texts before and after the nested duplicated attribute with the most outer value', () => {
				const viewElement = viewParse( '<span style="font-size:9px">Foo<span style="font-size:11px">Bar</span>Bom</span>' );

				expectResult(
					viewElement,
					'<$text fontSize="9">Foo</$text><$text fontSize="11">Bar</$text><$text fontSize="9">Bom</$text>'
				);
			} );

			it( 'should work with multiple duplicated attributes', () => {
				const viewElement = viewParse(
					'<span style="font-size:9px;color: #0000ff"><span style="font-size:11px;color: #ff0000">Bar</span></span>'
				);

				expectResult(
					viewElement,
					'<$text fontColor="#ff0000" fontSize="11">Bar</$text>'
				);
			} );

			it( 'should convert non-duplicated attributes from the most outer element', () => {
				const viewElement = viewParse(
					'<span style="font-size:9px;color: #0000ff"><span style="font-size:11px;">Bar</span></span>'
				);

				expectResult(
					viewElement,
					'<$text fontColor="#0000ff" fontSize="11">Bar</$text>'
				);
			} );

			// See https://github.com/ckeditor/ckeditor5/pull/9249#issuecomment-813935851
			it( 'should consume both elements even if the attribute from the most inner element will be used', () => {
				upcastDispatcher.on( 'element:span', ( evt, data, conversionApi ) => {
					const viewItem = data.viewItem;
					const wasConsumed = conversionApi.consumable.consume( viewItem, {
						styles: [ 'font-size' ]
					} );

					expect( wasConsumed, `span[fontSize=${ viewItem.getStyle( 'font-size' ) }]` ).to.equal( false );
				}, { priority: 'lowest' } );

				const viewElement = viewParse(
					'<span style="font-size:9px;"><span style="font-size:11px;">Bar</span></span>'
				);

				expectResult(
					viewElement,
					'<$text fontSize="11">Bar</$text>'
				);
			} );
		} );
	} );

	describe( 'attributeToAttribute()', () => {
		beforeEach( () => {
			upcastHelpers.elementToElement( { view: 'img', model: 'imageBlock' } );

			schema.register( 'imageBlock', {
				inheritAllFrom: '$block'
			} );
		} );

		it( 'should be chainable', () => {
			expect( upcastHelpers.attributeToAttribute( { view: 'src', model: 'source' } ) ).to.equal( upcastHelpers );
		} );

		it( 'config.view is a string', () => {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'source' ]
			} );

			upcastHelpers.attributeToAttribute( { view: 'src', model: 'source' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { src: 'foo.jpg' } ),
				'<imageBlock source="foo.jpg"></imageBlock>'
			);
		} );

		it( 'config.view has only key set', () => {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'source' ]
			} );

			upcastHelpers.attributeToAttribute( { view: { key: 'src' }, model: 'source' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { src: 'foo.jpg' } ),
				'<imageBlock source="foo.jpg"></imageBlock>'
			);
		} );

		it( 'config.view has only key and name set', () => {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'source' ]
			} );

			upcastHelpers.attributeToAttribute( { view: { name: 'img', key: 'src' }, model: { name: 'imageBlock', key: 'source' } } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { src: 'foo.jpg' } ),
				'<imageBlock source="foo.jpg"></imageBlock>'
			);
		} );

		it( 'can be overwritten using converterPriority', () => {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'src', 'source' ]
			} );

			upcastHelpers.attributeToAttribute( { view: { key: 'src' }, model: 'src' } );
			upcastHelpers.attributeToAttribute( { view: { key: 'src' }, model: 'source', converterPriority: 'normal' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { src: 'foo.jpg' } ),
				'<imageBlock source="foo.jpg"></imageBlock>'
			);
		} );

		it( 'config.view has value set', () => {
			schema.extend( 'imageBlock', {
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
				'<imageBlock styled="dark"></imageBlock>'
			);
		} );

		it( 'config.view does not have value set for style key', () => {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'styled' ]
			} );

			upcastHelpers.attributeToAttribute( {
				view: 'style',
				model: 'styled'
			} );

			// Ensure that proper consumables are consumed.
			upcastDispatcher.on( 'element', ( evt, data, { consumable } ) => {
				expect( consumable.test( data.viewItem, { styles: [ 'border', 'padding' ] } ) ).to.be.true;
				expect( consumable.test( data.viewItem, { styles: [ 'border' ] } ) ).to.be.true;
				expect( consumable.test( data.viewItem, { styles: [ 'padding' ] } ) ).to.be.true;
			}, { priority: 'highest' } );

			upcastDispatcher.on( 'element', ( evt, data, { consumable } ) => {
				expect( consumable.test( data.viewItem, { styles: [ 'border', 'padding' ] } ) ).to.be.false;
				expect( consumable.test( data.viewItem, { styles: [ 'border' ] } ) ).to.be.false;
				expect( consumable.test( data.viewItem, { styles: [ 'padding' ] } ) ).to.be.false;
			}, { priority: 'lowest' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { 'style': 'border: 2px solid red; padding: 6px 3px;' } ),
				'<imageBlock styled="border:2px solid red;padding:6px 3px;"></imageBlock>'
			);
		} );

		it( 'config.view does not have value set for class key', () => {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'classNames' ]
			} );

			upcastHelpers.attributeToAttribute( {
				view: 'class',
				model: 'classNames'
			} );

			// Ensure that proper consumables are consumed.
			upcastDispatcher.on( 'element', ( evt, data, { consumable } ) => {
				expect( consumable.test( data.viewItem, { classes: [ 'foo', 'bar' ] } ) ).to.be.true;
				expect( consumable.test( data.viewItem, { classes: [ 'foo' ] } ) ).to.be.true;
				expect( consumable.test( data.viewItem, { classes: [ 'bar' ] } ) ).to.be.true;
			}, { priority: 'highest' } );

			upcastDispatcher.on( 'element', ( evt, data, { consumable } ) => {
				expect( consumable.test( data.viewItem, { classes: [ 'foo', 'bar' ] } ) ).to.be.false;
				expect( consumable.test( data.viewItem, { classes: [ 'foo' ] } ) ).to.be.false;
				expect( consumable.test( data.viewItem, { classes: [ 'bar' ] } ) ).to.be.false;
			}, { priority: 'lowest' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { 'class': 'foo bar' } ),
				'<imageBlock classNames="foo bar"></imageBlock>'
			);
		} );

		it( 'model attribute value is a string', () => {
			schema.extend( 'imageBlock', {
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
				'<imageBlock styled="dark"></imageBlock>'
			);

			expectResult(
				new ViewContainerElement( viewDocument, 'img', { class: 'styled-xxx' } ),
				'<imageBlock></imageBlock>'
			);

			expectResult(
				new ViewContainerElement( viewDocument, 'p', { class: 'styled-dark' } ),
				'<paragraph></paragraph>'
			);
		} );

		it( 'model attribute value is a function', () => {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'styled' ]
			} );

			upcastHelpers.attributeToAttribute( {
				view: {
					key: 'class',
					value: /styled-[\S]+/
				},
				model: {
					key: 'styled',
					value: ( viewElement, conversionApi, data ) => {
						const regexp = /styled-([\S]+)/;
						const match = viewElement.getAttribute( 'class' ).match( regexp );

						// To ensure conversion API is provided.
						expect( conversionApi.writer ).to.instanceof( Writer );

						// To ensure upcast conversion data is provided.
						expect( data.modelCursor ).to.be.instanceof( ModelPosition );
						expect( data.viewItem ).to.equal( viewElement );
						expect( data.modelRange ).to.be.instanceOf( ModelRange );
						expect( data.modelRange.start.path ).to.be.deep.equal( [ 0 ] );
						expect( data.modelRange.end.path ).to.be.deep.equal( [ 1 ] );

						return match[ 1 ];
					}
				}
			} );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { 'class': 'styled-dark' } ),
				'<imageBlock styled="dark"></imageBlock>'
			);
		} );

		it( 'should not set an attribute if it is not allowed by schema', () => {
			upcastHelpers.attributeToAttribute( { view: 'src', model: 'source' } );

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { src: 'foo.jpg' } ),
				'<imageBlock></imageBlock>'
			);
		} );

		it( 'should not do anything if returned model attribute is null', () => {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'styled' ]
			} );

			// Run this first to verify if it does not consume.
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

			// This runs later as the above should not consume anything.
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

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { class: 'styled' } ),
				'<imageBlock styled="true"></imageBlock>'
			);
		} );

		it( 'should not do anything if returned model attribute is undefined', () => {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'styled' ]
			} );

			// Run this first to verify if it does not consume.
			upcastHelpers.attributeToAttribute( {
				view: {
					key: 'class',
					value: 'styled'
				},
				model: {
					key: 'styled',
					value: () => undefined
				}
			} );

			// This runs later as the above should not consume anything.
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

			expectResult(
				new ViewAttributeElement( viewDocument, 'img', { class: 'styled' } ),
				'<imageBlock styled="true"></imageBlock>'
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

		// https://github.com/ckeditor/ckeditor5/issues/11000
		it( 'should not set an attribute on child nodes if parent was not converted', () => {
			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );
			upcastHelpers.attributeToAttribute( { view: { key: 'foo' }, model: 'foo' } );

			schema.extend( 'paragraph', {
				allowAttributes: [ 'foo' ]
			} );

			schema.extend( '$text', {
				allowAttributes: [ 'foo' ]
			} );

			const viewElement = viewParse(
				'<div foo="foo-value">abc</div>' +
				'<p foo="foo-value">def</p>'
			);

			expectResult(
				viewElement,
				'abc<paragraph foo="foo-value">def</paragraph>'
			);
		} );

		// #9536.
		describe( 'calling the `model.value()` callback', () => {
			it( 'should not call the `model.view()` callback if the attribute was already consumed', () => {
				const spy = sinon.spy();

				upcastHelpers.attributeToAttribute( {
					view: {
						name: 'span',
						styles: {
							'text-align': /[\s\S]+/
						}
					},
					model: {
						key: 'alignment',
						value: spy
					}
				} );

				upcastDispatcher.on( 'element:span', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, {
						styles: [ 'text-align' ]
					} );
				} );

				const viewElement = viewParse( '<span style="text-align:center;">Foo.</span>' );

				expectResult(
					viewElement,
					'Foo.'
				);

				expect( spy.called ).to.equal( false );
			} );
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
				model: ( viewElement, conversionApi ) => {
					// To ensure conversion API is provided.
					expect( conversionApi.writer ).to.instanceof( Writer );

					return 'comment:' + viewElement.getAttribute( 'data-comment-id' );
				}
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
			upcastHelpers.dataToMarker( {
				view: 'g',
				model: ( name, conversionApi ) => {
					// To ensure conversion API is provided.
					expect( conversionApi.writer ).to.instanceof( Writer );

					return 'group:' + name.split( '_' )[ 0 ];
				}
			} );

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

		it( 'should convert children if the view element has not been converted yet', () => {
			upcastHelpers.dataToMarker( { view: 'group' } );

			expectResult(
				viewParse( '<div data-group-end-after="foo" data-group-start-before="foo"><p>Foo</p></div>' ),
				'<paragraph>Foo</paragraph>',
				{ name: 'group:foo', start: [ 0 ], end: [ 1 ] }
			);
		} );

		it( 'should not invoke conversion API when the attributes are not consumable', () => {
			upcastHelpers.dataToMarker( { view: 'fake' } );

			let conversionConsumeSpy = sinon.spy();

			upcastDispatcher.on( 'element:div', ( evt, data, conversionApi ) => {
				conversionConsumeSpy = sinon.spy( conversionApi.consumable, 'consume' );
			} );

			expectResult(
				viewParse( '<div data-group-end-after="foo" data-group-start-before="foo"><p>Foo</p></div>' ),
				'<paragraph>Foo</paragraph>',
				[]
			);

			for ( const consumeCall of conversionConsumeSpy.getCalls() ) {
				if ( consumeCall.args[ 1 ] ) {
					expect( consumeCall.args[ 1 ] ).to.not.have.property( 'attributes' );
				}
			}
		} );
	} );

	function expectResult( viewToConvert, modelString, markers ) {
		const conversionResult = model.change( writer => upcastDispatcher.convert( viewToConvert, writer ) );

		if ( markers ) {
			markers = toArray( markers );

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
				if ( ( childDef.name == '$text' || childDef.name == 'paragraph' ) && ctx.endsWith( '$root' ) ) {
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

		it( 'should auto-paragraph a text if it is not allowed at the insertion position but would be inserted if auto-paragraphed', () => {
			schema.addChildCheck( ( ctx, childDef ) => {
				if ( childDef.name == '$text' && ctx.endsWith( '$root' ) ) {
					return false;
				}
			} );

			const viewText = new ViewText( viewDocument, 'foobar' );
			dispatcher.on( 'text', convertText() );
			let conversionResult = model.change( writer => dispatcher.convert( viewText, writer, context ) );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.childCount ).to.equal( 1 );
			expect( conversionResult.getChild( 0 ).name ).to.equal( 'paragraph' );
			expect( conversionResult.getNodeByPath( [ 0, 0 ] ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getNodeByPath( [ 0, 0 ] ).data ).to.equal( 'foobar' );

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
					conversionApi.convertChildren( data.viewItem, paragraph );

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
