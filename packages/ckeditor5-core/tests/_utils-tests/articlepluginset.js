/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ArticlePluginSet } from '../_utils/articlepluginset.js';
import { ClassicTestEditor } from '../_utils/classictesteditor.js';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';

import { normalizeHtml } from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';

describe( 'ArticlePluginSet', () => {
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ArticlePluginSet ],
			image: {
				toolbar: [ 'imageStyle:block', 'imageStyle:side' ]
			}
		} );
	} );

	afterEach( async () => {
		await editor.destroy();

		editorElement.remove();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ArticlePluginSet ) ).toBeInstanceOf( ArticlePluginSet );
	} );

	it( 'should load all its dependencies', () => {
		expect( editor.plugins.get( Essentials ) ).toBeInstanceOf( Essentials );

		expect( editor.plugins.get( Autoformat ) ).toBeInstanceOf( Autoformat );
		expect( editor.plugins.get( Bold ) ).toBeInstanceOf( Bold );
		expect( editor.plugins.get( Heading ) ).toBeInstanceOf( Heading );
		expect( editor.plugins.get( Image ) ).toBeInstanceOf( Image );
		expect( editor.plugins.get( ImageCaption ) ).toBeInstanceOf( ImageCaption );
		expect( editor.plugins.get( ImageStyle ) ).toBeInstanceOf( ImageStyle );
		expect( editor.plugins.get( ImageToolbar ) ).toBeInstanceOf( ImageToolbar );
		expect( editor.plugins.get( Italic ) ).toBeInstanceOf( Italic );
		expect( editor.plugins.get( Link ) ).toBeInstanceOf( Link );
		expect( editor.plugins.get( List ) ).toBeInstanceOf( List );
		expect( editor.plugins.get( MediaEmbed ) ).toBeInstanceOf( MediaEmbed );
		expect( editor.plugins.get( Paragraph ) ).toBeInstanceOf( Paragraph );
		expect( editor.plugins.get( Table ) ).toBeInstanceOf( Table );
		expect( editor.plugins.get( TableToolbar ) ).toBeInstanceOf( TableToolbar );
	} );

	it( 'loads data', () => {
		const data =
			'<h2>Heading 1</h2>' +
			'<p>Paragraph</p>' +
			'<p><strong>Bold</strong> <i>Italic</i> <a href="foo">Link</a></p>' +
			'<ul>' +
				'<li>UL List item 1</li>' +
				'<li>UL List item 2</li>' +
			'</ul>' +
			'<ol>' +
				'<li>OL List item 1</li>' +
				'<li>OL List item 2</li>' +
			'</ol>' +
			'<figure class="image image-style-side">' +
				'<img alt="bar" src="/sample.png">' +
				'<figcaption>Caption</figcaption>' +
			'</figure>' +
			'<blockquote>' +
				'<p>Quote</p>' +
				'<ul><li>Quoted UL List item 1</li></ul>' +
			'</blockquote>' +
			'<figure class="table">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>a1</td>' +
							'<td>a2</td>' +
						'</tr>' +
						'<tr>' +
							'<td>b1</td>' +
							'<td>b2</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>';

		// Can't use data twice due to https://github.com/ckeditor/ckeditor5-utils/issues/128.
		const expectedOutput =
			'<h2>Heading 1</h2>' +
			'<p>Paragraph</p>' +
			'<p><strong>Bold</strong> <i>Italic</i> <a href="foo">Link</a></p>' +
			'<ul>' +
				'<li>UL List item 1</li>' +
				'<li>UL List item 2</li>' +
			'</ul>' +
			'<ol>' +
				'<li>OL List item 1</li>' +
				'<li>OL List item 2</li>' +
			'</ol>' +
			'<figure class="image image-style-side">' +
				'<img alt="bar" src="/sample.png"></img>' +
				'<figcaption>Caption</figcaption>' +
			'</figure>' +
			'<blockquote>' +
				'<p>Quote</p>' +
				'<ul><li>Quoted UL List item 1</li></ul>' +
			'</blockquote>' +
			'<figure class="table">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>a1</td>' +
							'<td>a2</td>' +
						'</tr>' +
						'<tr>' +
							'<td>b1</td>' +
							'<td>b2</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>';

		editor.setData( data );

		expect( normalizeHtml( editor.getData() ) ).toBe( expectedOutput );
	} );
} );
