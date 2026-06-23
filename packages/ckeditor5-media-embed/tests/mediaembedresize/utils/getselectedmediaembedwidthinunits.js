/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { MediaEmbedEditing } from '../../../src/mediaembedediting.js';
import { MediaEmbedResizeEditing } from '../../../src/mediaembedresize/mediaembedresizeediting.js';
import { getSelectedMediaEmbedWidthInUnits } from '../../../src/mediaembedresize/utils/getselectedmediaembedwidthinunits.js';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=foo';

describe( 'getSelectedMediaEmbedWidthInUnits()', () => {
	let editor, model;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should return null if no media embed is selected', () => {
		_setModelData( model, '<paragraph>foo</paragraph>' );

		expect( getSelectedMediaEmbedWidthInUnits( editor, '%' ) ).toBeNull();
	} );

	it( 'should return null if media embed has no resizedWidth attribute', () => {
		_setModelData( model, `[<media url="${ YOUTUBE_URL }"></media>]` );

		expect( getSelectedMediaEmbedWidthInUnits( editor, '%' ) ).toBeNull();
	} );

	it( 'should return the % value when unit matches', () => {
		_setModelData( model, `[<media resizedWidth="50%" url="${ YOUTUBE_URL }"></media>]` );

		const result = getSelectedMediaEmbedWidthInUnits( editor, '%' );

		expect( result ).toEqual( { value: 50, unit: '%' } );
	} );

	it( 'should return the px value when unit matches', () => {
		_setModelData( model, `[<media resizedWidth="200px" url="${ YOUTUBE_URL }"></media>]` );

		const result = getSelectedMediaEmbedWidthInUnits( editor, 'px' );

		expect( result ).toEqual( { value: 200, unit: 'px' } );
	} );
} );

describe( 'getSelectedMediaEmbedWidthInUnits() — unit conversion', () => {
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

	it( 'should convert px resizedWidth to % when targetUnit is %', () => {
		_setModelData( model, `[<media resizedWidth="200px" url="${ YOUTUBE_URL }"></media>]` );

		const result = getSelectedMediaEmbedWidthInUnits( editor, '%' );

		expect( result ).not.toBeNull();
		expect( result.unit ).toBe( '%' );
		expect( result.value ).toBeTypeOf( 'number' );
	} );
} );
