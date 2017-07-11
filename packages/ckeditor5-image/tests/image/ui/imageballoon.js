/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Image from '../../../src/image';
import ImageBalloon from '../../../src/image/ui/imageballoon';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

testUtils.createSinonSandbox();

describe( 'ImageBalloon', () => {
	let editor, doc, editingView, plugin, view, editorElement;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, {
			plugins: [ Image, ImageBalloon, Paragraph ],
		} )
		.then( newEditor => {
			editor = newEditor;
			doc = editor.document;
			editingView = editor.editing.view;
			plugin = editor.plugins.get( ImageBalloon );

			view = new View();
			view.template = new Template( { tag: 'div' } );
			view.init();
		} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'has proper plugin name', () => {
		expect( ImageBalloon.pluginName ).to.equal( 'ImageBalloon' );
	} );

	describe( 'add()', () => {
		it( 'uses default position configuration if not specified', () => {
			const spy = testUtils.sinon.stub( ContextualBalloon.prototype, 'add' );
			const positionData = {};

			setData( doc, '[<image src=""></image>]' );

			plugin.add( positionData );
			sinon.assert.calledWithExactly( spy, {
				position: {
					target: editingView.domConverter.viewToDom( editingView.selection.getSelectedElement() ),
					positions: [
						BalloonPanelView.defaultPositions.northArrowSouth,
						BalloonPanelView.defaultPositions.southArrowNorth
					]
				}
			} );

			expect( positionData.position ).to.be.undefined;
		} );

		it( 'uses specified position configuration', () => {
			const spy = testUtils.sinon.stub( ContextualBalloon.prototype, 'add' );
			const positionData = {
				position: {}
			};

			setData( doc, '[<image src=""></image>]' );

			plugin.add( positionData );
			sinon.assert.calledWithExactly( spy, {
				position: {}
			} );
		} );
	} );

	describe( 'editing view #render event handling', () => {
		let updatePositionSpy;

		beforeEach( () => {
			updatePositionSpy = testUtils.sinon.stub( ContextualBalloon.prototype, 'updatePosition', () => {} );
		} );

		it( 'does not engage if there is no #visibleView', () => {
			setData( doc, '[<image src=""></image>]' );

			editingView.fire( 'render' );
			sinon.assert.notCalled( updatePositionSpy );
		} );

		it( 'does not engage if there is no image selected', () => {
			setData( doc, '<paragraph>foo</paragraph>[<image src=""></image>]' );
			plugin.add( { view } );

			doc.enqueueChanges( () => {
				// Select the [<paragraph></paragraph>]
				doc.selection.setRanges( [
					Range.createIn( doc.getRoot().getChild( 0 ) )
				] );
			} );

			editingView.fire( 'render' );
			sinon.assert.notCalled( updatePositionSpy );
		} );

		it( 'updates balloon position when the image is selected', () => {
			setData( doc, '[<image src=""></image>]' );
			plugin.add( { view } );

			editingView.fire( 'render' );
			sinon.assert.calledOnce( updatePositionSpy );
		} );
	} );

	describe( 'editor focus handling', () => {
		it( 'clears the balloon if the editor focus is lost', () => {
			const spy = testUtils.sinon.spy( plugin, 'clear' );

			editor.ui.focusTracker.isFocused = true;
			sinon.assert.notCalled( spy );

			editor.ui.focusTracker.isFocused = false;
			sinon.assert.calledOnce( spy );

			editor.ui.focusTracker.isFocused = true;
			sinon.assert.calledOnce( spy );
		} );
	} );
} );
