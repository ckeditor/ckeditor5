/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import Widget from '../../src/widget';
import WidgetTypeAround from '../../src/widgettypearound/widgettypearound';
import { toWidget } from '../../src/utils';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'WidgetTypeAround', () => {
	let element, plugin, editor, editingView, viewDocument, viewRoot;

	beforeEach( async () => {
		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		editor = await ClassicEditor.create( element, {
			plugins: [
				ArticlePluginSet, Widget,

				blockWidgetPlugin, inlineWidgetPlugin
			]
		} );

		editingView = editor.editing.view;
		viewDocument = editingView.document;
		viewRoot = viewDocument.getRoot();
		plugin = editor.plugins.get( WidgetTypeAround );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	describe( 'plugin', () => {
		it( 'is loaded', () => {
			expect( editor.plugins.get( WidgetTypeAround ) ).to.be.instanceOf( WidgetTypeAround );
		} );

		it( 'requires the Paragraph plugin', () => {
			expect( WidgetTypeAround.requires ).to.deep.equal( [ Paragraph ] );
		} );
	} );

	describe( '_insertParagraph()', () => {
		let executeSpy;

		beforeEach( () => {
			executeSpy = sinon.spy( editor, 'execute' );
		} );

		it( 'should execute the "insertParagraph" command when inserting a paragraph before the widget', () => {
			setModelData( editor.model, '<blockWidget></blockWidget>' );

			plugin._insertParagraph( viewRoot.getChild( 0 ), 'before' );

			const spyExecutePosition = executeSpy.firstCall.args[ 1 ].position;
			const positionBeforeWidget = editor.model.createPositionBefore( editor.model.document.getRoot().getChild( 0 ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWith( executeSpy, 'insertParagraph' );

			expect( spyExecutePosition.isEqual( positionBeforeWidget ) ).to.be.true;

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph><blockWidget></blockWidget>' );
		} );

		it( 'should execute the "insertParagraph" command when inserting a paragraph after the widget', () => {
			setModelData( editor.model, '<blockWidget></blockWidget>' );

			plugin._insertParagraph( viewRoot.getChild( 0 ), 'after' );

			const spyExecutePosition = executeSpy.firstCall.args[ 1 ].position;
			const positionAfterWidget = editor.model.createPositionAfter( editor.model.document.getRoot().getChild( 0 ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWith( executeSpy, 'insertParagraph' );

			expect( spyExecutePosition.isEqual( positionAfterWidget ) ).to.be.true;

			expect( getModelData( editor.model ) ).to.equal( '<blockWidget></blockWidget><paragraph>[]</paragraph>' );
		} );

		it( 'should focus the editing view', () => {
			const spy = sinon.spy( editor.editing.view, 'focus' );

			setModelData( editor.model, '<blockWidget></blockWidget>' );

			plugin._insertParagraph( viewRoot.getChild( 0 ), 'after' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should scroll the editing view to the selection in an inserted paragraph', () => {
			const spy = sinon.spy( editor.editing.view, 'scrollToTheSelection' );

			setModelData( editor.model, '<blockWidget></blockWidget>' );

			plugin._insertParagraph( viewRoot.getChild( 0 ), 'after' );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'UI to type around view widgets', () => {
		it( 'should be injected in block widgets', () => {
			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<blockWidget></blockWidget>' +
				'<paragraph>bar</paragraph>' +
				'<blockWidget></blockWidget>'
			);

			const firstViewWidget = viewRoot.getChild( 1 );
			const lastViewWidget = viewRoot.getChild( 3 );

			expect( firstViewWidget.childCount ).to.equal( 2 );
			expect( firstViewWidget.getChild( 1 ).hasClass( 'ck-widget__type-around' ) ).to.be.true;

			expect( lastViewWidget.childCount ).to.equal( 2 );
			expect( lastViewWidget.getChild( 1 ).hasClass( 'ck-widget__type-around' ) ).to.be.true;
		} );

		it( 'should not be injected in inline widgets', () => {
			setModelData( editor.model,
				'<paragraph>foo<inlineWidget></inlineWidget></paragraph>' +
				'<paragraph><inlineWidget></inlineWidget>bar</paragraph>'
			);

			const firstViewWidget = viewRoot.getChild( 0 ).getChild( 1 );
			const lastViewWidget = viewRoot.getChild( 1 ).getChild( 0 );

			expect( firstViewWidget.childCount ).to.equal( 1 );
			expect( firstViewWidget.getChild( 0 ).is( 'text' ) ).to.be.true;
			expect( lastViewWidget.childCount ).to.equal( 1 );
			expect( lastViewWidget.getChild( 0 ).is( 'text' ) ).to.be.true;
		} );

		it( 'should inject buttons into the wrapper', () => {
			setModelData( editor.model, '<blockWidget></blockWidget>' );

			const viewWidget = viewRoot.getChild( 0 );

			expect( viewWidget.getChild( 1 ).is( 'uiElement' ) ).to.be.true;
			expect( viewWidget.getChild( 1 ).hasClass( 'ck' ) ).to.be.true;
			expect( viewWidget.getChild( 1 ).hasClass( 'ck-reset_all' ) ).to.be.true;
			expect( viewWidget.getChild( 1 ).hasClass( 'ck-widget__type-around' ) ).to.be.true;

			const domWrapper = editingView.domConverter.viewToDom( viewWidget.getChild( 1 ) );

			expect( domWrapper.querySelectorAll( '.ck-widget__type-around__button' ) ).to.have.length( 2 );
		} );

		describe( 'UI button to type around', () => {
			let buttonBefore, buttonAfter;

			beforeEach( () => {
				setModelData( editor.model, '<blockWidget></blockWidget>' );

				const viewWidget = viewRoot.getChild( 0 );
				const domWrapper = editingView.domConverter.viewToDom( viewWidget.getChild( 1 ) );

				buttonBefore = domWrapper.firstChild;
				buttonAfter = domWrapper.lastChild;
			} );

			it( 'should have proper CSS classes', () => {
				expect( buttonBefore.classList.contains( 'ck' ) ).to.be.true;
				expect( buttonBefore.classList.contains( 'ck-widget__type-around__button' ) ).to.be.true;

				expect( buttonAfter.classList.contains( 'ck' ) ).to.be.true;
				expect( buttonAfter.classList.contains( 'ck-widget__type-around__button' ) ).to.be.true;
			} );

			describe( 'button to type "before" a widget', () => {
				it( 'should have a specific class', () => {
					expect( buttonBefore.classList.contains( 'ck-widget__type-around__button_before' ) ).to.be.true;
				} );

				it( 'should have a specific "title"', () => {
					expect( buttonBefore.getAttribute( 'title' ) ).to.equal( 'Insert paragraph before block' );
				} );

				it( 'should execute WidgetTypeAround#_insertParagraph() when clicked', () => {
					const preventDefaultSpy = sinon.spy();
					const typeAroundSpy = sinon.spy( plugin, '_insertParagraph' );

					const eventInfo = new EventInfo( viewDocument, 'mousedown' );
					const stopSpy = sinon.stub( eventInfo, 'stop' );
					const domEventDataMock = new DomEventData( editingView, {
						target: buttonBefore,
						preventDefault: preventDefaultSpy
					} );

					viewDocument.fire( eventInfo, domEventDataMock );

					sinon.assert.calledOnce( typeAroundSpy );
					sinon.assert.calledWithExactly( typeAroundSpy, viewRoot.getChild( 1 ), 'before' );
					sinon.assert.calledOnce( preventDefaultSpy );
					sinon.assert.calledOnce( stopSpy );
				} );
			} );

			describe( 'button to type "after" a widget', () => {
				it( 'should have a specific class', () => {
					expect( buttonAfter.classList.contains( 'ck-widget__type-around__button_after' ) ).to.be.true;
				} );

				it( 'should have a specific "title"', () => {
					expect( buttonAfter.getAttribute( 'title' ) ).to.equal( 'Insert paragraph after block' );
				} );

				it( 'should execute WidgetTypeAround#_insertParagraph() when clicked', () => {
					const preventDefaultSpy = sinon.spy();
					const typeAroundSpy = sinon.spy( plugin, '_insertParagraph' );

					const eventInfo = new EventInfo( viewDocument, 'mousedown' );
					const stopSpy = sinon.stub( eventInfo, 'stop' );
					const domEventDataMock = new DomEventData( editingView, {
						target: buttonAfter,
						preventDefault: preventDefaultSpy
					} );

					viewDocument.fire( eventInfo, domEventDataMock );

					sinon.assert.calledOnce( typeAroundSpy );
					sinon.assert.calledWithExactly( typeAroundSpy, viewRoot.getChild( 0 ), 'after' );
					sinon.assert.calledOnce( preventDefaultSpy );
					sinon.assert.calledOnce( stopSpy );
				} );
			} );

			it( 'should have an icon', () => {
				const icon = buttonBefore.firstChild;

				expect( icon.tagName.toLowerCase() ).to.equal( 'svg' );
				expect( icon.getAttribute( 'viewBox' ) ).to.equal( '0 0 10 8' );
			} );
		} );
	} );

	describe( 'detection and CSS classes of widgets needing the typing around support', () => {
		it( 'should detect widgets that are a first child of the parent container', () => {
			setModelData( editor.model, '<blockWidget></blockWidget><paragraph>foo</paragraph>' );

			const viewWidget = viewRoot.getChild( 0 );

			assertIsTypeAroundBefore( viewWidget, true );
			assertIsTypeAroundAfter( viewWidget, false );
		} );

		it( 'should detect widgets that are a last child of the parent container', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph><blockWidget></blockWidget>' );

			const viewWidget = viewRoot.getChild( 1 );

			assertIsTypeAroundBefore( viewWidget, false );
			assertIsTypeAroundAfter( viewWidget, true );
		} );

		it( 'should not detect widgets that are surrounded by sibling which allow the selection', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph><blockWidget></blockWidget><paragraph>bar</paragraph>' );

			const viewWidget = viewRoot.getChild( 1 );

			assertIsTypeAroundBefore( viewWidget, false );
			assertIsTypeAroundAfter( viewWidget, false );
		} );

		it( 'should detect widgets that have another block widget as a next sibling', () => {
			setModelData( editor.model, '<blockWidget></blockWidget><blockWidget></blockWidget>' );

			const firstViewWidget = viewRoot.getChild( 0 );

			assertIsTypeAroundBefore( firstViewWidget, true );
			assertIsTypeAroundAfter( firstViewWidget, true );
		} );

		it( 'should detect widgets that have another block widget as a previous sibling', () => {
			setModelData( editor.model, '<blockWidget></blockWidget><blockWidget></blockWidget>' );

			const lastViewWidget = viewRoot.getChild( 1 );

			assertIsTypeAroundBefore( lastViewWidget, true );
			assertIsTypeAroundAfter( lastViewWidget, true );
		} );

		it( 'should not detect inline widgets even if they fall in previous categories', () => {
			setModelData( editor.model,
				'<paragraph><inlineWidget></inlineWidget><inlineWidget></inlineWidget></paragraph>'
			);

			const firstViewWidget = viewRoot.getChild( 0 ).getChild( 0 );
			const lastViewWidget = viewRoot.getChild( 0 ).getChild( 1 );

			assertIsTypeAroundBefore( firstViewWidget, false );
			assertIsTypeAroundAfter( firstViewWidget, false );

			assertIsTypeAroundBefore( lastViewWidget, false );
			assertIsTypeAroundAfter( lastViewWidget, false );
		} );
	} );

	function assertIsTypeAroundBefore( viewWidget, expected ) {
		expect( viewWidget.hasClass( 'ck-widget_can-type-around_before' ) ).to.equal( expected );
	}

	function assertIsTypeAroundAfter( viewWidget, expected ) {
		expect( viewWidget.hasClass( 'ck-widget_can-type-around_after' ) ).to.equal( expected );
	}

	function blockWidgetPlugin( editor ) {
		editor.model.schema.register( 'blockWidget', {
			inheritAllFrom: '$block',
			isObject: true
		} );

		editor.conversion.for( 'downcast' )
			.elementToElement( {
				model: 'blockWidget',
				view: ( modelItem, viewWriter ) => {
					const container = viewWriter.createContainerElement( 'div' );
					const viewText = viewWriter.createText( 'block-widget' );

					viewWriter.insert( viewWriter.createPositionAt( container, 0 ), viewText );

					return toWidget( container, viewWriter, {
						label: 'block widget'
					} );
				}
			} );
	}

	function inlineWidgetPlugin( editor ) {
		editor.model.schema.register( 'inlineWidget', {
			allowWhere: '$text',
			isObject: true,
			isInline: true
		} );

		editor.conversion.for( 'downcast' )
			.elementToElement( {
				model: 'inlineWidget',
				view: ( modelItem, viewWriter ) => {
					const container = viewWriter.createContainerElement( 'inlineWidget' );
					const viewText = viewWriter.createText( 'inline-widget' );

					viewWriter.insert( viewWriter.createPositionAt( container, 0 ), viewText );

					return toWidget( container, viewWriter, {
						label: 'inline widget'
					} );
				}
			} );
	}
} );
