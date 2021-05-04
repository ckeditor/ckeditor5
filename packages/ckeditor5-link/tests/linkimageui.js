/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import LinkImage from '../src/linkimage';
import LinkImageUI from '../src/linkimageui';
import Image from '@ckeditor/ckeditor5-image/src/image';

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

	it( 'should require ImageBlockEditing by name', () => {
		expect( LinkImageUI.requires ).to.include( 'ImageBlockEditing' );
	} );

	describe( 'init()', () => {
		it( 'should listen to the click event on the images', () => {
			const listenToSpy = sinon.stub( plugin, 'listenTo' );

			listenToSpy( viewDocument, 'click' );

			viewDocument.fire( 'click' );

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

			it( 'should disable the LinkUI plugin when clicked the linked image', () => {
				editor.setData( '<figure class="image"><a href="https://example.com"><img src="" /></a></figure>' );

				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot(), 'in' );
				} );

				const imageWidget = viewDocument.selection.getSelectedElement();
				const data = fakeEventData();
				const eventInfo = new EventInfo( imageWidget, 'click' );
				const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

				viewDocument.fire( 'click', domEventDataMock );

				expect( linkUI.isEnabled ).to.equal( false );
			} );

			it( 'should disable the LinkUI plugin when clicked the linked inline image', () => {
				editor.setData( '<p><a href="https://example.com"><img src="" /></a></p>' );

				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot(), 'in' );
				} );

				const imageWidget = viewDocument.selection.getSelectedElement();
				const data = fakeEventData();
				const eventInfo = new EventInfo( imageWidget, 'click' );
				const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

				viewDocument.fire( 'click', domEventDataMock );

				expect( linkUI.isEnabled ).to.equal( false );
			} );

			it( 'should enable the LinkUI plugin when clicked other element', () => {
				editor.setData( '<figure class="image"><a href="https://example.com"><img src="" /></a></figure><p>Foo.</p>' );

				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'on' );
				} );

				const imageWidget = viewDocument.selection.getSelectedElement();
				const imageData = fakeEventData();
				const imageEventInfo = new EventInfo( imageWidget, 'click' );
				const imageDomEventDataMock = new DomEventData( viewDocument, imageEventInfo, imageData );

				// Click the image first.
				viewDocument.fire( 'click', imageDomEventDataMock );

				expect( linkUI.isEnabled ).to.equal( false );

				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 'in' );
				} );

				const paragraphElement = viewDocument.selection.getSelectedElement();
				const paragraphData = fakeEventData();
				const paragraphEventInfo = new EventInfo( paragraphElement, 'click' );
				const paragraphDomEventDataMock = new DomEventData( viewDocument, paragraphEventInfo, paragraphData );

				// Then, click the paragraph.
				viewDocument.fire( 'click', paragraphDomEventDataMock );

				expect( linkUI.isEnabled ).to.equal( true );
			} );
		} );
	} );

	describe( 'event handling', () => {
		let root;

		beforeEach( () => {
			root = editor.model.document.getRoot();
		} );

		describe( 'when a block image is selected', () => {
			it( 'should show plugin#actionsView after "execute" if an image is already linked', () => {
				const linkUIPlugin = editor.plugins.get( 'LinkUI' );

				editor.setData( '<figure class="image"><a href="https://example.com"><img src="" /></a></figure>' );

				editor.model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 'on' );
				} );

				linkButton.fire( 'execute' );

				expect( linkUIPlugin._balloon.visibleView ).to.equals( linkUIPlugin.actionsView );
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
			it( 'should show plugin#actionsView after "execute" if an image is already linked', () => {
				const linkUIPlugin = editor.plugins.get( 'LinkUI' );

				editor.setData( '<p><a href="https://example.com"><img src="sample.jpg" /></a></p>' );

				editor.model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 'in' );
				} );

				linkButton.fire( 'execute' );

				expect( linkUIPlugin._balloon.visibleView ).to.equals( linkUIPlugin.actionsView );
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
