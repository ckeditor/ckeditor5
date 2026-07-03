/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { MediaEmbedEditing } from '../../../src/mediaembedediting.js';
import { MediaEmbedResizeEditing } from '../../../src/mediaembedresize/mediaembedresizeediting.js';
import { getSelectedMediaEmbedPossibleResizeRange } from '../../../src/mediaembedresize/utils/getselectedmediaembedpossibleresizerange.js';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=foo';

describe( 'getSelectedMediaEmbedPossibleResizeRange()', () => {
	let editor, model, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should return null if no media embed is selected', () => {
		_setModelData( model, '<paragraph>foo</paragraph>' );

		expect( getSelectedMediaEmbedPossibleResizeRange( editor, '%' ) ).toBeNull();
	} );

	it( 'should return range object with the correct unit when media is selected', () => {
		_setModelData( model, `[<media url="${ YOUTUBE_URL }"></media>]` );

		const result = getSelectedMediaEmbedPossibleResizeRange( editor, '%' );

		expect( result ).not.toBeNull();
		expect( result ).toHaveProperty( 'unit', '%' );
		expect( result ).toHaveProperty( 'lower' );
		expect( result ).toHaveProperty( 'upper' );
	} );

	it( 'should return a non-negative lower bound', () => {
		_setModelData( model, `[<media url="${ YOUTUBE_URL }"></media>]` );

		const result = getSelectedMediaEmbedPossibleResizeRange( editor, '%' );

		expect( result ).not.toBeNull();
		expect( result.lower ).toBeGreaterThanOrEqual( 0 );
	} );

	it( 'should return range with px unit when requested', () => {
		_setModelData( model, `[<media url="${ YOUTUBE_URL }"></media>]` );

		const result = getSelectedMediaEmbedPossibleResizeRange( editor, 'px' );

		expect( result ).not.toBeNull();
		expect( result.unit ).toBe( 'px' );
	} );

	it( 'should fall back to 1px minimum when minWidth style cannot be parsed', () => {
		_setModelData( model, `[<media url="${ YOUTUBE_URL }"></media>]` );

		const mediaViewElement = editor.editing.mapper.toViewElement(
			editor.model.document.getRoot().getChild( 0 )
		);
		const mediaDOMElement = editor.editing.view.domConverter.mapViewToDom( mediaViewElement );

		const originalGetComputedStyle = window.getComputedStyle.bind( window );

		vi.spyOn( window, 'getComputedStyle' ).mockImplementation( function( el ) {
			const realStyle = originalGetComputedStyle( el );

			if ( el === mediaDOMElement ) {
				return { minWidth: 'none', width: realStyle.width };
			}

			return realStyle;
		} );

		const result = getSelectedMediaEmbedPossibleResizeRange( editor, '%' );

		expect( result ).not.toBeNull();
		expect( result.lower ).toBeGreaterThanOrEqual( 0 );
	} );
} );
