/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ArticlePluginSet from '../_utils/articlepluginset.js';
import ClassicTestEditor from '../_utils/classictesteditor.js';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle.js';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';

import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';

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
