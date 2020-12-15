/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlEmbed from '../src/htmlembed';
import HtmlEmbedUI from '../src/htmlembedui';
import HtmlEmbedEditing from '../src/htmlembedediting';

describe( 'HtmlEmbed', () => {
	it( 'should require HtmlEmbedEditing and HtmlEmbedUI', () => {
		expect( HtmlEmbed.requires ).to.deep.equal( [ HtmlEmbedEditing, HtmlEmbedUI ] );
	} );

	it( 'should be named', () => {
		expect( HtmlEmbed.pluginName ).to.equal( 'HtmlEmbed' );
	} );
} );
