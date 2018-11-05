/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals DOMParser */

import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';

import { normalizeEndTagsPrecedingSpace, normalizeSpacerunSpans } from '../../src/filters/space';

describe( 'Filters', () => {
	describe( 'space', () => {
		describe( 'normalizeEndTagsPrecedingSpace', () => {
			it( 'should replace last space before closing tag with NBSP', () => {
				const input = '<p>Foo </p><p><span> Bar  </span> Baz </p>';
				const expected = '<p>Foo\u00A0</p><p><span> Bar \u00A0</span> Baz\u00A0</p>';

				expect( normalizeEndTagsPrecedingSpace( input ) ).to.equal( expected );
			} );

			it( 'should replace last space before special "o:p" tag with NBSP', () => {
				const input = '<p>Foo  <o:p></o:p><span> <o:p></o:p> Bar</span></p>';
				const expected = '<p>Foo \u00A0<o:p></o:p><span>\u00A0<o:p></o:p> Bar</span></p>';

				expect( normalizeEndTagsPrecedingSpace( input ) ).to.equal( expected );
			} );
		} );

		describe( 'normalizeSpacerunSpans', () => {
			it( 'should normalize spaces inside special "span.spacerun" elements', () => {
				const input = '<p> <span style=\'mso-spacerun:yes\'>   </span>Foo</p>' +
					'<p> Baz <span style=\'mso-spacerun:yes\'>      </span></p>';

				const expected = '<p> <span style="mso-spacerun:yes">&nbsp; &nbsp;</span>Foo</p>' +
					'<p> Baz <span style="mso-spacerun:yes">&nbsp; &nbsp; &nbsp; </span></p>';

				const domParser = new DOMParser();
				const htmlDocument = domParser.parseFromString( input, 'text/html' );

				expect( htmlDocument.body.innerHTML.replace( /'/g, '"' ).replace( /: /g, ':' ) ).to.not.equal( expected );

				normalizeSpacerunSpans( htmlDocument );

				expect( htmlDocument.body.innerHTML.replace( /'/g, '"' ).replace( /: /g, ':' ) ).to.equal( expected );
			} );

		} );
	} );
} );
