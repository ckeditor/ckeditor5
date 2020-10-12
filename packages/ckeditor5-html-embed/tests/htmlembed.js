/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HTMLEmbed from '../src/htmlembed';
import HTMLEmbedUI from '../src/htmlembedui';
import HTMLEmbedEditing from '../src/htmlembedediting';

describe( 'HTMLEMbed', () => {
	it( 'should require HTMLEmbedEditing and HTMLEmbedUI', () => {
		expect( HTMLEmbed.requires ).to.deep.equal( [ HTMLEmbedEditing, HTMLEmbedUI ] );
	} );

	it( 'should be named', () => {
		expect( HTMLEmbed.pluginName ).to.equal( 'HTMLEmbed' );
	} );
} );
