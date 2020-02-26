/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Image from '../../../src/image';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import View from '@ckeditor/ckeditor5-ui/src/view';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { repositionContextualBalloon, getBalloonPositionData } from '../../../src/image/ui/utils';

describe( 'Utils', () => {
	let editor, editingView, balloon, editorElement;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Image, Paragraph, ContextualBalloon ]
			} )
			.then( newEditor => {
				editor = newEditor;
				editingView = editor.editing.view;
				balloon = editor.plugins.get( 'ContextualBalloon' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'repositionContextualBalloon', () => {
		it( 'should re-position the ContextualBalloon when the image is selected', () => {
			const spy = sinon.spy( balloon, 'updatePosition' );
			const defaultPositions = BalloonPanelView.defaultPositions;
			const view = new View();

			view.element = global.document.createElement( 'div' );

			balloon.add( {
				view,
				position: {
					target: global.document.body
				}
			} );

			setData( editor.model, '[<image src=""></image>]' );
			repositionContextualBalloon( editor );

			sinon.assert.calledWithExactly( spy, {
				target: editingView.domConverter.viewToDom( editingView.document.selection.getSelectedElement() ),
				positions: [
					defaultPositions.northArrowSouth,
					defaultPositions.northArrowSouthWest,
					defaultPositions.northArrowSouthEast,
					defaultPositions.southArrowNorth,
					defaultPositions.southArrowNorthWest,
					defaultPositions.southArrowNorthEast
				]
			} );
		} );

		it( 'should not engage with no image is selected', () => {
			const spy = sinon.spy( balloon, 'updatePosition' );

			setData( editor.model, '<paragraph>foo</paragraph>' );

			repositionContextualBalloon( editor );
			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'getBalloonPositionData', () => {
		it( 'returns the position data', () => {
			const defaultPositions = BalloonPanelView.defaultPositions;

			setData( editor.model, '[<image src=""></image>]' );
			const data = getBalloonPositionData( editor );

			expect( data ).to.deep.equal( {
				target: editingView.domConverter.viewToDom( editingView.document.selection.getSelectedElement() ),
				positions: [
					defaultPositions.northArrowSouth,
					defaultPositions.northArrowSouthWest,
					defaultPositions.northArrowSouthEast,
					defaultPositions.southArrowNorth,
					defaultPositions.southArrowNorthWest,
					defaultPositions.southArrowNorthEast
				]
			} );
		} );
	} );
} );
