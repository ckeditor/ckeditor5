/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ViewText from '../../../src/view/text.js';
import ViewElement from '../../../src/view/element.js';
import ViewUIElement from '../../../src/view/uielement.js';
import ViewPosition from '../../../src/view/position.js';
import ViewContainerElement from '../../../src/view/containerelement.js';
import ViewAttributeElement from '../../../src/view/attributeelement.js';
import ViewEmptyElement from '../../../src/view/emptyelement.js';
import DomConverter from '../../../src/view/domconverter.js';
import ViewDocumentFragment from '../../../src/view/documentfragment.js';
import ViewDocument from '../../../src/view/document.js';
import DowncastWriter from '../../../src/view/downcastwriter.js';
import { INLINE_FILLER, INLINE_FILLER_LENGTH, BR_FILLER, NBSP_FILLER, MARKED_NBSP_FILLER } from '../../../src/view/filler.js';

import { parse, getData as getViewData } from '../../../src/dev-utils/view.js';
import { setData as setModelData } from '../../../src/dev-utils/model.js';

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DomConverter', () => {
	let converter, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		converter = new DomConverter( viewDocument );
	} );

	describe( 'viewToDom()', () => {
		it( 'should create tree of DOM elements from view elements', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

			viewP._appendChild( viewImg );
			viewP._appendChild( viewText );

			const domImg = document.createElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const domP = converter.viewToDom( viewP );

			expect( domP ).to.be.an.instanceof( HTMLElement );
			expect( domP.tagName ).to.equal( 'P' );

			expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domP.attributes.length ).to.equal( 1 );

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].tagName ).to.equal( 'IMG' );
			expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );

			expect( converter.mapDomToView( domP ) ).not.to.equal( viewP );
			expect( converter.mapDomToView( domP.childNodes[ 0 ] ) ).to.equal( viewImg );
		} );

		it( 'should create tree of DOM elements from view elements and bind elements', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

			viewP._appendChild( viewImg );
			viewP._appendChild( viewText );

			const domP = converter.viewToDom( viewP, { bind: true } );

			expect( domP ).to.be.an.instanceof( HTMLElement );
			expect( domP.tagName ).to.equal( 'P' );

			expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domP.attributes.length ).to.equal( 1 );

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].tagName ).to.equal( 'IMG' );
			expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );

			expect( converter.mapDomToView( domP ) ).to.equal( viewP );
			expect( converter.mapDomToView( domP.childNodes[ 0 ] ) ).to.equal( viewP.getChild( 0 ) );
		} );

		it( 'should support unicode', () => {
			const viewText = new ViewText( viewDocument, 'நிலைக்கு' );
			const viewP = new ViewElement( viewDocument, 'p', null, viewText );

			const domP = converter.viewToDom( viewP, { bind: true } );

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'நிலைக்கு' );

			expect( converter.mapDomToView( domP ) ).to.equal( viewP );
			expect( converter.findCorrespondingViewText( domP.childNodes[ 0 ] ) ).to.equal( viewP.getChild( 0 ) );
		} );

		it( 'should create tree of DOM elements from view element without children', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

			viewP._appendChild( viewImg );
			viewP._appendChild( viewText );

			const domImg = document.createElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const domP = converter.viewToDom( viewP, { withChildren: false } );

			expect( domP ).to.be.an.instanceof( HTMLElement );
			expect( domP.tagName ).to.equal( 'P' );

			expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domP.attributes.length ).to.equal( 1 );

			expect( domP.childNodes.length ).to.equal( 0 );
			expect( converter.mapDomToView( domP ) ).not.to.equal( viewP );
		} );

		it( 'should create DOM document fragment from view document fragment and bind elements', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewFragment = new ViewDocumentFragment( viewDocument );

			viewFragment._appendChild( viewImg );
			viewFragment._appendChild( viewText );

			const domFragment = converter.viewToDom( viewFragment, { bind: true } );

			expect( domFragment ).to.be.an.instanceof( DocumentFragment );
			expect( domFragment.childNodes.length ).to.equal( 2 );
			expect( domFragment.childNodes[ 0 ].tagName ).to.equal( 'IMG' );
			expect( domFragment.childNodes[ 1 ].data ).to.equal( 'foo' );

			expect( converter.mapDomToView( domFragment ) ).to.equal( viewFragment );
			expect( converter.mapDomToView( domFragment.childNodes[ 0 ] ) ).to.equal( viewFragment.getChild( 0 ) );
		} );

		it( 'should create DOM document fragment from view document without children', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewFragment = new ViewDocumentFragment( viewDocument );

			viewFragment._appendChild( viewImg );
			viewFragment._appendChild( viewText );

			const domImg = document.createElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const domFragment = converter.viewToDom( viewFragment, { withChildren: false } );

			expect( domFragment ).to.be.an.instanceof( DocumentFragment );

			expect( domFragment.childNodes.length ).to.equal( 0 );
			expect( converter.mapDomToView( domFragment ) ).not.to.equal( viewFragment );
		} );

		it( 'should return already bind document fragment', () => {
			const domFragment = document.createDocumentFragment();
			const viewFragment = new ViewDocumentFragment( viewDocument );

			converter.bindDocumentFragments( domFragment, viewFragment );

			const domFragment2 = converter.viewToDom( viewFragment );

			expect( domFragment2 ).to.equal( domFragment );
		} );

		it( 'should create DOM text node from view text node', () => {
			const viewTextNode = new ViewText( viewDocument, 'foo' );
			const domTextNode = converter.viewToDom( viewTextNode );

			expect( domTextNode ).to.be.instanceof( Text );
			expect( domTextNode.data ).to.equal( 'foo' );
		} );

		it( 'should create namespaced elements', () => {
			const namespace = 'http://www.w3.org/2000/svg';
			const viewSvg = new ViewElement( viewDocument, 'svg', { xmlns: namespace } );

			const domSvg = converter.viewToDom( viewSvg );

			expect( domSvg.createSVGRect ).to.be.a( 'function' );
		} );

		it( 'should create a DOM comment node from a view `$comment` UIElement', () => {
			const viewComment = new ViewUIElement( viewDocument, '$comment' );

			viewComment._setCustomProperty( '$rawContent', 'foo' );

			const domComment = converter.viewToDom( viewComment );

			expect( domComment ).to.be.an.instanceof( Comment );
			expect( domComment.nodeName ).to.equal( '#comment' );
			expect( domComment.data ).to.equal( 'foo' );

			expect( converter.mapDomToView( domComment ) ).to.not.equal( viewComment );
		} );

		it( 'should create a DOM comment node from a view `$comment` UIElement and bind them', () => {
			const viewComment = new ViewUIElement( viewDocument, '$comment' );

			viewComment._setCustomProperty( '$rawContent', 'foo' );

			const domComment = converter.viewToDom( viewComment, { bind: true } );

			expect( domComment ).to.be.an.instanceof( Comment );
			expect( domComment.nodeName ).to.equal( '#comment' );
			expect( domComment.data ).to.equal( 'foo' );

			expect( converter.mapDomToView( domComment ) ).to.equal( viewComment );
		} );

		describe( 'options.renderingMode = data', () => {
			it( 'should use a separate DOM document to create DOM elements', () => {
				const viewElement = new ViewElement( viewDocument, 'p', { onclick: 'bar' }, [
					new ViewElement( viewDocument, 'audio', { src: 'x', onerror: 'alert(1)' } )
				] );

				converter = new DomConverter( viewDocument, {
					renderingMode: 'data'
				} );

				const domElement = converter.viewToDom( viewElement );

				expect( domElement.ownerDocument ).not.equal( document );
				expect( domElement.firstChild.ownerDocument ).not.equal( document );
				expect( domElement.ownerDocument ).to.equal( domElement.firstChild.ownerDocument );
				expect( domElement.innerHTML ).to.equal( '<audio src="x" onerror="alert(1)"></audio>' );
			} );

			it( 'should use a separate DOM document to create DOM text nodes', () => {
				const viewElement = new ViewElement( viewDocument, 'p', { onclick: 'bar' }, [
					new ViewText( viewDocument, 'foobar' )
				] );

				converter = new DomConverter( viewDocument, {
					renderingMode: 'data'
				} );

				const domElement = converter.viewToDom( viewElement );

				expect( domElement.ownerDocument ).not.equal( document );
				expect( domElement.firstChild.ownerDocument ).not.equal( document );
				expect( domElement.ownerDocument ).to.equal( domElement.firstChild.ownerDocument );
				expect( domElement.innerHTML ).to.equal( 'foobar' );
			} );

			it( 'should use a separate DOM document to create a DOM document fragment', () => {
				const viewFragment = new ViewDocumentFragment( viewDocument, [
					new ViewElement( viewDocument, 'p', { onclick: 'bar' }, [
						new ViewElement( viewDocument, 'audio', { src: 'x', onerror: 'alert(1)' } )
					] )
				] );

				converter = new DomConverter( viewDocument, {
					renderingMode: 'data'
				} );

				const domFragment = converter.viewToDom( viewFragment );

				expect( domFragment.ownerDocument ).not.equal( document );
				expect( domFragment.firstChild.ownerDocument ).not.equal( document );
				expect( domFragment.firstChild.firstChild.ownerDocument ).not.equal( document );
				expect( domFragment.ownerDocument ).to.equal( domFragment.firstChild.ownerDocument );
				expect( domFragment.firstChild.innerHTML ).to.equal( '<audio src="x" onerror="alert(1)"></audio>' );
			} );
		} );

		describe( 'options.renderingMode = editing', () => {
			let warnStub;

			beforeEach( () => {
				warnStub = testUtils.sinon.stub( console, 'warn' );
			} );

			it( 'should filter DOM event handlers', () => {
				const viewImg = new ViewElement( viewDocument, 'img' );
				const viewText = new ViewText( viewDocument, 'foo' );
				const viewP = new ViewElement( viewDocument, 'p', { onclick: 'bar' } );

				viewP._appendChild( viewImg );
				viewP._appendChild( viewText );

				const domImg = document.createElement( 'img' );

				converter = new DomConverter( viewDocument, {
					renderingMode: 'editing'
				} );

				converter.bindElements( domImg, viewImg );

				const domP = converter.viewToDom( viewP );

				expect( domP ).to.be.an.instanceof( HTMLElement );
				expect( domP.tagName ).to.equal( 'P' );
				expect( domP.attributes.length ).to.equal( 1 );
				expect( domP.dataset.ckUnsafeAttributeOnclick ).to.equal( 'bar' );

				expect( domP.childNodes.length ).to.equal( 2 );
				expect( domP.childNodes[ 0 ].tagName ).to.equal( 'IMG' );
				expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );

				expect( converter.mapDomToView( domP ) ).not.to.equal( viewP );
				expect( converter.mapDomToView( domP.childNodes[ 0 ] ) ).to.equal( viewImg );
			} );

			it( 'should warn when an unsafe attribute was filtered out', () => {
				const viewP = new ViewElement( viewDocument, 'p', { onclick: 'bar' } );

				converter = new DomConverter( viewDocument, {
					renderingMode: 'editing'
				} );

				const domP = converter.viewToDom( viewP );

				sinon.assert.calledOnce( warnStub );
				sinon.assert.calledWithExactly( warnStub,
					sinon.match( /^domconverter-unsafe-attribute-detected/ ),
					{
						domElement: domP,
						key: 'onclick',
						value: 'bar'
					},
					sinon.match.string // Link to the documentation
				);
			} );

			it( 'should replace script with span and add special data attribute', () => {
				const viewScript = new ViewElement( viewDocument, 'script' );
				const viewText = new ViewText( viewDocument, 'foo' );
				const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

				viewP._appendChild( viewScript );
				viewP._appendChild( viewText );

				converter = new DomConverter( viewDocument, {
					renderingMode: 'editing'
				} );

				const domP = converter.viewToDom( viewP );

				expect( domP ).to.be.an.instanceof( HTMLElement );
				expect( domP.tagName ).to.equal( 'P' );
				expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
				expect( domP.attributes.length ).to.equal( 1 );

				expect( domP.childNodes.length ).to.equal( 2 );
				expect( domP.childNodes[ 0 ].tagName ).to.equal( 'SPAN' );
				expect( domP.childNodes[ 0 ].getAttribute( 'data-ck-unsafe-element' ) ).to.equal( 'script' );
				expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );
			} );

			it( 'should warn when an unsafe script was filtered out', () => {
				const viewScript = new ViewElement( viewDocument, 'script' );
				const viewText = new ViewText( viewDocument, 'foo' );
				const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

				viewP._appendChild( viewScript );
				viewP._appendChild( viewText );

				converter = new DomConverter( viewDocument, {
					renderingMode: 'editing'
				} );

				converter.viewToDom( viewP );

				sinon.assert.calledOnce( warnStub );
				sinon.assert.calledWithExactly( warnStub,
					sinon.match( /^domconverter-unsafe-script-element-detected/ ),
					sinon.match.string // Link to the documentation
				);
			} );

			it( 'should replace style with span and add special data attribute', () => {
				const viewScript = new ViewElement( viewDocument, 'style' );
				const viewText = new ViewText( viewDocument, 'foo' );
				const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

				viewP._appendChild( viewScript );
				viewP._appendChild( viewText );

				converter = new DomConverter( viewDocument, {
					renderingMode: 'editing'
				} );

				const domP = converter.viewToDom( viewP );

				expect( domP ).to.be.an.instanceof( HTMLElement );
				expect( domP.tagName ).to.equal( 'P' );
				expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
				expect( domP.attributes.length ).to.equal( 1 );

				expect( domP.childNodes.length ).to.equal( 2 );
				expect( domP.childNodes[ 0 ].tagName ).to.equal( 'SPAN' );
				expect( domP.childNodes[ 0 ].getAttribute( 'data-ck-unsafe-element' ) ).to.equal( 'style' );
				expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );
			} );

			it( 'should warn when an unsafe style was filtered out', () => {
				const viewStyle = new ViewElement( viewDocument, 'style' );
				const viewText = new ViewText( viewDocument, 'foo' );
				const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

				viewP._appendChild( viewStyle );
				viewP._appendChild( viewText );

				converter = new DomConverter( viewDocument, {
					renderingMode: 'editing'
				} );

				converter.viewToDom( viewP );

				sinon.assert.calledOnce( warnStub );
				sinon.assert.calledWithExactly( warnStub,
					sinon.match( /^domconverter-unsafe-style-element-detected/ ),
					sinon.match.string // Link to the documentation
				);
			} );

			it( 'should replace registered custom element with span and add special data attribute', () => {
				const viewScript = new ViewElement( viewDocument, 'custom-foo-element' );
				const viewText = new ViewText( viewDocument, 'foo' );
				const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

				viewP._appendChild( viewScript );
				viewP._appendChild( viewText );

				converter = new DomConverter( viewDocument, {
					renderingMode: 'editing'
				} );

				converter.unsafeElements.push( 'custom-foo-element' );

				const domP = converter.viewToDom( viewP );

				expect( domP ).to.be.an.instanceof( HTMLElement );
				expect( domP.tagName ).to.equal( 'P' );
				expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
				expect( domP.attributes.length ).to.equal( 1 );

				expect( domP.childNodes.length ).to.equal( 2 );
				expect( domP.childNodes[ 0 ].tagName ).to.equal( 'SPAN' );
				expect( domP.childNodes[ 0 ].getAttribute( 'data-ck-unsafe-element' ) ).to.equal( 'custom-foo-element' );
				expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );
			} );

			describe( 'unsafe attribute names that were declaratively permitted', () => {
				let writer;

				beforeEach( () => {
					writer = new DowncastWriter( viewDocument );
					converter = new DomConverter( viewDocument, {
						renderingMode: 'editing'
					} );
				} );

				it( 'should not be rejected when set on attribute elements', () => {
					const viewElement = writer.createAttributeElement( 'span', {
						onclick: 'foo',
						onkeydown: 'bar'
					}, { renderUnsafeAttributes: [ 'onclick' ] } );

					expect( converter.viewToDom( viewElement ).outerHTML ).to.equal(
						'<span onclick="foo" data-ck-unsafe-attribute-onkeydown="bar"></span>'
					);
				} );

				it( 'should not be rejected when set on container elements', () => {
					const viewElement = writer.createContainerElement( 'p', {
						onclick: 'foo',
						onkeydown: 'bar'
					}, { renderUnsafeAttributes: [ 'onclick' ] } );

					viewElement.getFillerOffset = () => null;

					expect( converter.viewToDom( viewElement ).outerHTML ).to.equal(
						'<p onclick="foo" data-ck-unsafe-attribute-onkeydown="bar"></p>'
					);
				} );

				it( 'should not be rejected when set on editable elements', () => {
					const viewElement = writer.createEditableElement( 'div', {
						onclick: 'foo',
						onkeydown: 'bar'
					}, { renderUnsafeAttributes: [ 'onclick' ] } );

					viewElement.getFillerOffset = () => null;

					expect( converter.viewToDom( viewElement ).outerHTML ).to.equal(
						'<div onclick="foo" data-ck-unsafe-attribute-onkeydown="bar"></div>'
					);
				} );

				it( 'should not be rejected when set on empty elements', () => {
					const viewElement = writer.createEmptyElement( 'img', {
						onclick: 'foo',
						onkeydown: 'bar'
					}, { renderUnsafeAttributes: [ 'onclick' ] } );

					expect( converter.viewToDom( viewElement ).outerHTML ).to.equal(
						'<img onclick="foo" data-ck-unsafe-attribute-onkeydown="bar">'
					);
				} );

				it( 'should not be rejected when set on raw elements', () => {
					const viewElement = writer.createRawElement( 'p', {
						onclick: 'foo',
						onkeydown: 'bar'
					}, function( domElement ) {
						domElement.innerHTML = 'foo';
					}, {
						renderUnsafeAttributes: [ 'onclick' ]
					} );

					expect( converter.viewToDom( viewElement ).outerHTML ).to.equal(
						'<p onclick="foo" data-ck-unsafe-attribute-onkeydown="bar">foo</p>'
					);
				} );
			} );

			describe( 'DOM elements with included script ', () => {
				const svgBase64 = 'data:image/svg+xml;base64,' + global.window.btoa( `<svg xmlns="http://www.w3.org/2000/svg">
							<image href="x" onerror="alert(1)" />
							</svg>` );

				const svgEncoded = 'data:image/svg+xml;utf8,' + encodeURIComponent( `<svg xmlns="http://www.w3.org/2000/svg">
							<image href="x" onerror="alert(1)" />
							</svg>` );

				let editor, editorElement, alertStub;

				beforeEach( async () => {
					editorElement = document.createElement( 'div' );
					document.body.appendChild( editorElement );

					editor = await ClassicTestEditor.create( editorElement, {
						plugins: [ Paragraph ]
					} );

					editor.model.schema.register( 'fakeImg', {
						allowAttributes: [ 'src' ],
						allowWhere: '$text',
						isInline: true
					} );

					editor.conversion.for( 'downcast' ).elementToElement( {
						model: 'fakeImg',
						view: ( modelElement, { writer } ) => writer.createEmptyElement( 'img', {
							src: modelElement.getAttribute( 'src' ),
							srcset: modelElement.getAttribute( 'src' )
						} )
					} );

					editor.model.schema.register( 'fakePicture', {
						allowAttributes: [ 'srcset', 'media' ],
						allowWhere: '$text',
						isInline: true
					} );

					editor.conversion.for( 'downcast' ).elementToElement( {
						model: 'fakePicture',
						view: ( modelElement, { writer } ) => {
							const picture = writer.createContainerElement( 'picture' );
							const source = writer.createEmptyElement( 'source', {
								srcset: modelElement.getAttribute( 'srcset' ),
								media: modelElement.getAttribute( 'media' )
							} );
							const image = writer.createEmptyElement( 'img', {
								src: modelElement.getAttribute( 'srcset' )
							} );

							writer.insert( writer.createPositionAt( picture, 0 ), image );
							writer.insert( writer.createPositionAt( picture, 0 ), source );

							return picture;
						}
					} );

					alertStub = testUtils.sinon.stub( global.window, 'alert' );
				} );

				afterEach( () => {
					editorElement.remove();
					return editor.destroy();
				} );

				it( 'script included in SVG encoded as base64 should not be executed when set on src attribute of img element', () => {
					setModelData( editor.model, `<paragraph><fakeImg src='${ svgBase64 }'></fakeImg></paragraph>` );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<p>' +
							`<img src="${ svgBase64 }" srcset="${ svgBase64 }"></img>` +
						'</p>'
					);
					expect( alertStub.callCount ).to.equal( 0 );
				} );

				it( 'script included in encoded SVG should not be executed when set on src attribute of img element', () => {
					setModelData( editor.model, `<paragraph><fakeImg src='${ svgEncoded }'></fakeImg></paragraph>` );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<p>' +
							`<img src="${ svgEncoded }" srcset="${ svgEncoded }"></img>` +
						'</p>'
					);
					expect( alertStub.callCount ).to.equal( 0 );
				} );

				it( 'script included in SVG encoded as base64 should not be executed when set on srcset attribute of source element',
					() => {
						setModelData( editor.model,
							`<paragraph><fakePicture srcset='${ svgBase64 }' media="(min-width: 10px)"></fakePicture></paragraph>`
						);

						expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
							'<p>' +
								'<picture>' +
									`<source media="(min-width: 10px)" srcset="${ svgBase64 }"></source>` +
									`<img src="${ svgBase64 }"></img>` +
								'</picture>' +
							'</p>'
						);
						expect( alertStub.callCount ).to.equal( 0 );
					}
				);

				it( 'script included in encoded SVG should not be executed when set on srcset attribute of source element',
					() => {
						setModelData( editor.model,
							`<paragraph><fakePicture srcset='${ svgEncoded }' media="(min-width: 10px)"></fakePicture></paragraph>`
						);

						expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
							'<p>' +
								'<picture>' +
									`<source media="(min-width: 10px)" srcset="${ svgEncoded }"></source>` +
									`<img src="${ svgEncoded }"></img>` +
								'</picture>' +
							'</p>'
						);
						expect( alertStub.callCount ).to.equal( 0 );
					}
				);
			} );
		} );

		describe( 'it should convert spaces to &nbsp;', () => {
			it( 'at the beginning of each container element', () => {
				const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, ' foo' ) ),
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'bar' ) ),
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, ' xxx' ) )
				] );

				const domDiv = converter.viewToDom( viewDiv );

				expect( domDiv.innerHTML ).to.equal( '<p>&nbsp;foo</p><p>bar</p><p>&nbsp;xxx</p>' );
			} );

			it( 'at the end of each container element', () => {
				const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'foo ' ) ),
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'bar' ) ),
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'xxx ' ) )
				] );

				const domDiv = converter.viewToDom( viewDiv );

				expect( domDiv.innerHTML ).to.equal( '<p>foo&nbsp;</p><p>bar</p><p>xxx&nbsp;</p>' );
			} );

			it( 'when there are multiple spaces next to each other or between attribute elements', () => {
				const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
					new ViewText( viewDocument, 'x  x   x x ' ),
					new ViewAttributeElement( viewDocument, 'b', null, new ViewText( viewDocument, ' x ' ) ),
					new ViewAttributeElement( viewDocument, 'i', null,
						new ViewAttributeElement( viewDocument, 'b', null,
							new ViewAttributeElement( viewDocument, 'u', null, new ViewText( viewDocument, ' x' ) )
						)
					)
				] );

				const domDiv = converter.viewToDom( viewDiv );

				expect( domDiv.innerHTML ).to.equal( 'x &nbsp;x &nbsp; x x&nbsp;<b> x&nbsp;</b><i><b><u> x</u></b></i>' );
			} );

			it( 'all together', () => {
				const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
					new ViewContainerElement( viewDocument, 'p', null, [
						new ViewText( viewDocument, ' x  x   x x ' ),
						new ViewAttributeElement( viewDocument, 'b', null, new ViewText( viewDocument, ' x ' ) ),
						new ViewAttributeElement( viewDocument, 'i', null,
							new ViewAttributeElement( viewDocument, 'b', null,
								new ViewAttributeElement( viewDocument, 'u', null, new ViewText( viewDocument, ' x ' ) )
							)
						)
					] ),
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, '  x  ' ) )
				] );

				const domDiv = converter.viewToDom( viewDiv );

				expect( domDiv.innerHTML ).to.equal(
					'<p>&nbsp;x &nbsp;x &nbsp; x x&nbsp;<b> x&nbsp;</b><i><b><u> x&nbsp;</u></b></i></p><p>&nbsp; x &nbsp;</p>'
				);
			} );

			function testConvert( inputTexts, output ) {
				if ( typeof inputTexts == 'string' ) {
					inputTexts = [ inputTexts ];
				}

				it( 'spaces in a text node: ' + inputTexts.join( '|' ) + ' -> ' + output, () => {
					const viewElement = new ViewContainerElement( viewDocument, 'p' );

					for ( const text of inputTexts ) {
						viewElement._appendChild( new ViewText( viewDocument, text.replace( /_/g, '\u00A0' ) ) );
					}

					const domElement = converter.viewToDom( viewElement );
					const data = showNbsp( domElement.innerHTML );

					expect( data ).to.equal( output );
				} );
			}

			function showNbsp( html ) {
				return html.replace( /&nbsp;/g, '_' );
			}

			/* eslint-disable @stylistic/no-multi-spaces */

			// At the beginning.
			testConvert( ' x', '_x' );
			testConvert( '  x', '_ x' );
			testConvert( '   x', '_ _x' );
			testConvert( '    x', '_ _ x' );

			// At the end.
			testConvert( 'x ', 'x_' );
			testConvert( 'x  ', 'x _' );
			testConvert( 'x   ', 'x __' );
			testConvert( 'x    ', 'x _ _' );

			// In the middle.
			testConvert( 'x x', 'x x' );
			testConvert( 'x  x', 'x _x' );
			testConvert( 'x   x', 'x _ x' );
			testConvert( 'x    x', 'x _ _x' );

			// Complex.
			testConvert( ' x ', '_x_' );
			testConvert( '  x  x  ', '_ x _x _' );
			testConvert( '   x x  ', '_ _x x _' );
			testConvert( '   x x   ', '_ _x x __' );
			testConvert( '   x    x ', '_ _x _ _x_' );

			// Only spaces.
			testConvert( ' ', '_' );
			testConvert( '  ', '__' );
			testConvert( '   ', '_ _' );
			testConvert( '    ', '_ __' );
			testConvert( '     ', '_ _ _' );
			testConvert( '      ', '_ _ __' );

			// With hard &nbsp;
			// It should be treated like a normal sign.
			testConvert( '_x', '_x' );
			testConvert( ' _x', '__x' );
			testConvert( '  _x', '_ _x' );
			testConvert( ' __x', '___x' );
			testConvert( '___x', '___x' );
			testConvert( '_ _x', '_ _x' );
			testConvert( ' _ x', '__ x' );
			testConvert( '  _x', '_ _x' );

			testConvert( 'x_', 'x_' );
			testConvert( 'x_ ', 'x__' );
			testConvert( 'x_  ', 'x_ _' );
			testConvert( 'x__ ', 'x___' );
			testConvert( 'x___', 'x___' );
			testConvert( 'x_ _', 'x_ _' );
			testConvert( 'x _ ', 'x __' );
			testConvert( 'x  _', 'x __' );

			testConvert( 'x_x', 'x_x' );
			testConvert( 'x___x', 'x___x' );
			testConvert( 'x__ x', 'x__ x' );
			testConvert( 'x_  x', 'x_ _x' );
			testConvert( 'x  _x', 'x __x' );
			testConvert( 'x __x', 'x __x' );
			testConvert( 'x _ x', 'x _ x' );
			testConvert( 'x  _  x', 'x __ _x' );

			testConvert( [ 'x', 'y' ], 'xy' );
			testConvert( [ 'x ', 'y' ], 'x y' );
			testConvert( [ 'x  ', 'y' ], 'x _y' );
			testConvert( [ 'x   ', 'y' ], 'x __y' );
			testConvert( [ 'x    ', 'y' ], 'x _ _y' );

			testConvert( [ 'x', ' y' ], 'x y' );
			testConvert( [ 'x ', ' y' ], 'x_ y' );
			testConvert( [ 'x  ', ' y' ], 'x _ y' );
			testConvert( [ 'x   ', ' y' ], 'x __ y' );
			testConvert( [ 'x    ', ' y' ], 'x _ _ y' );

			testConvert( [ 'x', '_y' ], 'x_y' );
			testConvert( [ 'x ', '_y' ], 'x _y' );
			testConvert( [ 'x  ', '_y' ], 'x __y' );

			// Two text nodes.
			testConvert( [ 'x   ', '_y' ], 'x ___y' );
			testConvert( [ 'x    ', '_y' ], 'x _ __y' );

			testConvert( [ 'x', '  y' ], 'x _y' );
			testConvert( [ 'x ', '  y' ], 'x_ _y' );
			testConvert( [ 'x  ', '  y' ], 'x _ _y' );
			testConvert( [ 'x   ', '  y' ], 'x __ _y' );
			testConvert( [ 'x    ', '  y' ], 'x _ _ _y' );

			testConvert( [ 'x', '   y' ], 'x _ y' );
			testConvert( [ 'x ', '   y' ], 'x_ _ y' );
			testConvert( [ 'x  ', '   y' ], 'x _ _ y' );
			testConvert( [ 'x   ', '   y' ], 'x __ _ y' );
			testConvert( [ 'x    ', '   y' ], 'x _ _ _ y' );

			testConvert( [ 'x',	' '		], 'x_' );
			testConvert( [ 'x',	'  '	], 'x _' );
			testConvert( [ 'x',	'   '	], 'x __' );
			testConvert( [ 'x ',	' '		], 'x__' );
			testConvert( [ 'x ',	'  '	], 'x_ _' );
			testConvert( [ 'x ',	'   '	], 'x_ __' );
			testConvert( [ 'x  ',	' '		], 'x __' );
			testConvert( [ 'x  ',	'  '	], 'x _ _' );
			testConvert( [ 'x  ',	'   '	], 'x _ __' );
			testConvert( [ 'x   ',	' '		], 'x ___' );
			testConvert( [ 'x   ',	'  '	], 'x __ _' );
			testConvert( [ 'x   ',	'   '	], 'x __ __' );

			testConvert( [ ' ',	'x'		], '_x' );
			testConvert( [ '  ',	'x'		], '_ x' );
			testConvert( [ '   ',	'x'		], '_ _x' );
			testConvert( [ ' ',	' x'	], '_ x' );
			testConvert( [ '  ',	' x'	], '__ x' );
			testConvert( [ '   ',	' x'	], '_ _ x' );
			testConvert( [ ' ',	'  x'	], '_ _x' );
			testConvert( [ '  ',	'  x'	], '__ _x' );
			testConvert( [ '   ',	'  x'	], '_ _ _x' );
			testConvert( [ ' ',	'   x'	], '_ _ x' );
			testConvert( [ '  ',	'   x'	], '__ _ x' );
			testConvert( [ '   ',	'   x'	], '_ _ _ x' );

			// "Non-empty" + "empty" text nodes.
			testConvert( [ 'x',	' ',		'x'		],	'x x' );
			testConvert( [ 'x',	' ',		' x'	],	'x_ x' );
			testConvert( [ 'x',	'  ',		' x'	],	'x _ x' );
			testConvert( [ 'x',	'   ',		'  x'	],	'x __ _x' );
			testConvert( [ 'x ',	' ',		' x'	],	'x__ x' );
			testConvert( [ 'x ',	'  ',		' x'	],	'x_ _ x' );
			testConvert( [ 'x ',	'   ',		'  x'	],	'x_ __ _x' );
			testConvert( [ 'x  ',	' ',		' x'	],	'x __ x' );
			testConvert( [ 'x  ',	'  ',		' x'	],	'x _ _ x' );
			testConvert( [ 'x  ',	'   ',		'  x'	],	'x _ __ _x' );
			testConvert( [ 'x   ',	' ',		' x'	],	'x ___ x' );
			testConvert( [ 'x   ',	'  ',		' x'	],	'x __ _ x' );
			testConvert( [ 'x   ',	'   ',		'  x'	],	'x __ __ _x' );

			// "Empty" + "empty" text nodes.
			testConvert( [ ' ', ' ' ], '__' );
			testConvert( [ '  ', ' ' ], '___' );
			testConvert( [ '   ', ' ' ], '_ __' );
			testConvert( [ ' ', '  ' ], '_ _' );
			testConvert( [ ' ', '   ' ], '_ __' );
			testConvert( [ '  ', '  ' ], '__ _' );
			testConvert( [ '  ', '   ' ], '__ __' );
			testConvert( [ '   ', '  ' ], '_ _ _' );
			testConvert( [ '   ', '   ' ], '_ _ __' );

			/* eslint-enable @stylistic/no-multi-spaces */

			it( 'not in preformatted blocks', () => {
				const viewPre = new ViewContainerElement( viewDocument, 'pre', null, [
					new ViewText( viewDocument, '   foo   ' ),
					new ViewText( viewDocument, ' bar ' )
				] );
				const domPre = converter.viewToDom( viewPre );

				expect( domPre.innerHTML ).to.equal( '   foo    bar ' );
			} );

			it( 'not in a preformatted block followed by a text', () => {
				const viewPre = new ViewAttributeElement( viewDocument, 'pre', null, new ViewText( viewDocument, 'foo   ' ) );
				const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [ viewPre, new ViewText( viewDocument, ' bar' ) ] );
				const domDiv = converter.viewToDom( viewDiv );

				expect( domDiv.innerHTML ).to.equal( '<pre>foo   </pre> bar' );
			} );

			describe( 'around <br>s', () => {
				it( 'before <br> – a single space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo_<br>bar' );
				} );

				it( 'before <br> – two spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo  ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo _<br>bar' );
				} );

				it( 'before <br> – three spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo   ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo __<br>bar' );
				} );

				it( 'before <br> – only a space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, ' ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '_<br>bar' );
				} );

				it( 'before <br> – only two spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, '  ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '__<br>bar' );
				} );

				it( 'before <br> – only three spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, '   ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '_ _<br>bar' );
				} );

				it( 'after <br> – a single space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, ' bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>_bar' );
				} );

				it( 'after <br> – two spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '  bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>_ bar' );
				} );

				it( 'after <br> – three spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '   bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>_ _bar' );
				} );

				it( 'after <br> – only a space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, ' ' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>_' );
				} );

				it( 'after <br> – only two spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '  ' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>__' );
				} );

				it( 'after <br> – only three spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '   ' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>_ _' );
				} );

				it( 'between <br>s – a single space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, ' ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '<br>_<br>foo' );
				} );

				it( 'between <br>s – only two spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '  ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '<br>__<br>foo' );
				} );

				it( 'between <br>s – only three spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '   ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '<br>_ _<br>foo' );
				} );

				it( 'between <br>s – space and text', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, ' foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '<br>_foo<br>foo' );
				} );

				it( 'between <br>s – text and space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo' )
					] );
					const domDiv = converter.viewToDom( viewDiv );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '<br>foo_<br>foo' );
				} );
			} );
		} );
	} );

	describe( 'viewChildrenToDom()', () => {
		it( 'should convert children', () => {
			const viewP = parse( '<container:p>foo<attribute:b>bar</attribute:b></container:p>' );

			const domChildren = Array.from( converter.viewChildrenToDom( viewP ) );

			expect( domChildren.length ).to.equal( 2 );
			expect( domChildren[ 0 ].data ).to.equal( 'foo' );
			expect( domChildren[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domChildren[ 1 ].childNodes.length ).to.equal( 1 );
		} );

		it( 'should add filler', () => {
			const viewP = parse( '<container:p></container:p>' );

			const domChildren = Array.from( converter.viewChildrenToDom( viewP ) );

			expect( domChildren.length ).to.equal( 1 );
			expect( converter.isBlockFiller( domChildren[ 0 ] ) ).to.be.true;
		} );

		it( 'should add filler according to fillerPositionOffset', () => {
			const viewP = parse( '<container:p>foo</container:p>' );
			viewP.getFillerOffset = () => 0;

			const domChildren = Array.from( converter.viewChildrenToDom( viewP ) );

			expect( domChildren.length ).to.equal( 2 );
			expect( converter.isBlockFiller( domChildren[ 0 ] ) ).to.be.true;
			expect( domChildren[ 1 ].data ).to.equal( 'foo' );
		} );

		it( 'should add proper filler type - br', () => {
			converter.blockFillerMode = 'br';

			const viewP = parse( '<container:p></container:p>' );

			const domChildren = Array.from( converter.viewChildrenToDom( viewP ) );
			const filler = domChildren[ 0 ];

			expect( filler.isEqualNode( BR_FILLER( document ) ) ).to.be.true; // eslint-disable-line new-cap
		} );

		it( 'should add proper filler type - nbsp', () => {
			converter.blockFillerMode = 'nbsp';

			const viewP = parse( '<container:p></container:p>' );

			const domChildren = Array.from( converter.viewChildrenToDom( viewP ) );
			const filler = domChildren[ 0 ];

			expect( filler.isEqualNode( NBSP_FILLER( document ) ) ).to.be.true; // eslint-disable-line new-cap
		} );

		it( 'should add proper filler type - markedNbsp', () => {
			converter.blockFillerMode = 'markedNbsp';

			const viewP = parse( '<container:p></container:p>' );

			const domChildren = Array.from( converter.viewChildrenToDom( viewP ) );
			const filler = domChildren[ 0 ];

			expect( filler.isEqualNode( MARKED_NBSP_FILLER( document ) ) ).to.be.true; // eslint-disable-line new-cap
		} );

		it( 'should pass options', () => {
			const viewP = parse( '<container:p>foo<attribute:b>bar</attribute:b></container:p>' );

			const domChildren = Array.from( converter.viewChildrenToDom( viewP, { withChildren: false } ) );

			expect( domChildren.length ).to.equal( 2 );
			expect( domChildren[ 0 ].data ).to.equal( 'foo' );
			expect( domChildren[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domChildren[ 1 ].childNodes.length ).to.equal( 0 );
		} );

		describe( 'transparentRendering custom property', () => {
			it( 'should be transparent in the data pipeline', () => {
				converter.renderingMode = 'data';
				converter.blockFillerMode = 'nbsp';

				const warnStub = testUtils.sinon.stub( console, 'warn' );

				const viewList = parse(
					'<container:div>' +
						'<attribute:ul>' +
							'<attribute:li>' +
								'<container:p>foo<attribute:b>bar</attribute:b></container:p>' +
							'</attribute:li>' +
							'<attribute:li>' +
								'<container:p>abc</container:p>' +
								'<container:p>123</container:p>' +
							'</attribute:li>' +
						'</attribute:ul>' +
					'</container:div>'
				);

				const bogusParagraph = viewList.getChild( 0 ).getChild( 0 ).getChild( 0 );

				bogusParagraph._setCustomProperty( 'dataPipeline:transparentRendering', true );

				const domDivChildren = Array.from( converter.viewChildrenToDom( viewList ) );

				expect( domDivChildren.length ).to.equal( 1 );
				expect( domDivChildren[ 0 ].tagName.toLowerCase() ).to.equal( 'ul' );

				const domUlChildren = Array.from( domDivChildren[ 0 ].childNodes );

				expect( domUlChildren.length ).to.equal( 2 );
				expect( domUlChildren[ 0 ].tagName.toLowerCase() ).to.equal( 'li' );
				expect( domUlChildren[ 1 ].tagName.toLowerCase() ).to.equal( 'li' );

				const domUl1Children = Array.from( domUlChildren[ 0 ].childNodes );
				const domUl2Children = Array.from( domUlChildren[ 1 ].childNodes );

				expect( domUl1Children.length ).to.equal( 2 );
				expect( domUl1Children[ 0 ].data ).to.equal( 'foo' );
				expect( domUl1Children[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
				expect( domUl1Children[ 1 ].firstChild.data ).to.equal( 'bar' );

				expect( domUl2Children.length ).to.equal( 2 );
				expect( domUl2Children[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );
				expect( domUl2Children[ 1 ].tagName.toLowerCase() ).to.equal( 'p' );
				expect( domUl2Children[ 0 ].firstChild.data ).to.equal( 'abc' );
				expect( domUl2Children[ 1 ].firstChild.data ).to.equal( '123' );

				sinon.assert.notCalled( warnStub );
			} );

			it( 'should yield the `RawElement` children properly', () => {
				const downcastWriter = new DowncastWriter( viewDocument );
				const dataConverter = new DomConverter( viewDocument, {
					renderingMode: 'data'
				} );
				const parentElement = downcastWriter.createContainerElement( 'p' );
				const transparentRawElement = downcastWriter.createRawElement( 'span', {}, function( domElement ) {
					domElement.innerHTML = 'foo <span style="color:red;">bar</span> <strong>is</strong> good';
				} );

				downcastWriter.insert( downcastWriter.createPositionAt( parentElement, 'end' ), transparentRawElement );
				downcastWriter.setCustomProperty( 'dataPipeline:transparentRendering', true, transparentRawElement );

				expect( dataConverter.viewToDom( parentElement ).outerHTML ).to.equal(
					'<p>foo <span style="color:red;">bar</span> <strong>is</strong> good</p>'
				);
			} );

			it( 'should not be transparent in the editing pipeline', () => {
				converter.renderingMode = 'editing';
				converter.blockFillerMode = 'br';

				const warnStub = testUtils.sinon.stub( console, 'warn' );

				const viewList = parse(
					'<container:div>' +
						'<attribute:ul>' +
							'<attribute:li>' +
								'<container:p>foo<attribute:b>bar</attribute:b></container:p>' +
							'</attribute:li>' +
							'<attribute:li>' +
								'<container:p>abc</container:p>' +
								'<container:p>123</container:p>' +
							'</attribute:li>' +
						'</attribute:ul>' +
					'</container:div>'
				);

				const bogusParagraph = viewList.getChild( 0 ).getChild( 0 ).getChild( 0 );

				bogusParagraph._setCustomProperty( 'dataPipeline:transparentRendering', true );

				const domDivChildren = Array.from( converter.viewChildrenToDom( viewList ) );

				expect( domDivChildren.length ).to.equal( 1 );
				expect( domDivChildren[ 0 ].tagName.toLowerCase() ).to.equal( 'ul' );

				const domUlChildren = Array.from( domDivChildren[ 0 ].childNodes );

				expect( domUlChildren.length ).to.equal( 2 );
				expect( domUlChildren[ 0 ].tagName.toLowerCase() ).to.equal( 'li' );
				expect( domUlChildren[ 1 ].tagName.toLowerCase() ).to.equal( 'li' );

				const domUl1Children = Array.from( domUlChildren[ 0 ].childNodes );
				const domUl2Children = Array.from( domUlChildren[ 1 ].childNodes );

				expect( domUl1Children.length ).to.equal( 1 );
				expect( domUl1Children[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );
				expect( domUl1Children[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );
				expect( domUl1Children[ 0 ].childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
				expect( domUl1Children[ 0 ].childNodes[ 1 ].firstChild.data ).to.equal( 'bar' );

				expect( domUl2Children.length ).to.equal( 2 );
				expect( domUl2Children[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );
				expect( domUl2Children[ 1 ].tagName.toLowerCase() ).to.equal( 'p' );
				expect( domUl2Children[ 0 ].firstChild.data ).to.equal( 'abc' );
				expect( domUl2Children[ 1 ].firstChild.data ).to.equal( '123' );

				sinon.assert.calledOnce( warnStub );
				sinon.assert.calledWithExactly( warnStub,
					sinon.match( /^domconverter-transparent-rendering-unsupported-in-editing-pipeline/ ),
					{
						viewElement: bogusParagraph
					},
					sinon.match.string // Link to the documentation
				);
			} );

			it( 'should not be transparent in the data pipeline if has any attribute', () => {
				converter.renderingMode = 'data';
				converter.blockFillerMode = 'nbsp';

				const warnStub = testUtils.sinon.stub( console, 'warn' );

				const viewList = parse(
					'<container:div>' +
						'<attribute:ul>' +
							'<attribute:li>' +
								'<container:p class="style">foo</container:p>' +
							'</attribute:li>' +
							'<attribute:li>' +
								'<container:p data-foo="123">bar</container:p>' +
							'</attribute:li>' +
							'<attribute:li>' +
								'<container:p>baz</container:p>' +
							'</attribute:li>' +
						'</attribute:ul>' +
					'</container:div>'
				);

				const bogusParagraph1 = viewList.getChild( 0 ).getChild( 0 ).getChild( 0 );
				const bogusParagraph2 = viewList.getChild( 0 ).getChild( 1 ).getChild( 0 );
				const bogusParagraph3 = viewList.getChild( 0 ).getChild( 2 ).getChild( 0 );

				bogusParagraph1._setCustomProperty( 'dataPipeline:transparentRendering', true );
				bogusParagraph2._setCustomProperty( 'dataPipeline:transparentRendering', true );
				bogusParagraph3._setCustomProperty( 'dataPipeline:transparentRendering', true );

				const domDivChildren = Array.from( converter.viewChildrenToDom( viewList ) );

				expect( domDivChildren.length ).to.equal( 1 );
				expect( domDivChildren[ 0 ].tagName.toLowerCase() ).to.equal( 'ul' );

				const domUlChildren = Array.from( domDivChildren[ 0 ].childNodes );

				expect( domUlChildren.length ).to.equal( 3 );
				expect( domUlChildren[ 0 ].tagName.toLowerCase() ).to.equal( 'li' );
				expect( domUlChildren[ 1 ].tagName.toLowerCase() ).to.equal( 'li' );
				expect( domUlChildren[ 2 ].tagName.toLowerCase() ).to.equal( 'li' );

				const domUl1Children = Array.from( domUlChildren[ 0 ].childNodes );
				const domUl2Children = Array.from( domUlChildren[ 1 ].childNodes );
				const domUl3Children = Array.from( domUlChildren[ 2 ].childNodes );

				expect( domUl1Children.length ).to.equal( 1 );
				expect( domUl1Children[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );
				expect( domUl1Children[ 0 ].getAttribute( 'class' ) ).to.equal( 'style' );
				expect( domUl1Children[ 0 ].firstChild.data ).to.equal( 'foo' );

				expect( domUl2Children.length ).to.equal( 1 );
				expect( domUl2Children[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );
				expect( domUl2Children[ 0 ].getAttribute( 'data-foo' ) ).to.equal( '123' );
				expect( domUl2Children[ 0 ].firstChild.data ).to.equal( 'bar' );

				expect( domUl3Children.length ).to.equal( 1 );
				expect( domUl3Children[ 0 ].data ).to.equal( 'baz' );

				sinon.assert.notCalled( warnStub );
			} );
		} );
	} );

	describe( 'viewPositionToDom()', () => {
		it( 'should convert the position in the text', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domFoo );
			const { view: viewP, selection } = parse( '<container:p>fo{}o</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 2 );
			expect( domPosition.parent ).to.equal( domFoo );
		} );

		it( 'should support unicode', () => {
			const domText = document.createTextNode( 'நிலைக்கு' );
			const domP = createElement( document, 'p', null, domText );
			const { view: viewP, selection } = parse( '<container:p>நிலை{}க்கு</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 4 );
			expect( domPosition.parent ).to.equal( domText );
		} );

		it( 'should convert the position in the empty element', () => {
			const domP = createElement( document, 'p' );
			const { view: viewP, selection } = parse( '<container:p>[]</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 0 );
			expect( domPosition.parent ).to.equal( domP );
		} );

		it( 'should convert the position in the non-empty element', () => {
			const domB = createElement( document, 'b', null, 'foo' );
			const domP = createElement( document, 'p', null, domB );
			const { view: viewP, selection } = parse( '<container:p><attribute:b>foo</attribute:b>[]</container:p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 0 ) );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 1 );
			expect( domPosition.parent ).to.equal( domP );
		} );

		it( 'should convert the position after text', () => {
			const domP = createElement( document, 'p', null, 'foo' );
			const { view: viewP, selection } = parse( '<container:p>foo[]</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 1 );
			expect( domPosition.parent ).to.equal( domP );
		} );

		it( 'should convert the position before text', () => {
			const domP = createElement( document, 'p', null, 'foo' );
			const { view: viewP, selection } = parse( '<container:p>[]foo</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 0 );
			expect( domPosition.parent ).to.equal( domP );
		} );

		it( 'should update offset if DOM text node starts with inline filler', () => {
			const domFoo = document.createTextNode( INLINE_FILLER + 'foo' );
			const domP = createElement( document, 'p', null, domFoo );
			const { view: viewP, selection } = parse( '<container:p>fo{}o</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( INLINE_FILLER_LENGTH + 2 );
			expect( domPosition.parent ).to.equal( domFoo );
		} );

		it( 'should move the position to the text node if the position is where inline filler is', () => {
			const domFiller = document.createTextNode( INLINE_FILLER );
			const domP = createElement( document, 'p', null, domFiller );
			const { view: viewP, selection } = parse( '<container:p>[]</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domPosition.parent ).to.equal( domFiller );
		} );

		it( 'should return null if view position is after a view element that has not been rendered to DOM', () => {
			const domP = createElement( document, 'p', null );
			const { view: viewP, selection } = parse( '<container:p><attribute:b>foo</attribute:b>[]</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition ).to.equal( null );
		} );

		it( 'should return null if view position is in a view text node that has not been rendered to DOM', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewPosition = new ViewPosition( viewText, 1 );
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition ).to.equal( null );
		} );

		it( 'should return null if view position is in a view element that has not been rendered to DOM', () => {
			const viewElement = new ViewContainerElement( viewDocument, 'div' );
			const viewPosition = new ViewPosition( viewElement, 0 );
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition ).to.equal( null );
		} );
	} );

	describe( 'viewRangeToDom()', () => {
		it( 'should convert view range to DOM range', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domFoo );
			const { view: viewP, selection } = parse( '<container:p>fo{o]</container:p>' );

			converter.bindElements( domP, viewP );

			const viewRange = selection.getFirstRange();
			const domRange = converter.viewRangeToDom( viewRange );

			expect( domRange ).to.be.instanceof( Range );
			expect( domRange.startContainer ).to.equal( domFoo );
			expect( domRange.startOffset ).to.equal( 2 );
			expect( domRange.endContainer ).to.equal( domP );
			expect( domRange.endOffset ).to.equal( 1 );
		} );
	} );
} );
