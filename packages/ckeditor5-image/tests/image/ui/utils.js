/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Image } from '../../../src/image.js';
import { global } from '@ckeditor/ckeditor5-utils';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { View, ContextualBalloon, BalloonPanelView } from '@ckeditor/ckeditor5-ui';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { repositionContextualBalloon, getBalloonPositionData } from '../../../src/image/ui/utils.js';
import { ImageCaption } from '../../../src/imagecaption.js';

describe( 'Utils', () => {
	const defaultPositions = BalloonPanelView.defaultPositions;
	const positions = [
		defaultPositions.northArrowSouth,
		defaultPositions.northArrowSouthWest,
		defaultPositions.northArrowSouthEast,
		defaultPositions.southArrowNorth,
		defaultPositions.southArrowNorthWest,
		defaultPositions.southArrowNorthEast,
		defaultPositions.viewportStickyNorth
	];

	let editor, converter, selection, balloon, editorElement;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Image, Paragraph, ContextualBalloon, ImageCaption ]
			} )
			.then( newEditor => {
				editor = newEditor;
				converter = editor.editing.view.domConverter;
				selection = editor.editing.view.document.selection;
				balloon = editor.plugins.get( 'ContextualBalloon' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'repositionContextualBalloon', () => {
		it( 'should re-position the ContextualBalloon when the image is selected', () => {
			const spy = vi.spyOn( balloon, 'updatePosition' );
			const view = new View();

			view.element = global.document.createElement( 'div' );

			balloon.add( {
				view,
				position: {
					target: global.document.body
				}
			} );

			_setModelData( editor.model, '[<imageBlock src=""></imageBlock>]' );
			repositionContextualBalloon( editor );

			expect( spy ).toHaveBeenCalledWith( {
				target: converter.mapViewToDom( selection.getSelectedElement() ),
				positions
			} );
		} );

		it( 'should re-position the ContextualBalloon when the selection is inside a block image caption', () => {
			const spy = vi.spyOn( balloon, 'updatePosition' );
			const view = new View();

			view.element = global.document.createElement( 'div' );

			balloon.add( {
				view,
				position: {
					target: global.document.body
				}
			} );

			_setModelData( editor.model, '<imageBlock src=""><caption>[Foo]</caption></imageBlock>' );
			repositionContextualBalloon( editor );

			expect( spy ).toHaveBeenCalledWith( {
				target: converter.mapViewToDom( selection.getFirstPosition().parent.parent.parent ),
				positions
			} );
		} );

		it( 'should not engage with no image is selected', () => {
			const spy = vi.spyOn( balloon, 'updatePosition' );

			_setModelData( editor.model, '<paragraph>foo</paragraph>' );

			repositionContextualBalloon( editor );
			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'getBalloonPositionData', () => {
		it( 'returns the position data if selection is on an image', () => {
			_setModelData( editor.model, '[<imageBlock src=""></imageBlock>]' );
			const data = getBalloonPositionData( editor );

			expect( data ).toEqual( {
				target: converter.mapViewToDom( selection.getSelectedElement() ),
				positions
			} );
		} );

		it( 'returns the position data if selection is in a block image caption', () => {
			_setModelData( editor.model, '<imageBlock src=""><caption>Foo[]</caption></imageBlock>' );
			const data = getBalloonPositionData( editor );

			expect( data ).toEqual( {
				target: converter.mapViewToDom( selection.getFirstPosition().parent.parent.parent ),
				positions
			} );
		} );
	} );
} );
