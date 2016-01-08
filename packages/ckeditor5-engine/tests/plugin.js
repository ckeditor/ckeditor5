/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'core/plugin', 'core/editor' );
let editor;

before( () => {
	const Editor = modules[ 'core/editor' ];

	editor = new Editor( document.body.appendChild( document.createElement( 'div' ) ) );
} );

describe( 'constructor', () => {
	it( 'should set the `editor` property', () => {
		const Plugin = modules[ 'core/plugin' ];

		let plugin = new Plugin( editor );

		expect( plugin ).to.have.property( 'editor' ).to.equal( editor );
	} );
} );
