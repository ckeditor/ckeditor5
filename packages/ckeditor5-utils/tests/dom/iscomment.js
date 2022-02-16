/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import isComment from '../../src/dom/iscomment';

describe( 'isComment()', () => {
	let text, element, documentFragment, comment;

	before( () => {
		text = document.createTextNode( 'test' );
		element = document.createElement( 'div' );
		documentFragment = document.createDocumentFragment();
		comment = document.createComment( 'a' );
	} );

	it( 'should return true for HTML comments', () => {
		expect( isComment( comment ) ).to.be.true;
	} );

	it( 'should return false for other arguments', () => {
		expect( isComment( text ) ).to.be.false;
		expect( isComment( element ) ).to.be.false;
		expect( isComment( documentFragment ) ).to.be.false;
		expect( isComment( {} ) ).to.be.false;
	} );
} );
