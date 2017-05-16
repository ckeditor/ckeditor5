/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import getDataFromElement from '../../src/dom/getdatafromelement';

describe( 'getDataFromElement', () => {
	let divEl;

	beforeEach( () => {
		divEl = document.createElement( 'div' );
		divEl.innerHTML = `<textarea id="getData-textarea">&lt;b&gt;foo&lt;/b&gt;</textarea>
<div id="getData-div"><b>foo</b></div>
<template id="getData-template"><b>foo</b></template>`;

		document.body.appendChild( divEl );
	} );

	afterEach( () => {
		divEl.parentElement.removeChild( divEl );
	} );

	[ 'textarea', 'template', 'div' ].forEach( elementName => {
		it( 'should return the content of a ' + elementName, () => {
			const data = getDataFromElement( document.getElementById( 'getData-' + elementName ) );
			expect( data ).to.equal( '<b>foo</b>' );
		} );
	} );
} );
