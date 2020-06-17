/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import LinkImageUI from '../src/linkimageui';
import LinkUI from '../src/linkui';
import LinkCommand from '../src/linkcommand';
import View from '@ckeditor/ckeditor5-ui/src/view';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

describe( 'LinkImageUI', () => {
	let editor, viewDocument, editorElement;
	let linkImageComponent, linkButton, actionsView;
	let plugin;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ LinkImageUI, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
				linkImageComponent = editor.ui.componentFactory.create( 'linkImage' );

				plugin = editor.plugins.get( 'LinkImageUI' );

				linkButton = plugin.linkButtonView;
				actionsView = plugin.actionsView;

				linkButton.render();
				actionsView.render();
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named"', () => {
		expect( LinkImageUI.pluginName ).to.equal( 'LinkImageUI' );
	} );

	describe( 'init()', () => {
		it( 'should create #_linkUIPlugin instance of LinkUI', () => {
			expect( plugin._linkUIPlugin ).to.be.instanceOf( LinkUI );
		} );

		it( 'should create #_linkCommand instance of LinkCommand', () => {
			expect( plugin._linkCommand ).to.be.instanceOf( LinkCommand );
		} );

		it( 'should listen to the click event on the images', () => {
			const linkPlugin = editor.plugins.get( 'LinkUI' );
			const listenToSpy = sinon.stub( linkPlugin, 'listenTo' );

			listenToSpy( viewDocument, 'click' );

			viewDocument.fire( 'click' );

			sinon.assert.calledOnce( listenToSpy );
		} );
	} );

	describe( 'link toolbar UI component', () => {
		it( 'should be registered', () => {
			expect( linkImageComponent ).to.be.instanceOf( View );
		} );

		it( 'should have "ck-link-image-options" class', () => {
			linkImageComponent.render();

			expect( linkImageComponent.element.classList.contains( 'ck-link-image-options' ) ).to.be.true;
		} );

		it( 'should contain #linkButton and #actionsView', () => {
			expect( linkImageComponent.template.children.length ).to.equal( 2 );

			expect( linkImageComponent.template.children[ 0 ] ).to.be.instanceOf( ButtonView );
			expect( linkImageComponent.template.children[ 0 ] ).equals( linkButton );

			expect( linkImageComponent.template.children[ 1 ] ).to.be.instanceOf( View );
			expect( linkImageComponent.template.children[ 1 ] ).equals( actionsView );
		} );

		describe( 'link button', () => {
			it( 'should have a toggleable button', () => {
				expect( linkButton.isToggleable ).to.be.true;
			} );

			it( 'should be bound to the link command', () => {
				const command = plugin._linkCommand;

				command.isEnabled = true;
				command.value = 'http://ckeditor.com';

				expect( linkButton.isOn ).to.be.true;
				expect( linkButton.isEnabled ).to.be.true;

				command.isEnabled = false;
				command.value = undefined;

				expect( linkButton.isOn ).to.be.false;
				expect( linkButton.isEnabled ).to.be.false;
			} );

			it( 'should call #_showUI upon #execute', () => {
				const spy = testUtils.sinon.stub( plugin._linkUIPlugin, '_showUI' );

				linkButton.fire( 'execute' );
				sinon.assert.calledWithExactly( spy, true );
			} );
		} );

		describe( 'actions view', () => {
			it( 'should bound "ck-hidden" class to the "isVisible" state', () => {
				actionsView.isVisible = true;
				expect( actionsView.element.classList.contains( 'ck-hidden' ) ).to.be.false;

				actionsView.isVisible = false;
				expect( actionsView.element.classList.contains( 'ck-hidden' ) ).to.be.true;
			} );
		} );
	} );

	describe( 'click', () => {
		it( 'should prevent default behavior if image has "linkHref" attribute', () => {
			setModelData( editor.model, '[<image src="" linkHref="https://example.com"></image>]' );

			const img = editor.model.document.selection.getSelectedElement();
			const data = fakeEventData();
			const eventInfo = new EventInfo( img, 'click' );
			const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

			viewDocument.fire( 'click', domEventDataMock );

			expect( data.preventDefault.called ).to.be.true;
			expect( eventInfo.source.name ).to.equal( 'image' );
		} );
	} );

	describe( '#_isImageLinked', () => {
		it( 'should return "true" when selected link has "linkHref" attribute', () => {
			setModelData( editor.model, '[<image src="" linkHref="https://example.com"></image>]' );

			const img = editor.model.document.selection.getSelectedElement();
			const spy = sinon.spy( plugin, '_isImageLinked' );

			expect( spy( img ) ).to.be.true;
		} );

		it( 'should return "false" when selected link hasn\'t "linkHref" attribute', () => {
			setModelData( editor.model, '[<image src=""></image>]' );

			const img = editor.model.document.selection.getSelectedElement();
			const spy = sinon.spy( plugin, '_isImageLinked' );

			expect( spy( img ) ).to.be.false;
		} );

		it( 'should return "false" when selected element isn\'t an image', () => {
			setModelData( editor.model, '<paragraph>foo</paragraph>' );

			const el = editor.model.document.getRoot().getChild( 0 );
			const spy = sinon.spy( plugin, '_isImageLinked' );

			expect( spy( el ) ).to.be.false;
			expect( el.name ).to.not.equal( 'image' );
		} );
	} );

	describe( 'event handling', () => {
		it( 'should show #actionsView after "submit"', () => {
			const linkUIPlugin = editor.plugins.get( 'LinkUI' );

			linkUIPlugin.formView.fire( 'submit' );

			expect( linkButton.isVisible ).to.be.false;
			expect( actionsView.isVisible ).to.be.true;
		} );

		it( 'should show #actionsView after "cancel"', () => {
			const linkUIPlugin = editor.plugins.get( 'LinkUI' );

			linkUIPlugin.formView.fire( 'cancel' );

			expect( linkButton.isVisible ).to.be.false;
			expect( actionsView.isVisible ).to.be.true;
		} );

		it( 'should show #linkButton after "unlink"', () => {
			actionsView.fire( 'unlink' );

			expect( linkButton.isVisible ).to.be.true;
			expect( actionsView.isVisible ).to.be.false;
		} );
	} );
} );

function fakeEventData() {
	return {
		preventDefault: sinon.spy()
	};
}
