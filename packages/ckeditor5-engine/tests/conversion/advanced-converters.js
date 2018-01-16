/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../src/model/model';
import ModelElement from '../../src/model/element';
import ModelText from '../../src/model/text';
import ModelTextProxy from '../../src/model/textproxy';
import ModelRange from '../../src/model/range';
import ModelPosition from '../../src/model/position';
import ModelWalker from '../../src/model/treewalker';

import ViewElement from '../../src/view/element';
import ViewContainerElement from '../../src/view/containerelement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewText from '../../src/view/text';
import ViewWriter from '../../src/view/writer';
import ViewPosition from '../../src/view/position';
import ViewRange from '../../src/view/range';

import EditingController from '../../src/controller/editingcontroller';

import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';

import {
	insertElement,
	changeAttribute,
	wrap
} from '../../src/conversion/model-to-view-converters';
import { convertToModelFragment, convertText } from '../../src/conversion/view-to-model-converters';

describe( 'advanced-converters', () => {
	let model, modelDoc, modelRoot, viewWriter, viewRoot, modelDispatcher, viewDispatcher;

	beforeEach( () => {
		model = new Model();
		modelDoc = model.document;
		modelRoot = modelDoc.createRoot();
		viewWriter = new ViewWriter();

		const editing = new EditingController( model );

		viewRoot = editing.view.document.getRoot();

		// Set name of view root the same as dom root.
		// This is a mock of attaching view root to dom root.
		viewRoot._name = 'div';

		viewDispatcher = new ViewConversionDispatcher( model, { schema: { checkChild: () => true } } );
		viewDispatcher.on( 'text', convertText() );
		viewDispatcher.on( 'documentFragment', convertToModelFragment() );

		modelDispatcher = editing.modelToView;
	} );

	function viewAttributesToString( item ) {
		let result = '';

		for ( const key of item.getAttributeKeys() ) {
			const value = item.getAttribute( key );

			if ( value ) {
				result += ' ' + key + '="' + value + '"';
			}
		}

		return result;
	}

	function viewToString( item ) {
		let result = '';

		if ( item instanceof ViewText ) {
			result = item.data;
		} else {
			// ViewElement or ViewDocumentFragment.
			for ( const child of item.getChildren() ) {
				result += viewToString( child );
			}

			if ( item instanceof ViewElement ) {
				result = '<' + item.name + viewAttributesToString( item ) + '>' + result + '</' + item.name + '>';
			}
		}

		return result;
	}

	function modelAttributesToString( item ) {
		let result = '';

		for ( const attr of item.getAttributes() ) {
			result += ' ' + attr[ 0 ] + '="' + attr[ 1 ] + '"';
		}

		return result;
	}

	function modelToString( item ) {
		let result = '';

		if ( item instanceof ModelTextProxy ) {
			const attributes = modelAttributesToString( item );

			result = attributes ? '<$text' + attributes + '>' + item.data + '</$text>' : item.data;
		} else {
			const walker = new ModelWalker( { boundaries: ModelRange.createIn( item ), shallow: true } );

			for ( const value of walker ) {
				result += modelToString( value.item );
			}

			if ( item instanceof ModelElement ) {
				const attributes = modelAttributesToString( item );

				result = '<' + item.name + attributes + '>' + result + '</' + item.name + '>';
			}
		}

		return result;
	}

	// Converter overwrites default attribute converter for `linkHref` and `linkTitle` attribute is set on `quote` element.
	//
	// Model:
	//
	// [quote {linkHref='foo.html' linkTitle='Foo source'}]
	//   ├─ f
	//   ├─ o
	//   └─ o
	//
	// foo {linkHref='foo.html' linkTitle='Foo title'}
	//
	// View:
	//
	// <blockquote>
	//	 ├─ foo
	//	 └─ <a href="foo.html" title="Foo source">
	//	 	  └─ see source
	//
	// <a href="foo.html" title="Foo title">
	//	 └─ foo
	describe( 'custom attribute handling for given element', () => {
		beforeEach( () => {
			// Normal model-to-view converters for links.
			modelDispatcher.on( 'attribute:linkHref', wrap( value => new ViewAttributeElement( 'a', { href: value } ) ) );
			modelDispatcher.on( 'attribute:linkTitle', wrap( value => new ViewAttributeElement( 'a', { title: value } ) ) );

			// Normal view-to-model converters for links.
			viewDispatcher.on( 'element:a', ( evt, data, consumable, conversionApi ) => {
				if ( consumable.consume( data.input, { name: true, attribute: 'href' } ) ) {
					if ( !data.output ) {
						data.output = conversionApi.convertChildren( data.input, consumable );
					}

					for ( const child of data.output ) {
						child.setAttribute( 'linkHref', data.input.getAttribute( 'href' ) );
					}
				}
			} );

			viewDispatcher.on( 'element:a', ( evt, data, consumable, conversionApi ) => {
				if ( consumable.consume( data.input, { attribute: 'title' } ) ) {
					if ( !data.output ) {
						data.output = conversionApi.convertChildren( data.input, consumable );
					}

					for ( const child of data.output ) {
						child.setAttribute( 'linkTitle', data.input.getAttribute( 'title' ) );
					}
				}
			} );

			// Model-to-view converter for quote element.
			modelDispatcher.on( 'insert:quote', ( evt, data, consumable, conversionApi ) => {
				consumable.consume( data.item, 'insert' );

				const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
				const viewElement = new ViewContainerElement( 'blockquote' );

				conversionApi.mapper.bindElements( data.item, viewElement );
				viewWriter.insert( viewPosition, viewElement );
			}, { priority: 'high' } );

			modelDispatcher.on( 'attribute:linkHref:quote', linkHrefOnQuoteConverter, { priority: 'high' } );
			modelDispatcher.on( 'attribute:linkTitle:quote', linkTitleOnQuoteConverter, { priority: 'high' } );

			function linkHrefOnQuoteConverter( evt, data, consumable, conversionApi ) {
				if ( !consumable.consume( data.item, 'attribute:linkHref' ) ) {
					return;
				}

				const viewQuote = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue === null ) {
					// Attribute was removed -> remove the view link.
					const viewLink = viewQuote.getChild( viewQuote.childCount - 1 );

					viewWriter.remove( ViewRange.createOn( viewLink ) );

					consumable.consume( data.item, 'attribute:linkTitle' );
				} else if ( data.attributeOldValue === null ) {
					// Attribute was added -> add the view link.
					const viewLink = new ViewAttributeElement(
						'a', { href: data.item.getAttribute( 'linkHref' ) }, new ViewText( 'see source' )
					);

					if ( consumable.consume( data.item, 'attribute:linkTitle' ) && data.item.getAttribute( 'linkTitle' ) !== null ) {
						viewLink.setAttribute( 'title', data.item.getAttribute( 'linkTitle' ) );
					}

					viewWriter.insert( new ViewPosition( viewQuote, viewQuote.childCount ), viewLink );
				} else {
					// Attribute has changed -> change the existing view link.
					const viewLink = viewQuote.getChild( viewQuote.childCount - 1 );
					viewLink.setAttribute( 'href', data.attributeNewValue );
				}
			}

			function linkTitleOnQuoteConverter( evt, data, consumable, conversionApi ) {
				if ( !consumable.consume( data.item, 'attribute:linkTitle' ) ) {
					return;
				}

				const viewQuote = conversionApi.mapper.toViewElement( data.item );
				const viewLink = viewQuote.getChild( viewQuote.childCount - 1 );

				if ( !viewLink ) {
					return;
				}

				if ( data.attributeNewValue === null ) {
					viewLink.removeAttribute( 'title' );
				} else {
					viewLink.setAttribute( 'title', data.attributeNewValue );
				}
			}

			// View-to-model converter for quote element.
			viewDispatcher.on( 'element:blockquote', ( evt, data, consumable, conversionApi ) => {
				if ( consumable.consume( data.input, { name: true } ) ) {
					data.output = new ModelElement( 'quote' );

					const viewA = data.input.getChild( data.input.childCount - 1 );

					// Convert the special "a" first, before converting all children.
					if ( viewA instanceof ViewElement && viewA.name == 'a' && consumable.consume( viewA, { name: true } ) ) {
						if ( consumable.consume( viewA, { attribute: 'href' } ) ) {
							data.output.setAttribute( 'linkHref', viewA.getAttribute( 'href' ) );
						}

						if ( consumable.consume( viewA, { attribute: 'title' } ) ) {
							data.output.setAttribute( 'linkTitle', viewA.getAttribute( 'title' ) );
						}
					}

					const children = conversionApi.convertChildren( data.input, consumable );
					data.output.appendChildren( children );
				}
			} );
		} );

		it( 'should convert model text with linkHref and linkTitle to view', () => {
			const modelText = new ModelText( 'foo', { linkHref: 'foo.html', linkTitle: 'Foo title' } );

			// Let's insert text with link attributes.
			model.change( writer => {
				writer.insert(
					modelText,
					new ModelPosition( modelRoot, [ 0 ] )
				);
			} );

			let range = ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 3 );

			expect( viewToString( viewRoot ) ).to.equal( '<div><a href="foo.html" title="Foo title">foo</a></div>' );

			// Let's change link's attributes.
			model.change( writer => {
				writer.setAttribute( 'linkHref', 'bar.html', range );
				writer.setAttribute( 'linkTitle', 'Bar title', range );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><a href="bar.html" title="Bar title">foo</a></div>' );

			// Let's remove a letter from the link.
			model.change( writer => {
				writer.remove( ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 1 ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><a href="bar.html" title="Bar title">oo</a></div>' );

			// Let's remove just one attribute.
			model.change( writer => {
				range = ModelRange.createIn( modelRoot );
				writer.removeAttribute( 'linkTitle', range );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><a href="bar.html">oo</a></div>' );

			// Let's remove the other attribute.
			model.change( writer => {
				range = ModelRange.createIn( modelRoot );
				writer.removeAttribute( 'linkHref', range );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>oo</div>' );
		} );

		it( 'should convert a view element to model', () => {
			const viewElement = new ViewAttributeElement( 'a', { href: 'foo.html', title: 'Foo title' }, new ViewText( 'foo' ) );

			const modelText = viewDispatcher.convert( viewElement ).getChild( 0 );

			expect( modelText ).to.be.instanceof( ModelText );
			expect( modelText.data ).to.equal( 'foo' );
			expect( modelText.getAttribute( 'linkHref' ) ).to.equal( 'foo.html' );
			expect( modelText.getAttribute( 'linkTitle' ) ).to.equal( 'Foo title' );
		} );

		it( 'should convert quote model element with linkHref and linkTitle attribute to view', () => {
			modelDispatcher.on( 'attribute:bold', wrap( new ViewAttributeElement( 'strong' ) ) );

			const modelElement = new ModelElement( 'quote', { linkHref: 'foo.html', linkTitle: 'Foo source' }, new ModelText( 'foo' ) );

			// Let's insert a quote element with link attribute.
			model.change( writer => {
				writer.insert(
					modelElement,
					new ModelPosition( modelRoot, [ 0 ] )
				);
			} );

			let expected = '<div><blockquote>foo<a href="foo.html" title="Foo source">see source</a></blockquote></div>';
			expect( viewToString( viewRoot ) ).to.equal( expected );

			// And insert some additional content into it.
			model.change( writer => {
				writer.insert(
					new ModelText( 'bar', { bold: true } ),
					new ModelPosition( modelRoot, [ 0, 3 ] )
				);
			} );

			expected = '<div><blockquote>foo<strong>bar</strong><a href="foo.html" title="Foo source">see source</a></blockquote></div>';
			expect( viewToString( viewRoot ) ).to.equal( expected );

			// Let's change some attributes.
			model.change( writer => {
				writer.removeAttribute( 'linkTitle', modelElement );
				writer.setAttribute( 'linkHref', 'bar.html', modelElement );
			} );

			expected = '<div><blockquote>foo<strong>bar</strong><a href="bar.html">see source</a></blockquote></div>';
			expect( viewToString( viewRoot ) ).to.equal( expected );

			// Let's remove the only attribute connected with link.
			model.change( writer => {
				writer.removeAttribute( 'linkHref', modelElement );
			} );

			expected = '<div><blockquote>foo<strong>bar</strong></blockquote></div>';
			expect( viewToString( viewRoot ) ).to.equal( expected );
		} );

		it( 'should convert view blockquote with a element to model', () => {
			const viewElement = new ViewContainerElement(
				'blockquote',
				null,
				[
					new ViewText( 'foo' ),
					new ViewAttributeElement(
						'a',
						{
							href: 'foo.html',
							title: 'Foo source'
						},
						new ViewText( 'see source' )
					)
				]
			);

			const modelElement = viewDispatcher.convert( viewElement );

			expect( modelToString( modelElement ) ).to.equal( '<quote linkHref="foo.html" linkTitle="Foo source">foo</quote>' );
		} );
	} );

	// Default view converter for tables that will convert table structure into paragraphs if tables are not supported.
	// TRs are supposed to become paragraphs and TDs content should be separated using space.
	it( 'default table view to model converter', () => {
		viewDispatcher.on( 'element:a', ( evt, data, consumable, conversionApi ) => {
			if ( consumable.consume( data.input, { name: true, attribute: 'href' } ) ) {
				if ( !data.output ) {
					data.output = conversionApi.convertChildren( data.input, consumable );
				}

				for ( const child of data.output ) {
					child.setAttribute( 'linkHref', data.input.getAttribute( 'href' ) );
				}
			}
		} );

		viewDispatcher.on( 'element:tr', ( evt, data, consumable, conversionApi ) => {
			if ( consumable.consume( data.input, { name: true } ) ) {
				data.output = new ModelElement( 'paragraph' );

				const children = conversionApi.convertChildren( data.input, consumable );

				for ( let i = 1; i < children.childCount; i++ ) {
					const child = children.getChild( i );

					if ( child instanceof ModelText && child.previousSibling instanceof ModelText ) {
						children.insertChildren( i, new ModelText( ' ' ) );
						i++;
					}
				}

				data.output.appendChildren( children );
			}
		} );

		viewDispatcher.on( 'element:table', ( evt, data, consumable, conversionApi ) => {
			if ( consumable.consume( data.input, { name: true } ) ) {
				data.output = conversionApi.convertChildren( data.input, consumable );
			}
		} );

		viewDispatcher.on( 'element:td', ( evt, data, consumable, conversionApi ) => {
			if ( consumable.consume( data.input, { name: true } ) ) {
				data.output = conversionApi.convertChildren( data.input, consumable );
			}
		} );

		const viewTable = new ViewContainerElement( 'table', null, [
			new ViewContainerElement( 'tr', null, [
				new ViewContainerElement( 'td', null, new ViewText( 'foo' ) ),
				new ViewContainerElement( 'td', null, new ViewAttributeElement( 'a', { href: 'bar.html' }, new ViewText( 'bar' ) ) )
			] ),
			new ViewContainerElement( 'tr', null, [
				new ViewContainerElement( 'td' ),
				new ViewContainerElement( 'td', null, new ViewText( 'abc' ) )
			] )
		] );

		expect( modelToString( viewDispatcher.convert( viewTable ) ) )
			.to.equal( '<paragraph>foo <$text linkHref="bar.html">bar</$text></paragraph><paragraph>abc</paragraph>' );
	} );

	// Model converter that converts any non-converted elements and attributes into view elements and attributes.
	// View converter that converts any non-converted elements and attributes into model elements and attributes.
	describe( 'universal converter', () => {
		beforeEach( () => {
			// "Universal" converters
			modelDispatcher.on( 'insert', insertElement( data => new ViewContainerElement( data.item.name ) ), { priority: 'lowest' } );
			modelDispatcher.on( 'attribute', changeAttribute(), { priority: 'lowest' } );

			viewDispatcher.on( 'element', ( evt, data, consumable, conversionApi ) => {
				if ( consumable.consume( data.input, { name: true } ) ) {
					data.output = new ModelElement( data.input.name );

					for ( const key of data.input.getAttributeKeys() ) {
						if ( consumable.consume( data.input, { attribute: key } ) ) {
							data.output.setAttribute( key, data.input.getAttribute( key ) );
						}
					}

					data.output.appendChildren( conversionApi.convertChildren( data.input, consumable ) );
				}
			}, { priority: 'lowest' } );

			// "Real" converters -- added with higher priority. Should overwrite the "universal" converters.
			modelDispatcher.on( 'insert:image', insertElement( new ViewContainerElement( 'img' ) ) );
			modelDispatcher.on( 'attribute:bold', wrap( new ViewAttributeElement( 'strong' ) ) );

			viewDispatcher.on( 'element:img', ( evt, data, consumable ) => {
				if ( consumable.consume( data.input, { name: true } ) ) {
					const modelImage = new ModelElement( 'image' );

					for ( const attributeKey of data.input.getAttributeKeys() ) {
						modelImage.setAttribute( attributeKey, data.input.getAttribute( attributeKey ) );
					}

					data.output = modelImage;
				}
			} );
			viewDispatcher.on( 'element:strong', ( evt, data, consumable, conversionApi ) => {
				if ( consumable.consume( data.input, { name: true } ) ) {
					if ( !data.output ) {
						data.output = conversionApi.convertChildren( data.input, consumable );
					}

					for ( const child of data.output ) {
						child.setAttribute( 'bold', true );
					}
				}
			} );
		} );

		it( 'should convert model to view', () => {
			const modelElement = new ModelElement( 'table', { cellpadding: 5, cellspacing: 5 }, [
				new ModelElement( 'tr', null, [
					new ModelElement( 'td', null, [
						new ModelText( 'foo ' ),
						new ModelText( 'abc', { bold: true } ),
						new ModelText( ' bar' )
					] ),
					new ModelElement( 'td', null, [
						new ModelElement( 'foo', { foo: 'bar' }, new ModelText( 'bar' ) )
					] )
				] )
			] );

			modelRoot.appendChildren( modelElement );
			modelDispatcher.convertInsert( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal(
				'<div>' +
					'<table cellpadding="5" cellspacing="5">' +
						'<tr>' +
							'<td>foo <strong>abc</strong> bar</td>' +
							'<td><foo foo="bar">bar</foo></td>' +
						'</tr>' +
					'</table>' +
				'</div>'
			);
		} );

		it( 'should convert view to model', () => {
			const viewElement = new ViewContainerElement( 'table', { cellpadding: 5, cellspacing: 5 }, [
				new ViewContainerElement( 'tr', null, [
					new ViewContainerElement( 'td', null, [
						new ViewText( 'foo ' ),
						new ViewAttributeElement( 'strong', null, new ViewText( 'abc' ) ),
						new ViewText( ' bar' )
					] ),
					new ViewContainerElement( 'td', null, new ViewContainerElement( 'foo', { foo: 'bar' }, new ViewText( 'bar' ) ) )
				] )
			] );

			const modelElement = viewDispatcher.convert( viewElement );

			expect( modelToString( modelElement ) ).to.equal(
				'<table cellpadding="5" cellspacing="5">' +
					'<tr>' +
						'<td>foo <$text bold="true">abc</$text> bar</td>' +
						'<td><foo foo="bar">bar</foo></td>' +
					'</tr>' +
				'</table>'
			);
		} );
	} );
} );
