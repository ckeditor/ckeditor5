/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { formatHtml } from '../../src/utils/formathtml';

describe( 'SourceEditing utils', () => {
	describe( 'formatHtml()', () => {
		it( 'should format table', () => {
			const source = '' +
				'<figure class="table">' +
				'<table>' +
				'<tbody>' +
				'<tr>' +
				'<td>' +
				'table cell #1' +
				'</td>' +
				'<td>' +
				'table cell #2' +
				'</td>' +
				'<td>' +
				'table cell #3' +
				'</td>' +
				'</tr>' +
				'</tbody>' +
				'</table>' +
				'</figure>';

			const sourceFormatted = '' +
				'<figure class="table">\n' +
				'    <table>\n' +
				'        <tbody>\n' +
				'            <tr>\n' +
				'                <td>\n' +
				'                    table cell #1\n' +
				'                </td>\n' +
				'                <td>\n' +
				'                    table cell #2\n' +
				'                </td>\n' +
				'                <td>\n' +
				'                    table cell #3\n' +
				'                </td>\n' +
				'            </tr>\n' +
				'        </tbody>\n' +
				'    </table>\n' +
				'</figure>';

			expect( formatHtml( source ) ).to.equal( sourceFormatted );
		} );

		it( 'should format ordered and bulleted lists', () => {
			const source = '' +
				'<ol>' +
				'<li>' +
				'Numbered list item #1.' +
				'</li>' +
				'<li>' +
				'Numbered list item #2.' +
				'</li>' +
				'<li>' +
				'Numbered list item #3.' +
				'</li>' +
				'</ol>' +
				'<ul>' +
				'<li>' +
				'Bulleted list item #1.' +
				'</li>' +
				'<li>' +
				'Bulleted list item #2.' +
				'</li>' +
				'<li>' +
				'Bulleted list item #3.' +
				'</li>' +
				'</ul>';

			const sourceFormatted = '' +
				'<ol>\n' +
				'    <li>\n' +
				'        Numbered list item #1.\n' +
				'    </li>\n' +
				'    <li>\n' +
				'        Numbered list item #2.\n' +
				'    </li>\n' +
				'    <li>\n' +
				'        Numbered list item #3.\n' +
				'    </li>\n' +
				'</ol>\n' +
				'<ul>\n' +
				'    <li>\n' +
				'        Bulleted list item #1.\n' +
				'    </li>\n' +
				'    <li>\n' +
				'        Bulleted list item #2.\n' +
				'    </li>\n' +
				'    <li>\n' +
				'        Bulleted list item #3.\n' +
				'    </li>\n' +
				'</ul>';

			expect( formatHtml( source ) ).to.equal( sourceFormatted );
		} );

		it( 'should format mixed nested block elements with inline elements #1', () => {
			const source = '' +
				'<div>' +
				'<p>' +
				'Paragraph #1.' +
				'</p>' +
				'<div>' +
				'<p>' +
				'<i>Nested</i> <strong>paragraph</strong> with basic styles' +
				'</p>' +
				'</div>' +
				'<p>' +
				'Paragraph #2.' +
				'</p>' +
				'</div>';

			const sourceFormatted = '' +
				'<div>\n' +
				'    <p>\n' +
				'        Paragraph #1.\n' +
				'    </p>\n' +
				'    <div>\n' +
				'        <p>\n' +
				'            <i>Nested</i> <strong>paragraph</strong> with basic styles\n' +
				'        </p>\n' +
				'    </div>\n' +
				'    <p>\n' +
				'        Paragraph #2.\n' +
				'    </p>\n' +
				'</div>';

			expect( formatHtml( source ) ).to.equal( sourceFormatted );
		} );

		it( 'should format mixed nested block elements with inline elements #2', () => {
			const source = '' +
				'<aside>' +
				'<h4>Contact the <span class="highlight">author</span>:</h4>' +
				'<hr>' +
				'<address>' +
				'<a href="mailto:john@example.com">john@example.com</a><br>' +
				'<a href="tel:+13105551234">(310) 555-1234</a>' +
				'</address>' +
				'</aside>';

			const sourceFormatted = '' +
				'<aside>\n' +
				'    <h4>\n' +
				'        Contact the <span class="highlight">author</span>:\n' +
				'    </h4>\n' +
				'    <hr>\n' +
				'    <address>\n' +
				'        <a href="mailto:john@example.com">john@example.com</a>\n' +
				'        <br>\n' +
				'        <a href="tel:+13105551234">(310) 555-1234</a>\n' +
				'    </address>\n' +
				'</aside>';

			expect( formatHtml( source ) ).to.equal( sourceFormatted );
		} );

		it( 'should format mixed nested block elements with inline elements #3', () => {
			const source = '' +
				'<main>' +
				'<form action="#" method="post">' +
				'<fieldset>' +
				'<label for="name"><i>Name:</i></label><input type="text" placeholder="Enter your full name">' +
				'<label for="email"><i>Email:</i></label><input type="email" placeholder="Enter your email address">' +
				'<label for="message"><i>Message:</i></label>' +
				'<textarea placeholder="What\'s on your mind?"></textarea>' +
				'<input type="submit" value="Send message">' +
				'</fieldset>' +
				'</form>' +
				'</main>';

			const sourceFormatted = '' +
				'<main>\n' +
				'    <form action="#" method="post">\n' +
				'        <fieldset>\n' +
				'            <label for="name"><i>Name:</i></label>\n' +
				'            <input type="text" placeholder="Enter your full name">\n' +
				'            <label for="email"><i>Email:</i></label>\n' +
				'            <input type="email" placeholder="Enter your email address">\n' +
				'            <label for="message"><i>Message:</i></label>\n' +
				'            <textarea placeholder="What\'s on your mind?">\n' +
				'            </textarea>\n' +
				'            <input type="submit" value="Send message">\n' +
				'        </fieldset>\n' +
				'    </form>\n' +
				'</main>';

			expect( formatHtml( source ) ).to.equal( sourceFormatted );
		} );

		it( 'should keep all attributes unchanged', () => {
			const source = '' +
				'<p id="foo" class="class1 class2" data-value="bar" onclick="fn();">' +
				'Paragraph' +
				'</p>';

			const sourceFormatted = '' +
				'<p id="foo" class="class1 class2" data-value="bar" onclick="fn();">\n' +
				'    Paragraph\n' +
				'</p>';

			expect( formatHtml( source ) ).to.equal( sourceFormatted );
		} );
	} );
} );
