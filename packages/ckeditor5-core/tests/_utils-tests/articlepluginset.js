/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ArticlePluginSet from '../_utils/articlepluginset';
import ClassicTestEditor from '../_utils/classictesteditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';

describe( 'ArticlePluginSet', () => {
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ArticlePluginSet ],
			image: {
				toolbar: [ 'imageStyle:full', 'imageStyle:side' ]
			}
		} );
	} );

	afterEach( async () => {
		await editor.destroy();

		editorElement.remove();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ArticlePluginSet ) ).to.be.instanceOf( ArticlePluginSet );
	} );

	it( 'should load all its dependencies', () => {
		expect( editor.plugins.get( Essentials ) ).to.be.instanceOf( Essentials );

		expect( editor.plugins.get( Autoformat ) ).to.be.instanceOf( Autoformat );
		expect( editor.plugins.get( Bold ) ).to.be.instanceOf( Bold );
		expect( editor.plugins.get( Heading ) ).to.be.instanceOf( Heading );
		expect( editor.plugins.get( Image ) ).to.be.instanceOf( Image );
		expect( editor.plugins.get( ImageCaption ) ).to.be.instanceOf( ImageCaption );
		expect( editor.plugins.get( ImageStyle ) ).to.be.instanceOf( ImageStyle );
		expect( editor.plugins.get( ImageToolbar ) ).to.be.instanceOf( ImageToolbar );
		expect( editor.plugins.get( Italic ) ).to.be.instanceOf( Italic );
		expect( editor.plugins.get( Link ) ).to.be.instanceOf( Link );
		expect( editor.plugins.get( List ) ).to.be.instanceOf( List );
		expect( editor.plugins.get( MediaEmbed ) ).to.be.instanceOf( MediaEmbed );
		expect( editor.plugins.get( Paragraph ) ).to.be.instanceOf( Paragraph );
		expect( editor.plugins.get( Table ) ).to.be.instanceOf( Table );
		expect( editor.plugins.get( TableToolbar ) ).to.be.instanceOf( TableToolbar );
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
				'<img alt="bar" src="/assets/sample.png">' +
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
				'<img alt="bar" src="/assets/sample.png"></img>' +
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

		expect( normalizeHtml( editor.getData() ) ).to.equal( expectedOutput );
	} );
} );
