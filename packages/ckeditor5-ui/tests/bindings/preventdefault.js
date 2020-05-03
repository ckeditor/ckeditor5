/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global Event */

import preventDefault from '../../src/bindings/preventdefault';
import View from '../../src/view';

describe( 'preventDefault', () => {
	it( 'prevents default of a native DOM event', () => {
		const view = new View();

		view.setTemplate( {
			tag: 'div',

			on: {
				foo: preventDefault( view )
			}
		} );

		const evt = new Event( 'foo', { bubbles: true } );
		const spy = sinon.spy( evt, 'preventDefault' );

		// Render to enable bubbling.
		view.render();

		view.element.dispatchEvent( evt );
		sinon.assert.calledOnce( spy );
	} );

	it( 'prevents only when target is view#element', () => {
		const view = new View();
		const child = new View();

		child.setTemplate( {
			tag: 'a'
		} );

		view.setTemplate( {
			tag: 'div',

			on: {
				foo: preventDefault( view )
			},

			children: [
				child
			]
		} );

		const evt = new Event( 'foo', { bubbles: true } );
		const spy = sinon.spy( evt, 'preventDefault' );

		// Render to enable bubbling.
		view.render();

		child.element.dispatchEvent( evt );
		sinon.assert.notCalled( spy );
	} );
} );
