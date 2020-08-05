/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import EditingController from '../../src/controller/editingcontroller';

import Model from '../../src/model/model';
import ModelElement from '../../src/model/element';
import ModelText from '../../src/model/text';

import ViewElement from '../../src/view/element';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewContainerElement from '../../src/view/containerelement';
import ViewUIElement from '../../src/view/uielement';
import ViewText from '../../src/view/text';
import ViewDocument from '../../src/view/document';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import DowncastHelpers, {
	clearAttributes,
	convertCollapsedSelection,
	convertRangeSelection,
	createViewElementFromHighlightDescriptor,
	insertText
} from '../../src/conversion/downcasthelpers';

import Mapper from '../../src/conversion/mapper';
import DowncastDispatcher from '../../src/conversion/downcastdispatcher';
import { stringify as stringifyView } from '../../src/dev-utils/view';
import View from '../../src/view/view';
import createViewRoot from '../view/_utils/createroot';
import { setData as setModelData } from '../../src/dev-utils/model';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { StylesProcessor } from '../../src/view/stylesmap';
import DowncastWriter from '../../src/view/downcastwriter';

describe( 'DowncastHelpers', () => {
	let model, modelRoot, viewRoot, downcastHelpers, controller, modelRootStart;

	beforeEach( () => {
		model = new Model();
		const modelDoc = model.document;
		modelRoot = modelDoc.createRoot();

		controller = new EditingController( model, new StylesProcessor() );

		// Set name of view root the same as dom root.
		// This is a mock of attaching view root to dom root.
		controller.view.document.getRoot()._name = 'div';

		viewRoot = controller.view.document.getRoot();

		downcastHelpers = new DowncastHelpers( [ controller.downcastDispatcher ] );

		modelRootStart = model.createPositionAt( modelRoot, 0 );
	} );

	describe( 'elementToElement()', () => {
		it( 'should be chainable', () => {
			expect( downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } ) ).to.equal( downcastHelpers );
		} );

		it( 'config.view is a string', () => {
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			model.change( writer => {
				writer.insertElement( 'paragraph', modelRoot, 0 );
			} );

			expectResult( '<p></p>' );
		} );

		it( 'can be overwritten using converterPriority', () => {
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'foo', converterPriority: 'high' } );

			model.change( writer => {
				writer.insertElement( 'paragraph', modelRoot, 0 );
			} );

			expectResult( '<foo></foo>' );
		} );

		it( 'config.view is a view element definition', () => {
			downcastHelpers.elementToElement( {
				model: 'fancyParagraph',
				view: {
					name: 'p',
					classes: 'fancy'
				}
			} );

			model.change( writer => {
				writer.insertElement( 'fancyParagraph', modelRoot, 0 );
			} );

			expectResult( '<p class="fancy"></p>' );
		} );

		it( 'config.view is a function', () => {
			downcastHelpers.elementToElement( {
				model: 'heading',
				view: ( modelElement, { writer } ) => writer.createContainerElement( 'h' + modelElement.getAttribute( 'level' ) )
			} );

			model.change( writer => {
				writer.insertElement( 'heading', { level: 2 }, modelRoot, 0 );
			} );

			expectResult( '<h2></h2>' );
		} );
	} );

	describe( 'attributeToElement()', () => {
		beforeEach( () => {
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );
		} );

		it( 'should be chainable', () => {
			expect( downcastHelpers.attributeToElement( { model: 'bold', view: 'strong' } ) ).to.equal( downcastHelpers );
		} );

		it( 'config.view is a string', () => {
			downcastHelpers.attributeToElement( { model: 'bold', view: 'strong' } );

			model.change( writer => {
				writer.insertText( 'foo', { bold: true }, modelRoot, 0 );
			} );

			expectResult( '<strong>foo</strong>' );
		} );

		it( 'can be overwritten using converterPriority', () => {
			downcastHelpers.attributeToElement( { model: 'bold', view: 'strong' } );
			downcastHelpers.attributeToElement( { model: 'bold', view: 'b', converterPriority: 'high' } );

			model.change( writer => {
				writer.insertText( 'foo', { bold: true }, modelRoot, 0 );
			} );

			expectResult( '<b>foo</b>' );
		} );

		it( 'config.view is a view element definition', () => {
			downcastHelpers.attributeToElement( {
				model: 'invert',
				view: {
					name: 'span',
					classes: [ 'font-light', 'bg-dark' ]
				}
			} );

			model.change( writer => {
				writer.insertText( 'foo', { invert: true }, modelRoot, 0 );
			} );

			expectResult( '<span class="bg-dark font-light">foo</span>' );
			expect( viewRoot.getChild( 0 ).priority ).to.equal( ViewAttributeElement.DEFAULT_PRIORITY );
		} );

		it( 'config.view allows specifying the element\'s priority', () => {
			downcastHelpers.attributeToElement( {
				model: 'invert',
				view: {
					name: 'span',
					priority: 5
				}
			} );

			model.change( writer => {
				writer.insertText( 'foo', { invert: true }, modelRoot, 0 );
			} );

			expect( viewRoot.getChild( 0 ).priority ).to.equal( 5 );
		} );

		it( 'model attribute value is enum', () => {
			downcastHelpers.attributeToElement( {
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
						},
						priority: 5
					}
				}
			} );

			model.change( writer => {
				writer.insertText( 'foo', { fontSize: 'big' }, modelRoot, 0 );
			} );

			expect( viewRoot.getChild( 0 ).priority ).to.equal( ViewAttributeElement.DEFAULT_PRIORITY );
			expectResult( '<span style="font-size:1.2em">foo</span>' );

			model.change( writer => {
				writer.setAttribute( 'fontSize', 'small', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<span style="font-size:0.8em">foo</span>' );
			expect( viewRoot.getChild( 0 ).priority ).to.equal( 5 );

			model.change( writer => {
				writer.removeAttribute( 'fontSize', modelRoot.getChild( 0 ) );
			} );

			expectResult( 'foo' );
		} );

		it( 'config.view is a function', () => {
			downcastHelpers.attributeToElement( {
				model: 'bold',
				view: ( modelAttributeValue, { writer } ) => {
					return writer.createAttributeElement( 'span', { style: 'font-weight:' + modelAttributeValue } );
				}
			} );

			model.change( writer => {
				writer.insertText( 'foo', { bold: '500' }, modelRoot, 0 );
			} );

			expectResult( '<span style="font-weight:500">foo</span>' );
		} );

		it( 'config.model.name is given', () => {
			downcastHelpers.attributeToElement( {
				model: {
					key: 'color',
					name: '$text'
				},
				view: ( modelAttributeValue, { writer } ) => {
					return writer.createAttributeElement( 'span', { style: 'color:' + modelAttributeValue } );
				}
			} );

			downcastHelpers.elementToElement( {
				model: 'smiley',
				view: ( modelElement, { writer } ) => {
					return writer.createEmptyElement( 'img', {
						src: 'smile.jpg',
						class: 'smiley'
					} );
				}
			} );

			model.change( writer => {
				writer.insertText( 'foo', { color: '#FF0000' }, modelRoot, 0 );
				writer.insertElement( 'smiley', { color: '#FF0000' }, modelRoot, 3 );
			} );

			expectResult( '<span style="color:#FF0000">foo</span><img class="smiley" src="smile.jpg"></img>' );
		} );

		it( 'should not convert if creator returned null', () => {
			downcastHelpers.elementToElement( { model: 'div', view: () => null } );

			const modelElement = new ModelElement( 'div' );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div></div>' );
		} );

		it( 'should convert insert/change/remove of attribute in model into wrapping element in a view', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { bold: true } ) );

			downcastHelpers.attributeToElement( {
				model: 'bold',
				view: ( modelAttributeValue, { writer } ) => writer.createAttributeElement( 'b' )
			} );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><b>foobar</b></p></div>' );

			model.change( writer => {
				writer.removeAttribute( 'bold', writer.createRangeIn( modelElement ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should convert insert/remove of attribute in model with wrapping element generating function as a parameter', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { style: 'bold' } ) );

			downcastHelpers.attributeToElement( {
				model: 'style',
				view: ( modelAttributeValue, { writer } ) => {
					if ( modelAttributeValue == 'bold' ) {
						return writer.createAttributeElement( 'b' );
					}
				}
			} );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><b>foobar</b></p></div>' );

			model.change( writer => {
				writer.removeAttribute( 'style', writer.createRangeIn( modelElement ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should update range on re-wrapping attribute (#475)', () => {
			const modelElement = new ModelElement( 'paragraph', null, [
				new ModelText( 'x' ),
				new ModelText( 'foo', { link: 'http://foo.com' } ),
				new ModelText( 'x' )
			] );

			downcastHelpers.attributeToElement( {
				model: 'link',
				view: ( modelAttributeValue, { writer } ) => {
					return writer.createAttributeElement( 'a', { href: modelAttributeValue } );
				}
			} );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>x<a href="http://foo.com">foo</a>x</p></div>' );

			// Set new attribute on old link but also on non-linked characters.
			model.change( writer => {
				writer.setAttribute( 'link', 'http://foobar.com', writer.createRangeIn( modelElement ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><a href="http://foobar.com">xfoox</a></p></div>' );
		} );

		it( 'should support unicode', () => {
			const modelElement = new ModelElement( 'paragraph', null, [ 'நி', new ModelText( 'லைக்', { bold: true } ), 'கு' ] );

			downcastHelpers.attributeToElement( {
				model: 'bold',
				view: ( modelAttributeValue, { writer } ) => writer.createAttributeElement( 'b' )
			} );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>நி<b>லைக்</b>கு</p></div>' );

			model.change( writer => {
				writer.removeAttribute( 'bold', writer.createRangeIn( modelElement ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>நிலைக்கு</p></div>' );
		} );

		it( 'should be possible to override ', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { bold: true } ) );

			downcastHelpers.attributeToElement( {
				model: 'bold',
				view: ( modelAttributeValue, { writer } ) => writer.createAttributeElement( 'b' )
			} );
			downcastHelpers.attributeToElement( {
				model: 'bold',
				view: ( modelAttributeValue, { writer } ) => writer.createAttributeElement( 'strong' ),
				converterPriority: 'high'
			} );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><strong>foobar</strong></p></div>' );
		} );

		it( 'should not convert and not consume if creator function returned null', () => {
			sinon.spy( controller.downcastDispatcher, 'fire' );

			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { italic: true } ) );

			downcastHelpers.attributeToElement( {
				model: 'italic',
				view: () => null
			} );

			const spy = sinon.spy();
			controller.downcastDispatcher.on( 'attribute:italic', spy );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( controller.downcastDispatcher.fire.calledWith( 'attribute:italic:$text' ) ).to.be.true;
			expect( spy.called ).to.be.true;
		} );
	} );

	describe( 'attributeToAttribute()', () => {
		testUtils.createSinonSandbox();

		beforeEach( () => {
			downcastHelpers.elementToElement( { model: 'image', view: 'img' } );
			downcastHelpers.elementToElement( {
				model: 'paragraph',
				view: ( modelItem, { writer } ) => writer.createContainerElement( 'p' )
			} );

			downcastHelpers.attributeToAttribute( {
				model: 'class',
				view: 'class'
			} );
		} );

		it( 'should be chainable', () => {
			expect( downcastHelpers.attributeToAttribute( { model: 'source', view: 'src' } ) ).to.equal( downcastHelpers );
		} );

		it( 'config.view is a string', () => {
			downcastHelpers.attributeToAttribute( { model: 'source', view: 'src' } );

			model.change( writer => {
				writer.insertElement( 'image', { source: 'foo.jpg' }, modelRoot, 0 );
			} );

			expectResult( '<img src="foo.jpg"></img>' );

			model.change( writer => {
				writer.removeAttribute( 'source', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<img></img>' );
		} );

		it( 'can be overwritten using converterPriority', () => {
			downcastHelpers.attributeToAttribute( { model: 'source', view: 'href' } );
			downcastHelpers.attributeToAttribute( { model: 'source', view: 'src', converterPriority: 'high' } );

			model.change( writer => {
				writer.insertElement( 'image', { source: 'foo.jpg' }, modelRoot, 0 );
			} );

			expectResult( '<img src="foo.jpg"></img>' );
		} );

		it( 'model element name specified', () => {
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			downcastHelpers.attributeToAttribute( {
				model: {
					name: 'image',
					key: 'source'
				},
				view: 'src'
			} );

			model.change( writer => {
				writer.insertElement( 'image', { source: 'foo.jpg' }, modelRoot, 0 );
			} );

			expectResult( '<img src="foo.jpg"></img>' );

			model.change( writer => {
				writer.rename( modelRoot.getChild( 0 ), 'paragraph' );
			} );

			expectResult( '<p></p>' );
		} );

		it( 'config.view is an object, model attribute value is enum', () => {
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			downcastHelpers.attributeToAttribute( {
				model: {
					key: 'styled',
					values: [ 'dark', 'light' ]
				},
				view: {
					dark: {
						key: 'class',
						value: [ 'styled', 'styled-dark' ]
					},
					light: {
						key: 'class',
						value: [ 'styled', 'styled-light' ]
					}
				}
			} );

			model.change( writer => {
				writer.insertElement( 'paragraph', { styled: 'dark' }, modelRoot, 0 );
			} );

			expectResult( '<p class="styled styled-dark"></p>' );

			model.change( writer => {
				writer.setAttribute( 'styled', 'light', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<p class="styled styled-light"></p>' );

			model.change( writer => {
				writer.removeAttribute( 'styled', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<p></p>' );
		} );

		it( 'config.view is an object, model attribute value is enum, view has style', () => {
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			downcastHelpers.attributeToAttribute( {
				model: {
					key: 'align',
					values: [ 'right', 'center' ]
				},
				view: {
					right: {
						key: 'style',
						value: {
							'text-align': 'right'
						}
					},
					center: {
						key: 'style',
						value: {
							'text-align': 'center'
						}
					}
				}
			} );

			model.change( writer => {
				writer.insertElement( 'paragraph', { align: 'right' }, modelRoot, 0 );
			} );

			expectResult( '<p style="text-align:right"></p>' );

			model.change( writer => {
				writer.setAttribute( 'align', 'center', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<p style="text-align:center"></p>' );

			model.change( writer => {
				writer.removeAttribute( 'align', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<p></p>' );
		} );

		it( 'config.view is an object, only name and key are provided', () => {
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			downcastHelpers.attributeToAttribute( {
				model: {
					name: 'paragraph',
					key: 'class'
				},
				view: {
					name: 'paragraph',
					key: 'class'
				}
			} );

			model.change( writer => {
				writer.insertElement( 'paragraph', { class: 'dark' }, modelRoot, 0 );
			} );

			expectResult( '<p class="dark"></p>' );

			model.change( writer => {
				writer.setAttribute( 'class', 'light', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<p class="light"></p>' );

			model.change( writer => {
				writer.removeAttribute( 'class', modelRoot.getChild( 0 ) );
			} );

			expectResult( '<p></p>' );
		} );

		it( 'config.view is a function', () => {
			downcastHelpers.attributeToAttribute( {
				model: 'styled',
				view: attributeValue => ( { key: 'class', value: 'styled-' + attributeValue } )
			} );

			model.change( writer => {
				writer.insertElement( 'image', { styled: 'pull-out' }, modelRoot, 0 );
			} );

			expectResult( '<img class="styled-pull-out"></img>' );
		} );

		// #1587
		it( 'config.view and config.model as strings in generic conversion (elements only)', () => {
			const consoleWarnStub = testUtils.sinon.stub( console, 'warn' );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			downcastHelpers.attributeToAttribute( { model: 'test', view: 'test' } );

			model.change( writer => {
				writer.insertElement( 'paragraph', { test: '1' }, modelRoot, 0 );
				writer.insertElement( 'paragraph', { test: '2' }, modelRoot, 1 );
			} );

			expectResult( '<p test="1"></p><p test="2"></p>' );
			expect( consoleWarnStub.callCount ).to.equal( 0 );

			model.change( writer => {
				writer.removeAttribute( 'test', modelRoot.getChild( 1 ) );
			} );

			expectResult( '<p test="1"></p><p></p>' );
		} );

		// #1587
		it( 'config.view and config.model as strings in generic conversion (elements + text)', () => {
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			downcastHelpers.attributeToAttribute( { model: 'test', view: 'test' } );

			expectToThrowCKEditorError( () => {
				model.change( writer => {
					writer.insertElement( 'paragraph', modelRoot, 0 );
					writer.insertElement( 'paragraph', { test: '1' }, modelRoot, 1 );

					writer.insertText( 'Foo', { test: '2' }, modelRoot.getChild( 0 ), 0 );
					writer.insertText( 'Bar', { test: '3' }, modelRoot.getChild( 1 ), 0 );
				} );
			}, /^conversion-attribute-to-attribute-on-text/ );
		} );

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
			downcastHelpers.elementToElement( { model: 'div', view: 'div' } );
			downcastHelpers.attributeToAttribute( {
				model: 'theme',
				view: ( value, data ) => {
					if ( data.item instanceof ModelElement && data.item.childCount > 0 ) {
						value += ' fix-content';
					}

					return { key: 'class', value };
				}
			} );

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
			downcastHelpers.attributeToAttribute( {
				model: 'class',
				view: ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:class' );
				},
				converterPriority: 'high'
			} );

			model.change( writer => {
				const modelElement = new ModelElement( 'paragraph', { classes: 'foo' }, new ModelText( 'foobar' ) );
				writer.insert( modelElement, modelRootStart );
			} );

			// No attribute set.
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should not convert or consume if element creator returned null', () => {
			const callback = sinon.stub().returns( null );

			downcastHelpers.attributeToAttribute( {
				model: 'class',
				view: callback,
				converterPriority: 'high'
			} );

			const modelElement = new ModelElement( 'paragraph', { class: 'foo' }, new ModelText( 'foobar' ) );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="foo">foobar</p></div>' );

			sinon.assert.called( callback );
		} );
	} );

	describe( 'markerToElement()', () => {
		let modelText, modelElement, range;

		it( 'should be chainable', () => {
			expect( downcastHelpers.markerToElement( { model: 'search', view: 'marker-search' } ) ).to.equal( downcastHelpers );
		} );

		it( 'config.view is a string', () => {
			downcastHelpers.markerToElement( { model: 'search', view: 'marker-search' } );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );

				const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 2 ) );
				writer.addMarker( 'search', { range, usingOperation: false } );
			} );

			expectResult( 'f<marker-search></marker-search>o<marker-search></marker-search>o' );
		} );

		it( 'can be overwritten using converterPriority', () => {
			downcastHelpers.markerToElement( { model: 'search', view: 'marker-search' } );
			downcastHelpers.markerToElement( { model: 'search', view: 'search', converterPriority: 'high' } );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 2 ) );
				writer.addMarker( 'search', { range, usingOperation: false } );
			} );

			expectResult( 'f<search></search>o<search></search>o' );
		} );

		it( 'config.view is a view element definition', () => {
			downcastHelpers.markerToElement( {
				model: 'search',
				view: {
					name: 'span',
					attributes: {
						'data-marker': 'search'
					}
				}
			} );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 2 ) );
				writer.addMarker( 'search', { range, usingOperation: false } );
			} );

			expectResult( 'f<span data-marker="search"></span>o<span data-marker="search"></span>o' );
		} );

		it( 'config.view is a function', () => {
			downcastHelpers.markerToElement( {
				model: 'search',
				view: ( data, { writer } ) => {
					return writer.createUIElement( 'span', { 'data-marker': 'search', 'data-start': data.isOpening } );
				}
			} );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 2 ) );
				writer.addMarker( 'search', { range, usingOperation: false } );
			} );

			expectResult( 'f<span data-marker="search" data-start="true"></span>o<span data-marker="search" data-start="false"></span>o' );
		} );

		describe( 'collapsed range', () => {
			beforeEach( () => {
				modelText = new ModelText( 'foobar' );
				modelElement = new ModelElement( 'paragraph', null, modelText );

				downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

				model.change( writer => {
					writer.insert( modelElement, modelRootStart );
				} );

				range = model.createRange( model.createPositionAt( modelElement, 3 ), model.createPositionAt( modelElement, 3 ) );
			} );

			it( 'should insert and remove ui element', () => {
				downcastHelpers.markerToElement( {
					model: 'marker',
					view: ( data, { writer } ) => writer.createUIElement( 'span', { 'class': 'marker' } )
				} );

				model.change( writer => {
					writer.addMarker( 'marker', { range, usingOperation: false } );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo<span class="marker"></span>bar</p></div>' );

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should not convert if consumable was consumed', () => {
				sinon.spy( controller.downcastDispatcher, 'fire' );

				downcastHelpers.markerToElement( {
					model: 'marker',
					view: ( data, { writer } ) => writer.createUIElement( 'span', { 'class': 'marker' } )
				} );

				controller.downcastDispatcher.on( 'addMarker:marker', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.markerRange, 'addMarker:marker' );
				}, { priority: 'high' } );

				model.change( writer => {
					writer.addMarker( 'marker', { range, usingOperation: false } );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
				expect( controller.downcastDispatcher.fire.calledWith( 'addMarker:marker' ) );
			} );

			it( 'should not convert if creator returned null', () => {
				downcastHelpers.markerToElement( {
					model: 'marker',
					view: () => null
				} );

				model.change( writer => {
					writer.addMarker( 'marker', { range, usingOperation: false } );
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
				modelText = new ModelText( 'foobar' );
				modelElement = new ModelElement( 'paragraph', null, modelText );

				downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

				model.change( writer => {
					writer.insert( modelElement, modelRootStart );
				} );

				range = model.createRange( model.createPositionAt( modelElement, 2 ), model.createPositionAt( modelElement, 5 ) );
			} );

			it( 'should insert and remove ui element - element as a creator', () => {
				downcastHelpers.markerToElement( {
					model: 'marker',
					view: ( data, { writer } ) => writer.createUIElement( 'span', { 'class': 'marker' } )
				} );

				model.change( writer => {
					writer.addMarker( 'marker', { range, usingOperation: false } );
				} );

				expect( viewToString( viewRoot ) )
					.to.equal( '<div><p>fo<span class="marker"></span>oba<span class="marker"></span>r</p></div>' );

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should insert and remove ui element - function as a creator', () => {
				downcastHelpers.markerToElement( {
					model: 'marker',
					view: ( data, { writer } ) => writer.createUIElement( 'span', { 'class': data.markerName } )
				} );

				model.change( writer => {
					writer.addMarker( 'marker', { range, usingOperation: false } );
				} );

				expect( viewToString( viewRoot ) )
					.to.equal( '<div><p>fo<span class="marker"></span>oba<span class="marker"></span>r</p></div>' );

				model.change( writer => {
					writer.removeMarker( 'marker' );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should insert and remove different opening and ending element', () => {
				downcastHelpers.markerToElement( {
					model: 'marker',
					view: ( data, { writer } ) => {
						if ( data.isOpening ) {
							return writer.createUIElement( 'span', { 'class': data.markerName, 'data-start': true } );
						}

						return writer.createUIElement( 'span', { 'class': data.markerName, 'data-end': true } );
					}
				} );

				model.change( writer => {
					writer.addMarker( 'marker', { range, usingOperation: false } );
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
				sinon.spy( controller.downcastDispatcher, 'fire' );

				downcastHelpers.markerToElement( {
					model: 'marker',
					view: ( data, { writer } ) => writer.createUIElement( 'span', { 'class': 'marker' } )
				} );
				controller.downcastDispatcher.on( 'addMarker:marker', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'addMarker:marker' );
				}, { priority: 'high' } );

				model.change( writer => {
					writer.addMarker( 'marker', { range, usingOperation: false } );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
				expect( controller.downcastDispatcher.fire.calledWith( 'addMarker:marker' ) );
			} );
		} );
	} );

	describe( 'markerToData()', () => {
		let root;

		beforeEach( () => {
			root = model.document.getRoot();

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );
		} );

		it( 'should be chainable', () => {
			expect( downcastHelpers.markerToData( { model: 'search' } ) ).to.equal( downcastHelpers );
		} );

		it( 'default conversion, inside text, non-collapsed, no name', () => {
			downcastHelpers.markerToData( { model: 'search' } );

			setModelData( model, '<paragraph>Fo[ob]ar</paragraph>' );

			model.change( writer => {
				writer.addMarker( 'search', { range: model.document.selection.getFirstRange(), usingOperation: false } );
			} );

			expectResult( '<p>Fo<search-start></search-start>ob<search-end></search-end>ar</p>' );

			model.change( writer => {
				writer.removeMarker( 'search' );
			} );

			expectResult( '<p>Foobar</p>' );
		} );

		it( 'default conversion, inside text, non-collapsed, name', () => {
			downcastHelpers.markerToData( { model: 'group' } );

			setModelData( model, '<paragraph>Fo[ob]ar</paragraph>' );

			model.change( writer => {
				writer.addMarker( 'group:foo:bar:baz', { range: model.document.selection.getFirstRange(), usingOperation: false } );
			} );

			expectResult( '<p>Fo<group-start name="foo:bar:baz"></group-start>ob<group-end name="foo:bar:baz"></group-end>ar</p>' );

			model.change( writer => {
				writer.removeMarker( 'group:foo:bar:baz' );
			} );

			expectResult( '<p>Foobar</p>' );
		} );

		it( 'default conversion, inside text, collapsed, no name', () => {
			downcastHelpers.markerToData( { model: 'search' } );

			setModelData( model, '<paragraph>Foo[]bar</paragraph>' );

			model.change( writer => {
				writer.addMarker( 'search', { range: model.document.selection.getFirstRange(), usingOperation: false } );
			} );

			expectResult( '<p>Foo<search-start></search-start><search-end></search-end>bar</p>' );

			model.change( writer => {
				writer.removeMarker( 'search' );
			} );

			expectResult( '<p>Foobar</p>' );
		} );

		it( 'default conversion, inside text, collapsed, multiple markers, no name', () => {
			downcastHelpers.markerToData( { model: 'group' } );

			setModelData( model, '<paragraph>Foo[]bar</paragraph>' );

			model.change( writer => {
				writer.addMarker( 'group:foo', { range: model.document.selection.getFirstRange(), usingOperation: false } );
				writer.addMarker( 'group:abc', { range: model.document.selection.getFirstRange(), usingOperation: false } );
			} );

			expectResult(
				'<p>' +
					'Foo' +
					'<group-start name="abc"></group-start><group-end name="abc"></group-end>' +
					'<group-start name="foo"></group-start><group-end name="foo"></group-end>' +
					'bar' +
				'</p>'
			);

			model.change( writer => {
				writer.removeMarker( 'group:foo' );
				writer.removeMarker( 'group:abc' );
			} );

			expectResult( '<p>Foobar</p>' );
		} );

		it( 'default conversion, on two elements, no name', () => {
			downcastHelpers.markerToData( { model: 'search' } );

			setModelData( model, '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			model.change( writer => {
				const range = writer.createRangeIn( root );
				writer.addMarker( 'search', { range, usingOperation: false } );
			} );

			expectResult( '<p data-search-start-before="">Foo</p><p data-search-end-after="">Bar</p>' );

			model.change( writer => {
				writer.removeMarker( 'search' );
			} );

			expectResult( '<p>Foo</p><p>Bar</p>' );
		} );

		it( 'default conversion, on two elements, name', () => {
			downcastHelpers.markerToData( { model: 'group' } );

			setModelData( model, '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			model.change( writer => {
				const range = writer.createRangeIn( root );
				writer.addMarker( 'group:foo:bar:baz', { range, usingOperation: false } );
			} );

			expectResult( '<p data-group-start-before="foo:bar:baz">Foo</p><p data-group-end-after="foo:bar:baz">Bar</p>' );

			model.change( writer => {
				writer.removeMarker( 'group:foo:bar:baz' );
			} );

			expectResult( '<p>Foo</p><p>Bar</p>' );
		} );

		it( 'default conversion, on one element, name', () => {
			downcastHelpers.markerToData( { model: 'group' } );

			setModelData( model, '<paragraph>Foobar</paragraph>' );

			model.change( writer => {
				const range = writer.createRangeIn( root );
				writer.addMarker( 'group:foo:bar:baz', { range, usingOperation: false } );
			} );

			expectResult( '<p data-group-end-after="foo:bar:baz" data-group-start-before="foo:bar:baz">Foobar</p>' );

			model.change( writer => {
				writer.removeMarker( 'group:foo:bar:baz' );
			} );

			expectResult( '<p>Foobar</p>' );
		} );

		it( 'default conversion, collapsed before element, name', () => {
			downcastHelpers.markerToData( { model: 'group' } );

			setModelData( model, '<paragraph>Foobar</paragraph>' );

			model.change( writer => {
				// Collapsed before <paragraph>.
				const range = writer.createRange(
					writer.createPositionFromPath( root, [ 0 ] )
				);

				writer.addMarker( 'group:foo:bar:baz', { range, usingOperation: false } );
			} );

			expectResult( '<p data-group-end-before="foo:bar:baz" data-group-start-before="foo:bar:baz">Foobar</p>' );

			model.change( writer => {
				writer.removeMarker( 'group:foo:bar:baz' );
			} );

			expectResult( '<p>Foobar</p>' );
		} );

		it( 'default conversion, collapsed after element, name', () => {
			downcastHelpers.markerToData( { model: 'group' } );

			setModelData( model, '<paragraph>Foobar</paragraph>' );

			model.change( writer => {
				// Collapsed before <paragraph>.
				const range = writer.createRange(
					writer.createPositionFromPath( root, [ 1 ] )
				);

				writer.addMarker( 'group:foo:bar:baz', { range, usingOperation: false } );
			} );

			expectResult( '<p data-group-end-after="foo:bar:baz" data-group-start-after="foo:bar:baz">Foobar</p>' );

			model.change( writer => {
				writer.removeMarker( 'group:foo:bar:baz' );
			} );

			expectResult( '<p>Foobar</p>' );
		} );

		it( 'default conversion, mixed, multiple markers, name', () => {
			downcastHelpers.markerToData( { model: 'group' } );

			setModelData( model, '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			model.change( writer => {
				const range = writer.createRange(
					writer.createPositionFromPath( root, [ 0 ] ),
					writer.createPositionFromPath( root, [ 1, 2 ] )
				);

				writer.addMarker( 'group:foo:bar', { range, usingOperation: false } );
				writer.addMarker( 'group:abc:xyz', { range, usingOperation: false } );
			} );

			expectResult(
				'<p data-group-start-before="abc:xyz,foo:bar">Foo</p>' +
				'<p>Ba<group-end name="abc:xyz"></group-end><group-end name="foo:bar"></group-end>r</p>'
			);

			model.change( writer => {
				writer.removeMarker( 'group:foo:bar' );
				writer.removeMarker( 'group:abc:xyz' );
			} );

			expectResult( '<p>Foo</p><p>Bar</p>' );
		} );

		it( 'default conversion, mixed #2, multiple markers, name', () => {
			downcastHelpers.markerToData( { model: 'group' } );

			setModelData( model, '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			model.change( writer => {
				const range = writer.createRange(
					writer.createPositionFromPath( root, [ 0, 1 ] ),
					writer.createPositionFromPath( root, [ 2 ] )
				);

				writer.addMarker( 'group:foo:bar', { range, usingOperation: false } );
				writer.addMarker( 'group:abc:xyz', { range, usingOperation: false } );
			} );

			expectResult(
				'<p>F<group-start name="abc:xyz"></group-start><group-start name="foo:bar"></group-start>oo</p>' +
				'<p data-group-end-after="abc:xyz,foo:bar">Bar</p>'
			);

			model.change( writer => {
				writer.removeMarker( 'group:foo:bar' );
				writer.removeMarker( 'group:abc:xyz' );
			} );

			expectResult( '<p>Foo</p><p>Bar</p>' );
		} );

		it( 'default conversion, mixed #3, multiple markers, name', () => {
			downcastHelpers.markerToData( { model: 'group' } );

			setModelData( model, '<paragraph>Foo</paragraph>' );

			model.change( writer => {
				const range = writer.createRange(
					writer.createPositionFromPath( root, [ 0 ] ),
					writer.createPositionFromPath( root, [ 0, 2 ] )
				);

				writer.addMarker( 'group:foo:bar', { range, usingOperation: false } );
				writer.addMarker( 'group:abc:xyz', { range, usingOperation: false } );
			} );

			expectResult(
				'<p data-group-start-before="abc:xyz,foo:bar">' +
					'Fo<group-end name="abc:xyz"></group-end><group-end name="foo:bar"></group-end>o' +
				'</p>'
			);

			model.change( writer => {
				writer.removeMarker( 'group:foo:bar' );
				writer.removeMarker( 'group:abc:xyz' );
			} );

			expectResult( '<p>Foo</p>' );
		} );

		it( 'default conversion, mixed #4, multiple markers, name', () => {
			downcastHelpers.markerToData( { model: 'group' } );

			setModelData( model, '<paragraph>Foo</paragraph>' );

			model.change( writer => {
				const range = writer.createRange(
					writer.createPositionFromPath( root, [ 0, 2 ] ),
					writer.createPositionFromPath( root, [ 1 ] )
				);

				writer.addMarker( 'group:foo:bar', { range, usingOperation: false } );
				writer.addMarker( 'group:abc:xyz', { range, usingOperation: false } );
			} );

			expectResult(
				'<p data-group-end-after="abc:xyz,foo:bar">' +
					'Fo<group-start name="abc:xyz"></group-start><group-start name="foo:bar"></group-start>o' +
				'</p>'
			);

			model.change( writer => {
				writer.removeMarker( 'group:foo:bar' );
				writer.removeMarker( 'group:abc:xyz' );
			} );

			expectResult( '<p>Foo</p>' );
		} );

		it( 'conversion callback, mixed, multiple markers, name', () => {
			const customData = {
				foo: 'bar',
				abc: 'xyz'
			};

			downcastHelpers.markerToData( {
				model: 'group',
				view: markerName => {
					const namePart = markerName.split( ':' )[ 1 ];

					return {
						group: 'g',
						name: namePart + '_' + customData[ namePart ]
					};
				}
			} );

			setModelData( model, '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			model.change( writer => {
				const range = writer.createRange(
					writer.createPositionFromPath( root, [ 0 ] ),
					writer.createPositionFromPath( root, [ 1, 2 ] )
				);

				writer.addMarker( 'group:foo', { range, usingOperation: false } );
				writer.addMarker( 'group:abc', { range, usingOperation: false } );
			} );

			expectResult(
				'<p data-g-start-before="abc_xyz,foo_bar">Foo</p>' +
				'<p>Ba<g-end name="abc_xyz"></g-end><g-end name="foo_bar"></g-end>r</p>'
			);

			model.change( writer => {
				writer.removeMarker( 'group:foo' );
				writer.removeMarker( 'group:abc' );
			} );

			expectResult( '<p>Foo</p><p>Bar</p>' );
		} );

		it( 'conversion callback, mixed #2, multiple markers, name', () => {
			const customData = {
				foo: 'bar',
				abc: 'xyz'
			};

			downcastHelpers.markerToData( {
				model: 'group',
				view: markerName => {
					const namePart = markerName.split( ':' )[ 1 ];

					return {
						group: 'g',
						name: namePart + '_' + customData[ namePart ]
					};
				}
			} );

			setModelData( model, '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

			model.change( writer => {
				const range = writer.createRange(
					writer.createPositionFromPath( root, [ 0, 1 ] ),
					writer.createPositionFromPath( root, [ 2 ] )
				);

				writer.addMarker( 'group:foo', { range, usingOperation: false } );
				writer.addMarker( 'group:abc', { range, usingOperation: false } );
			} );

			expectResult(
				'<p>F<g-start name="abc_xyz"></g-start><g-start name="foo_bar"></g-start>oo</p>' +
				'<p data-g-end-after="abc_xyz,foo_bar">Bar</p>'
			);

			model.change( writer => {
				writer.removeMarker( 'group:foo' );
				writer.removeMarker( 'group:abc' );
			} );

			expectResult( '<p>Foo</p><p>Bar</p>' );
		} );

		it( 'can be overwritten using converterPriority', () => {
			downcastHelpers.markerToData( {
				model: 'group'
			} );

			downcastHelpers.markerToData( {
				model: 'group',
				view: markerName => {
					const name = markerName.split( ':' )[ 1 ];

					return {
						group: 'g',
						name
					};
				},
				converterPriority: 'high'
			} );

			setModelData( model, '<paragraph>F[ooba]r</paragraph>' );

			model.change( writer => {
				writer.addMarker( 'group:foo', { range: model.document.selection.getFirstRange(), usingOperation: false } );
			} );

			expectResult(
				'<p>F<g-start name="foo"></g-start>ooba<g-end name="foo"></g-end>r</p>'
			);

			model.change( writer => {
				writer.removeMarker( 'group:foo' );
			} );

			expectResult( '<p>Foobar</p>' );
		} );

		it( 'can be overwritten by custom callback', () => {
			downcastHelpers.markerToData( {
				model: 'group'
			} );

			downcastHelpers.add( dispatcher => {
				dispatcher.on( 'addMarker:group', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.markerRange, evt.name );
				}, { priority: 'high' } );
			} );

			setModelData( model, '<paragraph>Foo[]bar</paragraph>' );

			model.change( writer => {
				writer.addMarker( 'group:foo', { range: model.document.selection.getFirstRange(), usingOperation: false } );
			} );

			expectResult( '<p>Foobar</p>' );

			model.change( writer => {
				writer.removeMarker( 'group:foo' );
			} );

			expectResult( '<p>Foobar</p>' );
		} );

		it( 'should not perform conversion if the callback returned falsy value', () => {
			downcastHelpers.markerToData( {
				model: 'group',
				view: () => false
			} );

			setModelData( model, '<paragraph>F[ooba]r</paragraph>' );

			model.change( writer => {
				writer.addMarker( 'group:foo', { range: model.document.selection.getFirstRange(), usingOperation: false } );
			} );

			expectResult( '<p>Foobar</p>' );

			model.change( writer => {
				writer.removeMarker( 'group:foo' );
			} );

			expectResult( '<p>Foobar</p>' );
		} );
	} );

	describe( 'markerToHighlight()', () => {
		it( 'should be chainable', () => {
			expect( downcastHelpers.markerToHighlight( { model: 'comment', view: { classes: 'comment' } } ) ).to.equal( downcastHelpers );
		} );

		it( 'config.view is a highlight descriptor', () => {
			downcastHelpers.markerToHighlight( { model: 'comment', view: { classes: 'comment' } } );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				const range = writer.createRange( writer.createPositionAt( modelRoot, 0 ), writer.createPositionAt( modelRoot, 3 ) );
				writer.addMarker( 'comment', { range, usingOperation: false } );
			} );

			expectResult( '<span class="comment">foo</span>' );
		} );

		it( 'can be overwritten using converterPriority', () => {
			downcastHelpers.markerToHighlight( { model: 'comment', view: { classes: 'comment' } } );
			downcastHelpers.markerToHighlight( { model: 'comment', view: { classes: 'new-comment' }, converterPriority: 'high' } );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				const range = writer.createRange( writer.createPositionAt( modelRoot, 0 ), writer.createPositionAt( modelRoot, 3 ) );
				writer.addMarker( 'comment', { range, usingOperation: false } );
			} );

			expectResult( '<span class="new-comment">foo</span>' );
		} );

		it( 'config.view is a function', () => {
			downcastHelpers.markerToHighlight( {
				model: 'comment',
				view: data => {
					const commentType = data.markerName.split( ':' )[ 1 ];

					return {
						classes: [ 'comment', 'comment-' + commentType ]
					};
				}
			} );

			model.change( writer => {
				writer.insertText( 'foo', modelRoot, 0 );
				const range = writer.createRange( writer.createPositionAt( modelRoot, 0 ), writer.createPositionAt( modelRoot, 3 ) );
				writer.addMarker( 'comment:abc', { range, usingOperation: false } );
			} );

			expectResult( '<span class="comment comment-abc">foo</span>' );
		} );

		describe( 'highlight', () => {
			const highlightConfig = {
				model: 'marker',
				view: {
					classes: 'highlight-class',
					attributes: { title: 'title' }
				},
				converterPriority: 7
			};

			describe( 'on text', () => {
				let markerRange;

				beforeEach( () => {
					downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

					const modelElement1 = new ModelElement( 'paragraph', null, new ModelText( 'foo' ) );
					const modelElement2 = new ModelElement( 'paragraph', null, new ModelText( 'bar' ) );

					model.change( writer => {
						writer.insert( [ modelElement1, modelElement2 ], modelRootStart );
					} );

					markerRange = model.createRangeIn( modelRoot );
				} );

				it( 'should wrap and unwrap text nodes', () => {
					downcastHelpers.markerToHighlight( highlightConfig );

					model.change( writer => {
						writer.addMarker( 'marker', { range: markerRange, usingOperation: false } );
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
					downcastHelpers.markerToHighlight( highlightConfig );
					downcastHelpers.markerToHighlight( {
						model: 'marker',
						view: { classes: 'override-class' },
						converterPriority: 'high'
					} );

					model.change( writer => {
						writer.addMarker( 'marker', { range: markerRange, usingOperation: false } );
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
					downcastHelpers.markerToHighlight( {
						model: 'marker',
						view: () => null,
						converterPriority: 'high'
					} );

					model.change( writer => {
						writer.addMarker( 'marker', { range: markerRange, usingOperation: false } );
					} );

					expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );

					model.change( writer => {
						writer.removeMarker( 'marker' );
					} );

					expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
				} );

				it( 'should do nothing if collapsed marker is converted', () => {
					downcastHelpers.markerToHighlight( {
						model: 'marker',
						view: { classes: 'foo' },
						converterPriority: 'high'
					} );

					markerRange = model.createRange( model.createPositionAt( modelRoot, 0 ), model.createPositionAt( modelRoot, 0 ) );

					model.change( writer => {
						writer.addMarker( 'marker', { range: markerRange, usingOperation: false } );
					} );

					expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );

					model.change( () => {
						model.markers._remove( 'marker' );
					} );

					expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
				} );

				it( 'should correctly wrap and unwrap multiple, intersecting markers', () => {
					downcastHelpers.markerToHighlight( {
						model: 'markerFoo',
						view: { classes: 'foo' }
					} );
					downcastHelpers.markerToHighlight( {
						model: 'markerBar',
						view: { classes: 'bar' }
					} );
					downcastHelpers.markerToHighlight( {
						model: 'markerXyz',
						view: { classes: 'xyz' }
					} );

					const p1 = modelRoot.getChild( 0 );
					const p2 = modelRoot.getChild( 1 );

					model.change( writer => {
						const range = writer.createRange( writer.createPositionAt( p1, 0 ), writer.createPositionAt( p1, 3 ) );
						writer.addMarker( 'markerFoo', { range, usingOperation: false } );
					} );

					expect( viewToString( viewRoot ) ).to.equal(
						'<div>' +
						'<p>' +
						'<span class="foo">foo</span>' +
						'</p>' +
						'<p>bar</p>' +
						'</div>'
					);

					model.change( writer => {
						const range = writer.createRange( writer.createPositionAt( p1, 1 ), writer.createPositionAt( p2, 2 ) );
						writer.addMarker( 'markerBar', { range, usingOperation: false } );
					} );

					expect( viewToString( viewRoot ) ).to.equal(
						'<div>' +
						'<p>' +
						'<span class="foo">f</span>' +
						'<span class="bar">' +
						'<span class="foo">oo</span>' +
						'</span>' +
						'</p>' +
						'<p>' +
						'<span class="bar">ba</span>' +
						'r' +
						'</p>' +
						'</div>'
					);

					model.change( writer => {
						const range = writer.createRange( writer.createPositionAt( p1, 2 ), writer.createPositionAt( p2, 3 ) );
						writer.addMarker( 'markerXyz', { range, usingOperation: false } );
					} );

					expect( viewToString( viewRoot ) ).to.equal(
						'<div>' +
						'<p>' +
						'<span class="foo">f</span>' +
						'<span class="bar">' +
						'<span class="foo">' +
						'o' +
						'<span class="xyz">o</span>' +
						'</span>' +
						'</span>' +
						'</p>' +
						'<p>' +
						'<span class="bar">' +
						'<span class="xyz">ba</span>' +
						'</span>' +
						'<span class="xyz">r</span>' +
						'</p>' +
						'</div>'
					);

					model.change( writer => {
						writer.removeMarker( 'markerBar' );
					} );

					expect( viewToString( viewRoot ) ).to.equal(
						'<div>' +
						'<p>' +
						'<span class="foo">' +
						'fo' +
						'<span class="xyz">o</span>' +
						'</span>' +
						'</p>' +
						'<p>' +
						'<span class="xyz">bar</span>' +
						'</p>' +
						'</div>'
					);

					model.change( writer => {
						writer.removeMarker( 'markerFoo' );
					} );

					expect( viewToString( viewRoot ) ).to.equal(
						'<div>' +
						'<p>' +
						'fo' +
						'<span class="xyz">o</span>' +
						'</p>' +
						'<p>' +
						'<span class="xyz">bar</span>' +
						'</p>' +
						'</div>'
					);

					model.change( writer => {
						writer.removeMarker( 'markerXyz' );
					} );

					expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
				} );

				it( 'should do nothing if marker is applied and removed on empty-ish range', () => {
					downcastHelpers.markerToHighlight( highlightConfig );

					const p1 = modelRoot.getChild( 0 );
					const p2 = modelRoot.getChild( 1 );

					const markerRange = model.createRange( model.createPositionAt( p1, 3 ), model.createPositionAt( p2, 0 ) );

					model.change( writer => {
						writer.addMarker( 'marker', { range: markerRange, usingOperation: false } );
					} );

					expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );

					model.change( writer => {
						writer.removeMarker( 'marker', { range: markerRange, usingOperation: false } );
					} );

					expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
				} );
			} );

			describe( 'on element', () => {
				const highlightConfig = {
					model: 'marker',
					view: {
						classes: 'highlight-class',
						attributes: { title: 'title' },
						id: 'customId'
					},
					converterPriority: 7
				};

				let markerRange, viewDocument;

				beforeEach( () => {
					viewDocument = new ViewDocument( new StylesProcessor() );

					downcastHelpers.elementToElement( {
						model: 'div',
						view: () => {
							const viewContainer = new ViewContainerElement( viewDocument, 'div' );

							viewContainer._setCustomProperty( 'addHighlight', ( element, descriptor, writer ) => {
								writer.addClass( descriptor.classes, element );
							} );

							viewContainer._setCustomProperty( 'removeHighlight', ( element, id, writer ) => {
								writer.setAttribute( 'class', '', element );
							} );

							return viewContainer;
						}
					} );

					const modelElement = new ModelElement( 'div', null, new ModelText( 'foo' ) );

					model.change( writer => {
						writer.insert( modelElement, modelRootStart );
					} );

					markerRange = model.createRangeOn( modelElement );

					downcastHelpers.markerToHighlight( highlightConfig );
				} );

				it( 'should use addHighlight and removeHighlight on elements and not convert children nodes', () => {
					model.change( writer => {
						writer.addMarker( 'marker', { range: markerRange, usingOperation: false } );
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
					downcastHelpers.markerToHighlight( {
						model: 'marker',
						view: { classes: 'override-class' },
						converterPriority: 'high'
					} );

					model.change( writer => {
						writer.addMarker( 'marker', { range: markerRange, usingOperation: false } );
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
					downcastHelpers.markerToHighlight( {
						model: 'marker2',
						view: () => null,
						converterPriority: 'high'
					} );

					viewDiv._setCustomProperty( 'addHighlight', ( element, descriptor ) => {
						expect( descriptor.priority ).to.equal( ViewAttributeElement.DEFAULT_PRIORITY );
						expect( descriptor.id ).to.equal( 'marker:foo-bar-baz' );
					} );

					viewDiv._setCustomProperty( 'removeHighlight', ( element, id ) => {
						expect( id ).to.equal( 'marker:foo-bar-baz' );
					} );

					model.change( writer => {
						writer.addMarker( 'marker2', { range: markerRange, usingOperation: false } );
					} );
				} );

				it( 'should do nothing if descriptor is not provided', () => {
					downcastHelpers.markerToHighlight( {
						model: 'marker2',
						view: () => null
					} );

					model.change( writer => {
						writer.addMarker( 'marker2', { range: markerRange, usingOperation: false } );
					} );

					expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div></div>' );

					model.change( writer => {
						writer.removeMarker( 'marker2' );
					} );

					expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div></div>' );
				} );
			} );
		} );
	} );

	function expectResult( string ) {
		expect( stringifyView( viewRoot, null, { ignoreRoot: true } ) ).to.equal( string );
	}
} );

describe( 'downcast converters', () => {
	let dispatcher, modelDoc, modelRoot, viewRoot, controller, modelRootStart, model;

	beforeEach( () => {
		model = new Model();
		modelDoc = model.document;
		modelRoot = modelDoc.createRoot();

		controller = new EditingController( model, new StylesProcessor() );

		viewRoot = controller.view.document.getRoot();
		// Set name of view root the same as dom root.
		// This is a mock of attaching view root to dom root.
		controller.view.document.getRoot()._name = 'div';

		dispatcher = controller.downcastDispatcher;
		const downcastHelpers = new DowncastHelpers( [ dispatcher ] );
		downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

		modelRootStart = model.createPositionAt( modelRoot, 0 );
	} );

	describe( 'insertText()', () => {
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
			dispatcher.on( 'insert:$text', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'insert' );
			}, { converterPriority: 'high' } );

			model.change( writer => {
				writer.insert( new ModelText( 'foobar' ), modelRootStart );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div></div>' );
		} );
	} );

	// Remove converter is by default already added in `EditingController` instance.
	describe( 'remove()', () => {
		let viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument( new StylesProcessor() );
		} );

		it( 'should remove items from view accordingly to changes in model #1', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar' ) );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			model.change( writer => {
				writer.remove(
					writer.createRange( writer.createPositionAt( modelElement, 2 ), writer.createPositionAt( modelElement, 4 ) )
				);
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
				writer.remove(
					writer.createRange( writer.createPositionAt( modelElement, 2 ), writer.createPositionAt( modelElement, 4 ) )
				);
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should support unicode', () => {
			const modelElement = new ModelElement( 'paragraph', null, 'நிலைக்கு' );

			model.change( writer => {
				writer.insert( modelElement, modelRootStart );
			} );

			model.change( writer => {
				writer.remove(
					writer.createRange( writer.createPositionAt( modelElement, 0 ), writer.createPositionAt( modelElement, 6 ) )
				);
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>கு</p></div>' );
		} );

		it( 'should not remove view ui elements that are placed next to removed content', () => {
			modelRoot._appendChild( new ModelText( 'fozbar' ) );
			viewRoot._appendChild( [
				new ViewText( viewDocument, 'foz' ),
				new ViewUIElement( viewDocument, 'span' ),
				new ViewText( viewDocument, 'bar' )
			] );

			// Remove 'b'.
			model.change( writer => {
				writer.remove(
					writer.createRange( writer.createPositionAt( modelRoot, 3 ), writer.createPositionAt( modelRoot, 4 ) )
				);
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foz<span></span>ar</div>' );

			// Remove 'z'.
			model.change( writer => {
				writer.remove(
					writer.createRange( writer.createPositionAt( modelRoot, 2 ), writer.createPositionAt( modelRoot, 3 ) )
				);
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>fo<span></span>ar</div>' );
		} );

		it( 'should remove correct amount of text when it is split by view ui element', () => {
			modelRoot._appendChild( new ModelText( 'fozbar' ) );
			viewRoot._appendChild( [
				new ViewText( viewDocument, 'foz' ),
				new ViewUIElement( viewDocument, 'span' ),
				new ViewText( viewDocument, 'bar' )
			] );

			// Remove 'z<span></span>b'.
			model.change( writer => {
				writer.remove(
					writer.createRange( writer.createPositionAt( modelRoot, 2 ), writer.createPositionAt( modelRoot, 4 ) )
				);
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

			const downcastHelpers = new DowncastHelpers( [ dispatcher ] );
			downcastHelpers.elementToElement( { model: 'widget', view: 'widget' } );

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

			const viewP1 = new ViewContainerElement( viewDocument, 'p' );
			const viewUi1 = new ViewUIElement( viewDocument, 'span' );
			const viewUi2 = new ViewUIElement( viewDocument, 'span' );
			const viewP2 = new ViewContainerElement( viewDocument, 'p' );

			modelRoot._appendChild( [ modelP1, modelP2 ] );
			viewRoot._appendChild( [ viewP1, viewUi1, viewUi2, viewP2 ] );

			controller.mapper.bindElements( modelP1, viewP1 );
			controller.mapper.bindElements( modelP2, viewP2 );

			// Remove second paragraph element.
			model.change( writer => {
				writer.remove( writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 2 ) ) );
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

	describe( 'createViewElementFromHighlightDescriptor()', () => {
		let viewWriter;

		beforeEach( () => {
			viewWriter = new DowncastWriter( controller.view.document );
		} );

		it( 'should return attribute element from descriptor object', () => {
			const descriptor = {
				classes: 'foo-class',
				attributes: { one: '1', two: '2' },
				priority: 7
			};
			const element = createViewElementFromHighlightDescriptor( viewWriter, descriptor );

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
				classes: [ 'foo-class', 'bar-class' ],
				attributes: { one: '1', two: '2' },
				priority: 7
			};
			const element = createViewElementFromHighlightDescriptor( viewWriter, descriptor );

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
				priority: 7
			};
			const element = createViewElementFromHighlightDescriptor( viewWriter, descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 7 );

			for ( const key of Object.keys( descriptor.attributes ) ) {
				expect( element.getAttribute( key ) ).to.equal( descriptor.attributes[ key ] );
			}
		} );

		it( 'should create element without priority', () => {
			const descriptor = {
				classes: 'foo-class',
				attributes: { one: '1', two: '2' }
			};
			const element = createViewElementFromHighlightDescriptor( viewWriter, descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( ViewAttributeElement.DEFAULT_PRIORITY );
			expect( element.hasClass( 'foo-class' ) ).to.be.true;

			for ( const key of Object.keys( descriptor.attributes ) ) {
				expect( element.getAttribute( key ) ).to.equal( descriptor.attributes[ key ] );
			}
		} );

		it( 'should create element without attributes', () => {
			const descriptor = {
				classes: 'foo-class',
				priority: 7
			};
			const element = createViewElementFromHighlightDescriptor( viewWriter, descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 7 );
			expect( element.hasClass( 'foo-class' ) ).to.be.true;
		} );
	} );
} );

describe( 'downcast selection converters', () => {
	let dispatcher, mapper, model, view, modelDoc, modelRoot, docSelection, viewDoc, viewRoot, viewSelection, downcastHelpers;

	beforeEach( () => {
		model = new Model();
		modelDoc = model.document;
		modelRoot = modelDoc.createRoot();
		docSelection = modelDoc.selection;

		model.schema.extend( '$text', { allowIn: '$root' } );

		view = new View( new StylesProcessor() );
		viewDoc = view.document;
		viewRoot = createViewRoot( viewDoc );
		viewSelection = viewDoc.selection;

		mapper = new Mapper();
		mapper.bindElements( modelRoot, viewRoot );

		dispatcher = new DowncastDispatcher( { mapper, viewSelection } );

		dispatcher.on( 'insert:$text', insertText() );

		downcastHelpers = new DowncastHelpers( [ dispatcher ] );
		downcastHelpers.attributeToElement( { model: 'bold', view: 'strong' } );
		downcastHelpers.markerToHighlight( { model: 'marker', view: { classes: 'marker' }, converterPriority: 1 } );

		// Default selection converters.
		dispatcher.on( 'selection', clearAttributes(), { priority: 'low' } );
		dispatcher.on( 'selection', convertRangeSelection(), { priority: 'low' } );
		dispatcher.on( 'selection', convertCollapsedSelection(), { priority: 'low' } );
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'default converters', () => {
		describe( 'range selection', () => {
			it( 'in same container', () => {
				testSelection(
					[ 1, 4 ],
					'foobar',
					'f{oob}ar'
				);
			} );

			it( 'in same container with unicode characters', () => {
				testSelection(
					[ 2, 6 ],
					'நிலைக்கு',
					'நி{லைக்}கு'
				);
			} );

			it( 'in same container, over attribute', () => {
				testSelection(
					[ 1, 5 ],
					'fo<$text bold="true">ob</$text>ar',
					'f{o<strong>ob</strong>a}r'
				);
			} );

			it( 'in same container, next to attribute', () => {
				testSelection(
					[ 1, 2 ],
					'fo<$text bold="true">ob</$text>ar',
					'f{o}<strong>ob</strong>ar'
				);
			} );

			it( 'in same attribute', () => {
				testSelection(
					[ 2, 4 ],
					'f<$text bold="true">ooba</$text>r',
					'f<strong>o{ob}a</strong>r'
				);
			} );

			it( 'in same attribute, selection same as attribute', () => {
				testSelection(
					[ 2, 4 ],
					'fo<$text bold="true">ob</$text>ar',
					'fo{<strong>ob</strong>}ar'
				);
			} );

			it( 'starts in text node, ends in attribute #1', () => {
				testSelection(
					[ 1, 3 ],
					'fo<$text bold="true">ob</$text>ar',
					'f{o<strong>o}b</strong>ar'
				);
			} );

			it( 'starts in text node, ends in attribute #2', () => {
				testSelection(
					[ 1, 4 ],
					'fo<$text bold="true">ob</$text>ar',
					'f{o<strong>ob</strong>}ar'
				);
			} );

			it( 'starts in attribute, ends in text node', () => {
				testSelection(
					[ 3, 5 ],
					'fo<$text bold="true">ob</$text>ar',
					'fo<strong>o{b</strong>a}r'
				);
			} );

			it( 'consumes consumable values properly', () => {
				// Add callback that will fire before default ones.
				// This should prevent default callback doing anything.
				dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
					expect( conversionApi.consumable.consume( data.selection, 'selection' ) ).to.be.true;
				}, { priority: 'high' } );

				// Similar test case as the first in this suite.
				testSelection(
					[ 1, 4 ],
					'foobar',
					'foobar' // No selection in view.
				);
			} );

			it( 'should convert backward selection', () => {
				testSelection(
					[ 1, 3, 'backward' ],
					'foobar',
					'f{oo}bar'
				);

				expect( viewSelection.focus.offset ).to.equal( 1 );
			} );
		} );

		describe( 'collapsed selection', () => {
			let marker, viewDocument;

			beforeEach( () => {
				viewDocument = new ViewDocument( new StylesProcessor() );
			} );

			it( 'in container', () => {
				testSelection(
					[ 1, 1 ],
					'foobar',
					'f{}oobar'
				);
			} );

			it( 'in attribute', () => {
				testSelection(
					[ 3, 3 ],
					'f<$text bold="true">ooba</$text>r',
					'f<strong>oo{}ba</strong>r'
				);
			} );

			it( 'in attribute and marker', () => {
				setModelData( model, 'fo<$text bold="true">ob</$text>ar' );

				model.change( writer => {
					const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 5 ) );
					marker = writer.addMarker( 'marker', { range, usingOperation: false } );
					writer.setSelection( modelRoot, 3 );
				} );

				// Remove view children manually (without firing additional conversion).
				viewRoot._removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );
					dispatcher.convertMarkerAdd( marker.name, marker.getRange(), writer );
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) ).to.equal(
					'<div>f<span class="marker">o<strong>o{}b</strong>a</span>r</div>'
				);
			} );

			it( 'in attribute and marker - no attribute', () => {
				setModelData( model, 'fo<$text bold="true">ob</$text>ar' );

				model.change( writer => {
					const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 5 ) );
					marker = writer.addMarker( 'marker', { range, usingOperation: false } );
					writer.setSelection( modelRoot, 3 );
					writer.removeSelectionAttribute( 'bold' );
				} );

				// Remove view children manually (without firing additional conversion).
				viewRoot._removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );
					dispatcher.convertMarkerAdd( marker.name, marker.getRange(), writer );
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>f<span class="marker">o<strong>o</strong>[]<strong>b</strong>a</span>r</div>' );
			} );

			it( 'in marker - using highlight descriptor creator', () => {
				downcastHelpers.markerToHighlight( {
					model: 'marker2',
					view: data => ( { classes: data.markerName } )
				} );

				setModelData( model, 'foobar' );

				model.change( writer => {
					const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 5 ) );
					marker = writer.addMarker( 'marker2', { range, usingOperation: false } );
					writer.setSelection( modelRoot, 3 );
				} );

				// Remove view children manually (without firing additional conversion).
				viewRoot._removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );
					dispatcher.convertMarkerAdd( marker.name, marker.getRange(), writer );
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>f<span class="marker2">oo{}ba</span>r</div>' );
			} );

			it( 'should do nothing if creator return null', () => {
				downcastHelpers.markerToHighlight( {
					model: 'marker3',
					view: () => null
				} );

				setModelData( model, 'foobar' );

				model.change( writer => {
					const range = writer.createRange( writer.createPositionAt( modelRoot, 1 ), writer.createPositionAt( modelRoot, 5 ) );
					marker = writer.addMarker( 'marker3', { range, usingOperation: false } );
					writer.setSelection( modelRoot, 3 );
				} );

				// Remove view children manually (without firing additional conversion).
				viewRoot._removeChildren( 0, viewRoot.childCount );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );
					dispatcher.convertMarkerAdd( marker.name, marker.getRange(), writer );
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>foo{}bar</div>' );
			} );

			// #1072 - if the container has only ui elements, collapsed selection attribute should be rendered after those ui elements.
			it( 'selection with attribute before ui element - no non-ui children', () => {
				setModelData( model, '' );

				// Add two ui elements to view.
				viewRoot._appendChild( [
					new ViewUIElement( viewDocument, 'span' ),
					new ViewUIElement( viewDocument, 'span' )
				] );

				model.change( writer => {
					writer.setSelection( writer.createRange( writer.createPositionFromPath( modelRoot, [ 0 ] ) ) );
					writer.setSelectionAttribute( 'bold', true );
				} );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div><span></span><span></span><strong>[]</strong></div>' );
			} );

			// #1072.
			it( 'selection with attribute before ui element - has non-ui children #1', () => {
				setModelData( model, 'x' );

				model.change( writer => {
					writer.setSelection( writer.createRange( writer.createPositionFromPath( modelRoot, [ 1 ] ) ) );
					writer.setSelectionAttribute( 'bold', true );
				} );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );

					// Add ui element to view.
					const uiElement = new ViewUIElement( viewDocument, 'span' );
					viewRoot._insertChild( 1, uiElement );

					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div>x<strong>[]</strong><span></span></div>' );
			} );

			// #1072.
			it( 'selection with attribute before ui element - has non-ui children #2', () => {
				setModelData( model, '<$text bold="true">x</$text>y' );

				model.change( writer => {
					writer.setSelection( writer.createRange( writer.createPositionFromPath( modelRoot, [ 1 ] ) ) );
					writer.setSelectionAttribute( 'bold', true );
				} );

				// Convert model to view.
				view.change( writer => {
					dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );

					// Add ui element to view.
					const uiElement = new ViewUIElement( viewDocument, 'span' );
					viewRoot._insertChild( 1, uiElement, writer );
					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );

				// Stringify view and check if it is same as expected.
				expect( stringifyView( viewRoot, viewSelection, { showType: false } ) )
					.to.equal( '<div><strong>x{}</strong><span></span>y</div>' );
			} );

			it( 'consumes consumable values properly', () => {
				// Add callbacks that will fire before default ones.
				// This should prevent default callbacks doing anything.
				dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
					expect( conversionApi.consumable.consume( data.selection, 'selection' ) ).to.be.true;
				}, { priority: 'high' } );

				dispatcher.on( 'attribute:bold', ( evt, data, conversionApi ) => {
					expect( conversionApi.consumable.consume( data.item, 'attribute:bold' ) ).to.be.true;
				}, { priority: 'high' } );

				// Similar test case as above.
				testSelection(
					[ 3, 3 ],
					'f<$text bold="true">ooba</$text>r',
					'foobar' // No selection in view and no attribute.
				);
			} );
		} );
	} );

	describe( 'clean-up', () => {
		describe( 'convertRangeSelection', () => {
			it( 'should remove all ranges before adding new range', () => {
				testSelection(
					[ 0, 2 ],
					'foobar',
					'{fo}obar'
				);

				testSelection(
					[ 3, 5 ],
					'foobar',
					'foo{ba}r'
				);

				expect( viewSelection.rangeCount ).to.equal( 1 );
			} );
		} );

		describe( 'convertCollapsedSelection', () => {
			it( 'should remove all ranges before adding new range', () => {
				testSelection(
					[ 2, 2 ],
					'foobar',
					'fo{}obar'
				);

				testSelection(
					[ 3, 3 ],
					'foobar',
					'foo{}bar'
				);

				expect( viewSelection.rangeCount ).to.equal( 1 );
			} );
		} );

		describe( 'clearAttributes', () => {
			it( 'should remove all ranges before adding new range', () => {
				testSelection(
					[ 3, 3 ],
					'foobar',
					'foo<strong>[]</strong>bar',
					{ bold: 'true' }
				);

				view.change( writer => {
					const modelRange = model.createRange( model.createPositionAt( modelRoot, 1 ), model.createPositionAt( modelRoot, 1 ) );
					model.change( writer => {
						writer.setSelection( modelRange );
					} );

					dispatcher.convertSelection( modelDoc.selection, model.markers, writer );
				} );

				expect( viewSelection.rangeCount ).to.equal( 1 );

				const viewString = stringifyView( viewRoot, viewSelection, { showType: false } );
				expect( viewString ).to.equal( '<div>f{}oobar</div>' );
			} );

			it( 'should do nothing if the attribute element had been already removed', () => {
				testSelection(
					[ 3, 3 ],
					'foobar',
					'foo<strong>[]</strong>bar',
					{ bold: 'true' }
				);

				view.change( writer => {
					// Remove <strong></strong> manually.
					writer.mergeAttributes( viewSelection.getFirstPosition() );

					const modelRange = model.createRange( model.createPositionAt( modelRoot, 1 ), model.createPositionAt( modelRoot, 1 ) );
					model.change( writer => {
						writer.setSelection( modelRange );
					} );

					dispatcher.convertSelection( modelDoc.selection, model.markers, writer );
				} );

				expect( viewSelection.rangeCount ).to.equal( 1 );

				const viewString = stringifyView( viewRoot, viewSelection, { showType: false } );
				expect( viewString ).to.equal( '<div>f{}oobar</div>' );
			} );

			it( 'should clear fake selection', () => {
				const modelRange = model.createRange( model.createPositionAt( modelRoot, 1 ), model.createPositionAt( modelRoot, 1 ) );

				view.change( writer => {
					writer.setSelection( modelRange, { fake: true } );

					dispatcher.convertSelection( docSelection, model.markers, writer );
				} );
				expect( viewSelection.isFake ).to.be.false;
			} );
		} );
	} );

	describe( 'table cell selection converter', () => {
		beforeEach( () => {
			model.schema.register( 'table', { isLimit: true } );
			model.schema.register( 'tr', { isLimit: true } );
			model.schema.register( 'td', { isLimit: true } );

			model.schema.extend( 'table', { allowIn: '$root' } );
			model.schema.extend( 'tr', { allowIn: 'table' } );
			model.schema.extend( 'td', { allowIn: 'tr' } );
			model.schema.extend( '$text', { allowIn: 'td' } );

			const downcastHelpers = new DowncastHelpers( [ dispatcher ] );

			// "Universal" converter to convert table structure.
			downcastHelpers.elementToElement( { model: 'table', view: 'table' } );
			downcastHelpers.elementToElement( { model: 'tr', view: 'tr' } );
			downcastHelpers.elementToElement( { model: 'td', view: 'td' } );

			// Special converter for table cells.
			dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
				const selection = data.selection;

				if ( !conversionApi.consumable.test( selection, 'selection' ) || selection.isCollapsed ) {
					return;
				}

				for ( const range of selection.getRanges() ) {
					const node = range.start.parent;

					if ( !!node && node.is( 'element', 'td' ) ) {
						conversionApi.consumable.consume( selection, 'selection' );

						const viewNode = conversionApi.mapper.toViewElement( node );
						conversionApi.writer.addClass( 'selected', viewNode );
					}
				}
			}, { priority: 'high' } );
		} );

		it( 'should not be used to convert selection that is not on table cell', () => {
			testSelection(
				[ 1, 5 ],
				'f{o<$text bold="true">ob</$text>a}r',
				'f{o<strong>ob</strong>a}r'
			);
		} );

		it( 'should add a class to the selected table cell', () => {
			testSelection(
				// table tr#0 td#0 [foo, table tr#0 td#0 bar]
				[ [ 0, 0, 0, 0 ], [ 0, 0, 0, 3 ] ],
				'<table><tr><td>foo</td></tr><tr><td>bar</td></tr></table>',
				'<table><tr><td class="selected">foo</td></tr><tr><td>bar</td></tr></table>'
			);
		} );

		it( 'should not be used if selection contains more than just a table cell', () => {
			testSelection(
				// table tr td#1 f{oo bar, table tr#2 bar]
				[ [ 0, 0, 0, 1 ], [ 0, 0, 1, 3 ] ],
				'<table><tr><td>foo</td><td>bar</td></tr></table>',
				'[<table><tr><td>foo</td><td>bar</td></tr></table>]'
			);
		} );
	} );

	// Tests if the selection got correctly converted.
	// Because `setData` might use selection converters itself to set the selection, we can't use it
	// to set the selection (because then we would test converters using converters).
	// Instead, the `test` function expects to be passed `selectionPaths` which is an array containing two numbers or two arrays,
	// that are offsets or paths of selection positions in root element.
	function testSelection( selectionPaths, modelInput, expectedView, selectionAttributes = {} ) {
		// Parse passed `modelInput` string and set it as current model.
		setModelData( model, modelInput );

		// Manually set selection ranges using passed `selectionPaths`.
		const startPath = typeof selectionPaths[ 0 ] == 'number' ? [ selectionPaths[ 0 ] ] : selectionPaths[ 0 ];
		const endPath = typeof selectionPaths[ 1 ] == 'number' ? [ selectionPaths[ 1 ] ] : selectionPaths[ 1 ];

		const startPos = model.createPositionFromPath( modelRoot, startPath );
		const endPos = model.createPositionFromPath( modelRoot, endPath );

		const isBackward = selectionPaths[ 2 ] === 'backward';
		model.change( writer => {
			writer.setSelection( writer.createRange( startPos, endPos ), { backward: isBackward } );

			// And add or remove passed attributes.
			for ( const key in selectionAttributes ) {
				const value = selectionAttributes[ key ];

				if ( value ) {
					writer.setSelectionAttribute( key, value );
				} else {
					writer.removeSelectionAttribute( key );
				}
			}
		} );

		// Remove view children manually (without firing additional conversion).
		viewRoot._removeChildren( 0, viewRoot.childCount );

		// Convert model to view.
		view.change( writer => {
			dispatcher.convertInsert( model.createRangeIn( modelRoot ), writer );
			dispatcher.convertSelection( docSelection, model.markers, writer );
		} );

		// Stringify view and check if it is same as expected.
		expect( stringifyView( viewRoot, viewSelection, { showType: false } ) ).to.equal( '<div>' + expectedView + '</div>' );
	}
} );

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
