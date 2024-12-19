/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import indexOf from '@ckeditor/ckeditor5-utils/src/dom/indexof.js';
import isRange from '@ckeditor/ckeditor5-utils/src/dom/isrange.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { Bookmark } from '@ckeditor/ckeditor5-bookmark';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver.js';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import { toWidget } from '@ckeditor/ckeditor5-widget';
import { icons } from '@ckeditor/ckeditor5-core';

import LinkEditing from '../src/linkediting.js';
import LinkUI from '../src/linkui.js';
import LinkFormView from '../src/ui/linkformview.js';
import LinkButtonView from '../src/ui/linkbuttonview.js';
import LinkBookmarksView from '../src/ui/linkbookmarksview.js';
import LinkPreviewButtonView from '../src/ui/linkpreviewbuttonview.js';
import LinkPropertiesView from '../src/ui/linkpropertiesview.js';
import ManualDecorator from '../src/utils/manualdecorator.js';
import { MenuBarMenuListItemButtonView, ToolbarView } from '@ckeditor/ckeditor5-ui';

import linkIcon from '../theme/icons/link.svg';

describe( 'LinkUI', () => {
	let editor, linkUIFeature, linkButton, balloon, formView, toolbarView, editorElement, propertiesView;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Essentials, LinkEditing, LinkUI, Paragraph, BlockQuote, BoldEditing ]
		} );

		linkUIFeature = editor.plugins.get( LinkUI );
		linkButton = editor.ui.componentFactory.create( 'link' );
		balloon = editor.plugins.get( ContextualBalloon );

		// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
		testUtils.sinon.stub( balloon.view, 'attachTo' ).returns( {} );
		testUtils.sinon.stub( balloon.view, 'pin' ).returns( {} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( LinkUI.pluginName ).to.equal( 'LinkUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LinkUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LinkUI.isPremiumPlugin ).to.be.false;
	} );

	it( 'should load ContextualBalloon', () => {
		expect( editor.plugins.get( ContextualBalloon ) ).to.be.instanceOf( ContextualBalloon );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Create link',
			keystroke: 'Ctrl+K'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Move out of a link',
			keystroke: [
				[ 'arrowleft', 'arrowleft' ],
				[ 'arrowright', 'arrowright' ]
			]
		} );
	} );

	describe( 'init', () => {
		it( 'should register click observer', () => {
			expect( editor.editing.view.getObserver( ClickObserver ) ).to.be.instanceOf( ClickObserver );
		} );

		it( 'should not create #toolbarView', () => {
			expect( linkUIFeature.toolbarView ).to.be.null;
		} );

		it( 'should not create #formView', () => {
			expect( linkUIFeature.formView ).to.be.null;
		} );

		describe( 'the "link" toolbar button', () => {
			beforeEach( () => {
				linkButton = editor.ui.componentFactory.create( 'link' );
			} );

			testButton( 'link', 'Link', ButtonView );

			it( 'should have #tooltip', () => {
				expect( linkButton.tooltip ).to.be.true;
			} );

			it( 'should have #isToggleable', () => {
				expect( linkButton.isToggleable ).to.be.true;
			} );
		} );

		describe( 'the "menuBar:link" menu bar button', () => {
			beforeEach( () => {
				linkButton = editor.ui.componentFactory.create( 'menuBar:link' );
			} );

			testButton( 'link', 'Link', MenuBarMenuListItemButtonView );
		} );

		function testButton( featureName, label, Component ) {
			it( 'should register feature component', () => {
				expect( linkButton ).to.be.instanceOf( Component );
			} );

			it( 'should create UI component with correct attribute values', () => {
				expect( linkButton.isOn ).to.be.false;
				expect( linkButton.label ).to.equal( label );
				expect( linkButton.icon ).to.equal( linkIcon );
				expect( linkButton.keystroke ).to.equal( 'Ctrl+K' );
			} );

			it( 'should display the link UI when executed', () => {
				const spy = testUtils.sinon.stub( linkUIFeature, '_showUI' ).returns( {} );

				linkButton.fire( 'execute' );

				sinon.assert.calledWithExactly( spy, true );
			} );

			it( `should bind #isEnabled to ${ featureName } command`, () => {
				const command = editor.commands.get( featureName );

				expect( linkButton.isOn ).to.be.false;

				const initState = command.isEnabled;
				expect( linkButton.isEnabled ).to.equal( initState );

				command.isEnabled = !initState;
				expect( linkButton.isEnabled ).to.equal( !initState );
			} );

			it( 'should toggle the link UI with hidden back button', () => {
				linkButton.fire( 'execute' );

				expect( linkUIFeature.formView.backButtonView.isVisible ).to.be.false;
			} );

			it( 'should open on-top of the toolbar if the link is selected', () => {
				setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

				linkButton.fire( 'execute' );

				expect( balloon.visibleView ).to.equal( linkUIFeature.formView );
			} );
		}

		describe( 'the "linkPreview" toolbar button', () => {
			let button;

			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'linkPreview' );
			} );

			it( 'should be a LinkPreviewButtonView instance', () => {
				expect( button ).to.be.instanceOf( LinkPreviewButtonView );
			} );

			it( 'should bind "href" to link command value', () => {
				const linkCommand = editor.commands.get( 'link' );

				linkCommand.value = 'foo';
				expect( button.href ).to.equal( 'foo' );

				linkCommand.value = 'bar';
				expect( button.href ).to.equal( 'bar' );
			} );

			it( 'should not use unsafe href', () => {
				const linkCommand = editor.commands.get( 'link' );

				linkCommand.value = 'javascript:alert(1)';

				expect( button.href ).to.equal( '#' );
			} );

			it( 'should be enabled when command has a value', () => {
				const linkCommand = editor.commands.get( 'link' );

				linkCommand.value = null;
				expect( button.isEnabled ).to.be.false;

				linkCommand.value = 'foo';
				expect( button.isEnabled ).to.be.true;
			} );

			it( 'should use tooltip text depending on the command value', () => {
				const linkCommand = editor.commands.get( 'link' );

				linkCommand.value = 'foo';
				expect( button.tooltip ).to.equal( 'Open link in new tab' );

				linkCommand.value = '#foo';
				expect( button.tooltip ).to.equal( 'Open link in new tab' );
			} );

			it( 'should not use icon', () => {
				const linkCommand = editor.commands.get( 'link' );

				linkCommand.value = 'foo';
				expect( button.icon ).to.equal( undefined );

				linkCommand.value = '#foo';
				expect( button.icon ).to.equal( undefined );
			} );
		} );

		describe( 'the "unlink" toolbar button', () => {
			let button;

			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'unlink' );
			} );

			it( 'should be a ButtonView instance', () => {
				expect( button ).to.be.instanceOf( ButtonView );
			} );

			it( 'should set button properties', () => {
				expect( button.label ).to.equal( 'Unlink' );
				expect( button.tooltip ).to.be.true;
				expect( button.icon ).to.not.be.undefined;
			} );

			it( 'should bind enabled state to unlink command', () => {
				const unlinkCommand = editor.commands.get( 'unlink' );

				unlinkCommand.isEnabled = true;
				expect( button.isEnabled ).to.be.true;

				unlinkCommand.isEnabled = false;
				expect( button.isEnabled ).to.be.false;
			} );

			it( 'should trigger unlink command and hide UI on execute', () => {
				const unlinkCommand = editor.commands.get( 'unlink' );
				const stubCommand = sinon.stub( unlinkCommand, 'execute' );
				const stubHideUI = sinon.stub( linkUIFeature, '_hideUI' );

				button.fire( 'execute' );

				sinon.assert.calledOnce( stubCommand );
				sinon.assert.calledOnce( stubHideUI );
			} );
		} );

		describe( 'the "editLink" toolbar button', () => {
			let button;

			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'editLink' );
			} );

			it( 'should be a ButtonView instance', () => {
				expect( button ).to.be.instanceOf( ButtonView );
			} );

			it( 'should set button properties', () => {
				expect( button.label ).to.equal( 'Edit link' );
				expect( button.tooltip ).to.be.true;
				expect( button.icon ).to.not.be.undefined;
			} );

			it( 'should bind enabled state to link command', () => {
				const linkCommand = editor.commands.get( 'link' );

				linkCommand.isEnabled = true;
				expect( button.isEnabled ).to.be.true;

				linkCommand.isEnabled = false;
				expect( button.isEnabled ).to.be.false;
			} );

			it( 'should add form view to the balloon on execute', () => {
				const stubAddForm = sinon.stub( linkUIFeature, '_addFormView' );

				button.fire( 'execute' );

				sinon.assert.calledOnce( stubAddForm );
			} );

			it( 'should open link form view with back button', () => {
				const linkCommand = editor.commands.get( 'link' );

				// Simulate link selection.
				linkCommand.isEnabled = true;
				linkCommand.value = 'http://ckeditor.com';

				button.fire( 'execute' );

				expect( linkUIFeature.formView.backButtonView.isVisible ).to.be.true;
			} );
		} );

		describe( 'the "linkProperties" toolbar button', () => {
			let button;

			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'linkProperties' );
				editor.commands.get( 'link' ).manualDecorators.add( new ManualDecorator( {
					id: 'linkIsBar',
					label: 'Bar',
					attributes: {
						target: '_blank'
					}
				} ) );
			} );

			it( 'should be a ButtonView instance', () => {
				expect( button ).to.be.instanceOf( ButtonView );
			} );

			it( 'should set button properties', () => {
				expect( button.label ).to.equal( 'Link properties' );
				expect( button.tooltip ).to.be.true;
				expect( button.icon ).to.not.be.undefined;
			} );

			it( 'should be disabled if link value is empty or command is disabled', () => {
				const linkCommand = editor.commands.get( 'link' );

				linkCommand.value = 'http://ckeditor.com';
				expect( button.isEnabled ).to.be.true;

				linkCommand.isEnabled = false;
				expect( button.isEnabled ).to.be.false;

				linkCommand.isEnabled = true;
				linkCommand.value = '';
				expect( button.isEnabled ).to.be.false;

				linkCommand.value = null;
				expect( button.isEnabled ).to.be.false;
			} );

			it( 'should be disabled if there are no manual decorators', () => {
				const linkCommand = editor.commands.get( 'link' );

				linkCommand.isEnabled = false;

				expect( button.isEnabled ).to.be.false;

				linkCommand.manualDecorators.clear();
				linkCommand.isEnabled = true;

				expect( button.isEnabled ).to.be.false;
			} );

			it( 'should add properties view to the balloon on execute', () => {
				const stubAddProperties = sinon.stub( linkUIFeature, '_addPropertiesView' );

				button.fire( 'execute' );

				sinon.assert.calledOnce( stubAddProperties );
			} );

			it( 'should not be available in the toolbar if there are no manual decorators', () => {
				let items = Array.from( linkUIFeature._createToolbarView().items ).map( item => item.label );

				expect( items ).to.include( 'Link properties' );

				editor.commands.get( 'link' ).manualDecorators.clear();
				items = Array.from( linkUIFeature._createToolbarView().items ).map( item => item.label );
				expect( items ).not.to.include( 'Link properties' );
			} );
		} );
	} );

	describe( '_showUI()', () => {
		let balloonAddSpy;

		beforeEach( () => {
			balloonAddSpy = testUtils.sinon.spy( balloon, 'add' );
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #toolbarView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();

			expect( linkUIFeature.toolbarView ).to.be.instanceOf( ToolbarView );
		} );

		it( 'should create #formView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();

			expect( linkUIFeature.formView ).to.be.instanceOf( LinkFormView );
		} );

		it( 'should not throw if the UI is already visible', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();

			expect( () => {
				linkUIFeature._showUI();
			} ).to.not.throw();
		} );

		it( 'should add #formView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();
			formView = linkUIFeature.formView;

			const expectedRange = getMarkersRange( editor );

			expect( balloon.visibleView ).to.equal( formView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: formView,
				position: {
					target: sinon.match( isRange )
				}
			} );

			assertDomRange( expectedRange, balloonAddSpy.args[ 0 ][ 0 ].position.target );
		} );

		it( 'should add #formView to the balloon and attach the balloon to the marker element when selection is collapsed', () => {
			// (#7926)
			setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );
			linkUIFeature._showUI();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;

			const expectedRange = getMarkersRange( editor );

			expect( balloon.visibleView ).to.equal( formView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: formView,
				position: {
					target: sinon.match( isRange )
				}
			} );
			assertDomRange( expectedRange, balloonAddSpy.args[ 0 ][ 0 ].position.target );
		} );

		it( 'should add #toolbarView to the balloon and attach the balloon to the link element when collapsed selection is inside ' +
			'that link',
		() => {
			setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );
			const linkElement = editor.editing.view.getDomRoot().querySelector( 'a' );

			linkUIFeature._showUI();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;

			expect( balloon.visibleView ).to.equal( toolbarView );

			const addSpyCallArgs = balloonAddSpy.firstCall.args[ 0 ];

			expect( addSpyCallArgs.view ).to.equal( toolbarView );
			expect( addSpyCallArgs.position.target ).to.be.a( 'function' );
			expect( addSpyCallArgs.position.target() ).to.equal( linkElement );
		} );

		// #https://github.com/ckeditor/ckeditor5-link/issues/181
		it( 'should add #formView to the balloon when collapsed selection is inside the link and #toolbarView is already visible', () => {
			setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );
			const linkElement = editor.editing.view.getDomRoot().querySelector( 'a' );

			linkUIFeature._showUI();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;

			expect( balloon.visibleView ).to.equal( toolbarView );

			const addSpyFirstCallArgs = balloonAddSpy.firstCall.args[ 0 ];

			expect( addSpyFirstCallArgs.view ).to.equal( toolbarView );
			expect( addSpyFirstCallArgs.position.target ).to.be.a( 'function' );
			expect( addSpyFirstCallArgs.position.target() ).to.equal( linkElement );

			linkUIFeature._showUI();

			const addSpyCallSecondCallArgs = balloonAddSpy.secondCall.args[ 0 ];

			expect( addSpyCallSecondCallArgs.view ).to.equal( formView );
			expect( addSpyCallSecondCallArgs.position.target ).to.be.a( 'function' );
			expect( addSpyCallSecondCallArgs.position.target() ).to.equal( linkElement );
		} );

		it( 'should disable #formView and #toolbarView elements when link and unlink commands are disabled', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;

			const editButtonView = toolbarView.items.get( 2 );
			const unlinkButtonView = toolbarView.items.get( 3 );

			formView.urlInputView.fieldView.value = 'ckeditor.com';

			editor.commands.get( 'link' ).isEnabled = true;
			editor.commands.get( 'unlink' ).isEnabled = true;

			expect( formView.urlInputView.isEnabled ).to.be.true;
			expect( formView.urlInputView.fieldView.isReadOnly ).to.be.false;
			expect( formView.saveButtonView.isEnabled ).to.be.true;

			expect( unlinkButtonView.isEnabled ).to.be.true;
			expect( editButtonView.isEnabled ).to.be.true;

			editor.commands.get( 'link' ).isEnabled = false;
			editor.commands.get( 'unlink' ).isEnabled = false;

			expect( formView.urlInputView.isEnabled ).to.be.false;
			expect( formView.urlInputView.fieldView.isReadOnly ).to.be.true;
			expect( formView.saveButtonView.isEnabled ).to.be.false;

			expect( unlinkButtonView.isEnabled ).to.be.false;
			expect( editButtonView.isEnabled ).to.be.false;
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/78
		it( 'should make sure the URL input in the #formView always stays in sync with the value of the command (selected link)', () => {
			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;
			formView.render();

			setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

			// Open the link balloon.
			linkUIFeature._showUI();

			// Simulate clicking the "edit" button.
			toolbarView.items.get( 2 ).fire( 'execute' );

			// Change text in the URL field.
			formView.urlInputView.fieldView.element.value = 'to-be-discarded';

			// Cancel link editing.
			formView.fire( 'cancel' );

			// Open the editing panel again.
			toolbarView.items.get( 2 ).fire( 'execute' );

			// Expect original value in the URL field.
			expect( formView.urlInputView.fieldView.element.value ).to.equal( 'url' );

			// Expect "save" button to be enabled, despite not making any changes.
			expect( formView.saveButtonView.isEnabled ).to.equal( true );

			// Expect entire content of the URL field to be selected.
			const elem = formView.urlInputView.fieldView.element;
			expect( elem.value.substring( elem.selectionStart, elem.selectionEnd ) ).to.equal( 'url' );
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/123
		it( 'should make sure the URL input in the #formView always stays in sync with the value of the command (no link selected)', () => {
			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;
			formView.render();

			setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );

			linkUIFeature._showUI();
			expect( formView.urlInputView.fieldView.element.value ).to.equal( '' );
		} );

		it( 'should optionally force `main` stack to be visible', () => {
			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;
			formView.render();

			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			linkUIFeature._showUI( true );

			expect( balloon.visibleView ).to.equal( formView );
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/242.
		it( 'should update balloon position when is switched in rotator to a visible panel', () => {
			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;
			formView.render();

			setModelData( editor.model, '<paragraph>fo<$text linkHref="foo">o[] b</$text>ar</paragraph>' );
			linkUIFeature._showUI();

			const customView = new View();
			const linkViewElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 1 );
			const linkDomElement = editor.editing.view.domConverter.mapViewToDom( linkViewElement );

			expect( balloon.visibleView ).to.equal( toolbarView );
			expect( balloon.view.pin.lastCall.args[ 0 ].target() ).to.equal( linkDomElement );

			balloon.add( {
				stackId: 'custom',
				view: customView,
				position: { target: {} }
			} );

			balloon.showStack( 'custom' );

			expect( balloon.visibleView ).to.equal( customView );
			expect( balloon.hasView( toolbarView ) ).to.equal( true );

			editor.execute( 'blockQuote' );
			balloon.showStack( 'main' );

			expect( balloon.visibleView ).to.equal( toolbarView );
			expect( balloon.hasView( customView ) ).to.equal( true );
			expect( balloon.view.pin.lastCall.args[ 0 ].target() ).to.not.equal( linkDomElement );

			const newLinkViewElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 1 );
			const newLinkDomElement = editor.editing.view.domConverter.mapViewToDom( newLinkViewElement );

			expect( balloon.view.pin.lastCall.args[ 0 ].target() ).to.equal( newLinkDomElement );
		} );

		describe( 'form status', () => {
			it( 'should update ui on error due to change balloon position', () => {
				const updateSpy = sinon.spy( editor.ui, 'update' );

				linkUIFeature._createViews();
				formView = linkUIFeature.formView;
				toolbarView = linkUIFeature.toolbarView;
				formView.render();

				setModelData( editor.model, '<paragraph>[foo]</paragraph>' );

				linkUIFeature._showUI();

				expect( updateSpy ).not.to.be.called;
				formView.fire( 'submit' );
				expect( updateSpy ).to.be.calledOnce;
			} );

			it( 'should show error form status if passed empty link', () => {
				linkUIFeature._createViews();
				formView = linkUIFeature.formView;
				toolbarView = linkUIFeature.toolbarView;
				formView.render();

				setModelData( editor.model, '<paragraph>[foo]</paragraph>' );
				linkUIFeature._showUI();

				formView.fire( 'submit' );

				expect( formView.urlInputView.errorText ).to.be.equal( 'Link URL must not be empty.' );
			} );

			it( 'should reset error form status after filling empty link', () => {
				linkUIFeature._createViews();
				formView = linkUIFeature.formView;
				toolbarView = linkUIFeature.toolbarView;
				formView.render();

				setModelData( editor.model, '<paragraph>[foo]</paragraph>' );

				linkUIFeature._showUI();

				formView.fire( 'submit' );
				expect( formView.urlInputView.errorText ).to.be.equal( 'Link URL must not be empty.' );

				formView.urlInputView.fieldView.value = 'http://cksource.com';
				formView.fire( 'submit' );

				expect( formView.urlInputView.errorText ).to.be.null;
			} );

			it( 'should reset form status on show', () => {
				linkUIFeature._createViews();
				formView = linkUIFeature.formView;
				toolbarView = linkUIFeature.toolbarView;
				formView.render();

				setModelData( editor.model, '<paragraph>[foo]</paragraph>' );
				linkUIFeature._showUI();

				formView.fire( 'submit' );
				expect( formView.urlInputView.errorText ).to.be.equal( 'Link URL must not be empty.' );

				linkUIFeature._hideUI();
				linkUIFeature._showUI();
				expect( formView.urlInputView.errorText ).to.be.null;
			} );
		} );

		describe( 'response to ui#update', () => {
			let view, viewDocument;

			beforeEach( () => {
				view = editor.editing.view;
				viewDocument = view.document;
			} );

			it( 'should not duplicate #update listeners', () => {
				setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );

				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				linkUIFeature._showUI();
				editor.ui.fire( 'update' );
				linkUIFeature._hideUI();

				linkUIFeature._showUI();
				editor.ui.fire( 'update' );
				sinon.assert.calledTwice( spy );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'updates the position of the panel – editing a link, then the selection remains in the link', () => {
				setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

				linkUIFeature._showUI();
				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				expect( getViewData( view ) ).to.equal(
					'<p><a class="ck-link_selected" href="url">f{}oo</a></p>'
				);

				const root = viewDocument.getRoot();
				const linkElement = root.getChild( 0 ).getChild( 0 );
				const text = linkElement.getChild( 0 );

				// Move selection to foo[].
				view.change( writer => {
					writer.setSelection( text, 3, true );
				} );

				sinon.assert.calledOnce( spy );

				expect( spy.firstCall.args[ 0 ].target() ).to.equal( view.domConverter.mapViewToDom( linkElement ) );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'updates the position of the panel – creating a new link, then the selection moved', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				linkUIFeature._showUI();
				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 2 );

				view.change( writer => {
					writer.setSelection( text, 1, true );
				} );

				const expectedRange = getMarkersRange( editor );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, {
					target: sinon.match( isRange )
				} );

				assertDomRange( expectedRange, spy.args[ 0 ][ 0 ].target );
			} );

			it( 'not update the position when is in not visible stack', () => {
				linkUIFeature._createViews();
				formView = linkUIFeature.formView;
				toolbarView = linkUIFeature.toolbarView;
				formView.render();

				setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

				linkUIFeature._showUI();

				const customView = new View();

				balloon.add( {
					stackId: 'custom',
					view: customView,
					position: { target: {} }
				} );

				balloon.showStack( 'custom' );

				expect( balloon.visibleView ).to.equal( customView );
				expect( balloon.hasView( toolbarView ) ).to.equal( true );

				const spy = testUtils.sinon.spy( balloon, 'updatePosition' );

				editor.ui.fire( 'update' );

				sinon.assert.notCalled( spy );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'hides of the panel – editing a link, then the selection moved out of the link', () => {
				setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text>bar</paragraph>' );

				linkUIFeature._showUI();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 1 );

				// Move selection to b[]ar.
				view.change( writer => {
					writer.setSelection( text, 1, true );
				} );

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'hides the panel – editing a link, then the selection expands', () => {
				setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

				linkUIFeature._showUI();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

				expect( getViewData( view ) ).to.equal( '<p><a class="ck-link_selected" href="url">f{}oo</a></p>' );

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 0 ).getChild( 0 );

				// Move selection to f[o]o.
				view.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( text, 1 ),
						writer.createPositionAt( text, 2 )
					), true );
				} );

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'hides the panel – creating a new link, then the selection moved to another parent', () => {
				setModelData( editor.model, '<paragraph>f[]oo</paragraph><paragraph>bar</paragraph>' );

				linkUIFeature._showUI();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

				const root = viewDocument.getRoot();
				const text = root.getChild( 1 ).getChild( 0 );

				// Move selection to f[o]o.
				view.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( text, 1 ),
						writer.createPositionAt( text, 2 )
					), true );
				} );

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );
		} );

		describe( 'fake visual selection', () => {
			describe( 'non-collapsed', () => {
				it( 'should be displayed when a text fragment is selected', () => {
					setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const paragraph = editor.model.document.getRoot().getChild( 0 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( paragraph, 1 ),
						editor.model.createPositionAt( paragraph, 2 )
					);
					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal( '<p>f{<span class="ck-fake-link-selection">o</span>}o</p>' );
					expect( editor.getData() ).to.equal( '<p>foo</p>' );
				} );

				it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
					'of the empty block in the multiline selection', () => {
					setModelData( editor.model, '<paragraph>[</paragraph><paragraph>foo]</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const secondParagraph = editor.model.document.getRoot().getChild( 1 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( secondParagraph, 0 ),
						editor.model.createPositionAt( secondParagraph, 3 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal(
						'<p>[</p>' +
						'<p><span class="ck-fake-link-selection">foo</span>]</p>'
					);
					expect( editor.getData() ).to.equal( '<p>&nbsp;</p><p>foo</p>' );
				} );

				it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
					'of the first block in the multiline selection', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph><paragraph>bar]</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const secondParagraph = editor.model.document.getRoot().getChild( 1 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( secondParagraph, 0 ),
						editor.model.createPositionAt( secondParagraph, 3 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal(
						'<p>foo{</p>' +
						'<p><span class="ck-fake-link-selection">bar</span>]</p>'
					);
					expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
				} );

				it( 'should be displayed on first text node in non-empty element when selection contains few empty elements', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]baz</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const firstNonEmptyElementInTheSelection = editor.model.document.getRoot().getChild( 3 );
					const rangeEnd = editor.model.document.selection.getFirstRange().end;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( firstNonEmptyElementInTheSelection, 0 ),
						editor.model.createPositionAt( rangeEnd, 0 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p></p>' +
						'<p><span class="ck-fake-link-selection">bar</span></p>' +
						'<p></p>' +
						'<p></p>' +
						'<p>}baz</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal(
						'<p>foo</p>' +
						'<p>&nbsp;</p><p>&nbsp;</p>' +
						'<p>bar</p>' +
						'<p>&nbsp;</p><p>&nbsp;</p>' +
						'<p>baz</p>'
					);
				} );
			} );

			describe( 'collapsed', () => {
				it( 'should be displayed on a collapsed selection', () => {
					setModelData( editor.model, '<paragraph>f[]o</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const paragraph = editor.model.document.getRoot().getChild( 0 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( paragraph, 1 ),
						editor.model.createPositionAt( paragraph, 1 )
					);
					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal(
						'<p>f{}<span class="ck-fake-link-selection ck-fake-link-selection_collapsed"></span>o</p>'
					);
					expect( editor.getData() ).to.equal( '<p>fo</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains only one empty element ' +
					'(selection focus is at the beginning of the first non-empty element)', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]bar</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-link-selection ck-fake-link-selection_collapsed"></span>bar</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>bar</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains few empty elements ' +
					'(selection focus is at the beginning of the first non-empty element)', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]bar</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-link-selection ck-fake-link-selection_collapsed"></span>bar</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains few empty elements ' +
					'(selection focus is inside an empty element)', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]</paragraph>' +
						'<paragraph>bar</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-link-selection ck-fake-link-selection_collapsed"></span></p>' +
						'<p>bar</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
				} );
			} );
		} );

		function getMarkersRange( editor ) {
			const markerElements = editor.ui.view.element.querySelectorAll( '.ck-fake-link-selection' );
			const lastMarkerElement = markerElements[ markerElements.length - 1 ];

			const range = document.createRange();
			range.setStart( markerElements[ 0 ].parentElement, indexOf( markerElements[ 0 ] ) );
			range.setEnd( lastMarkerElement.parentElement, indexOf( lastMarkerElement ) + 1 );

			return range;
		}

		function assertDomRange( expected, actual ) {
			expect( actual, 'startContainer' ).to.have.property( 'startContainer', expected.startContainer );
			expect( actual, 'startOffset' ).to.have.property( 'startOffset', expected.startOffset );
			expect( actual, 'endContainer' ).to.have.property( 'endContainer', expected.endContainer );
			expect( actual, 'endOffset' ).to.have.property( 'endOffset', expected.endOffset );
		}
	} );

	describe( '_addToolbarView()', () => {
		beforeEach( () => {
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #toolbarView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._addToolbarView();

			expect( linkUIFeature.toolbarView ).to.be.instanceOf( ToolbarView );
		} );

		it( 'should add #toolbarView to the balloon and attach the balloon to the link element when collapsed selection is inside ' +
			'that link',
		() => {
			setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

			linkUIFeature._addToolbarView();
			toolbarView = linkUIFeature.toolbarView;

			expect( balloon.visibleView ).to.equal( toolbarView );
		} );
	} );

	describe( '_addFormView()', () => {
		beforeEach( () => {
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #formView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._addFormView();

			expect( linkUIFeature.formView ).to.be.instanceOf( LinkFormView );
		} );

		it( 'should add #formView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._addFormView();
			formView = linkUIFeature.formView;

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should implement the CSS transition disabling feature', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._addFormView();

			expect( linkUIFeature.formView.disableCssTransitions ).to.be.a( 'function' );
		} );
	} );

	describe( '_addPropertiesView()', () => {
		beforeEach( () => {
			editor.editing.view.document.isFocused = true;
			editor.commands.get( 'link' ).manualDecorators.add( new ManualDecorator( {
				id: 'linkIsBar',
				label: 'Bar',
				attributes: {
					target: '_blank'
				}
			} ) );
		} );

		it( 'should create #propertiesView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();

			expect( linkUIFeature.propertiesView ).to.be.instanceOf( LinkPropertiesView );
		} );

		it( 'should add #propertiesView to the balloon and attach the balloon', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._addPropertiesView();
			propertiesView = linkUIFeature.propertiesView;

			expect( balloon.visibleView ).to.equal( propertiesView );
		} );

		it( 'should not add #propertiesView to the balloon again when it is already added', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._addPropertiesView();
			propertiesView = linkUIFeature.propertiesView;

			const addSpy = sinon.spy( balloon, 'add' );

			linkUIFeature._addPropertiesView();

			expect( addSpy ).not.to.be.called;
			expect( balloon.visibleView ).to.equal( propertiesView );
		} );
	} );

	describe( '_createBookmarksView()', () => {
		beforeEach( () => {
			editor.editing.view.document.isFocused = true;
		} );

		describe( 'when Bookmark plugin is not loaded', () => {
			it( 'should not create #advancedView', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				linkUIFeature._showUI();

				expect( linkUIFeature.bookmarksView ).to.be.equal( null );
			} );
		} );
	} );

	describe( '_hideUI()', () => {
		beforeEach( () => {
			linkUIFeature._showUI();

			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;
		} );

		it( 'should remove the UI from the balloon', () => {
			expect( balloon.hasView( formView ) ).to.be.true;
			expect( balloon.hasView( toolbarView ) ).to.be.true;

			linkUIFeature._hideUI();

			expect( balloon.hasView( formView ) ).to.be.false;
			expect( balloon.hasView( toolbarView ) ).to.be.false;
		} );

		it( 'should focus the `editable` by default', () => {
			const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			linkUIFeature._hideUI();

			// First call is from _removeFormView.
			sinon.assert.calledTwice( spy );
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/193
		it( 'should focus the `editable` before before removing elements from the balloon', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const removeSpy = testUtils.sinon.spy( balloon, 'remove' );

			linkUIFeature._hideUI();

			expect( focusSpy.calledBefore( removeSpy ) ).to.equal( true );
		} );

		it( 'should not throw an error when views are not in the `balloon`', () => {
			linkUIFeature._hideUI();

			expect( () => {
				linkUIFeature._hideUI();
			} ).to.not.throw();
		} );

		it( 'should clear ui#update listener from the ViewDocument', () => {
			const spy = sinon.spy();

			linkUIFeature.listenTo( editor.ui, 'update', spy );
			linkUIFeature._hideUI();
			editor.ui.fire( 'update' );

			sinon.assert.notCalled( spy );
		} );

		it( 'should clear the fake visual selection from a selected text fragment', () => {
			expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

			linkUIFeature._hideUI();

			expect( editor.model.markers.has( 'link-ui' ) ).to.be.false;
		} );

		it( 'should not throw if selection includes soft break before text item', () => {
			linkUIFeature._hideUI();

			setModelData( editor.model, '<paragraph>[<softBreak></softBreak>fo]</paragraph>' );

			linkUIFeature._showUI();

			expect( () => {
				linkUIFeature._hideUI();
			} ).to.not.throw();
		} );
	} );

	describe( 'keyboard support', () => {
		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( linkUIFeature.formView ).to.be.null;
			expect( linkUIFeature.toolbarView ).to.be.null;

			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;

			formView.render();
		} );

		it( 'should show the UI on Ctrl+K keystroke', () => {
			const spy = testUtils.sinon.stub( linkUIFeature, '_showUI' ).returns( {} );

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );
			sinon.assert.calledWithExactly( spy, true );
		} );

		it( 'should not show the UI on Ctrl+K keystroke on content with LinkCommand disabled', () => {
			const spy = testUtils.sinon.stub( linkUIFeature, '_showUI' ).returns( {} );
			const command = editor.commands.get( 'link' );
			command.isEnabled = false;

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'should prevent default action on Ctrl+K keystroke', () => {
			const preventDefaultSpy = sinon.spy();
			const stopPropagationSpy = sinon.spy();

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: preventDefaultSpy,
				stopPropagation: stopPropagationSpy
			} );

			sinon.assert.calledOnce( preventDefaultSpy );
			sinon.assert.calledOnce( stopPropagationSpy );
		} );

		it( 'should make stack with link visible on Ctrl+K keystroke - no link', () => {
			const command = editor.commands.get( 'link' );

			command.isEnabled = true;

			balloon.add( {
				view: new View(),
				stackId: 'custom'
			} );

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should make stack with link visible on Ctrl+K keystroke - link', () => {
			setModelData( editor.model, '<paragraph><$text linkHref="foo.html">f[]oo</$text></paragraph>' );

			const customView = new View();

			balloon.add( {
				view: customView,
				stackId: 'custom'
			} );

			expect( balloon.visibleView ).to.equal( customView );

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( balloon.visibleView ).to.equal( toolbarView );

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should focus the the #toolbarView on `Tab` key press when #toolbarView is visible', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			const normalPriorityTabCallbackSpy = sinon.spy();
			const highestPriorityTabCallbackSpy = sinon.spy();
			editor.keystrokes.set( 'Tab', normalPriorityTabCallbackSpy );
			editor.keystrokes.set( 'Tab', highestPriorityTabCallbackSpy, { priority: 'highest' } );

			// Balloon is invisible, form not focused.
			toolbarView.focusTracker.isFocused = false;

			const spy = sinon.spy( toolbarView, 'focus' );

			editor.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( keyEvtData.preventDefault );
			sinon.assert.notCalled( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy );
			sinon.assert.calledOnce( normalPriorityTabCallbackSpy );
			sinon.assert.calledOnce( highestPriorityTabCallbackSpy );

			// Balloon is visible, form focused.
			linkUIFeature._showUI();
			testUtils.sinon.stub( linkUIFeature, '_isToolbarVisible' ).value( true );

			toolbarView.focusTracker.isFocused = true;

			editor.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( keyEvtData.preventDefault );
			sinon.assert.notCalled( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy );
			sinon.assert.calledTwice( normalPriorityTabCallbackSpy );
			sinon.assert.calledTwice( highestPriorityTabCallbackSpy );

			// Balloon is still visible, form not focused.
			toolbarView.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy );
			sinon.assert.calledTwice( normalPriorityTabCallbackSpy );
			sinon.assert.calledThrice( highestPriorityTabCallbackSpy );
		} );

		describe( 'toolbar cycling on Alt+F10', () => {
			let editor, editorElement;

			beforeEach( async () => {
				editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				editor = await ClassicEditor.create( editorElement, {
					plugins: [ Essentials, LinkEditing, LinkUI, Paragraph, BlockQuote ],
					toolbar: [ 'link' ]
				} );

				linkUIFeature = editor.plugins.get( LinkUI );
				linkButton = editor.ui.componentFactory.create( 'link' );
				balloon = editor.plugins.get( ContextualBalloon );
			} );

			afterEach( async () => {
				await editor.destroy();
				editorElement.remove();
			} );

			it( 'should focus the link toolbar on Alt+F10', () => {
				linkUIFeature._createViews();

				setModelData( editor.model, '<paragraph><$text linkHref="foo">b[]ar</$text></paragraph>' );
				editor.ui.focusTracker.isFocused = true;

				const focusSpy = sinon.spy( linkUIFeature.toolbarView, 'focus' );

				expect( linkUIFeature._isToolbarVisible ).to.be.false;
				pressAltF10();

				expect( linkUIFeature._isToolbarVisible ).to.be.true;
				sinon.assert.calledOnce( focusSpy );

				pressAltF10();
				expect( linkUIFeature._isToolbarVisible ).to.be.false;
				sinon.assert.calledOnce( focusSpy );
			} );

			function pressAltF10() {
				editor.keystrokes.press( {
					keyCode: keyCodes.f10,
					altKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				} );
			}
		} );

		it( 'should hide the UI after Esc key press (from editor) and not focus the editable', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			// Balloon is visible.
			linkUIFeature._showUI();
			editor.keystrokes.press( keyEvtData );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should not hide the UI after Esc key press (from editor) when UI is open but is not visible', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			const viewMock = {
				ready: true,
				render: () => {},
				destroy: () => {}
			};

			linkUIFeature._showUI();

			// Some view precedes the link UI in the balloon.
			balloon.add( { view: viewMock } );
			editor.keystrokes.press( keyEvtData );

			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'mouse support', () => {
		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( linkUIFeature.formView ).to.be.null;
			expect( linkUIFeature.toolbarView ).to.be.null;

			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;

			formView.render();
		} );

		it( 'should hide the UI and not focus editable upon clicking outside the UI', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

			linkUIFeature._showUI();
			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should hide the UI when link is in not currently visible stack', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			linkUIFeature._showUI();

			// Be sure any of link view is not currently visible/
			expect( balloon.visibleView ).to.not.equal( toolbarView );
			expect( balloon.visibleView ).to.not.equal( formView );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should not hide the UI upon clicking inside the the UI', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

			linkUIFeature._showUI();
			balloon.view.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( spy );
		} );

		describe( 'clicking on editable', () => {
			let observer, spy;

			beforeEach( () => {
				observer = editor.editing.view.getObserver( ClickObserver );
				editor.model.schema.extend( '$text', { allowIn: '$root' } );

				spy = testUtils.sinon.stub( linkUIFeature, '_showUI' ).returns( {} );
			} );

			it( 'should show the UI when collapsed selection is inside link element', () => {
				setModelData( editor.model, '<$text linkHref="url">fo[]o</$text>' );

				observer.fire( 'click', { target: document.body } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should show the UI when selection exclusively encloses a link element (#1)', () => {
				setModelData( editor.model, '[<$text linkHref="url">foo</$text>]' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should show the UI when selection exclusively encloses a link element (#2)', () => {
				setModelData( editor.model, '<$text linkHref="url">[foo]</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should show the UI when the selection spans over a link which only child is a widget', () => {
				editor.model.schema.register( 'inlineWidget', {
					allowWhere: '$text',
					isObject: true,
					isInline: true,
					allowAttributesOf: '$text'
				} );

				// The view element has no children.
				editor.conversion.for( 'downcast' )
					.elementToElement( {
						model: 'inlineWidget',
						view: ( modelItem, { writer } ) => toWidget(
							writer.createContainerElement( 'inlineWidget' ),
							writer,
							{ label: 'inline widget' }
						)
					} );

				setModelData( editor.model, '<paragraph>[<inlineWidget linkHref="url"></inlineWidget>]</paragraph>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should do nothing when selection is not inside link element', () => {
				setModelData( editor.model, '[]' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should do nothing when selection is non-collapsed and doesn\'t enclose a link element (#1)', () => {
				setModelData( editor.model, '<$text linkHref="url">f[o]o</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should do nothing when selection is non-collapsed and doesn\'t enclose a link element (#2)', () => {
				setModelData( editor.model, '<$text linkHref="url">[fo]o</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should do nothing when selection is non-collapsed and doesn\'t enclose a link element (#3)', () => {
				setModelData( editor.model, '<$text linkHref="url">f[oo]</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should do nothing when selection is non-collapsed and doesn\'t enclose a link element (#4)', () => {
				setModelData( editor.model, 'ba[r<$text linkHref="url">foo]</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should do nothing when selection is non-collapsed and doesn\'t enclose a link element (#5)', () => {
				setModelData( editor.model, 'ba[r<$text linkHref="url">foo</$text>]' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			// See: #9607.
			it( 'should show the UI when clicking on the linked inline widget', () => {
				editor.model.schema.register( 'inlineWidget', {
					allowWhere: '$text',
					isInline: true,
					isObject: true,
					allowAttributesOf: '$text'
				} );

				editor.conversion.for( 'downcast' ).elementToStructure( {
					model: 'inlineWidget',
					view: ( modelItem, { writer } ) => {
						const spanView = writer.createContainerElement( 'span' );

						const innerText = writer.createText( '{' + modelItem.name + '}' );
						writer.insert( writer.createPositionAt( spanView, 0 ), innerText );

						return toWidget( spanView, writer );
					}
				} );

				setModelData( editor.model, '<paragraph>Foo [<inlineWidget linkHref="foo"></inlineWidget>] Foo.</paragraph>' );

				observer.fire( 'click', { target: document.body } );
				sinon.assert.calledWithExactly( spy );
			} );
		} );
	} );

	describe( 'actions/toolbar view', () => {
		let focusEditableSpy;

		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( linkUIFeature.formView ).to.be.null;
			expect( linkUIFeature.toolbarView ).to.be.null;

			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;

			formView.render();

			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		it( 'should mark the editor UI as focused when the #toolbarView is focused', () => {
			linkUIFeature._showUI();
			linkUIFeature._removeFormView();

			expect( balloon.visibleView ).to.equal( toolbarView );

			editor.ui.focusTracker.isFocused = false;
			toolbarView.element.dispatchEvent( new Event( 'focus' ) );

			expect( editor.ui.focusTracker.isFocused ).to.be.true;
		} );

		describe( 'binding', () => {
			it( 'should show the #formView on edit button click and select the URL input field', () => {
				linkUIFeature._showUI();
				linkUIFeature._removeFormView();

				const selectSpy = testUtils.sinon.spy( formView.urlInputView.fieldView, 'select' );
				toolbarView.items.get( 2 ).fire( 'execute' );

				expect( balloon.visibleView ).to.equal( formView );
				sinon.assert.calledOnce( selectSpy );
			} );

			it( 'should disable CSS transitions before showing the form to avoid unnecessary animations' +
				'(and then enable them again)', () => {
				const addSpy = sinon.spy( balloon, 'add' );
				const disableCssTransitionsSpy = sinon.spy( formView, 'disableCssTransitions' );
				const enableCssTransitionsSpy = sinon.spy( formView, 'enableCssTransitions' );
				const selectSpy = sinon.spy( formView.urlInputView.fieldView, 'select' );

				toolbarView.items.get( 2 ).fire( 'execute' );

				sinon.assert.callOrder( disableCssTransitionsSpy, addSpy, selectSpy, enableCssTransitionsSpy );
			} );

			it( 'should execute unlink command on link edit button click', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				toolbarView.items.get( 3 ).fire( 'execute' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly( 'unlink' ) ).to.be.true;
			} );

			it( 'should hide and focus editable on unlink button click', () => {
				linkUIFeature._showUI();
				linkUIFeature._removeFormView();

				// Removing the form would call the focus spy.
				focusEditableSpy.resetHistory();
				toolbarView.items.get( 3 ).fire( 'execute' );

				expect( balloon.visibleView ).to.be.null;
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			it( 'should hide after Esc key press', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				linkUIFeature._showUI();
				linkUIFeature._removeFormView();

				// Removing the form would call the focus spy.
				focusEditableSpy.resetHistory();

				toolbarView.keystrokes.press( keyEvtData );
				expect( balloon.visibleView ).to.equal( null );
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			// #https://github.com/ckeditor/ckeditor5-link/issues/181
			it( 'should add the #formView upon Ctrl+K keystroke press', () => {
				const keyEvtData = {
					keyCode: keyCodes.k,
					ctrlKey: !env.isMac,
					metaKey: env.isMac,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				linkUIFeature._showUI();
				linkUIFeature._removeFormView();
				expect( balloon.visibleView ).to.equal( toolbarView );

				toolbarView.keystrokes.press( keyEvtData );
				expect( balloon.visibleView ).to.equal( formView );
			} );
		} );
	} );

	describe( 'link form view', () => {
		let focusEditableSpy;

		const createEditorWithLinkConfig = async link => {
			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ LinkEditing, LinkUI, Paragraph, BlockQuote ],
				link
			} );

			const linkUIFeature = editor.plugins.get( LinkUI );

			linkUIFeature._createViews();

			const formView = linkUIFeature.formView;

			formView.render();

			editor.model.schema.extend( '$text', {
				allowIn: '$root',
				allowAttributes: 'linkHref'
			} );

			return { editor, formView };
		};

		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( linkUIFeature.formView ).to.be.null;
			expect( linkUIFeature.toolbarView ).to.be.null;

			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			toolbarView = linkUIFeature.toolbarView;

			formView.render();

			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		it( 'should mark the editor UI as focused when the #formView is focused', () => {
			linkUIFeature._showUI();
			expect( balloon.visibleView ).to.equal( formView );

			editor.ui.focusTracker.isFocused = false;
			formView.element.dispatchEvent( new Event( 'focus' ) );

			expect( editor.ui.focusTracker.isFocused ).to.be.true;
		} );

		describe( 'empty links', () => {
			it( 'should not allow empty links by default', () => {
				const allowCreatingEmptyLinks = editor.config.get( 'link.allowCreatingEmptyLinks' );

				expect( allowCreatingEmptyLinks ).to.equal( false );
			} );

			it( 'should allow enabling empty links', async () => {
				const { editor } = await createEditorWithLinkConfig( { allowCreatingEmptyLinks: true } );
				const allowCreatingEmptyLinks = editor.config.get( 'link.allowCreatingEmptyLinks' );

				expect( allowCreatingEmptyLinks ).to.equal( true );

				return editor.destroy();
			} );

			it( 'should not allow submitting empty form when link is required', async () => {
				const { editor, formView } = await createEditorWithLinkConfig( { allowCreatingEmptyLinks: false } );
				const executeSpy = sinon.spy( editor, 'execute' );

				formView.urlInputView.fieldView.value = '';
				formView.fire( 'submit' );

				expect( executeSpy ).not.to.be.called;
				return editor.destroy();
			} );

			it( 'should allow submitting empty form when link is not required', async () => {
				const { editor, formView } = await createEditorWithLinkConfig( { allowCreatingEmptyLinks: true } );

				expect( formView.saveButtonView.isEnabled ).to.be.true;

				return editor.destroy();
			} );
		} );

		describe( 'link protocol', () => {
			it( 'should use a default link protocol from the `config.link.defaultProtocol` when provided', async () => {
				const editor = await ClassicTestEditor.create( editorElement, {
					link: {
						defaultProtocol: 'https://'
					}
				} );

				const defaultProtocol = editor.config.get( 'link.defaultProtocol' );

				expect( defaultProtocol ).to.equal( 'https://' );

				return editor.destroy();
			} );

			it( 'should not add a protocol without the configuration', () => {
				const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );

				formView.urlInputView.fieldView.value = 'ckeditor.com';
				formView.fire( 'submit' );

				sinon.assert.calledWith( linkCommandSpy, 'ckeditor.com', sinon.match.any );

				return editor.destroy();
			} );

			it( 'should not add a protocol to the local links even when `config.link.defaultProtocol` configured', async () => {
				const { editor, formView } = await createEditorWithLinkConfig( { defaultProtocol: 'http://' } );
				const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );

				formView.urlInputView.fieldView.value = '#test';
				formView.fire( 'submit' );

				sinon.assert.calledWith( linkCommandSpy, '#test', sinon.match.any );

				return editor.destroy();
			} );

			it( 'should not add a protocol to the relative links even when `config.link.defaultProtocol` configured', async () => {
				const { editor, formView } = await createEditorWithLinkConfig( { defaultProtocol: 'http://' } );
				const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );

				formView.urlInputView.fieldView.value = '/test.html';
				formView.fire( 'submit' );

				sinon.assert.calledWith( linkCommandSpy, '/test.html', sinon.match.any );

				return editor.destroy();
			} );

			it( 'should not add a protocol when given provided within the value ' +
				'even when `config.link.defaultProtocol` configured', async () => {
				const { editor, formView } = await createEditorWithLinkConfig( { defaultProtocol: 'http://' } );
				const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );

				formView.urlInputView.fieldView.value = 'http://example.com';
				formView.fire( 'submit' );

				sinon.assert.calledWith( linkCommandSpy, 'http://example.com', sinon.match.any );

				return editor.destroy();
			} );

			it( 'should use the "http://" protocol when it\'s configured', async () => {
				const { editor, formView } = await createEditorWithLinkConfig( { defaultProtocol: 'http://' } );
				const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );

				formView.urlInputView.fieldView.value = 'ckeditor.com';
				formView.fire( 'submit' );

				sinon.assert.calledWith( linkCommandSpy, 'http://ckeditor.com', sinon.match.any );

				return editor.destroy();
			} );

			it( 'should use the "http://" protocol when it\'s configured and form input value contains "www."', async () => {
				const { editor, formView } = await createEditorWithLinkConfig( { defaultProtocol: 'http://' } );
				const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );

				formView.urlInputView.fieldView.value = 'www.ckeditor.com';
				formView.fire( 'submit' );

				sinon.assert.calledWith( linkCommandSpy, 'http://www.ckeditor.com', sinon.match.any );

				return editor.destroy();
			} );

			it( 'should propagate the protocol to the link\'s `linkHref` attribute in model', async () => {
				const { editor, formView } = await createEditorWithLinkConfig( { defaultProtocol: 'http://' } );

				setModelData( editor.model, '[ckeditor.com]' );

				formView.urlInputView.fieldView.value = 'ckeditor.com';
				formView.fire( 'submit' );

				expect( getModelData( editor.model ) ).to.equal(
					'[<$text linkHref="http://ckeditor.com">ckeditor.com</$text>]'
				);

				return editor.destroy();
			} );

			it( 'should detect an email on submitting the form and add "mailto:" ' +
				'protocol automatically to the provided value', async () => {
				const { editor, formView } = await createEditorWithLinkConfig( { defaultProtocol: 'http://' } );

				setModelData( editor.model, '[email@example.com]' );

				formView.urlInputView.fieldView.value = 'email@example.com';
				formView.fire( 'submit' );

				expect( getModelData( editor.model ) ).to.equal(
					'[<$text linkHref="mailto:email@example.com">email@example.com</$text>]'
				);

				return editor.destroy();
			} );

			it( 'should detect an email on submitting the form and add "mailto:" protocol automatically to the provided value ' +
				'even when defaultProtocol is undefined', () => {
				setModelData( editor.model, '<paragraph>[email@example.com]</paragraph>' );

				formView.urlInputView.fieldView.value = 'email@example.com';
				formView.fire( 'submit' );

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>[<$text linkHref="mailto:email@example.com">email@example.com</$text>]</paragraph>'
				);
			} );

			it( 'should not add an email protocol when given provided within the value ' +
				'even when `config.link.defaultProtocol` configured', async () => {
				const { editor, formView } = await createEditorWithLinkConfig( { defaultProtocol: 'mailto:' } );
				const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );

				formView.urlInputView.fieldView.value = 'mailto:test@example.com';
				formView.fire( 'submit' );

				sinon.assert.calledWith( linkCommandSpy, 'mailto:test@example.com', sinon.match.any );

				return editor.destroy();
			} );
		} );

		describe( 'binding', () => {
			beforeEach( () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );
			} );

			it( 'should populate form on open on collapsed selection in text', () => {
				setModelData( editor.model, '<paragraph>fo[]o</paragraph>' );

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( '' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( '' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';
				formView.displayedTextInputView.fieldView.value = 'CKEditor 5';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'CKEditor 5' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://ckeditor.com',
					{},
					'CKEditor 5'
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>fo<$text linkHref="http://ckeditor.com">CKEditor 5</$text>[]o</paragraph>'
				);
			} );

			it( 'should populate form on open on collapsed selection in text (without providing displayed text)', () => {
				setModelData( editor.model, '<paragraph>fo[]o</paragraph>' );

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( '' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( '' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( '' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://ckeditor.com',
					{},
					undefined
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>fo<$text linkHref="http://ckeditor.com">http://ckeditor.com</$text>[]o</paragraph>'
				);
			} );

			it( 'should populate form on open on non-collapsed selection in text', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( '' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'o' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';
				formView.displayedTextInputView.fieldView.value = 'CKEditor 5';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'CKEditor 5' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://ckeditor.com',
					{},
					'CKEditor 5'
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>f[<$text linkHref="http://ckeditor.com">CKEditor 5</$text>]o</paragraph>'
				);
			} );

			it( 'should populate form on open on non-collapsed selection in text (without providing displayed text)', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( '' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'o' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'o' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://ckeditor.com',
					{},
					undefined
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>f[<$text linkHref="http://ckeditor.com">o</$text>]o</paragraph>'
				);
			} );

			it( 'should populate form on open on collapsed selection in link', () => {
				setModelData( editor.model, '<paragraph>fo<$text linkHref="abc">o[]b</$text>ar</paragraph>' );

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // ToolbarView
				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( 'abc' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'ob' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';
				formView.displayedTextInputView.fieldView.value = 'CKEditor 5';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'CKEditor 5' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://ckeditor.com',
					{},
					'CKEditor 5'
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>fo<$text linkHref="http://ckeditor.com">CKEditor 5</$text>[]ar</paragraph>'
				);
			} );

			it( 'should populate form on open on collapsed selection in link (without providing displayed text)', () => {
				setModelData( editor.model, '<paragraph>fo<$text linkHref="abc">o[]b</$text>ar</paragraph>' );

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // ToolbarView
				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( 'abc' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'ob' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'ob' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://ckeditor.com',
					{},
					undefined
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>fo<$text linkHref="http://ckeditor.com">o[]b</$text>ar</paragraph>'
				);
			} );

			it( 'should populate form on open on non-collapsed selection in link', () => {
				setModelData( editor.model, '<paragraph>fo<$text linkHref="abc">[ob]</$text>ar</paragraph>' );

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // ToolbarView
				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( 'abc' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'ob' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';
				formView.displayedTextInputView.fieldView.value = 'CKEditor 5';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'CKEditor 5' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://ckeditor.com',
					{},
					'CKEditor 5'
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>fo[<$text linkHref="http://ckeditor.com">CKEditor 5</$text>]ar</paragraph>'
				);
			} );

			it( 'should populate form on open on non-collapsed selection in link (without providing displayed text)', () => {
				setModelData( editor.model, '<paragraph>fo<$text linkHref="abc">[ob]</$text>ar</paragraph>' );

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // ToolbarView
				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( 'abc' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'ob' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'ob' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://ckeditor.com',
					{},
					undefined
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>fo[<$text linkHref="http://ckeditor.com">ob</$text>]ar</paragraph>'
				);
			} );

			it( 'should populate form on open on collapsed selection in link with text matching href', () => {
				setModelData( editor.model,
					'<paragraph>fo<$text linkHref="http://cksource.com">http://ck[]source.com</$text>ar</paragraph>'
				);

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // ToolbarView
				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://cksource.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'http://cksource.com' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'http://cksource.com' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://ckeditor.com',
					{},
					undefined
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>fo<$text linkHref="http://ckeditor.com">http://ckeditor.com</$text>[]ar</paragraph>'
				);
			} );

			it( 'should populate form on open on collapsed selection in link with text matching href but styled', () => {
				setModelData( editor.model,
					'<paragraph>' +
						'fo' +
						'<$text linkHref="http://cksource.com">htt[]p://</$text>' +
						'<$text linkHref="http://cksource.com" bold="true">cksource.com</$text>' +
						'ar' +
					'</paragraph>'
				);

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // ToolbarView
				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://cksource.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'http://cksource.com' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'http://cksource.com' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://ckeditor.com',
					{},
					undefined
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>fo' +
						'<$text linkHref="http://ckeditor.com">http://</$text>' +
						'<$text bold="true" linkHref="http://ckeditor.com">ckeditor.com</$text>' +
						'<$text bold="true">[]</$text>ar' +
					'</paragraph>'
				);
			} );

			it( 'should populate form on open on collapsed selection in link with text matching href but styled ' +
				'and update text', () => {
				setModelData( editor.model,
					'<paragraph>' +
						'fo' +
						'<$text linkHref="http://cksource.com">htt[]p://</$text>' +
						'<$text linkHref="http://cksource.com" bold="true">cksource.com</$text>' +
						'ar' +
					'</paragraph>'
				);

				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				linkUIFeature._showUI(); // ToolbarView
				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://cksource.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'http://cksource.com' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				formView.displayedTextInputView.fieldView.value = 'CKSource';

				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://cksource.com' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'CKSource' );

				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly(
					'link',
					'http://cksource.com',
					{},
					'CKSource'
				) ).to.be.true;

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>' +
						'fo<$text linkHref="http://cksource.com">CKS</$text>' +
						'<$text bold="true" linkHref="http://cksource.com">ource</$text>' +
						'<$text bold="true">[]</$text>ar' +
					'</paragraph>'
				);
			} );

			it( 'should disable displayed text field on multi block select', () => {
				setModelData( editor.model,
					'<paragraph>f[oo</paragraph>' +
					'<paragraph>ba]r</paragraph>'
				);

				linkUIFeature._showUI(); // ToolbarView
				linkUIFeature._showUI(); // FormView

				expect( formView.urlInputView.fieldView.value ).to.equal( '' );
				expect( formView.displayedTextInputView.fieldView.value ).to.equal( '' );
				expect( formView.displayedTextInputView.isEnabled ).to.be.false;
			} );

			it( 'should disable displayed text field if it can not be modified as a plain text', () => {
				linkUIFeature.selectedLinkableText = undefined;
				expect( formView.displayedTextInputView.isEnabled ).to.be.false;

				linkUIFeature.selectedLinkableText = '';
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				linkUIFeature.selectedLinkableText = 'foo';
				expect( formView.displayedTextInputView.isEnabled ).to.be.true;

				linkUIFeature.selectedLinkableText = undefined;
				expect( formView.displayedTextInputView.isEnabled ).to.be.false;
			} );

			it( 'should clear the fake visual selection on formView#submit event', () => {
				linkUIFeature._showUI();
				expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://cksource.com';
				formView.fire( 'submit' );

				expect( editor.model.markers.has( 'link-ui' ) ).to.be.false;
			} );

			it( 'should hide and reveal the #toolbarView on formView#submit event', () => {
				linkUIFeature._showUI();

				formView.urlInputView.fieldView.value = '/test.html';
				formView.fire( 'submit' );

				expect( balloon.visibleView ).to.equal( toolbarView );
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			it( 'should hide and reveal the #toolbarView on formView#cancel event if link command has a value', () => {
				linkUIFeature._showUI();

				const command = editor.commands.get( 'link' );
				command.value = 'http://foo.com';

				formView.fire( 'cancel' );

				expect( balloon.visibleView ).to.equal( toolbarView );
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			it( 'should hide the balloon on formView#cancel if link command does not have a value', () => {
				linkUIFeature._showUI();
				formView.fire( 'cancel' );

				expect( balloon.visibleView ).to.be.null;
			} );

			it( 'should hide and reveal the #toolbarView after Esc key press if link command has a value', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				linkUIFeature._showUI();

				const command = editor.commands.get( 'link' );
				command.value = 'http://foo.com';

				formView.keystrokes.press( keyEvtData );

				expect( balloon.visibleView ).to.equal( toolbarView );
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			it( 'should hide the balloon after Esc key press if link command does not have a value', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				linkUIFeature._showUI();

				formView.keystrokes.press( keyEvtData );

				expect( balloon.visibleView ).to.be.null;
			} );

			// https://github.com/ckeditor/ckeditor5/issues/1501
			it( 'should blur url input element before hiding the view', () => {
				linkUIFeature._showUI();

				const focusSpy = testUtils.sinon.spy( formView.saveButtonView, 'focus' );
				const removeSpy = testUtils.sinon.spy( balloon, 'remove' );

				formView.fire( 'cancel' );

				expect( focusSpy.calledBefore( removeSpy ) ).to.equal( true );
			} );

			describe( 'support manual decorators', () => {
				let editorElement, editor, model, formView, propertiesView, linkUIFeature;

				beforeEach( async () => {
					editorElement = document.createElement( 'div' );
					document.body.appendChild( editorElement );

					editor = await ClassicTestEditor.create( editorElement, {
						plugins: [ LinkEditing, LinkUI, Paragraph ],
						link: {
							decorators: {
								decorator1: {
									mode: 'manual',
									label: 'Foo',
									attributes: {
										foo: 'bar'
									}
								},
								decorator2: {
									mode: 'manual',
									label: 'Download',
									attributes: {
										download: 'download'
									},
									defaultValue: true
								},
								decorator3: {
									mode: 'manual',
									label: 'Multi',
									attributes: {
										class: 'fancy-class',
										target: '_blank',
										rel: 'noopener noreferrer'
									}
								}
							}
						}
					} );

					model = editor.model;

					model.schema.extend( '$text', {
						allowIn: '$root',
						allowAttributes: 'linkHref'
					} );

					linkUIFeature = editor.plugins.get( LinkUI );
					linkUIFeature._createViews();

					const balloon = editor.plugins.get( ContextualBalloon );

					formView = linkUIFeature.formView;
					propertiesView = linkUIFeature.propertiesView;

					// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
					testUtils.sinon.stub( balloon.view, 'attachTo' ).returns( {} );
					testUtils.sinon.stub( balloon.view, 'pin' ).returns( {} );

					formView.render();
					propertiesView.render();
				} );

				afterEach( () => {
					editorElement.remove();
					return editor.destroy();
				} );

				it( 'should gather information about manual decorators', () => {
					const executeSpy = testUtils.sinon.spy( editor, 'execute' );

					setModelData( model, 'f[<$text linkHref="url" linkDecorator1="true">ooba</$text>]r' );

					linkUIFeature._showUI( true ); // ToolbarView
					linkUIFeature._showUI( true ); // FormView

					expect( formView.urlInputView.fieldView.element.value ).to.equal( 'url' );
					expect( formView.displayedTextInputView.fieldView.value ).to.equal( 'ooba' );
					expect( linkUIFeature._getDecoratorSwitchesState() ).to.deep.equal( {
						linkDecorator1: true,
						linkDecorator2: false,
						linkDecorator3: false
					} );

					// Switch the first decorator on.
					linkUIFeature._createPropertiesView();
					propertiesView.listChildren.get( 1 ).fire( 'execute' );

					sinon.assert.calledOnce( executeSpy );
					sinon.assert.calledWithExactly(
						executeSpy,
						'link',
						'url',
						{
							linkDecorator1: true,
							linkDecorator2: true,
							linkDecorator3: false
						}
					);
				} );

				it( 'should keep switch state when form is closed', () => {
					setModelData( model, 'f[<$text linkHref="url" linkIsFoo="true">ooba</$text>]r' );

					linkUIFeature._createPropertiesView();

					const manualDecorators = editor.commands.get( 'link' ).manualDecorators;
					const firstDecoratorModel = manualDecorators.first;
					const firstDecoratorSwitch = propertiesView.listChildren.first;

					expect( firstDecoratorModel.value, 'Initial value should be read from the model (true)' ).to.be.undefined;
					expect( firstDecoratorSwitch.isOn, 'Initial value should be read from the model (true)' ).to.be.false;

					firstDecoratorSwitch.fire( 'execute' );

					expect( firstDecoratorModel.value, 'Pressing button toggles value' ).to.be.true;
					expect( firstDecoratorSwitch.isOn, 'Pressing button toggles value' ).to.be.true;

					linkUIFeature._closeFormView();

					expect( firstDecoratorModel.value ).to.be.true;
					expect( firstDecoratorSwitch.isOn ).to.be.true;
				} );

				it( 'switch buttons reflects state of manual decorators', () => {
					expect( linkUIFeature.propertiesView.listChildren.length ).to.equal( 3 );

					expect( linkUIFeature.propertiesView.listChildren.get( 0 ) ).to.deep.include( {
						label: 'Foo',
						isOn: false
					} );
					expect( linkUIFeature.propertiesView.listChildren.get( 1 ) ).to.deep.include( {
						label: 'Download',
						isOn: true
					} );
					expect( linkUIFeature.propertiesView.listChildren.get( 2 ) ).to.deep.include( {
						label: 'Multi',
						isOn: false
					} );
				} );

				it( 'reacts on switch button changes', () => {
					setModelData( model, 'f[<$text linkHref="url" linkDecorator1="true">ooba</$text>]r' );

					const linkCommand = editor.commands.get( 'link' );
					const modelItem = linkCommand.manualDecorators.first;
					const viewItem = linkUIFeature.propertiesView.listChildren.first;

					expect( modelItem.value ).to.be.true;
					expect( viewItem.isOn ).to.be.true;

					viewItem.element.dispatchEvent( new Event( 'click' ) );

					expect( modelItem.value ).to.be.undefined;
					expect( viewItem.isOn ).to.be.false;

					viewItem.element.dispatchEvent( new Event( 'click' ) );

					expect( modelItem.value ).to.be.true;
					expect( viewItem.isOn ).to.be.true;
				} );

				describe( '_getDecoratorSwitchesState()', () => {
					it( 'should provide object with decorators states', () => {
						setModelData( model, 'f[<$text linkHref="url" linkDecorator1="true">ooba</$text>]r' );

						expect( linkUIFeature._getDecoratorSwitchesState() ).to.deep.equal( {
							linkDecorator1: true,
							linkDecorator2: false,
							linkDecorator3: false
						} );

						linkUIFeature.propertiesView.listChildren.map( item => {
							item.element.dispatchEvent( new Event( 'click' ) );
						} );

						linkUIFeature.propertiesView.listChildren.get( 2 ).element.dispatchEvent( new Event( 'click' ) );

						expect( linkUIFeature._getDecoratorSwitchesState() ).to.deep.equal( {
							linkDecorator1: false,
							linkDecorator2: true,
							linkDecorator3: false
						} );
					} );

					it( 'should use decorator default value if command and decorator values are not set', () => {
						expect( linkUIFeature._getDecoratorSwitchesState() ).to.deep.equal( {
							linkDecorator1: false,
							linkDecorator2: true,
							linkDecorator3: false
						} );
					} );

					it( 'should use a decorator value if decorator value is set', () => {
						const linkCommand = editor.commands.get( 'link' );

						for ( const decorator of linkCommand.manualDecorators ) {
							decorator.value = true;
						}

						expect( linkUIFeature._getDecoratorSwitchesState() ).to.deep.equal( {
							linkDecorator1: true,
							linkDecorator2: true,
							linkDecorator3: true
						} );

						for ( const decorator of linkCommand.manualDecorators ) {
							decorator.value = false;
						}

						expect( linkUIFeature._getDecoratorSwitchesState() ).to.deep.equal( {
							linkDecorator1: false,
							linkDecorator2: false,
							linkDecorator3: false
						} );
					} );
					it( 'should use a decorator value if link command value is set', () => {
						const linkCommand = editor.commands.get( 'link' );

						linkCommand.value = '';

						expect( linkUIFeature._getDecoratorSwitchesState() ).to.deep.equal( {
							linkDecorator1: false,
							linkDecorator2: false,
							linkDecorator3: false
						} );

						for ( const decorator of linkCommand.manualDecorators ) {
							decorator.value = false;
						}

						expect( linkUIFeature._getDecoratorSwitchesState() ).to.deep.equal( {
							linkDecorator1: false,
							linkDecorator2: false,
							linkDecorator3: false
						} );

						for ( const decorator of linkCommand.manualDecorators ) {
							decorator.value = true;
						}

						expect( linkUIFeature._getDecoratorSwitchesState() ).to.deep.equal( {
							linkDecorator1: true,
							linkDecorator2: true,
							linkDecorator3: true
						} );
					} );
				} );
			} );
		} );
	} );

	describe( 'properties view', () => {
		beforeEach( () => {
			editor.commands.get( 'link' ).manualDecorators.add( new ManualDecorator( {
				id: 'linkIsBar',
				label: 'Bar',
				attributes: {
					target: '_blank'
				}
			} ) );
		} );

		it( 'can be closed by clicking the back button', () => {
			const spy = sinon.spy();

			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();
			linkUIFeature._addPropertiesView();

			expect( balloon.visibleView ).to.equal( linkUIFeature.propertiesView );

			linkUIFeature.listenTo( linkUIFeature.propertiesView, 'back', spy );

			const removeBalloonSpy = sinon.spy( balloon, 'remove' );
			linkUIFeature.propertiesView.backButtonView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
			expect( removeBalloonSpy ).to.be.calledWithExactly( linkUIFeature.propertiesView );
		} );

		it( 'can be closed by clicking the "esc" button', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();
			linkUIFeature._addPropertiesView();

			expect( balloon.visibleView ).to.equal( linkUIFeature.propertiesView );

			const removeBalloonSpy = sinon.spy( balloon, 'remove' );

			linkUIFeature.propertiesView.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( removeBalloonSpy ).to.be.calledWithExactly( linkUIFeature.propertiesView );
		} );
	} );
} );

describe( 'LinkUI with Bookmark', () => {
	let editor, linkUIFeature, balloon, editorElement, bookmarksView;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Essentials, LinkEditing, LinkUI, Paragraph, BlockQuote, Bookmark ]
		} );

		linkUIFeature = editor.plugins.get( LinkUI );
		balloon = editor.plugins.get( ContextualBalloon );

		// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
		testUtils.sinon.stub( balloon.view, 'attachTo' ).returns( {} );
		testUtils.sinon.stub( balloon.view, 'pin' ).returns( {} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should create #formView with bookmarks button', () => {
		setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

		linkUIFeature._showUI();

		const formView = linkUIFeature.formView;
		const button = formView
			.template.children[ 0 ]
			.last // ul
			.template.children[ 0 ]
			.get( 0 ) // li
			.template.children[ 0 ]
			.get( 0 ); // button

		expect( linkUIFeature.formView ).to.be.instanceOf( LinkFormView );
		expect( button ).to.be.instanceOf( LinkButtonView );

		expect( linkUIFeature._areBookmarksVisible ).to.be.false;

		button.fire( 'execute' );

		expect( linkUIFeature._areBookmarksVisible ).to.be.true;
	} );

	describe( '_createBookmarksView()', () => {
		it( 'should create #bookmarksView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();

			expect( linkUIFeature.bookmarksView ).to.be.instanceOf( LinkBookmarksView );
		} );
	} );

	describe( '_createBookmarksListView()', () => {
		describe( 'with bookmarks data', () => {
			let bookmarksView;

			beforeEach( () => {
				setModelData( editor.model,
					'<paragraph>f[o]o' +
						'<bookmark bookmarkId="zzz"></bookmark>' +
						'<bookmark bookmarkId="aaa"></bookmark>' +
						'<bookmark bookmarkId="ccc"></bookmark>' +
					'</paragraph>'
				);

				linkUIFeature._showUI();
				linkUIFeature._addBookmarksView();

				bookmarksView = linkUIFeature.bookmarksView;
			} );

			it( 'should create a sorted list of bookmarks buttons', () => {
				expect( bookmarksView.listChildren.length ).to.equal( 3 );

				expect( bookmarksView.listChildren.get( 0 ) ).is.instanceOf( ButtonView );
				expect( bookmarksView.listChildren.get( 1 ) ).is.instanceOf( ButtonView );
				expect( bookmarksView.listChildren.get( 2 ) ).is.instanceOf( ButtonView );

				expect( bookmarksView.listChildren.get( 0 ).icon ).to.equal( icons.bookmarkMedium );
				expect( bookmarksView.listChildren.get( 1 ).icon ).to.equal( icons.bookmarkMedium );
				expect( bookmarksView.listChildren.get( 2 ).icon ).to.equal( icons.bookmarkMedium );

				expect( bookmarksView.listChildren.get( 0 ).label ).to.equal( 'aaa' );
				expect( bookmarksView.listChildren.get( 1 ).label ).to.equal( 'ccc' );
				expect( bookmarksView.listChildren.get( 2 ).label ).to.equal( 'zzz' );
			} );

			it( 'should execute action after click the bookmark button', () => {
				// First button from the list with bookmark name 'aaa'.
				const bookmarkButton = bookmarksView.listChildren.get( 0 );
				const focusSpy = testUtils.sinon.spy( linkUIFeature.formView, 'focus' );

				bookmarkButton.fire( 'execute' );

				expect( linkUIFeature.formView.urlInputView.fieldView.value ).is.equal( '#aaa' );
				expect( linkUIFeature._balloon.visibleView ).to.be.equal( linkUIFeature.formView );
				expect( focusSpy.calledOnce ).to.be.true;
			} );

			it( 'should clear the error message that appears on first attempt of submit the form ' +
					'when next action is executed after clicking the bookmark button', () => {
				linkUIFeature._createViews();
				const formView = linkUIFeature.formView;
				formView.render();

				setModelData( editor.model, '<paragraph>[foo]</paragraph>' );
				linkUIFeature._showUI();

				formView.fire( 'submit' );

				expect( formView.urlInputView.errorText ).to.be.equal( 'Link URL must not be empty.' );
				// First button from the list with bookmark name 'aaa'.
				const bookmarkButton = bookmarksView.listChildren.get( 0 );
				const focusSpy = testUtils.sinon.spy( linkUIFeature.formView, 'focus' );

				bookmarkButton.fire( 'execute' );

				expect( linkUIFeature.formView.urlInputView.fieldView.value ).is.equal( '#aaa' );
				expect( linkUIFeature._balloon.visibleView ).to.be.equal( linkUIFeature.formView );
				expect( focusSpy.calledOnce ).to.be.true;

				expect( formView.urlInputView.errorText ).to.be.null;
			} );
		} );
	} );

	describe( 'bookmarks view', () => {
		it( 'can be opened by clicking the bookmarks button', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();

			const formView = linkUIFeature.formView;
			const button = formView
				.template.children[ 0 ]
				.last // ul
				.template.children[ 0 ]
				.get( 0 ) // li
				.template.children[ 0 ]
				.get( 0 ); // button

			button.fire( 'execute' );
			bookmarksView = linkUIFeature.bookmarksView;

			expect( balloon.visibleView ).to.equal( bookmarksView );
		} );

		it( 'can be closed by clicking the back button', () => {
			const spy = sinon.spy();

			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();
			linkUIFeature.listenTo( linkUIFeature.bookmarksView, 'cancel', spy );
			linkUIFeature._addBookmarksView();

			linkUIFeature.bookmarksView.backButtonView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
			expect( balloon.visibleView ).to.equal( linkUIFeature.formView );
		} );

		it( 'can be closed by clicking the "esc" button', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();
			linkUIFeature._addBookmarksView();

			linkUIFeature.bookmarksView.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( balloon.visibleView ).to.equal( linkUIFeature.formView );
		} );

		it( 'should hide the UI and not focus editable upon clicking outside the UI', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();
			linkUIFeature._addBookmarksView();

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledWithExactly( spy );
			expect( linkUIFeature._balloon.visibleView ).to.be.null;
		} );
	} );

	describe( 'the "linkPreview" toolbar button', () => {
		let button;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'linkPreview' );
		} );

		it( 'should be a LinkPreviewButtonView instance', () => {
			expect( button ).to.be.instanceOf( LinkPreviewButtonView );
		} );

		it( 'should bind "href" to link command value', () => {
			const linkCommand = editor.commands.get( 'link' );

			linkCommand.value = 'foo';
			expect( button.href ).to.equal( 'foo' );

			linkCommand.value = 'bar';
			expect( button.href ).to.equal( 'bar' );
		} );

		it( 'should not use unsafe href', () => {
			const linkCommand = editor.commands.get( 'link' );

			linkCommand.value = 'javascript:alert(1)';

			expect( button.href ).to.equal( '#' );
		} );

		it( 'should be enabled when command has a value', () => {
			const linkCommand = editor.commands.get( 'link' );

			linkCommand.value = null;
			expect( button.isEnabled ).to.be.false;

			linkCommand.value = 'foo';
			expect( button.isEnabled ).to.be.true;
		} );

		it( 'should use tooltip text depending on the command value', () => {
			const linkCommand = editor.commands.get( 'link' );
			const bookmarkEditing = editor.plugins.get( 'BookmarkEditing' );

			sinon.stub( bookmarkEditing, 'getElementForBookmarkId' ).callsFake( id => id === 'abc' );

			linkCommand.value = 'foo';
			expect( button.tooltip ).to.equal( 'Open link in new tab' );

			linkCommand.value = '#foo';
			expect( button.tooltip ).to.equal( 'Open link in new tab' );

			linkCommand.value = '#abc';
			expect( button.tooltip ).to.equal( 'Scroll to target' );
		} );

		it( 'should use icon for bookmarks', () => {
			const linkCommand = editor.commands.get( 'link' );
			const bookmarkEditing = editor.plugins.get( 'BookmarkEditing' );

			sinon.stub( bookmarkEditing, 'getElementForBookmarkId' ).callsFake( id => id === 'abc' );

			linkCommand.value = 'foo';
			expect( button.icon ).to.equal( undefined );

			linkCommand.value = '#foo';
			expect( button.icon ).to.equal( undefined );

			linkCommand.value = '#abc';
			expect( button.icon ).to.equal( icons.bookmarkSmall );
		} );

		it( 'should bind label', () => {
			const linkCommand = editor.commands.get( 'link' );
			const bookmarkEditing = editor.plugins.get( 'BookmarkEditing' );

			sinon.stub( bookmarkEditing, 'getElementForBookmarkId' ).callsFake( id => id === 'abc' );

			linkCommand.value = 'foo';
			expect( button.label ).to.equal( 'foo' );

			linkCommand.value = '#foo';
			expect( button.label ).to.equal( '#foo' );

			linkCommand.value = '#abc';
			expect( button.label ).to.equal( 'abc' );
		} );

		it( 'should trigger scroll if target is in the same document', () => {
			const cancelSpy = sinon.spy();
			const scrollStub = sinon.stub( editor.editing.view, 'scrollToTheSelection' );

			setModelData( editor.model, '<paragraph>[foo]<bookmark bookmarkId="abc"></bookmark></paragraph>' );

			button.fire( 'navigate', '#abc', cancelSpy );

			sinon.assert.calledOnce( cancelSpy );
			sinon.assert.calledOnce( scrollStub );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo[<bookmark bookmarkId="abc"></bookmark>]</paragraph>' );
		} );

		it( 'should not trigger scroll if target is not a known bookmark', () => {
			const cancelSpy = sinon.spy();
			const scrollStub = sinon.stub( editor.editing.view, 'scrollToTheSelection' );

			setModelData( editor.model, '<paragraph>[foo]<bookmark bookmarkId="abc"></bookmark></paragraph>' );

			button.fire( 'navigate', '#foo', cancelSpy );

			sinon.assert.notCalled( cancelSpy );
			sinon.assert.notCalled( scrollStub );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>[foo]<bookmark bookmarkId="abc"></bookmark></paragraph>' );
		} );
	} );
} );
