/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitHandler } from '../../src/bindings/submithandler.js';

import { View } from '../../src/view.js';

describe( 'submitHandler', () => {
	let view;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		view = new View();
		view.element = document.createElement( 'div' );
		view.element.child = document.createElement( 'input' );

		view.element.appendChild( view.element.child );

		submitHandler( { view } );
	} );

	it( 'should fire #submit event on the view and prevent the native DOM #submit', () => {
		return new Promise( resolve => {
			const evt = new Event( 'submit' );
			const spy = vi.spyOn( evt, 'preventDefault' );

			view.on( 'submit', () => {
				expect( spy ).toHaveBeenCalledOnce();
				resolve();
			} );

			view.element.child.dispatchEvent( evt );
		} );
	} );
} );
