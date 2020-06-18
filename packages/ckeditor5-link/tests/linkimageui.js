/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import LinkImageUI from '../src/linkimageui';

describe( 'LinkImageUI', () => {
	let editor, viewDocument, editorElement;
	let plugin, linkButtonComponent, linkButton;

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
				linkButtonComponent = editor.ui.componentFactory.create( 'linkImage' );

				plugin = editor.plugins.get( 'LinkImageUI' );
				linkButton = plugin.linkButtonView;
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
			expect( linkButtonComponent ).to.be.instanceOf( ButtonView );
		} );

		describe( 'link button', () => {
			it( 'should have a toggleable button', () => {
				expect( linkButton.isToggleable ).to.be.true;
			} );

			it( 'should be bound to the link command', () => {
				const command = editor.commands.get( 'link' );

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
				const spy = testUtils.sinon.stub( editor.plugins.get( 'LinkUI' ), '_showUI' );

				linkButton.fire( 'execute' );
				sinon.assert.calledWithExactly( spy, true );
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
		it( 'should show plugin#actionsView after "execute" if image is already linked', () => {
			const linkUIPlugin = editor.plugins.get( 'LinkUI' );

			setModelData( editor.model, '[<image src="" linkHref="https://example.com"></image>]' );

			linkButton.fire( 'execute' );

			expect( linkUIPlugin._balloon.visibleView ).to.equals( linkUIPlugin.actionsView );
		} );

		it( 'should show plugin#formView after "execute" if image is not linked', () => {
			const linkUIPlugin = editor.plugins.get( 'LinkUI' );

			setModelData( editor.model, '[<image src=""></image>]' );

			linkButton.fire( 'execute' );

			expect( linkUIPlugin._balloon.visibleView ).to.equals( linkUIPlugin.formView );
		} );
	} );
} );

function fakeEventData() {
	return {
		preventDefault: sinon.spy()
	};
}
