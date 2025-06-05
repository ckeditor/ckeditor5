/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { normalizeSpacing, normalizeSpacerunSpans } from '../../src/filters/space.js';

describe( 'PasteFromOffice - filters', () => {
	describe( 'space', () => {
		describe( 'normalizeSpacing()', () => {
			it( 'should replace last space before closing tag with NBSP', () => {
				const input = '<p>Foo </p><p><span> Bar  </span> Baz </p>';
				const expected = '<p>Foo\u00A0</p><p><span> Bar \u00A0</span> Baz\u00A0</p>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			it( 'should replace last space before special "o:p" tag with NBSP', () => {
				const input = '<p>Foo  <o:p></o:p><span> <o:p></o:p> Bar</span></p>';
				const expected = '<p>Foo \u00A0<o:p></o:p><span>\u00A0<o:p></o:p> Bar</span></p>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			it( 'should remove newlines from spacerun spans #1', () => {
				const input = '<span style=\'mso-spacerun:yes\'>  \n</span>';
				const expected = '<span style=\'mso-spacerun:yes\'> \u00A0</span>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			it( 'should remove newlines from spacerun spans #2', () => {
				const input = '<span style=\'mso-spacerun:yes\'> \r\n</span>';
				const expected = '<span style=\'mso-spacerun:yes\'>\u00A0</span>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			it( 'should remove newlines from spacerun spans #3', () => {
				const input = '<span style=\'mso-spacerun:yes\'>  \r\n\n  </span>';
				const expected = '<span style=\'mso-spacerun:yes\'>   \u00A0</span>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			it( 'should remove newlines from spacerun spans #4', () => {
				const input = '<span style=\'mso-spacerun:yes\'>\n\n\n  </span>';
				const expected = '<span style=\'mso-spacerun:yes\'> \u00A0</span>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			it( 'should remove newlines from spacerun spans #5', () => {
				const input = '<span style=\'mso-spacerun:yes\'>\n\n</span>';
				const expected = '';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			it( 'should remove multiline sequences of whitespaces', () => {
				const input = '<p>Foo</p> \n\n   \n<p>Bar</p>   \r\n\r\n  <p>Baz</p>';
				const expected = '<p>Foo</p><p>Bar</p><p>Baz</p>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			it( 'should normalize Safari "space spans"', () => {
				const input = '<p>Foo <span class="Apple-converted-space">   </span> Baz <span>  </span></p>';
				const expected = '<p>Foo \u00A0 \u00A0 Baz \u00A0\u00A0</p>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			it( 'should normalize nested Safari "space spans"', () => {
				const input =
					'<p> Foo <span class="Apple-converted-space"> <span class="Apple-converted-space">    </span></span> Baz</p>';

				const expected = '<p> Foo \u00A0 \u00A0 \u00A0 Baz</p>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			// ckeditor5#2095
			it( 'should detect space spans which are split into multiple lines', () => {
				const input =
					'<p><span style=\'font-size:13.0pt;line-height:150%;\n' +
					'font-family:"Times New Roman",serif\'><span\n' +
					'style=\'mso-spacerun:yes\'>\n' +
					'</span><span style=\'mso-spacerun:yes\'>          </span><span\n' +
					'style=\'mso-spacerun:yes\'>    </span><span style=\'mso-spacerun:yes\'> </span>Test<o:p></o:p></span></p>';

				const expected =
					'<p><span style=\'font-size:13.0pt;line-height:150%;\nfont-family:"Times New Roman",serif\'>' +
					'<span style=\'mso-spacerun:yes\'>          </span>' +
					'<span\nstyle=\'mso-spacerun:yes\'>    </span>' +
					'<span style=\'mso-spacerun:yes\'> </span>Test<o:p></o:p></span></p>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );

			it( 'should detect span with new-line only', () => {
				const input =
					'<p><span style="letter-spacing:-.15pt">\n</span>' +
					'<span\nstyle="letter-spacing:-1.5pt">\r</span>' +
					'<span style=\'letter-spacing:.15pt\'>\r\n</span></p>';

				const expected =
					'<p><span style="letter-spacing:-.15pt">\u00A0</span>' +
					'<span\nstyle="letter-spacing:-1.5pt">\u00A0</span>' +
					'<span style=\'letter-spacing:.15pt\'>\u00A0</span></p>';

				expect( normalizeSpacing( input ) ).to.equal( expected );
			} );
		} );

		describe( 'normalizeSpacerunSpans()', () => {
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

			// ckeditor5#5645
			it( 'should normalize spaces inside special "span.spacerun" elements that contain no data', () => {
				const input = '<p> <span style=\'mso-spacerun:yes\'>   </span>Foo</p>' +
					'<p> Baz <span style=\'mso-spacerun:yes\'></span></p>';

				const expected = '<p> <span style="mso-spacerun:yes">&nbsp; &nbsp;</span>Foo</p>' +
					'<p> Baz <span style="mso-spacerun:yes"></span></p>';

				const domParser = new DOMParser();
				const htmlDocument = domParser.parseFromString( input, 'text/html' );

				expect( htmlDocument.body.innerHTML.replace( /'/g, '"' ).replace( /: /g, ':' ) ).to.not.equal( expected );

				normalizeSpacerunSpans( htmlDocument );

				expect( htmlDocument.body.innerHTML.replace( /'/g, '"' ).replace( /: /g, ':' ) ).to.equal( expected );
			} );

			it( 'should use innerText setter instead of innerHTML', () => {
				const input = '<span style=\'mso-spacerun:yes\'>   </span>';

				const domParser = new DOMParser();
				const htmlDocument = domParser.parseFromString( input, 'text/html' );

				const spanElement = htmlDocument.getElementsByTagName( 'span' )[ 0 ];
				const innerHTMLSpy = sinon.spy( spanElement, 'innerHTML', [ 'set' ] );
				const innerTextSpy = sinon.spy( spanElement, 'innerText', [ 'set' ] );

				normalizeSpacerunSpans( htmlDocument );

				sinon.assert.notCalled( innerHTMLSpy.set );
				sinon.assert.calledOnce( innerTextSpy.set );
			} );
		} );
	} );
} );
