/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EditingController from '../../src/controller/editingcontroller';

import Conversion from '../../src/conversion/conversion';

import Model from '../../src/model/model';
import ModelElement from '../../src/model/element';
import ModelText from '../../src/model/text';
import ModelRange from '../../src/model/range';
import ModelPosition from '../../src/model/position';

import ViewElement from '../../src/view/element';
import ViewContainerElement from '../../src/view/containerelement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewUIElement from '../../src/view/uielement';
import ViewText from '../../src/view/text';

import {
	downcastElementToElement, downcastAttributeToElement, downcastAttributeToAttribute, downcastMarkerToElement, downcastMarkerToHighlight,
	insertElement, insertUIElement, changeAttribute, wrap, removeUIElement,
	highlightElement, highlightText, removeHighlight, createViewElementFromHighlightDescriptor
} from '../../src/conversion/downcast-converters';

import { stringify } from '../../src/dev-utils/view';

describe( 'downcast-helpers', () => {
	let conversion, model, modelRoot, viewRoot;

	beforeEach( () => {
		model = new Model();
		const modelDoc = model.document;
		modelRoot = modelDoc.createRoot();

		const controller = new EditingController( model );

		// Set name of view root the same as dom root.
		// This is a mock of attaching view root to dom root.
		controller.view.document.getRoot()._name = 'div';

		viewRoot = controller.view.document.getRoot();

		conversion = new Conversion();
		conversion.register( 'downcast', [ controller.downcastDispatcher ] );
	} );

	describe( 'downcastElementToElement', () => {
		it( 'config.view is a string', () => {
			const helper = downcastElementToElement( { model: 'paragraph', view: 'p' } );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'paragraph', modelRoot, 0 );
			} );

			expectResult( '<p></p>' );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = downcastElementToElement( { model: 'paragraph', view: 'p' } );
			const helperB = downcastElementToElement( { model: 'paragraph', view: 'foo' }, 'high' );

			conversion.for( 'downcast' ).add( helperA ).add( helperB );

			model.change( writer => {
				writer.insertElement( 'paragraph', modelRoot, 0 );
			} );

			expectResult( '<foo></foo>' );
		} );

		it( 'config.view is a view element definition', () => {
			const helper = downcastElementToElement( {
				model: 'fancyParagraph',
				view: {
					name: 'p',
					class: 'fancy'
				}
			} );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'fancyParagraph', modelRoot, 0 );
			} );

			expectResult( '<p class="fancy"></p>' );
		} );

		it( 'config.view is a function', () => {
			const helper = downcastElementToElement( {
				model: 'heading',
				view: modelElement => new ViewContainerElement( 'h' + modelElement.getAttribute( 'level' ) )
			} );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'heading', { level: 2 }, modelRoot, 0 );
			} );

			expectResult( '<h2></h2>' );
		} );
	} );

	describe( 'downcastAttributeToElement', () => {
		it( 'config.view is a string', () => {
			const helper = downcastAttributeToElement( 'bold', { view: 'strong' } );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', { bold: true }, modelRoot, 0 );
			} );

			expectResult( '<strong>foo</strong>' );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = downcastAttributeToElement( 'bold', { view: 'strong' } );
			const helperB = downcastAttributeToElement( 'bold', { view: 'b' }, 'high' );

			conversion.for( 'downcast' ).add( helperA ).add( helperB );

			model.change( writer => {
				writer.insertText( 'foo', { bold: true }, modelRoot, 0 );
			} );

			expectResult( '<b>foo</b>' );
		} );

		it( 'config.view is a view element definition', () => {
			const helper = downcastAttributeToElement( 'bold', {
				view: {
					name: 'span',
					class: 'bold'
				}
			} );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', { bold: true }, modelRoot, 0 );
			} );

			expectResult( '<span class="bold">foo</span>' );
		} );

		it( 'config.view is a view element definition, model attribute value specified', () => {
			const helper = downcastAttributeToElement( 'styled', {
				model: 'dark',
				view: {
					name: 'span',
					class: [ 'styled', 'styled-dark' ]
				}
			} );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', { styled: 'dark' }, modelRoot, 0 );
			} );

			expectResult( '<span class="styled styled-dark">foo</span>' );

			model.change( writer => {
				writer.setAttribute( 'styled', 'xyz', modelRoot.getChild( 0 ) );
			} );

			expectResult( 'foo' );
		} );

		it( 'multiple config items', () => {
			const helper = downcastAttributeToElement( 'fontSize', [
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

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', { fontSize: 'big' }, modelRoot, 0 );
			} );

			expectResult( '<span style="font-size:1.2em">foo</span>' );

			model.change( writer => {
				writer.setAttribute( 'fontSize', 'small', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<span style="font-size:0.8em">foo</span>' );

			model.change( writer => {
				writer.removeAttribute( 'fontSize', modelRoot.getChild( 0 ) );
			} );

			expectResult( 'foo' );
		} );

		it( 'config.view is a function', () => {
			const helper = downcastAttributeToElement( 'bold', {
				view: attributeValue => new ViewAttributeElement( 'span', { style: 'font-weight:' + attributeValue } )
			} );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', { bold: '500' }, modelRoot, 0 );
			} );

			expectResult( '<span style="font-weight:500">foo</span>' );
		} );
	} );

	describe( 'downcastAttributeToAttribute', () => {
		beforeEach( () => {
			conversion.for( 'downcast' ).add( downcastElementToElement( { model: 'image', view: 'img' } ) );
		} );

		it( 'config not set', () => {
			const helper = downcastAttributeToAttribute( 'src' );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'image', { src: 'foo.jpg' }, modelRoot, 0 );
			} );

			expectResult( '<img src="foo.jpg"></img>' );
		} );

		it( 'config.view is a string', () => {
			const helper = downcastAttributeToAttribute( 'source', { view: 'src' } );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'image', { source: 'foo.jpg' }, modelRoot, 0 );
			} );

			expectResult( '<img src="foo.jpg"></img>' );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = downcastAttributeToAttribute( 'source', { view: 'href' } );
			const helperB = downcastAttributeToAttribute( 'source', { view: 'src' }, 'high' );

			conversion.for( 'downcast' ).add( helperA ).add( helperB );

			model.change( writer => {
				writer.insertElement( 'image', { source: 'foo.jpg' }, modelRoot, 0 );
			} );

			expectResult( '<img src="foo.jpg"></img>' );
		} );

		it( 'config.view is an object', () => {
			const helper = downcastAttributeToAttribute( 'stylish', { view: { key: 'class', value: 'styled' } } );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'image', { stylish: true }, modelRoot, 0 );
			} );

			expectResult( '<img class="styled"></img>' );
		} );

		it( 'config.view is an object, model attribute value specified', () => {
			const helper = downcastAttributeToAttribute( 'styled', {
				model: 'dark',
				view: {
					key: 'class',
					value: 'styled-dark styled'
				}
			} );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'image', { styled: 'dark' }, modelRoot, 0 );
			} );

			expectResult( '<img class="styled styled-dark"></img>' );

			model.change( writer => {
				writer.setAttribute( 'styled', 'xyz', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<img></img>' );
		} );

		it( 'multiple config items', () => {
			const helper = downcastAttributeToAttribute( 'styled', [
				{
					model: 'dark',
					view: {
						key: 'class',
						value: 'styled-dark'
					}
				},
				{
					model: 'light',
					view: {
						key: 'class',
						value: 'styled-light'
					}
				}
			] );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'image', { styled: 'dark' }, modelRoot, 0 );
			} );

			expectResult( '<img class="styled-dark"></img>' );

			model.change( writer => {
				writer.setAttribute( 'styled', 'light', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<img class="styled-light"></img>' );

			model.change( writer => {
				writer.setAttribute( 'styled', 'xyz', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<img></img>' );
		} );

		it( 'config.view is a function', () => {
			const helper = downcastAttributeToAttribute( 'styled', {
				view: attributeValue => ( { key: 'class', value: 'styled-' + attributeValue } )
			} );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'image', { styled: 'pull-out' }, modelRoot, 0 );
			} );

			expectResult( '<img class="styled-pull-out"></img>' );
		} );
	} );

	describe( 'downcastMarkerToElement', () => {
		it( 'config.view is a string', () => {
			const helper = downcastMarkerToElement( { model: 'search', view: 'marker-search' } );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'search', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ) );
			} );

			expectResult( 'f<marker-search></marker-search>o<marker-search></marker-search>o' );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = downcastMarkerToElement( { model: 'search', view: 'marker-search' } );
			const helperB = downcastMarkerToElement( { model: 'search', view: 'search' }, 'high' );

			conversion.for( 'downcast' ).add( helperA ).add( helperB );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'search', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ) );
			} );

			expectResult( 'f<search></search>o<search></search>o' );
		} );

		it( 'config.view is a view element definition', () => {
			const helper = downcastMarkerToElement( {
				model: 'search',
				view: {
					name: 'span',
					attribute: {
						'data-marker': 'search'
					}
				}
			} );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'search', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ) );
			} );

			expectResult( 'f<span data-marker="search"></span>o<span data-marker="search"></span>o' );
		} );

		it( 'config.view is a function', () => {
			const helper = downcastMarkerToElement( {
				model: 'search',
				view: data => {
					return new ViewUIElement( 'span', { 'data-marker': 'search', 'data-start': data.isOpening } );
				}
			} );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'search', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ) );
			} );

			expectResult( 'f<span data-marker="search" data-start="true"></span>o<span data-marker="search" data-start="false"></span>o' );
		} );
	} );

	describe( 'downcastMarkerToHighlight', () => {
		it( 'config.view is a highlight descriptor', () => {
			const helper = downcastMarkerToHighlight( { model: 'comment', view: { class: 'comment' } } );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'comment', ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 3 ) );
			} );

			expectResult( '<span class="comment">foo</span>' );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = downcastMarkerToHighlight( { model: 'comment', view: { class: 'comment' } } );
			const helperB = downcastMarkerToHighlight( { model: 'comment', view: { class: 'new-comment' } }, 'high' );

			conversion.for( 'downcast' ).add( helperA ).add( helperB );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'comment', ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 3 ) );
			} );

			expectResult( '<span class="new-comment">foo</span>' );
		} );

		it( 'config.view is a function', () => {
			const helper = downcastMarkerToHighlight( {
				model: 'comment',
				view: data => {
					const commentType = data.markerName.split( ':' )[ 1 ];

					return {
						class: [ 'comment', 'comment-' + commentType ]
					};
				}
			} );

			conversion.for( 'downcast' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'comment:abc', ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 3 ) );
			} );

			expectResult( '<span class="comment comment-abc">foo</span>' );
		} );
	} );

	function expectResult( string ) {
		expect( stringify( viewRoot, null, { ignoreRoot: true } ) ).to.equal( string );
	}
} );

describe( 'downcast-converters', () => {
	let dispatcher, modelDoc, modelRoot, viewRoot, controller, modelRootStart, model;

	beforeEach( () => {
		model = new Model();
		modelDoc = model.document;
		modelRoot = modelDoc.createRoot();

		controller = new EditingController( model );

		viewRoot = controller.view.document.getRoot();
		// Set name of view root the same as dom root.
		// This is a mock of attaching view root to dom root.
		controller.view.document.getRoot()._name = 'div';

		dispatcher = controller.downcastDispatcher;

		dispatcher.on(
			'insert:paragraph',
			insertElement(
				( modelItem, consumable, conversionApi ) => conversionApi.writer.createContainerElement( 'p' )
			)
		);

		dispatcher.on( 'attribute:class', changeAttribute() );

		modelRootStart = ModelPosition.createAt( modelRoot, 0 );
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

	describe( 'insertText', () => {
		it( 'should downcast text', () => {
			model.change( writer => {
				writer.insert( new ModelText( 'foobar' ), modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foobar</div>' );
		} );

		it( 'should support unicode', () => {
			model.change( writer => {
				writer.insert( new ModelText( 'நிலைக்கு' ), modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>நிலைக்கு</div>' );
		} );

		it( 'should be possible to override it', () => {
			dispatcher.on( 'insert:$text', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'insert' );
			}, { priority: 'high' } );

			model.change( writer => {
				writer.insert( new ModelText( 'foobar' ), modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div></div>' );
		} );
	} );

	describe( 'insertElement', () => {
		it( 'should convert element insertion in model to and map positions for future converting', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar' ) );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should take view element function generator as a parameter', () => {
			const elementGenerator = ( modelItem, consumable ) => {
				if ( consumable.consume( modelItem, 'attribute:nice' ) ) {
					return new ViewContainerElement( 'div' );
				}

				// Test if default converter will be fired for paragraph, if `null` is returned and consumable was not consumed.
				return null;
			};

			dispatcher.on( 'insert:paragraph', insertElement( elementGenerator ), { priority: 'high' } );

			const niceP = new ModelElement( 'paragraph', { nice: true }, new ModelText( 'foo' ) );
			const badP = new ModelElement( 'paragraph', null, new ModelText( 'bar' ) );

			model.change( writer => {
				writer.insert( [ niceP, badP ], modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div><p>bar</p></div>' );
		} );
	} );

	describe( 'setAttribute', () => {
		it( 'should convert attribute insert/change/remove on a model node', () => {
			const modelElement = new ModelElement( 'paragraph', { class: 'foo' }, new ModelText( 'foobar' ) );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="foo">foobar</p></div>' );

			model.change( writer => {
				writer.setAttribute( 'class', 'bar', modelElement );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="bar">foobar</p></div>' );

			model.change( writer => {
				writer.removeAttribute( 'class', modelElement );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should convert insert/change/remove with attribute generating function as a parameter', () => {
			const themeConverter = ( value, data ) => {
				if ( data.item instanceof ModelElement && data.item.childCount > 0 ) {
					value += ' fix-content';
				}

				return { key: 'class', value };
			};

			dispatcher.on( 'insert:div', insertElement( ( model, consumable, api ) => api.writer.createContainerElement( 'div' ) ) );
			dispatcher.on( 'attribute:theme', changeAttribute( themeConverter ) );

			const modelParagraph = new ModelElement( 'paragraph', { theme: 'nice' }, new ModelText( 'foobar' ) );
			const modelDiv = new ModelElement( 'div', { theme: 'nice' } );

			model.change( writer => {
				writer.insert( [ modelParagraph, modelDiv ], modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="nice fix-content">foobar</p><div class="nice"></div></div>' );

			model.change( writer => {
				writer.setAttribute( 'theme', 'awesome', modelParagraph );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="awesome fix-content">foobar</p><div class="nice"></div></div>' );

			model.change( writer => {
				writer.removeAttribute( 'theme', modelParagraph );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p><div class="nice"></div></div>' );
		} );

		it( 'should be possible to override setAttribute', () => {
			const modelElement = new ModelElement( 'paragraph', { class: 'foo' }, new ModelText( 'foobar' ) );

			dispatcher.on( 'attribute:class', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'attribute:class' );
			}, { priority: 'high' } );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			// No attribute set.
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );
	} );

	describe( 'wrap', () => {
		it( 'should convert insert/change/remove of attribute in model into wrapping element in a view', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { bold: true } ) );
			const creator = ( value, data, consumable, api ) => api.writer.createAttributeElement( 'b' );

			dispatcher.on( 'attribute:bold', wrap( creator ) );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><b>foobar</b></p></div>' );

			model.change( writer => {
				writer.removeAttribute( 'bold', ModelRange.createIn( modelElement ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should convert insert/remove of attribute in model with wrapping element generating function as a parameter', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { style: 'bold' } ) );

			const elementGenerator = ( value, data, consumable, api ) => {
				if ( value == 'bold' ) {
					return api.writer.createAttributeElement( 'b' );
				}
			};

			dispatcher.on( 'attribute:style', wrap( elementGenerator ) );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><b>foobar</b></p></div>' );

			model.change( writer => {
				writer.removeAttribute( 'style', ModelRange.createIn( modelElement ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should update range on re-wrapping attribute (#475)', () => {
			const modelElement = new ModelElement( 'paragraph', null, [
				new ModelText( 'x' ),
				new ModelText( 'foo', { link: 'http://foo.com' } ),
				new ModelText( 'x' )
			] );

			const elementGenerator = ( href, data, consumable, api ) => api.writer.createAttributeElement( 'a', { href } );

			dispatcher.on( 'attribute:link', wrap( elementGenerator ) );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>x<a href="http://foo.com">foo</a>x</p></div>' );

			// Set new attribute on old link but also on non-linked characters.
			model.change( writer => {
				writer.setAttribute( 'link', 'http://foobar.com', ModelRange.createIn( modelElement ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><a href="http://foobar.com">xfoox</a></p></div>' );
		} );

		it( 'should support unicode', () => {
			const modelElement = new ModelElement( 'paragraph', null, [ 'நி', new ModelText( 'லைக்', { bold: true } ), 'கு' ] );
			const creator = ( value, data, consumable, api ) => api.writer.createAttributeElement( 'b' );

			dispatcher.on( 'attribute:bold', wrap( creator ) );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>நி<b>லைக்</b>கு</p></div>' );

			model.change( writer => {
				writer.removeAttribute( 'bold', ModelRange.createIn( modelElement ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>நிலைக்கு</p></div>' );
		} );

		it( 'should be possible to override wrap', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { bold: true } ) );
			const creator = ( value, data, consumable, api ) => api.writer.createAttributeElement( 'b' );

			dispatcher.on( 'attribute:bold', wrap( creator ) );
			dispatcher.on( 'attribute:bold', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'attribute:bold' );
			}, { priority: 'high' } );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should not convert and not consume if creator function returned null', () => {
			const elementGenerator = () => null;

			sinon.spy( dispatcher, 'fire' );

			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { italic: true } ) );

			dispatcher.on( 'attribute:italic', wrap( elementGenerator ) );
			dispatcher.on( 'attribute:italic', ( evt, data, consumable ) => {
				expect( consumable.test( data.item, 'attribute:italic' ) ).to.be.true;
			} );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'attribute:italic:$text' ) ).to.be.true;
		} );
	} );

	describe( 'insertUIElement/removeUIElement', () => {
		let modelText, modelElement, range;

		beforeEach( () => {
			modelText = new ModelText( 'foobar' );
			modelElement = new ModelElement( 'paragraph', null, modelText );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );
		} );

		describe( 'collapsed range', () => {
			beforeEach( () => {
				range = ModelRange.createFromParentsAndOffsets( modelElement, 3, modelElement, 3 );
			} );

			it( 'should insert and remove ui element - element as a creator', () => {
				const viewUi = new ViewUIElement( 'span', { 'class': 'marker' } );

				dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
				dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

				model.change( writer => {
					writer.setMarker( 'marker', range );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo<span class="marker"></span>bar</p></div>' );

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should insert and remove ui element - function as a creator', () => {
				const viewUi = new ViewUIElement( 'span', { 'class': 'marker' } );

				dispatcher.on( 'addMarker:marker', insertUIElement( () => viewUi ) );
				dispatcher.on( 'removeMarker:marker', removeUIElement( () => viewUi ) );

				model.change( writer => {
					writer.setMarker( 'marker', range );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo<span class="marker"></span>bar</p></div>' );

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should not convert if consumable was consumed', () => {
				const viewUi = new ViewUIElement( 'span', { 'class': 'marker' } );

				sinon.spy( dispatcher, 'fire' );

				dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
				dispatcher.on( 'addMarker:marker', ( evt, data, consumable ) => {
					consumable.consume( data.markerRange, 'addMarker:marker' );
				}, { priority: 'high' } );

				dispatcher.convertMarkerAdd( 'marker', range );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
				expect( dispatcher.fire.calledWith( 'addMarker:marker' ) );
			} );

			it( 'should not convert if creator returned null', () => {
				dispatcher.on( 'addMarker:marker', insertUIElement( () => null ) );
				dispatcher.on( 'removeMarker:marker', removeUIElement( () => null ) );

				model.change( writer => {
					writer.setMarker( 'marker', range );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );
		} );

		describe( 'non-collapsed range', () => {
			beforeEach( () => {
				range = ModelRange.createFromParentsAndOffsets( modelElement, 2, modelElement, 5 );
			} );

			it( 'should insert and remove ui element - element as a creator', () => {
				const viewUi = new ViewUIElement( 'span', { 'class': 'marker' } );

				dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
				dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

				model.change( writer => {
					writer.setMarker( 'marker', range );
				} );

				expect( viewToString( viewRoot ) )
					.to.equal( '<div><p>fo<span class="marker"></span>oba<span class="marker"></span>r</p></div>' );

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should insert and remove ui element - function as a creator', () => {
				const viewUi = data => new ViewUIElement( 'span', { 'class': data.markerName } );

				dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
				dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

				model.change( writer => {
					writer.setMarker( 'marker', range );
				} );

				expect( viewToString( viewRoot ) )
					.to.equal( '<div><p>fo<span class="marker"></span>oba<span class="marker"></span>r</p></div>' );

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should insert and remove different opening and ending element', () => {
				function creator( data ) {
					if ( data.isOpening ) {
						return new ViewUIElement( 'span', { 'class': data.markerName, 'data-start': true } );
					}

					return new ViewUIElement( 'span', { 'class': data.markerName, 'data-end': true } );
				}

				dispatcher.on( 'addMarker:marker', insertUIElement( creator ) );
				dispatcher.on( 'removeMarker:marker', removeUIElement( creator ) );

				model.change( writer => {
					writer.setMarker( 'marker', range );
				} );

				expect( viewToString( viewRoot ) ).to.equal(
					'<div><p>fo<span class="marker" data-start="true"></span>oba<span class="marker" data-end="true"></span>r</p></div>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should not convert if consumable was consumed', () => {
				const viewUi = new ViewUIElement( 'span', { 'class': 'marker' } );

				sinon.spy( dispatcher, 'fire' );

				dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
				dispatcher.on( 'addMarker:marker', ( evt, data, consumable ) => {
					consumable.consume( data.item, 'addMarker:marker' );
				}, { priority: 'high' } );

				dispatcher.convertMarkerAdd( 'marker', range );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
				expect( dispatcher.fire.calledWith( 'addMarker:marker' ) );
			} );
		} );
	} );

	// Remove converter is by default already added in `EditingController` instance.
	describe( 'remove', () => {
		it( 'should remove items from view accordingly to changes in model #1', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar' ) );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			model.change( writer => {
				writer.remove( ModelRange.createFromParentsAndOffsets( modelElement, 2, modelElement, 4 ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foar</p></div>' );
		} );

		it( 'should be possible to overwrite', () => {
			dispatcher.on( 'remove', evt => evt.stop(), { priority: 'high' } );

			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar' ) );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			model.change( writer => {
				writer.remove( ModelRange.createFromParentsAndOffsets( modelElement, 2, modelElement, 4 ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should support unicode', () => {
			const modelElement = new ModelElement( 'paragraph', null, 'நிலைக்கு' );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			model.change( writer => {
				writer.remove( ModelRange.createFromParentsAndOffsets( modelElement, 0, modelElement, 6 ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>கு</p></div>' );
		} );

		it( 'should not remove view ui elements that are placed next to removed content', () => {
			modelRoot.appendChildren( new ModelText( 'fozbar' ) );
			viewRoot.appendChildren( [
				new ViewText( 'foz' ),
				new ViewUIElement( 'span' ),
				new ViewText( 'bar' )
			] );

			// Remove 'b'.
			model.change( writer => {
				writer.remove( ModelRange.createFromParentsAndOffsets( modelRoot, 3, modelRoot, 4 ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foz<span></span>ar</div>' );

			// Remove 'z'.
			model.change( writer => {
				writer.remove( ModelRange.createFromParentsAndOffsets( modelRoot, 2, modelRoot, 3 ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>fo<span></span>ar</div>' );
		} );

		it( 'should remove correct amount of text when it is split by view ui element', () => {
			modelRoot.appendChildren( new ModelText( 'fozbar' ) );
			viewRoot.appendChildren( [
				new ViewText( 'foz' ),
				new ViewUIElement( 'span' ),
				new ViewText( 'bar' )
			] );

			// Remove 'z<span></span>b'.
			model.change( writer => {
				writer.remove( ModelRange.createFromParentsAndOffsets( modelRoot, 2, modelRoot, 4 ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foar</div>' );
		} );

		it( 'should unbind elements', () => {
			const modelElement = new ModelElement( 'paragraph' );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			const viewElement = controller.mapper.toViewElement( modelElement );
			expect( viewElement ).not.to.be.undefined;
			expect( controller.mapper.toModelElement( viewElement ) ).to.equal( modelElement );

			model.change( writer => {
				writer.remove( modelElement );
			} );

			expect( controller.mapper.toViewElement( modelElement ) ).to.be.undefined;
			expect( controller.mapper.toModelElement( viewElement ) ).to.be.undefined;
		} );

		it( 'should not break when remove() is used as part of unwrapping', () => {
			const modelP = new ModelElement( 'paragraph', null, new ModelText( 'foo' ) );
			const modelWidget = new ModelElement( 'widget', null, modelP );

			dispatcher.on( 'insert:widget', insertElement( () => new ViewContainerElement( 'widget' ) ) );

			model.change( writer => {
				writer.insert( modelWidget, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><widget><p>foo</p></widget></div>' );

			const viewP = controller.mapper.toViewElement( modelP );

			expect( viewP ).not.to.be.undefined;

			model.change( writer => {
				writer.unwrap( modelWidget );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p></div>' );
			// `modelP` is now bound with newly created view element.
			expect( controller.mapper.toViewElement( modelP ) ).not.to.equal( viewP );
			// `viewP` is no longer bound with model element.
			expect( controller.mapper.toModelElement( viewP ) ).to.be.undefined;
			// View element from view root is bound to `modelP`.
			expect( controller.mapper.toModelElement( viewRoot.getChild( 0 ) ) ).to.equal( modelP );
		} );

		it( 'should work correctly if container element after ui element is removed', () => {
			// Prepare a model and view structure.
			// This is done outside of conversion to put view ui elements inside easily.
			const modelP1 = new ModelElement( 'paragraph' );
			const modelP2 = new ModelElement( 'paragraph' );

			const viewP1 = new ViewContainerElement( 'p' );
			const viewUi1 = new ViewUIElement( 'span' );
			const viewUi2 = new ViewUIElement( 'span' );
			const viewP2 = new ViewContainerElement( 'p' );

			modelRoot.appendChildren( [ modelP1, modelP2 ] );
			viewRoot.appendChildren( [ viewP1, viewUi1, viewUi2, viewP2 ] );

			controller.mapper.bindElements( modelP1, viewP1 );
			controller.mapper.bindElements( modelP2, viewP2 );

			// Remove second paragraph element.
			model.change( writer => {
				writer.remove( ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p></p><span></span><span></span></div>' );
		} );

		it( 'should work correctly if container element after text node is removed', () => {
			const modelText = new ModelText( 'foo' );
			const modelP = new ModelElement( 'paragraph' );

			model.change( writer => {
				writer.insert( [ modelText, modelP ], modelRootStart );
			} );

			model.change( writer => {
				writer.remove( modelP );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foo</div>' );
		} );
	} );

	describe( 'highlight', () => {
		describe( 'on text', () => {
			const highlightDescriptor = {
				class: 'highlight-class',
				priority: 7,
				attributes: { title: 'title' }
			};

			let markerRange;

			beforeEach( () => {
				const modelElement1 = new ModelElement( 'paragraph', null, new ModelText( 'foo' ) );
				const modelElement2 = new ModelElement( 'paragraph', null, new ModelText( 'bar' ) );

				model.change( writer => {
					writer.insert( [ modelElement1, modelElement2 ], modelRootStart );
				} );

				markerRange = ModelRange.createIn( modelRoot );
			} );

			it( 'should wrap and unwrap text nodes', () => {
				dispatcher.on( 'addMarker:marker', highlightText( highlightDescriptor ) );
				dispatcher.on( 'addMarker:marker', highlightElement( highlightDescriptor ) );
				dispatcher.on( 'removeMarker:marker', removeHighlight( highlightDescriptor ) );

				model.change( writer => {
					writer.setMarker( 'marker', markerRange );
				} );

				expect( viewToString( viewRoot ) ).to.equal(
					'<div>' +
						'<p>' +
							'<span class="highlight-class" title="title">foo</span>' +
						'</p>' +
						'<p>' +
							'<span class="highlight-class" title="title">bar</span>' +
						'</p>' +
					'</div>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
			} );

			it( 'should be possible to overwrite', () => {
				dispatcher.on( 'addMarker:marker', highlightText( highlightDescriptor ) );
				dispatcher.on( 'addMarker:marker', highlightElement( highlightDescriptor ) );
				dispatcher.on( 'removeMarker:marker', removeHighlight( highlightDescriptor ) );

				const newDescriptor = { class: 'override-class' };

				dispatcher.on( 'addMarker:marker', highlightText( newDescriptor ), { priority: 'high' } );
				dispatcher.on( 'addMarker:marker', highlightElement( newDescriptor ), { priority: 'high' } );
				dispatcher.on( 'removeMarker:marker', removeHighlight( newDescriptor ), { priority: 'high' } );

				model.change( writer => {
					writer.setMarker( 'marker', markerRange );
				} );

				expect( viewToString( viewRoot ) ).to.equal(
					'<div>' +
						'<p>' +
							'<span class="override-class">foo</span>' +
						'</p>' +
						'<p>' +
							'<span class="override-class">bar</span>' +
						'</p>' +
					'</div>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
			} );

			it( 'should do nothing if descriptor is not provided or generating function returns null', () => {
				dispatcher.on( 'addMarker:marker', highlightText( () => null ), { priority: 'high' } );
				dispatcher.on( 'addMarker:marker', highlightElement( () => null ), { priority: 'high' } );
				dispatcher.on( 'removeMarker:marker', removeHighlight( () => null ), { priority: 'high' } );

				model.change( writer => {
					writer.setMarker( 'marker', markerRange );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
			} );

			it( 'should do nothing if collapsed marker is converted', () => {
				const descriptor = { class: 'foo' };

				dispatcher.on( 'addMarker:marker', highlightText( descriptor ), { priority: 'high' } );
				dispatcher.on( 'addMarker:marker', highlightElement( descriptor ), { priority: 'high' } );
				dispatcher.on( 'removeMarker:marker', removeHighlight( descriptor ), { priority: 'high' } );

				markerRange = ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 0 );

				model.change( () => {
					model.markers._set( 'marker', markerRange );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );

				model.change( () => {
					model.markers._remove( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
			} );
		} );

		describe( 'on element', () => {
			const highlightDescriptor = {
				class: 'highlight-class',
				priority: 7,
				attributes: { title: 'title' },
				id: 'customId'
			};

			let markerRange;

			beforeEach( () => {
				// Provide converter for div element. View div element will have custom highlight handling.
				dispatcher.on( 'insert:div', insertElement( () => {
					const viewContainer = new ViewContainerElement( 'div' );

					viewContainer.setCustomProperty( 'addHighlight', ( element, descriptor ) => {
						element.addClass( descriptor.class );
					} );

					viewContainer.setCustomProperty( 'removeHighlight', element => {
						element.setAttribute( 'class', '' );
					} );

					return viewContainer;
				} ) );

				const modelElement = new ModelElement( 'div', null, new ModelText( 'foo' ) );

				model.change( writer => {
					writer.insert( modelElement, modelRootStart );
				} );

				markerRange = ModelRange.createOn( modelElement );

				dispatcher.on( 'addMarker:marker', highlightText( highlightDescriptor ) );
				dispatcher.on( 'addMarker:marker', highlightElement( highlightDescriptor ) );
				dispatcher.on( 'removeMarker:marker', removeHighlight( highlightDescriptor ) );
			} );

			it( 'should use addHighlight and removeHighlight on elements and not convert children nodes', () => {
				model.change( writer => {
					writer.setMarker( 'marker', markerRange );
				} );

				expect( viewToString( viewRoot ) ).to.equal(
					'<div>' +
						'<div class="highlight-class">' +
							'foo' +
						'</div>' +
					'</div>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div></div>' );
			} );

			it( 'should be possible to override', () => {
				const newDescriptor = { class: 'override-class' };

				dispatcher.on( 'addMarker:marker', highlightText( newDescriptor ), { priority: 'high' } );
				dispatcher.on( 'addMarker:marker', highlightElement( newDescriptor ), { priority: 'high' } );
				dispatcher.on( 'removeMarker:marker', removeHighlight( newDescriptor ), { priority: 'high' } );

				model.change( writer => {
					writer.setMarker( 'marker', markerRange );
				} );

				expect( viewToString( viewRoot ) ).to.equal(
					'<div>' +
						'<div class="override-class">' +
							'foo' +
						'</div>' +
					'</div>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div></div>' );
			} );

			it( 'should use default priority and id if not provided', () => {
				const viewDiv = viewRoot.getChild( 0 );

				dispatcher.on( 'addMarker:marker2', highlightText( () => null ) );
				dispatcher.on( 'addMarker:marker2', highlightElement( () => null ) );
				dispatcher.on( 'removeMarker:marker2', removeHighlight( () => null ) );

				viewDiv.setCustomProperty( 'addHighlight', ( element, descriptor ) => {
					expect( descriptor.priority ).to.equal( 10 );
					expect( descriptor.id ).to.equal( 'marker:foo-bar-baz' );
				} );

				viewDiv.setCustomProperty( 'removeHighlight', ( element, id ) => {
					expect( id ).to.equal( 'marker:foo-bar-baz' );
				} );

				model.change( writer => {
					writer.setMarker( 'marker2', markerRange );
				} );
			} );

			it( 'should do nothing if descriptor is not provided', () => {
				dispatcher.on( 'addMarker:marker2', highlightText( () => null ) );
				dispatcher.on( 'addMarker:marker2', highlightElement( () => null ) );
				dispatcher.on( 'removeMarker:marker2', removeHighlight( () => null ) );

				model.change( writer => {
					writer.setMarker( 'marker2', markerRange );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div></div>' );

				model.change( writer => {
					writer.removeMarker( 'marker2' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div></div>' );
			} );
		} );
	} );

	describe( 'createViewElementFromHighlightDescriptor()', () => {
		it( 'should return attribute element from descriptor object', () => {
			const descriptor = {
				class: 'foo-class',
				attributes: { one: '1', two: '2' },
				priority: 7,
			};
			const element = createViewElementFromHighlightDescriptor( descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 7 );
			expect( element.hasClass( 'foo-class' ) ).to.be.true;

			for ( const key of Object.keys( descriptor.attributes ) ) {
				expect( element.getAttribute( key ) ).to.equal( descriptor.attributes[ key ] );
			}
		} );

		it( 'should return attribute element from descriptor object - array with classes', () => {
			const descriptor = {
				class: [ 'foo-class', 'bar-class' ],
				attributes: { one: '1', two: '2' },
				priority: 7,
			};
			const element = createViewElementFromHighlightDescriptor( descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 7 );
			expect( element.hasClass( 'foo-class' ) ).to.be.true;
			expect( element.hasClass( 'bar-class' ) ).to.be.true;

			for ( const key of Object.keys( descriptor.attributes ) ) {
				expect( element.getAttribute( key ) ).to.equal( descriptor.attributes[ key ] );
			}
		} );

		it( 'should create element without class', () => {
			const descriptor = {
				attributes: { one: '1', two: '2' },
				priority: 7,
			};
			const element = createViewElementFromHighlightDescriptor( descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 7 );

			for ( const key of Object.keys( descriptor.attributes ) ) {
				expect( element.getAttribute( key ) ).to.equal( descriptor.attributes[ key ] );
			}
		} );

		it( 'should create element without priority', () => {
			const descriptor = {
				class: 'foo-class',
				attributes: { one: '1', two: '2' },
			};
			const element = createViewElementFromHighlightDescriptor( descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 10 );
			expect( element.hasClass( 'foo-class' ) ).to.be.true;

			for ( const key of Object.keys( descriptor.attributes ) ) {
				expect( element.getAttribute( key ) ).to.equal( descriptor.attributes[ key ] );
			}
		} );

		it( 'should create element without attributes', () => {
			const descriptor = {
				class: 'foo-class',
				priority: 7
			};
			const element = createViewElementFromHighlightDescriptor( descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 7 );
			expect( element.hasClass( 'foo-class' ) ).to.be.true;
		} );

		it( 'should create similar elements if they are created using same descriptor id', () => {
			const a = createViewElementFromHighlightDescriptor( {
				id: 'id',
				class: 'classA',
				priority: 1
			} );

			const b = createViewElementFromHighlightDescriptor( {
				id: 'id',
				class: 'classB',
				priority: 2
			} );

			expect( a.isSimilar( b ) ).to.be.true;
		} );

		it( 'should create non-similar elements if they have different descriptor id', () => {
			const a = createViewElementFromHighlightDescriptor( {
				id: 'a',
				class: 'foo',
				priority: 1
			} );

			const b = createViewElementFromHighlightDescriptor( {
				id: 'b',
				class: 'foo',
				priority: 1
			} );

			expect( a.isSimilar( b ) ).to.be.false;
		} );
	} );
} );
