/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import Title from '../src/title';
import Heading from '../src/heading';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

import { setData, getData, stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'Title', () => {
	let element, editor, model;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor.create( element, {
			plugins: [ Title, Heading, BlockQuote, Clipboard, Image, ImageUpload, Enter, Undo ]
		} ).then( _editor => {
			editor = _editor;
			model = editor.model;
		} );
	} );

	afterEach( () => {
		return editor.destroy().then( () => element.remove() );
	} );

	it( 'should requires Paragraph plugin', () => {
		expect( Title.requires ).to.have.members( [ Paragraph ] );
	} );

	it( 'should have plugin name property', () => {
		expect( Title.pluginName ).to.equal( 'Title' );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.isRegistered( 'title' ) ).to.equal( true );
		expect( model.schema.isBlock( 'title' ) ).to.equal( true );
		expect( model.schema.isRegistered( 'title-content' ) ).to.equal( true );
		expect( model.schema.isBlock( 'title-content' ) ).to.equal( true );

		expect( model.schema.checkChild( 'title', '$text' ) ).to.equal( false );
		expect( model.schema.checkChild( 'title', '$block' ) ).to.equal( false );
		expect( model.schema.checkChild( 'title', 'title-content' ) ).to.equal( true );
		expect( model.schema.checkChild( '$root', 'title' ) ).to.equal( true );
		expect( model.schema.checkChild( '$root', 'title-content' ) ).to.equal( false );
		expect( model.schema.checkChild( '$block', 'title-content' ) ).to.equal( false );
		expect( model.schema.checkChild( 'title-content', '$text' ) ).to.equal( true );
		expect( model.schema.checkChild( 'title-content', '$block' ) ).to.equal( false );

		expect( model.schema.checkAttribute( [ 'title-content' ], 'alignment' ) ).to.equal( true );

		model.schema.extend( '$text', { allowAttributes: [ 'bold' ] } );
		expect( model.schema.checkAttribute( [ 'title-content', '$text' ], 'bold' ) ).to.equal( false );
	} );

	it( 'should convert title to h1', () => {
		setData( model,
			'<title><title-content>Foo</title-content></title>' +
			'<paragraph>Bar</paragraph>'
		);

		expect( editor.getData() ).to.equal( '<h1>Foo</h1><p>Bar</p>' );
	} );

	it( 'should convert h1 to the title if it is the first root child', () => {
		editor.setData( '<h1>Foo</h1><p>Bar</p>' );

		expect( getData( model ) ).to.equal(
			'<title><title-content>[]Foo</title-content></title>' +
			'<paragraph>Bar</paragraph>'
		);
	} );

	it( 'should avoid calling post-fixers to parse view to correct model (h1)', () => {
		const modelFrag = editor.data.parse( '<h1>Foo</h1><p>Bar</p>' );

		expect( stringify( modelFrag ) ).to.equal(
			'<title><title-content>Foo</title-content></title>' +
			'<paragraph>Bar</paragraph>'
		);
	} );

	it( 'should avoid calling post-fixers to parse view to correct model (h2)', () => {
		const modelFrag = editor.data.parse( '<h2>Foo</h2><p>Bar</p>' );

		expect( stringify( modelFrag ) ).to.equal(
			'<title><title-content>Foo</title-content></title>' +
			'<paragraph>Bar</paragraph>'
		);
	} );

	it( 'should avoid calling post-fixers to parse view to correct model (h3)', () => {
		const modelFrag = editor.data.parse( '<h3>Foo</h3><p>Bar</p>' );

		expect( stringify( modelFrag ) ).to.equal(
			'<title><title-content>Foo</title-content></title>' +
			'<paragraph>Bar</paragraph>'
		);
	} );

	it( 'should allow to override custom v->m title converter', () => {
		const spy = sinon.spy();

		editor.data.upcastDispatcher.on( 'element:h1', ( evt, data, api ) => {
			api.consumable.consume( data.viewItem, { name: true } );
			spy();
		}, { priority: 'highest' } );

		editor.setData( '<h1>Foo</h1><p>Bar</p>' );

		sinon.assert.called( spy );
	} );

	describe( 'model post-fixing', () => {
		it( 'should set title and content elements', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should create a content element when only title has been set', () => {
			setData( model, '<title><title-content>Foo</title-content></title>' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph></paragraph>'
			);
		} );

		it( 'should create a title and content elements when are missing', () => {
			setData( model, '' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]</title-content></title>' +
				'<paragraph></paragraph>'
			);
		} );

		it( 'should change heading element to title when is set as a first root child', () => {
			setData( model,
				'<heading1>Foo</heading1>' +
				'<heading1>Bar</heading1>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<heading1>Bar</heading1>'
			);
		} );

		it( 'should change paragraph element to title when is set as a first root child', () => {
			setData( model,
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Bar</paragraph>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should change paragraph element to title and then change additional title elements to paragraphs', () => {
			setData( model,
				'<paragraph>Foo</paragraph>' +
				'<title><title-content>Bar</title-content></title>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should change title element to a paragraph when is not a first root child #1', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<title><title-content>Bar</title-content></title>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should change title element to a paragraph when is not a first root child #2', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>' +
				'<title><title-content>Biz</title-content></title>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>' +
				'<paragraph>Biz</paragraph>'
			);
		} );

		it( 'should move title at the beginning of the root when first root child is not allowed to be a title #1', () => {
			setData( model,
				'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
				'<title><title-content>Bar</title-content></title>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Bar</title-content></title>' +
				'<blockQuote><paragraph>Foo</paragraph></blockQuote>'
			);
		} );

		it( 'should move title at the beginning of the root when first root child is not allowed to be a title #2', () => {
			setData( model,
				'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
				'<blockQuote><paragraph>Bar</paragraph></blockQuote>' +
				'<title><title-content>Biz</title-content></title>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Biz</title-content></title>' +
				'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
				'<blockQuote><paragraph>Bar</paragraph></blockQuote>'
			);
		} );

		it( 'should move title at the beginning of the root when first root child is not allowed to be a title #3', () => {
			setData( model,
				'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
				'<paragraph>Bar</paragraph>' +
				'<title><title-content>Biz</title-content></title>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Biz</title-content></title>' +
				'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should create a missing title element before an element that cannot to be a title element', () => {
			setData( model, '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]</title-content></title>' +
				'<blockQuote><paragraph>Foo</paragraph></blockQuote>'
			);
		} );

		it( 'should clear element from attributes when changing to title element', () => {
			model.schema.extend( '$text', { allowAttributes: 'foo' } );
			model.schema.extend( 'paragraph', { allowAttributes: [ 'foo', 'alignment' ] } );

			setData( model,
				'<paragraph alignment="justify" foo="true">F<$text foo="true">o</$text>o</paragraph>' +
				'<paragraph foo="true">B<$text foo="true">a</$text>r</paragraph>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content alignment="justify">[]Foo</title-content></title>' +
				'<paragraph foo="true">B<$text foo="true">a</$text>r</paragraph>'
			);
		} );
	} );

	describe( 'removes extra paragraph', () => {
		it( 'should remove the extra paragraph when pasting to the editor with body placeholder', () => {
			setData( model, '<title><title-content>[]</title-content></title>' );

			const dataTransferMock = {
				getData: type => {
					if ( type === 'text/html' ) {
						return '<h1>Title</h1><p>Body</p>';
					}
				},
				types: [],
				files: []
			};

			editor.editing.view.document.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( getData( model ) ).to.equal(
				'<title><title-content>Title</title-content></title>' +
				'<paragraph>Body[]</paragraph>'
			);
		} );

		it( 'should not remove the extra paragraph when pasting to the editor with directly created body element', () => {
			setData( model,
				'<title><title-content>[]</title-content></title>' +
				'<paragraph></paragraph>'
			);

			const dataTransferMock = {
				getData: type => {
					if ( type === 'text/html' ) {
						return '<h1>Title</h1><p>Body</p>';
					}
				},
				types: [],
				files: []
			};

			editor.editing.view.document.fire( 'paste', {
				dataTransfer: dataTransferMock,
				stopPropagation() {},
				preventDefault() {}
			} );

			expect( getData( model ) ).to.equal(
				'<title><title-content>Title</title-content></title>' +
				'<paragraph>Body[]</paragraph>' +
				'<paragraph></paragraph>'
			);
		} );

		it( 'should remove the extra paragraph when pressing enter in the title', () => {
			setData( model, '<title><title-content>fo[]o</title-content></title>' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>fo</title-content></title>' +
				'<paragraph>[]o</paragraph>'
			);
		} );

		it( 'should not remove the extra paragraph when pressing enter in the title when body is created directly', () => {
			setData( model,
				'<title><title-content>fo[]o</title-content></title>' +
				'<paragraph></paragraph>'
			);

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>fo</title-content></title>' +
				'<paragraph>[]o</paragraph>' +
				'<paragraph></paragraph>'
			);
		} );
	} );

	describe( 'getTitle()', () => {
		it( 'should return content of a title element', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			expect( editor.plugins.get( 'Title' ).getTitle() ).to.equal( 'Foo' );
		} );

		it( 'should return content of an empty title element', () => {
			setData( model,
				'<title><title-content></title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			expect( editor.plugins.get( 'Title' ).getTitle() ).to.equal( '' );
		} );

		it( 'should return marker - starts and ends inside a title', () => {
			editor.conversion.for( 'downcast' ).markerToElement( { model: 'comment', view: 'comment' } );

			setData( model, '<title><title-content>Foo Bar</title-content></title>' );

			const title = model.document.getRoot().getChild( 0 ).getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'comment', {
					range: model.createRange( model.createPositionAt( title, 1 ), model.createPositionAt( title, 5 ) ),
					usingOperation: true
				} );
			} );

			expect( editor.plugins.get( 'Title' ).getTitle() ).to.equal(
				'F<comment></comment>oo B<comment></comment>ar'
			);
		} );

		it( 'should return marker - starts inside a title ends inside a body', () => {
			editor.conversion.for( 'downcast' ).markerToElement( { model: 'comment', view: 'comment' } );

			setData( model,
				'<title><title-content>Foo Bar</title-content></title>' +
				'<paragraph>Biz</paragraph>'
			);

			const title = model.document.getRoot().getChild( 0 ).getChild( 0 );
			const body = model.document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.addMarker( 'comment', {
					range: model.createRange( model.createPositionAt( title, 1 ), model.createPositionAt( body, 3 ) ),
					usingOperation: true
				} );
			} );

			expect( editor.plugins.get( 'Title' ).getTitle() ).to.equal(
				'F<comment></comment>oo Bar<comment></comment>'
			);
		} );
	} );

	describe( 'getBody()', () => {
		it( 'should return all data except the title element', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>' +
				'<paragraph>Biz</paragraph>'
			);

			expect( editor.plugins.get( 'Title' ).getBody() ).to.equal( '<p>Bar</p><p>Biz</p>' );
		} );

		it( 'should return empty paragraph when body is empty', () => {
			setData( model, '<title><title-content>Foo</title-content></title>' );

			expect( editor.plugins.get( 'Title' ).getBody() ).to.equal( '<p>&nbsp;</p>' );
		} );

		it( 'should return marker - starts and ends inside a body', () => {
			editor.conversion.for( 'downcast' ).markerToElement( { model: 'comment', view: 'comment' } );

			setData( model,
				'<title><title-content></title-content></title>' +
				'<paragraph>Foo Bar</paragraph>'
			);

			const body = model.document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.addMarker( 'comment', {
					range: model.createRange( model.createPositionAt( body, 1 ), model.createPositionAt( body, 5 ) ),
					usingOperation: true
				} );
			} );

			expect( editor.plugins.get( 'Title' ).getBody() ).to.equal(
				'<p>F<comment></comment>oo B<comment></comment>ar</p>'
			);
		} );

		it( 'should return marker - starts inside a title ends inside a body', () => {
			editor.conversion.for( 'downcast' ).markerToElement( { model: 'comment', view: 'comment' } );

			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			const title = model.document.getRoot().getChild( 0 ).getChild( 0 );
			const body = model.document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.addMarker( 'comment', {
					range: model.createRange( model.createPositionAt( title, 1 ), model.createPositionAt( body, 2 ) ),
					usingOperation: true
				} );
			} );

			expect( editor.plugins.get( 'Title' ).getBody() ).to.equal(
				'<comment></comment><p>Ba<comment></comment>r</p>'
			);
		} );

		it( 'should return marker - starts at the beginning of the body ends inside the body', () => {
			editor.conversion.for( 'downcast' ).markerToElement( { model: 'comment', view: 'comment' } );

			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			const body = model.document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.addMarker( 'comment', {
					range: model.createRange( model.createPositionAt( body, 0 ), model.createPositionAt( body, 2 ) ),
					usingOperation: true
				} );
			} );

			expect( editor.plugins.get( 'Title' ).getBody() ).to.equal(
				'<p><comment></comment>Ba<comment></comment>r</p>'
			);
		} );

		it( 'should do nothing when marker is fully out of the body range', () => {
			editor.conversion.for( 'downcast' ).markerToElement( { model: 'comment', view: 'comment' } );

			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			const title = model.document.getRoot().getChild( 0 ).getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'comment', {
					range: model.createRange( model.createPositionAt( title, 1 ), model.createPositionAt( title, 2 ) ),
					usingOperation: true
				} );
			} );

			expect( editor.plugins.get( 'Title' ).getBody() ).to.equal( '<p>Bar</p>' );
		} );
	} );

	describe( 'placeholders', () => {
		let viewRoot;

		beforeEach( () => {
			viewRoot = editor.editing.view.document.getRoot();
		} );

		it( 'should attach placeholder placeholder to title and body', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			const title = viewRoot.getChild( 0 );
			const body = viewRoot.getChild( 1 );

			expect( title.getAttribute( 'data-placeholder' ) ).to.equal( 'Type your title' );
			expect( body.getAttribute( 'data-placeholder' ) ).to.equal( 'Type or paste your content here.' );

			expect( title.hasClass( 'ck-placeholder' ) ).to.equal( false );
			expect( body.hasClass( 'ck-placeholder' ) ).to.equal( false );
		} );

		it( 'should show placeholder in empty title and body', () => {
			setData( model,
				'<title><title-content></title-content></title>' +
				'<paragraph></paragraph>'
			);

			const title = viewRoot.getChild( 0 );
			const body = viewRoot.getChild( 1 );

			expect( title.getAttribute( 'data-placeholder' ) ).to.equal( 'Type your title' );
			expect( body.getAttribute( 'data-placeholder' ) ).to.equal( 'Type or paste your content here.' );

			expect( title.hasClass( 'ck-placeholder' ) ).to.equal( true );
			expect( body.hasClass( 'ck-placeholder' ) ).to.equal( true );
		} );

		it( 'should hide placeholder from body with more than one child elements', () => {
			setData( editor.model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph></paragraph>' +
				'<paragraph></paragraph>'
			);

			const body = viewRoot.getChild( 1 );

			expect( body.getAttribute( 'data-placeholder' ) ).to.equal( 'Type or paste your content here.' );
			expect( body.hasClass( 'ck-placeholder' ) ).to.equal( false );
		} );

		it( 'should hide placeholder from body with element other than paragraph', () => {
			setData( editor.model,
				'<title><title-content>Foo</title-content></title>' +
				'<heading1></heading1>'
			);

			const body = viewRoot.getChild( 1 );

			expect( body.hasAttribute( 'data-placeholder' ) ).to.equal( true );
			expect( body.hasClass( 'ck-placeholder' ) ).to.equal( false );
		} );

		it( 'should hide placeholder when title element become not empty', () => {
			setData( model,
				'<title><title-content></title-content></title>' +
				'<paragraph>[]</paragraph>'
			);

			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.equal( true );

			model.change( writer => {
				writer.appendText( 'Bar', null, model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.equal( false );
		} );

		it( 'should hide placeholder when body element become not empty', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph></paragraph>'
			);

			expect( viewRoot.getChild( 1 ).hasClass( 'ck-placeholder' ) ).to.equal( true );

			model.change( writer => {
				writer.appendText( 'Bar', null, model.document.getRoot().getChild( 1 ) );
			} );

			expect( viewRoot.getChild( 1 ).hasClass( 'ck-placeholder' ) ).to.equal( false );
		} );

		it( 'should properly map the body placeholder in DOM when undoing', () => {
			const viewRoot = editor.editing.view.document.getRoot();
			const domConverter = editor.editing.view.domConverter;
			let bodyDomElement;

			setData( editor.model,
				'<title><title-content>[Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>' +
				'<paragraph>Baz]</paragraph>'
			);
			editor.model.deleteContent( editor.model.document.selection );

			bodyDomElement = domConverter.mapViewToDom( viewRoot.getChild( 1 ) );

			expect( bodyDomElement.dataset.placeholder ).to.equal( 'Type or paste your content here.' );
			expect( bodyDomElement.classList.contains( 'ck-placeholder' ) ).to.equal( true );

			editor.execute( 'undo' );

			bodyDomElement = domConverter.mapViewToDom( viewRoot.getChild( 1 ) );

			expect( bodyDomElement.dataset.placeholder ).to.equal( 'Type or paste your content here.' );
			expect( bodyDomElement.classList.contains( 'ck-placeholder' ) ).to.equal( false );
		} );

		describe( 'custom placeholder defined using configuration', () => {
			let element, editor, model;

			beforeEach( () => {
				element = document.createElement( 'div' );
				document.body.appendChild( element );

				return ClassicTestEditor.create( element, {
					plugins: [ Title, Heading, BlockQuote, Clipboard, Image, ImageUpload, Enter, Undo ],
					title: {
						placeholder: 'foo'
					},
					placeholder: 'bar'
				} ).then( _editor => {
					editor = _editor;
					model = editor.model;
				} );
			} );

			afterEach( () => {
				return editor.destroy().then( () => element.remove() );
			} );

			it( 'should show custom placeholder in title and body', () => {
				const viewRoot = editor.editing.view.document.getRoot();

				setData( model,
					'<title><title-content></title-content></title>' +
					'<paragraph></paragraph>'
				);

				const title = viewRoot.getChild( 0 );
				const body = viewRoot.getChild( 1 );

				expect( title.getAttribute( 'data-placeholder' ) ).to.equal( 'foo' );
				expect( body.getAttribute( 'data-placeholder' ) ).to.equal( 'bar' );

				expect( title.hasClass( 'ck-placeholder' ) ).to.equal( true );
				expect( body.hasClass( 'ck-placeholder' ) ).to.equal( true );
			} );
		} );

		describe( 'custom placeholder defined using textarea attribte', () => {
			let element, editor, model;

			beforeEach( () => {
				element = document.createElement( 'textarea' );
				element.setAttribute( 'placeholder', 'bom' );
				document.body.appendChild( element );

				return ClassicTestEditor.create( element, {
					plugins: [ Title, Heading, BlockQuote, Clipboard, Image, ImageUpload, Enter, Undo ],
					title: {
						placeholder: 'foo'
					}
				} ).then( _editor => {
					editor = _editor;
					model = editor.model;
				} );
			} );

			afterEach( () => {
				return editor.destroy().then( () => element.remove() );
			} );

			it( 'should show custom placeholder in title and body', () => {
				const viewRoot = editor.editing.view.document.getRoot();

				setData( model,
					'<title><title-content></title-content></title>' +
					'<paragraph></paragraph>'
				);

				const title = viewRoot.getChild( 0 );
				const body = viewRoot.getChild( 1 );

				expect( title.getAttribute( 'data-placeholder' ) ).to.equal( 'foo' );
				expect( body.getAttribute( 'data-placeholder' ) ).to.equal( 'bom' );

				expect( title.hasClass( 'ck-placeholder' ) ).to.equal( true );
				expect( body.hasClass( 'ck-placeholder' ) ).to.equal( true );
			} );
		} );
	} );

	describe( 'Tab press handling', () => {
		it( 'should handle tab key when the selection is at the beginning of the title', () => {
			setData( model,
				'<title><title-content>[]foo</title-content></title>' +
				'<paragraph>bar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab );

			editor.keystrokes.press( eventData );

			sinon.assert.calledOnce( eventData.preventDefault );
			sinon.assert.calledOnce( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[]bar</paragraph>'
			);
		} );

		it( 'should handle tab key when the selection is at the end of the title', () => {
			setData( model,
				'<title><title-content>foo[]</title-content></title>' +
				'<paragraph>bar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab );

			editor.keystrokes.press( eventData );

			sinon.assert.calledOnce( eventData.preventDefault );
			sinon.assert.calledOnce( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[]bar</paragraph>'
			);
		} );

		it( 'should not handle tab key when the selection is in the title and body', () => {
			setData( model,
				'<title><title-content>fo[o</title-content></title>' +
				'<paragraph>b]ar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab );

			editor.keystrokes.press( eventData );

			sinon.assert.notCalled( eventData.preventDefault );
			sinon.assert.notCalled( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>fo[o</title-content></title>' +
				'<paragraph>b]ar</paragraph>'
			);
		} );

		it( 'should not handle tab key when the selection is in the body', () => {
			setData( model,
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[]bar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab );

			editor.keystrokes.press( eventData );

			sinon.assert.notCalled( eventData.preventDefault );
			sinon.assert.notCalled( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[]bar</paragraph>'
			);
		} );
	} );

	describe( 'Shift + Tab press handling', () => {
		it( 'should handle shift + tab keys when the selection is at the beginning of the body', () => {
			setData( model,
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[]bar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab, { shiftKey: true } );

			editor.keystrokes.press( eventData );

			sinon.assert.calledOnce( eventData.preventDefault );
			sinon.assert.calledOnce( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>[]foo</title-content></title>' +
				'<paragraph>bar</paragraph>'
			);
		} );

		it( 'should not handle shift + tab keys when the selection is not at the beginning of the body', () => {
			setData( model,
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>b[]ar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab, { shiftKey: true } );

			editor.keystrokes.press( eventData );

			sinon.assert.notCalled( eventData.preventDefault );
			sinon.assert.notCalled( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>b[]ar</paragraph>'
			);
		} );

		it( 'should not handle shift + tab keys when the selection is not collapsed', () => {
			setData( model,
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[b]ar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab, { shiftKey: true } );

			editor.keystrokes.press( eventData );

			sinon.assert.notCalled( eventData.preventDefault );
			sinon.assert.notCalled( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[b]ar</paragraph>'
			);
		} );

		it( 'should not handle shift + tab keys when the selection is in the title', () => {
			setData( model,
				'<title><title-content>[]foo</title-content></title>' +
				'<paragraph>bar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab, { shiftKey: true } );

			editor.keystrokes.press( eventData );

			sinon.assert.notCalled( eventData.preventDefault );
			sinon.assert.notCalled( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>[]foo</title-content></title>' +
				'<paragraph>bar</paragraph>'
			);
		} );
	} );
} );

function getEventData( keyCode, { shiftKey = false } = {} ) {
	return {
		keyCode,
		shiftKey,
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	};
}
