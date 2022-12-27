/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import Widget from '../src/widget';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';

import { toWidget } from '../src/utils';
import {
	setData as setModelData,
	getData as getModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import env from '@ckeditor/ckeditor5-utils/src/env';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Widget - integration', () => {
	let editor, model, view, viewDocument, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( env, 'isSafari' ).get( () => true );

		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, { plugins: [ Paragraph, Widget, Typing, LinkEditing ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
				viewDocument = view.document;

				model.schema.register( 'widget', {
					inheritAllFrom: '$block',
					isObject: true
				} );
				model.schema.register( 'nested', {
					allowIn: 'widget',
					isLimit: true
				} );
				model.schema.extend( '$text', {
					allowIn: [ 'nested', 'editable', 'inline-widget' ]
				} );
				model.schema.register( 'editable', {
					allowIn: [ 'widget', '$root' ]
				} );
				model.schema.register( 'inline-widget', {
					allowWhere: '$text',
					isObject: true,
					isInline: true
				} );
				model.schema.extend( '$block', {
					allowIn: 'nested'
				} );

				editor.conversion.for( 'downcast' )
					.elementToElement( { model: 'inline', view: 'figure' } )
					.elementToElement( { model: 'imageBlock', view: 'img' } )
					.elementToElement( {
						model: 'widget',
						view: ( modelItem, { writer } ) => {
							const div = writer.createContainerElement( 'div' );

							return toWidget( div, writer, { label: 'element label' } );
						}
					} )
					.elementToElement( {
						model: 'inline-widget',
						view: ( modelItem, { writer } ) => {
							const span = writer.createContainerElement( 'span' );

							return toWidget( span, writer );
						}
					} )
					.elementToElement( {
						model: 'nested',
						view: ( modelItem, { writer } ) => writer.createEditableElement( 'figcaption', { contenteditable: true } )
					} )
					.elementToElement( {
						model: 'editable',
						view: ( modelItem, { writer } ) => writer.createEditableElement( 'figcaption', { contenteditable: true } )
					} );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should do nothing if clicked inside a nested editable', () => {
		setModelData( model, '<paragraph>[]</paragraph><widget><nested>foo bar</nested></widget>' );
		const viewDiv = viewDocument.getRoot().getChild( 1 );
		const viewFigcaption = viewDiv.getChild( 0 );

		const preventDefault = sinon.spy();

		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewFigcaption ),
			preventDefault,
			detail: 1
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.notCalled( preventDefault );

		expect( getViewData( view ) ).to.equal(
			'<p>[]</p>' +
			'<div class="ck-widget" contenteditable="false">' +
				'<figcaption contenteditable="true">foo bar</figcaption>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>'
		);

		expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph><widget><nested>foo bar</nested></widget>' );
	} );

	it( 'should select the entire nested editable if triple clicked', () => {
		setModelData( model, '[]<widget><nested>foo bar</nested></widget>' );

		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const viewFigcaption = viewDiv.getChild( 0 );
		const preventDefault = sinon.spy();
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewFigcaption ),
			preventDefault,
			detail: 3
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.called( preventDefault );

		expect( getViewData( view ) ).to.equal(
			'<div class="ck-widget" contenteditable="false">' +
				'<figcaption contenteditable="true">{foo bar}</figcaption>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>'
		);
		expect( getModelData( model ) ).to.equal( '<widget><nested>[foo bar]</nested></widget>' );
	} );

	it( 'should select the entire nested editable if triple clicked on link', () => {
		setModelData( model, '[]<widget><nested>foo <$text linkHref="abc">bar</$text></nested></widget>' );

		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const viewLink = viewDiv.getChild( 0 ).getChild( 1 );
		const preventDefault = sinon.spy();
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewLink ),
			preventDefault,
			detail: 3
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.called( preventDefault );

		expect( getViewData( view ) ).to.equal(
			'<div class="ck-widget" contenteditable="false">' +
			'<figcaption contenteditable="true">{foo <a href="abc">bar</a>]</figcaption>' +
			'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>'
		);
		expect( getModelData( model ) ).to.equal( '<widget><nested>[foo <$text linkHref="abc">bar</$text>]</nested></widget>' );
	} );

	it( 'should select only clicked paragraph if triple clicked on link', () => {
		setModelData( model,
			'[]<widget>' +
				'<nested>' +
					'<paragraph>foo</paragraph>' +
					'<paragraph>foo <$text linkHref="abc">bar</$text></paragraph>' +
					'<paragraph>bar</paragraph>' +
				'</nested>' +
			'</widget>'
		);

		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const viewLink = viewDiv.getChild( 0 ).getChild( 1 ).getChild( 1 );
		const preventDefault = sinon.spy();
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewLink ),
			preventDefault,
			detail: 3
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.called( preventDefault );

		expect( getViewData( view ) ).to.equal(
			'<div class="ck-widget" contenteditable="false">' +
				'<figcaption contenteditable="true">' +
					'<p>foo</p>' +
					'<p>{foo <a href="abc">bar</a>]</p>' +
					'<p>bar</p>' +
				'</figcaption>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>'
		);
		expect( getModelData( model ) ).to.equal(
			'<widget>' +
				'<nested>' +
					'<paragraph>foo</paragraph>' +
					'<paragraph>[foo <$text linkHref="abc">bar</$text>]</paragraph>' +
					'<paragraph>bar</paragraph>' +
				'</nested>' +
			'</widget>'
		);
	} );

	it( 'should select proper nested editable if triple clicked', () => {
		setModelData( model, '[]<widget><nested>foo</nested><nested>bar</nested></widget>' );

		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const secondViewFigcaption = viewDiv.getChild( 1 );
		const preventDefault = sinon.spy();
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( secondViewFigcaption ),
			preventDefault,
			detail: 3
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.called( preventDefault );

		expect( getViewData( view ) ).to.equal(
			'<div class="ck-widget" contenteditable="false">' +
				'<figcaption contenteditable="true">foo</figcaption>' +
				'<figcaption contenteditable="true">{bar}</figcaption>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>'
		);

		expect( getModelData( model ) ).to.equal( '<widget><nested>foo</nested><nested>[bar]</nested></widget>' );
	} );

	it( 'should select the entire nested editable if quadra clicked', () => {
		setModelData( model, '[]<widget><nested>foo bar</nested></widget>' );

		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const viewFigcaption = viewDiv.getChild( 0 );
		const preventDefault = sinon.spy();
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewFigcaption ),
			preventDefault,
			detail: 4
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.called( preventDefault );

		expect( getViewData( view ) ).to.equal(
			'<div class="ck-widget" contenteditable="false">' +
				'<figcaption contenteditable="true">{foo bar}</figcaption>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>'
		);

		expect( getModelData( model ) ).to.equal( '<widget><nested>[foo bar]</nested></widget>' );
	} );

	it( 'should select the inline widget if triple clicked', () => {
		setModelData( model, '<paragraph>Foo<inline-widget>foo bar</inline-widget>Bar</paragraph>' );

		const viewParagraph = viewDocument.getRoot().getChild( 0 );
		const viewInlineWidget = viewParagraph.getChild( 1 );
		const preventDefault = sinon.spy();
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewInlineWidget ),
			preventDefault,
			detail: 3
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( viewDocument.selection.isFake ).to.be.true;
		expect( getViewData( view ) ).to.equal(
			'<p>Foo[<span class="ck-widget ck-widget_selected" contenteditable="false">foo bar</span>]Bar</p>'
		);

		expect( getModelData( model ) ).to.equal( '<paragraph>Foo[<inline-widget>foo bar</inline-widget>]Bar</paragraph>' );
	} );

	it( 'should do nothing for non-Safari and non-Gecko browser', () => {
		testUtils.sinon.stub( env, 'isSafari' ).get( () => false );
		testUtils.sinon.stub( env, 'isGecko' ).get( () => false );

		setModelData( model, '<paragraph>[]</paragraph><widget><nested>foo bar</nested></widget>' );

		const viewDiv = viewDocument.getRoot().getChild( 1 );
		const viewFigcaption = viewDiv.getChild( 0 );
		const preventDefault = sinon.spy();
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewFigcaption ),
			preventDefault,
			detail: 4
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.notCalled( preventDefault );

		expect( getViewData( view ) ).to.equal(
			'<p>[]</p>' +
			'<div class="ck-widget" contenteditable="false">' +
				'<figcaption contenteditable="true">foo bar</figcaption>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>'
		);

		expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph><widget><nested>foo bar</nested></widget>' );
	} );
} );
