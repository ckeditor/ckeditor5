/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	elementToElement, attributeToElement, attributeToAttribute, markerToElement, markerToHighlight
} from '../../src/conversion/model-to-view-helpers';

import Conversion from '../../src/conversion/conversion';
import EditingController from '../../src/controller/editingcontroller';

import Model from '../../src/model/model';
import ModelRange from '../../src/model/range';

import ViewContainerElement from '../../src/view/containerelement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewUIElement from '../../src/view/uielement';

import { stringify } from '../../src/dev-utils/view';

describe( 'model-to-view-helpers', () => {
	let conversion, model, modelRoot, viewRoot;

	beforeEach( () => {
		model = new Model();
		const modelDoc = model.document;
		modelRoot = modelDoc.createRoot();

		const controller = new EditingController( model );

		// Set name of view root the same as dom root.
		// This is a mock of attaching view root to dom root.
		controller.view.getRoot()._name = 'div';

		viewRoot = controller.view.getRoot();

		conversion = new Conversion();
		conversion.register( 'model', [ controller.modelToView ] );
	} );

	describe( 'elementToElement', () => {
		it( 'config.view is a string', () => {
			const helper = elementToElement( { model: 'paragraph', view: 'p' } );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'paragraph', modelRoot, 0 );
			} );

			expectResult( '<p></p>' );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = elementToElement( { model: 'paragraph', view: 'p' } );
			const helperB = elementToElement( { model: 'paragraph', view: 'foo' }, 'high' );

			conversion.for( 'model' ).add( helperA ).add( helperB );

			model.change( writer => {
				writer.insertElement( 'paragraph', modelRoot, 0 );
			} );

			expectResult( '<foo></foo>' );
		} );

		it( 'config.view is an element instance', () => {
			const helper = elementToElement( {
				model: 'paragraph',
				view: new ViewContainerElement( 'p' )
			} );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'paragraph', modelRoot, 0 );
			} );

			expectResult( '<p></p>' );
		} );

		it( 'config.view is a view element definition', () => {
			const helper = elementToElement( {
				model: 'fancyParagraph',
				view: {
					name: 'p',
					class: 'fancy'
				}
			} );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'fancyParagraph', modelRoot, 0 );
			} );

			expectResult( '<p class="fancy"></p>' );
		} );

		it( 'config.view is a function', () => {
			const helper = elementToElement( {
				model: 'heading',
				view: modelElement => new ViewContainerElement( 'h' + modelElement.getAttribute( 'level' ) )
			} );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'heading', { level: 2 }, modelRoot, 0 );
			} );

			expectResult( '<h2></h2>' );
		} );
	} );

	describe( 'attributeToElement', () => {
		it( 'config.view is a string', () => {
			const helper = attributeToElement( 'bold', { view: 'strong' } );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', { bold: true }, modelRoot, 0 );
			} );

			expectResult( '<strong>foo</strong>' );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = attributeToElement( 'bold', { view: 'strong' } );
			const helperB = attributeToElement( 'bold', { view: 'b' }, 'high' );

			conversion.for( 'model' ).add( helperA ).add( helperB );

			model.change( writer => {
				writer.insertText( 'foo', { bold: true }, modelRoot, 0 );
			} );

			expectResult( '<b>foo</b>' );
		} );

		it( 'config.view is an element instance', () => {
			const helper = attributeToElement( 'bold', {
				view: new ViewAttributeElement( 'strong' )
			} );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', { bold: true }, modelRoot, 0 );
			} );

			expectResult( '<strong>foo</strong>' );
		} );

		it( 'config.view is a view element definition', () => {
			const helper = attributeToElement( 'bold', {
				view: {
					name: 'span',
					class: 'bold'
				}
			} );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', { bold: true }, modelRoot, 0 );
			} );

			expectResult( '<span class="bold">foo</span>' );
		} );

		it( 'config.view is a view element definition, model attribute value specified', () => {
			const helper = attributeToElement( 'styled', {
				model: 'dark',
				view: {
					name: 'span',
					class: [ 'styled', 'styled-dark' ]
				}
			} );

			conversion.for( 'model' ).add( helper );

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
			const helper = attributeToElement( 'fontSize', [
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

			conversion.for( 'model' ).add( helper );

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
			const helper = attributeToElement( 'bold', {
				view: attributeValue => new ViewAttributeElement( 'span', { style: 'font-weight:' + attributeValue } )
			} );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', { bold: '500' }, modelRoot, 0 );
			} );

			expectResult( '<span style="font-weight:500">foo</span>' );
		} );
	} );

	describe( 'attributeToAttribute', () => {
		beforeEach( () => {
			conversion.for( 'model' ).add( elementToElement( { model: 'image', view: 'img' } ) );
		} );

		it( 'config not set', () => {
			const helper = attributeToAttribute( 'src' );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'image', { src: 'foo.jpg' }, modelRoot, 0 );
			} );

			expectResult( '<img src="foo.jpg"></img>' );
		} );

		it( 'config.view is a string', () => {
			const helper = attributeToAttribute( 'source', { view: 'src' } );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'image', { source: 'foo.jpg' }, modelRoot, 0 );
			} );

			expectResult( '<img src="foo.jpg"></img>' );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = attributeToAttribute( 'source', { view: 'href' } );
			const helperB = attributeToAttribute( 'source', { view: 'src' }, 'high' );

			conversion.for( 'model' ).add( helperA ).add( helperB );

			model.change( writer => {
				writer.insertElement( 'image', { source: 'foo.jpg' }, modelRoot, 0 );
			} );

			expectResult( '<img src="foo.jpg"></img>' );
		} );

		it( 'config.view is an object', () => {
			const helper = attributeToAttribute( 'stylish', { view: { key: 'class', value: 'styled' } } );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'image', { stylish: true }, modelRoot, 0 );
			} );

			expectResult( '<img class="styled"></img>' );
		} );

		it( 'config.view is an object, model attribute value specified', () => {
			const helper = attributeToAttribute( 'styled', {
				model: 'dark',
				view: {
					key: 'class',
					value: 'styled-dark styled'
				}
			} );

			conversion.for( 'model' ).add( helper );

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
			const helper = attributeToAttribute( 'styled', [
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

			conversion.for( 'model' ).add( helper );

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
			const helper = attributeToAttribute( 'styled', {
				view: attributeValue => ( { key: 'class', value: 'styled-' + attributeValue } )
			} );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertElement( 'image', { styled: 'pull-out' }, modelRoot, 0 );
			} );

			expectResult( '<img class="styled-pull-out"></img>' );
		} );
	} );

	describe( 'markerToElement', () => {
		it( 'config.view is a string', () => {
			const helper = markerToElement( { model: 'search', view: 'marker-search' } );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'search', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ) );
			} );

			expectResult( 'f<marker-search></marker-search>o<marker-search></marker-search>o' );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = markerToElement( { model: 'search', view: 'marker-search' } );
			const helperB = markerToElement( { model: 'search', view: 'search' }, 'high' );

			conversion.for( 'model' ).add( helperA ).add( helperB );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'search', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ) );
			} );

			expectResult( 'f<search></search>o<search></search>o' );
		} );

		it( 'config.view is an element instance', () => {
			const helper = markerToElement( {
				model: 'search',
				view: new ViewUIElement( 'span', { 'data-marker': 'search' } )
			} );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'search', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ) );
			} );

			expectResult( 'f<span data-marker="search"></span>o<span data-marker="search"></span>o' );
		} );

		it( 'config.view is a view element definition', () => {
			const helper = markerToElement( {
				model: 'search',
				view: {
					name: 'span',
					attribute: {
						'data-marker': 'search'
					}
				}
			} );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'search', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ) );
			} );

			expectResult( 'f<span data-marker="search"></span>o<span data-marker="search"></span>o' );
		} );

		it( 'config.view is a function', () => {
			const helper = markerToElement( {
				model: 'search',
				view: data => {
					return new ViewUIElement( 'span', { 'data-marker': 'search', 'data-start': data.isOpening } );
				}
			} );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'search', ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ) );
			} );

			expectResult( 'f<span data-marker="search" data-start="true"></span>o<span data-marker="search" data-start="false"></span>o' );
		} );
	} );

	describe( 'markerToHighlight', () => {
		it( 'config.view is a highlight descriptor', () => {
			const helper = markerToHighlight( { model: 'comment', view: { class: 'comment' } } );

			conversion.for( 'model' ).add( helper );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'comment', ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 3 ) );
			} );

			expectResult( '<span class="comment">foo</span>' );
		} );

		it( 'can be overwritten using priority', () => {
			const helperA = markerToHighlight( { model: 'comment', view: { class: 'comment' } } );
			const helperB = markerToHighlight( { model: 'comment', view: { class: 'new-comment' } }, 'high' );

			conversion.for( 'model' ).add( helperA ).add( helperB );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				writer.setMarker( 'comment', ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 3 ) );
			} );

			expectResult( '<span class="new-comment">foo</span>' );
		} );

		it( 'config.view is a function', () => {
			const helper = markerToHighlight( {
				model: 'comment',
				view: data => {
					const commentType = data.markerName.split( ':' )[ 1 ];

					return {
						class: [ 'comment', 'comment-' + commentType ]
					};
				}
			} );

			conversion.for( 'model' ).add( helper );

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
