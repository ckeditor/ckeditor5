/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';
import BubblingEventInfo from '@ckeditor/ckeditor5-engine/src/view/observer/bubblingeventinfo';

import Widget from '../../src/widget';
import WidgetTypeAround from '../../src/widgettypearound/widgettypearound';
import { TYPE_AROUND_SELECTION_ATTRIBUTE } from '../../src/widgettypearound/utils';
import { toWidget } from '../../src/utils';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'WidgetTypeAround', () => {
	let element, plugin, editor, editingView, viewDocument, modelRoot, viewRoot;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		editor = await ClassicEditor.create( element, {
			plugins: [
				ArticlePluginSet, Widget,

				blockWidgetPlugin, inlineWidgetPlugin
			],
			image: {
				toolbar: [ 'imageStyle:block', 'imageStyle:side' ]
			}
		} );

		editingView = editor.editing.view;
		viewDocument = editingView.document;
		viewRoot = viewDocument.getRoot();
		modelRoot = editor.model.document.getRoot();
		plugin = editor.plugins.get( WidgetTypeAround );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	describe( 'plugin', () => {
		it( 'should be loaded', () => {
			expect( editor.plugins.get( WidgetTypeAround ) ).to.be.instanceOf( WidgetTypeAround );
		} );

		it( 'should have a name', () => {
			expect( WidgetTypeAround.pluginName ).to.equal( 'WidgetTypeAround' );
		} );

		describe( '#isEnabled support', () => {
			it( 'should add class to the editing view root when becoming disabled', () => {
				editor.plugins.get( WidgetTypeAround ).isEnabled = false;
				expect( viewRoot.hasClass( 'ck-widget__type-around_disabled' ) ).to.be.true;

				editor.plugins.get( WidgetTypeAround ).isEnabled = true;
				expect( viewRoot.hasClass( 'ck-widget__type-around_disabled' ) ).to.be.false;
			} );

			it( 'should remove the model selection attribute when becoming disabled', () => {
				setModelData( editor.model, '<blockWidget></blockWidget>' );

				editor.model.change( writer => {
					writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'foo' );
				} );

				expect( editor.model.document.selection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'foo' );

				editor.plugins.get( WidgetTypeAround ).isEnabled = false;

				expect( editor.model.document.selection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			} );
		} );
	} );

	describe( '_insertParagraph()', () => {
		let executeSpy;

		beforeEach( () => {
			executeSpy = sinon.spy( editor, 'execute' );
		} );

		it( 'should execute the "insertParagraph" command when inserting a paragraph before the widget', () => {
			setModelData( editor.model, '<blockWidget></blockWidget>' );

			plugin._insertParagraph( modelRoot.getChild( 0 ), 'before' );

			const spyExecutePosition = executeSpy.firstCall.args[ 1 ].position;
			const positionBeforeWidget = editor.model.createPositionBefore( modelRoot.getChild( 0 ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWith( executeSpy, 'insertParagraph' );

			expect( spyExecutePosition.isEqual( positionBeforeWidget ) ).to.be.true;

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph><blockWidget></blockWidget>' );
		} );

		it( 'should execute the "insertParagraph" command when inserting a paragraph after the widget', () => {
			setModelData( editor.model, '<blockWidget></blockWidget>' );

			plugin._insertParagraph( modelRoot.getChild( 0 ), 'after' );

			const spyExecutePosition = executeSpy.firstCall.args[ 1 ].position;
			const positionAfterWidget = editor.model.createPositionAfter( modelRoot.getChild( 0 ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWith( executeSpy, 'insertParagraph' );

			expect( spyExecutePosition.isEqual( positionAfterWidget ) ).to.be.true;

			expect( getModelData( editor.model ) ).to.equal( '<blockWidget></blockWidget><paragraph>[]</paragraph>' );
		} );

		it( 'should focus the editing view', () => {
			const spy = sinon.spy( editor.editing.view, 'focus' );

			setModelData( editor.model, '<blockWidget></blockWidget>' );

			plugin._insertParagraph( modelRoot.getChild( 0 ), 'after' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should scroll the editing view to the selection in an inserted paragraph', () => {
			const spy = sinon.spy( editor.editing.view, 'scrollToTheSelection' );

			setModelData( editor.model, '<blockWidget></blockWidget>' );

			plugin._insertParagraph( modelRoot.getChild( 0 ), 'after' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should inherit attributes from widget that have copyOnReplace property', () => {
			editor.model.schema.extend( 'paragraph', {
				allowAttributes: 'a'
			} );

			editor.model.schema.extend( '$blockObject', {
				allowAttributes: 'a'
			} );

			editor.model.schema.setAttributeProperties( 'a', {
				copyOnReplace: true
			} );

			setModelData( editor.model, '[<blockWidget a="true"></blockWidget>]' );

			plugin._insertParagraph( modelRoot.getChild( 0 ), 'before' );

			const spyExecutePosition = executeSpy.firstCall.args[ 1 ].position;
			const positionBeforeWidget = editor.model.createPositionBefore( modelRoot.getChild( 0 ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWith( executeSpy, 'insertParagraph' );

			expect( spyExecutePosition.isEqual( positionBeforeWidget ) ).to.be.true;

			expect( getModelData( editor.model ) ).to.equal( '<paragraph a="true">[]</paragraph><blockWidget a="true"></blockWidget>' );
		} );

		it( 'should not copy attribute if it has copyOnReplace property but it is not allowed on paragraph', () => {
			editor.model.schema.extend( '$blockObject', {
				allowAttributes: 'a'
			} );

			editor.model.schema.setAttributeProperties( 'a', {
				copyOnReplace: true
			} );

			setModelData( editor.model, '[<blockWidget a="true"></blockWidget>]' );

			plugin._insertParagraph( modelRoot.getChild( 0 ), 'before' );

			const spyExecutePosition = executeSpy.firstCall.args[ 1 ].position;
			const positionBeforeWidget = editor.model.createPositionBefore( modelRoot.getChild( 0 ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWith( executeSpy, 'insertParagraph' );

			expect( spyExecutePosition.isEqual( positionBeforeWidget ) ).to.be.true;

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph><blockWidget a="true"></blockWidget>' );
		} );

		it( 'should not copy attribute if it has not got copyOnReplace attribute', () => {
			editor.model.schema.extend( 'paragraph', {
				allowAttributes: 'a'
			} );

			editor.model.schema.extend( '$blockObject', {
				allowAttributes: 'a'
			} );

			setModelData( editor.model, '[<blockWidget a="true"></blockWidget>]' );

			plugin._insertParagraph( modelRoot.getChild( 0 ), 'before' );

			const spyExecutePosition = executeSpy.firstCall.args[ 1 ].position;
			const positionBeforeWidget = editor.model.createPositionBefore( modelRoot.getChild( 0 ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWith( executeSpy, 'insertParagraph' );

			expect( spyExecutePosition.isEqual( positionBeforeWidget ) ).to.be.true;

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph><blockWidget a="true"></blockWidget>' );
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
			expect( firstViewWidget.getChild( 0 ).is( '$text' ) ).to.be.true;
			expect( lastViewWidget.childCount ).to.equal( 1 );
			expect( lastViewWidget.getChild( 0 ).is( '$text' ) ).to.be.true;
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

		it( 'should inject a fake caret into the wrapper', () => {
			setModelData( editor.model, '<blockWidget></blockWidget>' );

			const viewWidget = viewRoot.getChild( 0 );

			expect( viewWidget.getChild( 1 ).is( 'uiElement' ) ).to.be.true;
			expect( viewWidget.getChild( 1 ).hasClass( 'ck' ) ).to.be.true;
			expect( viewWidget.getChild( 1 ).hasClass( 'ck-reset_all' ) ).to.be.true;
			expect( viewWidget.getChild( 1 ).hasClass( 'ck-widget__type-around' ) ).to.be.true;

			const domWrapper = editingView.domConverter.viewToDom( viewWidget.getChild( 1 ) );

			expect( domWrapper.querySelectorAll( '.ck-widget__type-around__fake-caret' ) ).to.have.length( 1 );
		} );

		describe( 'UI button to type around', () => {
			let buttonBefore, buttonAfter;

			beforeEach( () => {
				setModelData( editor.model, '<blockWidget></blockWidget>' );

				const viewWidget = viewRoot.getChild( 0 );
				const domWrapper = editingView.domConverter.viewToDom( viewWidget.getChild( 1 ) );

				buttonBefore = domWrapper.children[ 0 ];
				buttonAfter = domWrapper.children[ 1 ];
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
					sinon.assert.calledWithExactly( typeAroundSpy, modelRoot.getChild( 1 ), 'before' );
					sinon.assert.calledOnce( preventDefaultSpy );
					sinon.assert.calledOnce( stopSpy );
				} );

				it( 'should not cause WidgetTypeAround#_insertParagraph() when clicked something other than the button', () => {
					const typeAroundSpy = sinon.spy( plugin, '_insertParagraph' );

					const eventInfo = new EventInfo( viewDocument, 'mousedown' );
					const domEventDataMock = new DomEventData( editingView, {
						// Clicking a widget.
						target: editingView.domConverter.viewToDom( viewRoot.getChild( 0 ) ),
						preventDefault: sinon.spy()
					} );

					viewDocument.fire( eventInfo, domEventDataMock );
					sinon.assert.notCalled( typeAroundSpy );
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
					sinon.assert.calledWithExactly( typeAroundSpy, modelRoot.getChild( 0 ), 'after' );
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

	describe( 'typing around view widgets using keyboard', () => {
		let model, modelSelection, eventInfoStub, domEventDataStub;

		beforeEach( () => {
			model = editor.model;
			modelSelection = model.document.selection;
		} );

		describe( '"fake caret" activation', () => {
			it( 'should activate before when the collapsed selection is before a widget and the navigation is forward', () => {
				setModelData( editor.model, '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );

				fireKeyboardEvent( 'arrowright' );

				expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

				const viewWidget = viewRoot.getChild( 1 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.true;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should activate after when the collapsed selection is after a widget and the navigation is backward', () => {
				setModelData( editor.model, '<blockWidget></blockWidget><paragraph>[]foo</paragraph>' );

				fireKeyboardEvent( 'arrowleft' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

				const viewWidget = viewRoot.getChild( 0 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.true;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should activate after when the widget is selected and the navigation is forward', () => {
				setModelData( editor.model, '[<blockWidget></blockWidget>]' );

				fireKeyboardEvent( 'arrowright' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

				const viewWidget = viewRoot.getChild( 0 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.true;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should activate before when the widget is selected and the navigation is backward', () => {
				setModelData( editor.model, '[<blockWidget></blockWidget>]' );

				fireKeyboardEvent( 'arrowleft' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

				const viewWidget = viewRoot.getChild( 0 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.true;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should activate if an arrow key is pressed along with Shift', () => {
				setModelData( editor.model, '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );

				fireKeyboardEvent( 'arrowright', { shiftKey: true } );

				expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should not activate when the selection is before the widget but the non-arrow key was pressed', () => {
				setModelData( editor.model, '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );

				fireKeyboardEvent( 'a' );
				fireMutation( 'a' );

				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				expect( getModelData( model ) ).to.equal( '<paragraph>fooa[]</paragraph><blockWidget></blockWidget>' );

				const viewWidget = viewRoot.getChild( 1 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.notCalled( eventInfoStub.stop );
				sinon.assert.notCalled( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should not activate when the selection is not before the widget and navigating forward', () => {
				setModelData( editor.model, '<paragraph>fo[]o</paragraph><blockWidget></blockWidget>' );

				fireKeyboardEvent( 'arrowright' );

				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

				const viewWidget = viewRoot.getChild( 1 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.notCalled( eventInfoStub.stop );
				sinon.assert.notCalled( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should not activate when the selection is not after the widget and navigating backward', () => {
				setModelData( editor.model, '<blockWidget></blockWidget><paragraph>f[]oo</paragraph>' );

				fireKeyboardEvent( 'arrowleft' );

				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

				const viewWidget = viewRoot.getChild( 0 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.notCalled( eventInfoStub.stop );
				sinon.assert.notCalled( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should not activate when the non-collapsed selection is before the widget and navigating forward', () => {
				setModelData( editor.model, '<paragraph>fo[o]</paragraph><blockWidget></blockWidget>' );

				fireKeyboardEvent( 'arrowright' );

				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

				const viewWidget = viewRoot.getChild( 1 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.notCalled( eventInfoStub.stop );
				sinon.assert.notCalled( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should not activate when the non-collapsed selection is after the widget and navigating backward', () => {
				setModelData( editor.model, '<blockWidget></blockWidget><paragraph>[f]oo</paragraph>' );

				fireKeyboardEvent( 'arrowleft' );

				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

				const viewWidget = viewRoot.getChild( 0 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.notCalled( eventInfoStub.stop );
				sinon.assert.notCalled( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should not activate selection downcast when a non–type-around-friendly widget is selected', () => {
				setModelData( editor.model, '<paragraph>foo[<inlineWidget></inlineWidget>]</paragraph>' );

				model.change( writer => {
					// Simply trigger the selection downcast.
					writer.setSelectionAttribute( 'foo', 'bar' );
				} );

				const viewWidget = viewRoot.getChild( 0 ).getChild( 1 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;
			} );

			describe( 'selection containing more than a widget', () => {
				it( 'should activate before when the widget is the first element and the navigation is backward', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget><paragraph>foo]</paragraph>' );

					fireKeyboardEvent( 'arrowleft' );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					const viewWidget = viewRoot.getChild( 0 );

					expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.true;
					expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.called( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should activate before when the widget is the first and last element and the navigation is backward', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget><paragraph>foo</paragraph><blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );

					expect( getModelData( model ) ).to.equal(
						'[<blockWidget></blockWidget>]<paragraph>foo</paragraph><blockWidget></blockWidget>'
					);
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					const viewWidget = viewRoot.getChild( 0 );

					expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.true;
					expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.called( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should activate after when the widget is the last element and the navigation is forward', () => {
					setModelData( editor.model, '<paragraph>[foo</paragraph><blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowright' );

					expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					const viewWidget = viewRoot.getChild( 1 );

					expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
					expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.true;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.called( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should activate after when the widget is the first and last element and the navigation is forward', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget><paragraph>foo</paragraph><blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowright' );

					expect( getModelData( model ) ).to.equal(
						'<blockWidget></blockWidget><paragraph>foo</paragraph>[<blockWidget></blockWidget>]'
					);
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					const viewWidget = viewRoot.getChild( 2 );

					expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
					expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.true;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.called( domEventDataStub.domEvent.preventDefault );
				} );
			} );
		} );

		describe( '"fake caret" deactivation', () => {
			it( 'should deactivate when the widget is selected and the navigation is backward to a valid position', () => {
				setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );

				fireKeyboardEvent( 'arrowleft' );

				expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );

				fireKeyboardEvent( 'arrowleft' );

				expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

				const viewWidget = viewRoot.getChild( 1 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should deactivate when the widget is selected and the navigation is forward to a valid position', () => {
				setModelData( editor.model, '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );

				fireKeyboardEvent( 'arrowright' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );

				fireKeyboardEvent( 'arrowright' );

				expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget><paragraph>[]foo</paragraph>' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

				const viewWidget = viewRoot.getChild( 0 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should deactivate if an arrow key is pressed along with Shift', () => {
				setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );

				fireKeyboardEvent( 'arrowleft', { shiftKey: true } );

				expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );

				fireKeyboardEvent( 'arrowleft', { shiftKey: true } );

				expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should not deactivate when the widget is selected and the navigation is backward but there is nowhere to go', () => {
				setModelData( editor.model, '[<blockWidget></blockWidget>]' );

				fireKeyboardEvent( 'arrowleft' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );

				fireKeyboardEvent( 'arrowleft' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );

				const viewWidget = viewRoot.getChild( 0 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.true;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should not deactivate when the widget is selected and the navigation is forward but there is nowhere to go', () => {
				setModelData( editor.model, '[<blockWidget></blockWidget>]' );

				fireKeyboardEvent( 'arrowright' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );

				fireKeyboardEvent( 'arrowright' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );

				const viewWidget = viewRoot.getChild( 0 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.true;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should deactivate when the widget is selected and the navigation is against the fake caret (backward)', () => {
				setModelData( editor.model, '[<blockWidget></blockWidget>]' );

				fireKeyboardEvent( 'arrowleft' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );

				fireKeyboardEvent( 'arrowright' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

				const viewWidget = viewRoot.getChild( 0 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should deactivate when the widget is selected and the navigation is against the fake caret (forward)', () => {
				setModelData( editor.model, '[<blockWidget></blockWidget>]' );

				fireKeyboardEvent( 'arrowright' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );

				fireKeyboardEvent( 'arrowleft' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

				const viewWidget = viewRoot.getChild( 0 );

				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
				expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );
		} );

		describe( 'collapsing selection spanning over the widget at the edge of limit element', () => {
			it( 'should collapse selection at the beginning if the widget is the last element and the navigation is backward', () => {
				setModelData( editor.model, '<paragraph>[foo</paragraph><blockWidget></blockWidget>]' );

				fireKeyboardEvent( 'arrowleft' );

				expect( getModelData( model ) ).to.equal( '<paragraph>[]foo</paragraph><blockWidget></blockWidget>' );
				expect( modelSelection.hasAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.false;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );

			it( 'should collapse selection at the end if the widget is the first element and the navigation is forward', () => {
				setModelData( editor.model, '[<blockWidget></blockWidget><paragraph>foo]</paragraph>' );

				fireKeyboardEvent( 'arrowright' );

				expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget><paragraph>foo[]</paragraph>' );
				expect( modelSelection.hasAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.false;

				sinon.assert.calledOnce( eventInfoStub.stop );
				sinon.assert.called( domEventDataStub.domEvent.preventDefault );
			} );
		} );

		it( 'should not work when the plugin is disabled', () => {
			editor.plugins.get( WidgetTypeAround ).isEnabled = false;

			setModelData( editor.model, '<paragraph>foo[]</paragraph><blockWidget></blockWidget><paragraph>bar</paragraph>' );

			fireKeyboardEvent( 'arrowright' );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>bar</paragraph>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

			fireKeyboardEvent( 'arrowdown' );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph><blockWidget></blockWidget><paragraph>[]bar</paragraph>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
		} );

		it( 'should activate and deactivate the "fake caret" using all 4 arrow keys', () => {
			setModelData( editor.model, '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );

			fireKeyboardEvent( 'arrowright' );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

			fireKeyboardEvent( 'arrowdown' );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

			fireKeyboardEvent( 'arrowup' );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

			fireKeyboardEvent( 'arrowleft' );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
		} );

		it( 'should quit the "fake caret" mode when the editor loses focus', () => {
			editor.ui.focusTracker.isFocused = true;

			setModelData( editor.model, '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );

			fireKeyboardEvent( 'arrowright' );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

			editor.ui.focusTracker.isFocused = false;

			const viewWidget = viewRoot.getChild( 1 );

			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
			expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;
		} );

		it( 'should quit the "fake caret" mode when the user changed the selection', () => {
			setModelData( editor.model, '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );

			fireKeyboardEvent( 'arrowright' );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

			model.change( writer => {
				writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
			} );

			const viewWidget = viewRoot.getChild( 1 );

			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
			expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;
		} );

		it( 'should not quit the "fake caret" mode when the selection changed as a result of an indirect change', () => {
			setModelData( editor.model, '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );

			fireKeyboardEvent( 'arrowright' );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

			// This could happen in collaboration.
			model.document.selection.fire( 'change:range', {
				directChange: false
			} );

			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

			const viewWidget = viewRoot.getChild( 1 );

			expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.true;
			expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;
		} );

		it( 'should quit the "fake caret" mode when model was changed (model.deleteContent())', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>baz</paragraph>' );

			const selection = model.createSelection( modelSelection );

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
				model.deleteContent( selection );
			} );

			const viewWidget = viewRoot.getChild( 1 );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph></paragraph><paragraph>baz</paragraph>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_before' ) ).to.be.false;
			expect( viewWidget.hasClass( 'ck-widget_type-around_show-fake-caret_after' ) ).to.be.false;
		} );

		it( 'should quit the "fake caret" mode when model was changed (writer.remove())', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>baz</paragraph>' );

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
				writer.remove( editor.model.document.getRoot().getChild( 1 ) );
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>baz</paragraph>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
		} );

		describe( 'inserting a new paragraph', () => {
			describe( 'on Enter key press when the "fake caret" is activated', () => {
				it( 'should insert a paragraph before a widget if the caret was "before" it', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					fireKeyboardEvent( 'enter' );
					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph><blockWidget></blockWidget>' );
				} );

				it( 'should insert a paragraph after a widget if the caret was "after" it', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowright' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					fireKeyboardEvent( 'enter' );
					expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget><paragraph>[]</paragraph>' );
				} );

				it( 'should integrate with the undo feature', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );
					fireKeyboardEvent( 'enter' );

					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph><blockWidget></blockWidget>' );

					editor.execute( 'undo' );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );

				it( 'should not work when the plugin is disabled', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					editor.plugins.get( WidgetTypeAround ).isEnabled = false;

					model.change( writer => {
						writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'after' );
					} );

					fireKeyboardEvent( 'enter' );
					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
				} );
			} );

			describe( 'on Enter key press when the widget is selected (no "fake caret", though)', () => {
				it( 'should insert a new paragraph after the widget if Enter was pressed', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					fireKeyboardEvent( 'enter' );

					expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget><paragraph>[]</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );

				it( 'should insert a new paragraph before the widget if Shift+Enter was pressed', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					fireKeyboardEvent( 'enter', { shiftKey: true } );

					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph><blockWidget></blockWidget>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );

				it( 'should insert a new paragraph only if an entire widget is selected (selected nested editable content)', () => {
					setModelData( editor.model, '<blockWidget><nested>[foo] bar</nested></blockWidget>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					fireKeyboardEvent( 'enter' );

					expect( getModelData( model ) ).to.equal( '<blockWidget><nested>[] bar</nested></blockWidget>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );

				it( 'should insert a new paragraph only if an entire widget is selected (selected widget siblings)', () => {
					setModelData( editor.model, '<paragraph>f[oo</paragraph><blockWidget></blockWidget><paragraph>o]o</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					fireKeyboardEvent( 'enter' );

					expect( getModelData( model ) ).to.equal( '<paragraph>f</paragraph><paragraph>[]o</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );

				it( 'should split ancestors to find a place that allows a widget', () => {
					model.schema.register( 'allowP', {
						inheritAllFrom: '$block'
					} );
					model.schema.register( 'disallowP', {
						inheritAllFrom: '$block',
						allowIn: [ 'allowP' ]
					} );
					model.schema.extend( 'blockWidget', {
						allowIn: [ 'allowP', 'disallowP' ]
					} );
					model.schema.extend( 'paragraph', {
						allowIn: [ 'allowP' ]
					} );

					editor.conversion.for( 'downcast' ).elementToElement( { model: 'allowP', view: 'allowP' } );
					editor.conversion.for( 'downcast' ).elementToElement( { model: 'disallowP', view: 'disallowP' } );

					setModelData( model,
						'<allowP>' +
							'<disallowP>[<blockWidget></blockWidget>]</disallowP>' +
						'</allowP>'
					);

					fireKeyboardEvent( 'enter' );

					expect( getModelData( model ) ).to.equal(
						'<allowP>' +
							'<disallowP><blockWidget></blockWidget></disallowP>' +
							'<paragraph>[]</paragraph>' +
							'<disallowP></disallowP>' +
						'</allowP>'
					);
				} );

				it( 'should integrate with the undo feature', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					fireKeyboardEvent( 'enter' );

					expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget><paragraph>[]</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					editor.execute( 'undo' );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );

				it( 'should do nothing if a non-type-around-friendly content is selected', () => {
					setModelData( editor.model, '<paragraph>foo[<inlineWidget></inlineWidget>]</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					fireKeyboardEvent( 'enter' );

					expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>[]</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );

				it( 'should not work when the plugin is disabled', () => {
					editor.plugins.get( WidgetTypeAround ).isEnabled = false;

					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'enter' );

					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
				} );
			} );

			describe( 'on keydown of a "typing" character when the "fake caret" is activated ', () => {
				it( 'should insert a character inside a new paragraph before a widget if the caret was "before" it', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					fireKeyboardEvent( 'a' );
					fireMutation( 'a' );

					expect( getModelData( model ) ).to.equal( '<paragraph>a[]</paragraph><blockWidget></blockWidget>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );

				it( 'should insert a character inside a new paragraph after a widget if the caret was "after" it', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowright' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					fireKeyboardEvent( 'a' );
					fireMutation( 'a' );

					expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget><paragraph>a[]</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );

				it( 'should do nothing if a "safe" keystroke was pressed', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowright' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					fireKeyboardEvent( 'esc' );
					fireKeyboardEvent( 'tab' );
					fireKeyboardEvent( 'd', { ctrlKey: true } );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );
				} );

				it( 'should integrate with the undo feature', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );
					fireKeyboardEvent( 'a' );
					fireMutation( 'a' );

					expect( getModelData( model ) ).to.equal( '<paragraph>a[]</paragraph><blockWidget></blockWidget>' );

					editor.execute( 'undo' );
					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph><blockWidget></blockWidget>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					editor.execute( 'undo' );
					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );

				it( 'should not work when the plugin is disabled', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					editor.plugins.get( WidgetTypeAround ).isEnabled = false;

					model.change( writer => {
						writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
					} );

					fireKeyboardEvent( 'a' );
					fireMutation( 'a' );

					expect( getModelData( model ) ).to.equal( '<paragraph>a[]</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
				} );
			} );
		} );

		describe( 'delete integration', () => {
			let eventInfoStub, domEventDataStub;

			describe( 'backward delete', () => {
				it( 'should delete content before a widget if the "fake caret" is also before the widget', () => {
					setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );

					expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					fireDeleteEvent();
					expect( getModelData( model ) ).to.equal( '<paragraph>fo[]</paragraph><blockWidget></blockWidget>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete an empty paragraph before a widget if the "fake caret" is also before the widget', () => {
					setModelData( editor.model, '<paragraph></paragraph>[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );

					expect( getModelData( model ) ).to.equal( '<paragraph></paragraph>[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					fireDeleteEvent();
					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete an empty document tree branch before a widget if the "fake caret" is also before the widget', () => {
					setModelData( editor.model, '<blockQuote><paragraph></paragraph></blockQuote>[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );

					expect( getModelData( model ) ).to.equal(
						'<blockQuote>' +
							'<paragraph></paragraph>' +
						'</blockQuote>' +
						'[<blockWidget></blockWidget>]'
					);
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					fireDeleteEvent();
					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete an empty document tree sub-branch before a widget if the "fake caret" is also before the widget', () => {
					let operationType;

					setModelData( editor.model,
						'<blockQuote>' +
							'<paragraph>foo</paragraph>' +
							'<paragraph></paragraph>' +
						'</blockQuote>' +
						'[<blockWidget></blockWidget>]'
					);

					fireKeyboardEvent( 'arrowleft' );

					expect( getModelData( model ) ).to.equal(
						'<blockQuote>' +
							'<paragraph>foo</paragraph>' +
							'<paragraph></paragraph>' +
						'</blockQuote>' +
						'[<blockWidget></blockWidget>]'
					);
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					// Assert that the paragraph is merged rather than deleted because
					// it is safer for collaboration.
					model.on( 'applyOperation', ( evt, [ operation ] ) => {
						operationType = operation.type;
					} );

					fireDeleteEvent();
					expect( getModelData( model ) ).to.equal(
						'<blockQuote>' +
							'<paragraph>foo[]</paragraph>' +
						'</blockQuote>' +
						'<blockWidget></blockWidget>'
					);
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
					expect( operationType ).to.equal( 'merge' );

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should do nothing if the "fake caret" is before the widget but there is nothing to delete there', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					fireDeleteEvent();
					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete a widget if the "fake caret" is after the widget (no content after the widget)', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowright' );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					fireDeleteEvent();
					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete a widget if the "fake caret" is after the widget (some content after the widget)', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );

					fireKeyboardEvent( 'arrowright' );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					fireDeleteEvent();
					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph><paragraph>foo</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete a sibling widget', () => {
					setModelData( editor.model, '<blockWidget><nested>foo</nested></blockWidget>[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );

					expect( getModelData( model ) ).to.equal(
						'<blockWidget><nested>foo</nested></blockWidget>' +
						'[<blockWidget></blockWidget>]'
					);
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					fireDeleteEvent();
					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph><blockWidget></blockWidget>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should do nothing if some content inside widget is deleted', () => {
					setModelData( editor.model, '<blockWidget><nested>[foo] bar</nested></blockWidget>' );

					fireDeleteEvent();
					expect( getModelData( model ) ).to.equal( '<blockWidget><nested>[] bar</nested></blockWidget>' );
				} );
			} );

			describe( 'delete forward', () => {
				it( 'should delete content after a widget if the "fake caret" is also after the widget', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );

					fireKeyboardEvent( 'arrowright' );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					fireDeleteEvent( true );
					expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget><paragraph>[]oo</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete an empty paragraph after a widget if the "fake caret" is also after the widget', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]<paragraph></paragraph>' );

					fireKeyboardEvent( 'arrowright' );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph></paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					fireDeleteEvent( true );
					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete an empty document tree branch after a widget if the "fake caret" is also after the widget', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]<blockQuote><paragraph></paragraph></blockQuote>' );

					fireKeyboardEvent( 'arrowright' );

					expect( getModelData( model ) ).to.equal(
						'[<blockWidget></blockWidget>]' +
						'<blockQuote><paragraph></paragraph></blockQuote>'
					);
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					fireDeleteEvent( true );
					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete an empty document tree sub-branch after a widget if the "fake caret" is also after the widget', () => {
					let operationType;

					setModelData( editor.model,
						'[<blockWidget></blockWidget>]' +
						'<blockQuote>' +
							'<paragraph></paragraph>' +
							'<paragraph>foo</paragraph>' +
						'</blockQuote>'
					);

					fireKeyboardEvent( 'arrowright' );

					expect( getModelData( model ) ).to.equal(
						'[<blockWidget></blockWidget>]' +
						'<blockQuote>' +
							'<paragraph></paragraph>' +
							'<paragraph>foo</paragraph>' +
						'</blockQuote>'
					);
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					// Assert that the paragraph is merged rather than deleted because
					// it is safer for collaboration.
					model.on( 'applyOperation', ( evt, [ operation ] ) => {
						operationType = operation.type;
					} );

					fireDeleteEvent( true );
					expect( getModelData( model ) ).to.equal(
						'<blockWidget></blockWidget>' +
						'<blockQuote>' +
							'<paragraph>[]foo</paragraph>' +
						'</blockQuote>'
					);
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
					expect( operationType ).to.equal( 'merge' );

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should do nothing if the "fake caret" is after the widget but there is nothing to delete there', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowright' );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					fireDeleteEvent( true );
					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete a widget if the "fake caret" is before the widget (no content before the widget)', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );

					expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					fireDeleteEvent( true );
					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete a widget if the "fake caret" is before the widget (some content before the widget)', () => {
					setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );

					fireKeyboardEvent( 'arrowleft' );

					expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

					fireDeleteEvent( true );
					expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>[]</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );

				it( 'should delete a sibling widget', () => {
					setModelData( editor.model, '[<blockWidget></blockWidget>]<blockWidget><nested>foo</nested></blockWidget>' );

					fireKeyboardEvent( 'arrowright' );

					expect( getModelData( model ) ).to.equal(
						'[<blockWidget></blockWidget>]' +
						'<blockWidget><nested>foo</nested></blockWidget>'
					);
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );

					fireDeleteEvent( true );
					expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget><paragraph>[]</paragraph>' );
					expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

					sinon.assert.calledOnce( eventInfoStub.stop );
					sinon.assert.calledOnce( domEventDataStub.domEvent.preventDefault );
				} );
			} );

			it( 'should not work when the plugin is disabled', () => {
				setModelData( editor.model, '[<blockWidget></blockWidget>]' );
				fireKeyboardEvent( 'arrowleft' );

				expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
				expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );

				editor.plugins.get( WidgetTypeAround ).isEnabled = false;

				model.change( writer => {
					writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
				} );

				fireDeleteEvent();
				expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			} );

			function fireDeleteEvent( isForward = false ) {
				eventInfoStub = new BubblingEventInfo( viewDocument, 'delete' );
				sinon.spy( eventInfoStub, 'stop' );

				const data = {
					direction: isForward ? 'forward' : 'backward',
					unit: 'character'
				};

				domEventDataStub = new DomEventData( viewDocument, getDomEvent(), data );

				viewDocument.fire( eventInfoStub, domEventDataStub );
			}
		} );

		function getDomEvent() {
			return {
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
		}

		function fireKeyboardEvent( key, modifiers ) {
			eventInfoStub = new EventInfo( viewDocument, 'keydown' );

			sinon.spy( eventInfoStub, 'stop' );

			const data = {
				document: viewDocument,
				domTarget: editingView.getDomRoot(),
				keyCode: getCode( key )
			};

			Object.assign( data, modifiers );

			domEventDataStub = new DomEventData( viewDocument, getDomEvent(), data );

			viewDocument.fire( eventInfoStub, domEventDataStub );
		}

		function fireMutation( text ) {
			const placeOfMutation = viewDocument.selection.getFirstRange().start;

			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( viewDocument, text ) ],
					node: placeOfMutation
				}
			] );
		}
	} );

	describe( 'Model#insertContent() integration', () => {
		let model, modelSelection;

		beforeEach( () => {
			model = editor.model;
			modelSelection = model.document.selection;
		} );

		it( 'should not alter insertContent for the selection other than the document selection', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>baz</paragraph>' );

			const batchSet = setupBatchWatch();
			const selection = model.createSelection( modelSelection );

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
				model.insertContent( createParagraph( 'bar' ), selection );
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>bar</paragraph><paragraph>baz</paragraph>' );
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		it( 'should not alter insertContent when the "fake caret" is not active', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>baz</paragraph>' );

			const batchSet = setupBatchWatch();

			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

			model.insertContent( createParagraph( 'bar' ) );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>bar[]</paragraph><paragraph>baz</paragraph>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		it( 'should handle insertContent before a widget when it\'s the first element of the root', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]' );

			const batchSet = setupBatchWatch();

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
			} );

			model.insertContent( createParagraph( 'bar' ) );

			expect( getModelData( model ) ).to.equal( '<paragraph>bar[]</paragraph><blockWidget></blockWidget>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		it( 'should handle insertContent after a widget when it\'s the last element of the root', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]' );

			const batchSet = setupBatchWatch();

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'after' );
			} );

			model.insertContent( createParagraph( 'bar' ) );

			expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget><paragraph>bar[]</paragraph>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		it( 'should handle insertContent before a widget when it\'s not the first element of the root', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );

			const batchSet = setupBatchWatch();

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
			} );

			model.insertContent( createParagraph( 'bar' ) );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>bar[]</paragraph><blockWidget></blockWidget>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		it( 'should handle insertContent after a widget when it\'s not the last element of the root', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );

			const batchSet = setupBatchWatch();

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'after' );
			} );

			model.insertContent( createParagraph( 'bar' ) );

			expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget><paragraph>bar[]</paragraph><paragraph>foo</paragraph>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		it( 'should not work when the plugin is disabled', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]' );

			editor.plugins.get( WidgetTypeAround ).isEnabled = false;

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
			} );

			model.insertContent( createParagraph( 'bar' ) );

			expect( getModelData( model ) ).to.equal( '<paragraph>bar[]</paragraph>' );
		} );

		it( 'should handle pasted content (with formatting)', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]' );

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
			} );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer: {
					getData() {
						return 'foo<b>bar</b>';
					}
				}
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo<$text bold="true">bar[]</$text></paragraph><blockWidget></blockWidget>'
			);
		} );

		function createParagraph( text ) {
			return model.change( writer => {
				const paragraph = writer.createElement( 'paragraph' );

				writer.insertText( text, paragraph );

				return paragraph;
			} );
		}

		function setupBatchWatch() {
			const createdBatches = new Set();

			model.on( 'applyOperation', ( evt, [ operation ] ) => {
				if ( operation.isDocumentOperation ) {
					createdBatches.add( operation.batch );
				}
			} );

			return createdBatches;
		}
	} );

	describe( 'Model#insertObject() integration', () => {
		let model, modelSelection;

		beforeEach( () => {
			model = editor.model;
			modelSelection = model.document.selection;
		} );

		it( 'should not alter insertObject\'s findOptimalPosition parameter other than the document selection', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>baz</paragraph>' );

			const batchSet = setupBatchWatch();
			const selection = model.createSelection( modelSelection );

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
				model.insertObject( createObject(), selection );
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><blockWidget></blockWidget><paragraph>baz</paragraph>' );
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		it( 'should not alter insertObject when the "fake caret" is not active', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>baz</paragraph>' );

			const batchSet = setupBatchWatch();

			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

			model.insertObject( createObject() );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>baz</paragraph>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		it( 'should alter insertObject\'s findOptimalPosition when the fake carret is active', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]' );

			const batchSet = setupBatchWatch();
			const insertObjectSpy = sinon.spy( model, 'insertObject' );

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'after' );
			} );

			model.insertObject( createObject(), undefined, undefined, { setSelection: 'on', findOptimalPosition: 'before' } );

			expect( getModelData( model ) ).to.equal( '<blockWidget></blockWidget>[<blockWidget></blockWidget>]' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( insertObjectSpy.firstCall.args[ 3 ].findOptimalPosition ).to.equal( 'after' );
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		function createObject( ) {
			return model.change( writer => {
				const object = writer.createElement( 'blockWidget' );

				return object;
			} );
		}

		function setupBatchWatch() {
			const createdBatches = new Set();

			model.on( 'applyOperation', ( evt, [ operation ] ) => {
				if ( operation.isDocumentOperation ) {
					createdBatches.add( operation.batch );
				}
			} );

			return createdBatches;
		}
	} );

	describe( 'Model#deleteContent() integration', () => {
		let model, modelSelection;

		beforeEach( () => {
			model = editor.model;
			modelSelection = model.document.selection;
		} );

		it( 'should not alter deleteContent for the selection other than the document selection', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>baz</paragraph>' );

			const batchSet = setupBatchWatch();
			const selection = model.createSelection( modelSelection );

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
				model.deleteContent( selection );
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph></paragraph><paragraph>baz</paragraph>' );
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		it( 'should not alter deleteContent when the "fake caret" is not active', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]<paragraph>baz</paragraph>' );

			const batchSet = setupBatchWatch();

			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;

			model.deleteContent( modelSelection );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>[]</paragraph><paragraph>baz</paragraph>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.be.undefined;
			expect( batchSet.size ).to.be.equal( 1 );
		} );

		it( 'should disable deleteContent before a widget when it\'s the first element of the root', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]' );

			const batchSet = setupBatchWatch();

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
			} );

			model.deleteContent( modelSelection );

			expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );
			expect( batchSet.size ).to.be.equal( 0 );
		} );

		it( 'should disable insertContent after a widget when it\'s the last element of the root', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]' );

			const batchSet = setupBatchWatch();

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'after' );
			} );

			model.deleteContent( modelSelection );

			expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );
			expect( batchSet.size ).to.be.equal( 0 );
		} );

		it( 'should disable insertContent before a widget when it\'s not the first element of the root', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );

			const batchSet = setupBatchWatch();

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
			} );

			model.deleteContent( modelSelection );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'before' );
			expect( batchSet.size ).to.be.equal( 0 );
		} );

		it( 'should disable insertContent after a widget when it\'s not the last element of the root', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );

			const batchSet = setupBatchWatch();

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'after' );
			} );

			model.deleteContent( modelSelection );

			expect( getModelData( model ) ).to.equal( '[<blockWidget></blockWidget>]<paragraph>foo</paragraph>' );
			expect( modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ).to.equal( 'after' );
			expect( batchSet.size ).to.be.equal( 0 );
		} );

		it( 'should not block when the plugin is disabled', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]' );

			editor.plugins.get( WidgetTypeAround ).isEnabled = false;

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
			} );

			model.deleteContent( modelSelection );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'should not remove widget while pasting a plain text', () => {
			setModelData( editor.model, '[<blockWidget></blockWidget>]' );

			model.change( writer => {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
			} );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer: {
					getData() {
						return 'bar';
					}
				}
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>bar[]</paragraph><blockWidget></blockWidget>' );
		} );

		function setupBatchWatch() {
			const createdBatches = new Set();

			model.on( 'applyOperation', ( evt, [ operation ] ) => {
				if ( operation.isDocumentOperation ) {
					createdBatches.add( operation.batch );
				}
			} );

			return createdBatches;
		}
	} );

	function blockWidgetPlugin( editor ) {
		editor.model.schema.register( 'blockWidget', {
			inheritAllFrom: '$block',
			isObject: true
		} );

		editor.model.schema.register( 'nested', {
			allowIn: 'blockWidget',
			isLimit: true
		} );

		editor.model.schema.extend( '$text', {
			allowIn: [ 'nested' ]
		} );

		editor.conversion.for( 'downcast' )
			.elementToElement( {
				model: 'blockWidget',
				view: ( modelItem, { writer } ) => {
					const container = writer.createContainerElement( 'div' );
					const viewText = writer.createText( 'block-widget' );

					writer.insert( writer.createPositionAt( container, 0 ), viewText );

					return toWidget( container, writer, {
						label: 'block widget'
					} );
				}
			} )
			.elementToElement( {
				model: 'nested',
				view: ( modelItem, { writer } ) => writer.createEditableElement( 'nested', { contenteditable: true } )
			} );
	}

	function inlineWidgetPlugin( editor ) {
		editor.model.schema.register( 'inlineWidget', {
			allowWhere: '$text',
			isObject: true,
			isInline: true
		} );

		editor.conversion.for( 'downcast' )
			.elementToStructure( {
				model: 'inlineWidget',
				view: ( modelItem, { writer } ) => {
					const container = writer.createContainerElement( 'inlineWidget' );
					const viewText = writer.createText( 'inline-widget' );

					writer.insert( writer.createPositionAt( container, 0 ), viewText );
					writer.insert( writer.createPositionAt( container, 0 ), writer.createSlot() );

					return toWidget( container, writer, {
						label: 'inline widget'
					} );
				}
			} );
	}
} );
