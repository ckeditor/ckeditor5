/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Plugin from '../src/plugin';
import Editor from '../src/editor/editor';

let editor;

before( () => {
	editor = new Editor();
} );

describe( 'constructor()', () => {
	it( 'should set the `editor` property', () => {
		let plugin = new Plugin( editor );

		expect( plugin ).to.have.property( 'editor' ).to.equal( editor );
	} );
} );

describe( 'init', () => {
	it( 'should exist and do nothing', () => {
		let plugin = new Plugin( editor );

		expect( plugin.init ).to.be.a( 'function' );

		plugin.init();
	} );
} );

describe( 'destroy', () => {
	it( 'should exist and do nothing', () => {
		let plugin = new Plugin( editor );

		expect( plugin.destroy ).to.be.a( 'function' );

		plugin.destroy();
	} );
} );
