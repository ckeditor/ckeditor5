/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlEmbed from '../src/htmlembed.js';
import HtmlEmbedUI from '../src/htmlembedui.js';
import HtmlEmbedEditing from '../src/htmlembedediting.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';

describe( 'HtmlEmbed', () => {
	it( 'should require HtmlEmbedEditing, HtmlEmbedUI and Widget', () => {
		expect( HtmlEmbed.requires ).to.deep.equal( [ HtmlEmbedEditing, HtmlEmbedUI, Widget ] );
	} );

	it( 'should be named', () => {
		expect( HtmlEmbed.pluginName ).to.equal( 'HtmlEmbed' );
	} );
} );
