/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import LinkImage from '../src/linkimage.js';
import LinkImageUI from '../src/linkimageui.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';

describe( 'LinkImageUI', () => {
	let editor, viewDocument, editorElement;
	let plugin, linkButton;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image, LinkImageUI, LinkImage, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
				linkButton = editor.ui.componentFactory.create( 'linkImage' );

				plugin = editor.plugins.get( 'LinkImageUI' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named"', () => {
		expect( LinkImageUI.pluginName ).to.equal( 'LinkImageUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LinkImageUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LinkImageUI.isPremiumPlugin ).to.be.false;
	} );

	it( 'should require ImageBlockEditing by name', () => {
		expect( LinkImageUI.requires ).to.include( 'ImageBlockEditing' );
	} );

	describe( 'init()', () => {
		it( 'should listen to the click event on the images', () => {
			const listenToSpy = sinon.stub( plugin, 'listenTo' );

			listenToSpy( viewDocument, 'click' );

			viewDocument.fire( 'click', { domEvent: {} } );

			sinon.assert.calledOnce( listenToSpy );
		} );
	} );

	describe( 'link toolbar UI component', () => {
		it( 'should be registered', () => {
			expect( linkButton ).to.be.instanceOf( ButtonView );
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
		it( 'should prevent default behavior to prevent navigation if a block image has a link', () => {
			editor.setData( '<figure class="image"><a href="https://example.com"><img src="" /></a></figure>' );

			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot(), 'in' );
			} );

			const imageWidget = viewDocument.selection.getSelectedElement();
			const data = fakeEventData();
			const eventInfo = new EventInfo( imageWidget, 'click' );
			const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

			viewDocument.fire( 'click', domEventDataMock );

			expect( imageWidget.getChild( 0 ).name ).to.equal( 'a' );
			expect( data.preventDefault.called ).to.be.true;
		} );

		it( 'should prevent default behavior to prevent navigation if an inline image is wrapped in a link', () => {
			editor.setData( '<p><a href="https://example.com"><img src="" /></a></p>' );

			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'in' );
			} );

			const imageWidget = viewDocument.selection.getSelectedElement();
			const data = fakeEventData();
			const eventInfo = new EventInfo( imageWidget, 'click' );
			const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

			viewDocument.fire( 'click', domEventDataMock );

			expect( imageWidget.getChild( 0 ).name ).to.equal( 'img' );
			expect( data.preventDefault.called ).to.be.true;
		} );

		// See: #9607.
		describe( 'blocking the LinkUI plugin', () => {
			let linkUI;

			beforeEach( () => {
				linkUI = editor.plugins.get( 'LinkUI' );
			} );

			it( 'should not show the LinkUI when clicked the linked image', () => {
				const spy = sinon.stub( linkUI, '_showUI' ).returns( {} );

				editor.setData( '<figure class="image"><a href="https://example.com"><img src="" /></a></figure>' );

				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot(), 'in' );
				} );

				const imageWidget = viewDocument.selection.getSelectedElement();
				const data = fakeEventData();
				const eventInfo = new EventInfo( imageWidget, 'click' );
				const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

				viewDocument.fire( 'click', domEventDataMock );

				expect( editor.model.document.getRoot().getChild( 0 ).is( 'element', 'imageBlock' ) ).to.be.true;
				expect( spy.notCalled ).to.be.true;
			} );

			it( 'should not show the LinkUI when clicked the linked inline image', () => {
				const spy = sinon.stub( linkUI, '_showUI' ).returns( {} );

				editor.setData( '<p><a href="https://example.com"><img src="" /></a></p>' );

				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot(), 'in' );
				} );

				const imageWidget = viewDocument.selection.getSelectedElement();
				const data = fakeEventData();
				const eventInfo = new EventInfo( imageWidget, 'click' );
				const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

				viewDocument.fire( 'click', domEventDataMock );

				expect( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).is( 'element', 'imageInline' ) ).to.be.true;
				expect( spy.notCalled ).to.be.true;
			} );
		} );
	} );

	describe( 'event handling', () => {
		let root;

		beforeEach( () => {
			root = editor.model.document.getRoot();
		} );

		describe( 'when a block image is selected', () => {
			it( 'should show plugin#toolbarView after "execute" if an image is already linked', () => {
				const linkUIPlugin = editor.plugins.get( 'LinkUI' );

				editor.setData( '<figure class="image"><a href="https://example.com"><img src="" /></a></figure>' );

				editor.ui.focusTracker.isFocused = true;

				editor.model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 'on' );
				} );

				linkButton.fire( 'execute' );

				expect( linkUIPlugin._balloon.visibleView ).to.be.not.null;
				expect( linkUIPlugin._balloon.visibleView ).to.equals( linkUIPlugin.toolbarView );
			} );

			it( 'should show plugin#formView after "execute" if image is not linked', () => {
				const linkUIPlugin = editor.plugins.get( 'LinkUI' );

				editor.setData( '<figure class="image"><img src="" /></a>' );

				editor.model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 'on' );
				} );

				linkButton.fire( 'execute' );

				expect( linkUIPlugin._balloon.visibleView ).to.equals( linkUIPlugin.formView );
			} );
		} );

		describe( 'when an inline image is selected', () => {
			it( 'should show plugin#toolbarView after "execute" if an image is already linked', () => {
				const linkUIPlugin = editor.plugins.get( 'LinkUI' );

				editor.setData( '<p><a href="https://example.com"><img src="/assets/sample.png" /></a></p>' );

				editor.model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 'in' );
				} );

				linkButton.fire( 'execute' );

				expect( linkUIPlugin._balloon.visibleView ).to.equals( linkUIPlugin.toolbarView );
			} );

			it( 'should show plugin#formView after "execute" if image is not linked', () => {
				const linkUIPlugin = editor.plugins.get( 'LinkUI' );

				editor.setData( '<p><img src="" /></p>' );

				editor.model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 'in' );
				} );

				linkButton.fire( 'execute' );

				expect( linkUIPlugin._balloon.visibleView ).to.equals( linkUIPlugin.formView );
			} );
		} );
	} );
} );

function fakeEventData() {
	return {
		preventDefault: sinon.spy()
	};
}
