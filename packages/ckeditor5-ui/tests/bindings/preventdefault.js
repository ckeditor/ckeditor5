/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Event */

import preventDefault from '../../src/bindings/preventdefault';
import View from '../../src/view';
import Template from '../../src/template';

describe( 'preventDefault', () => {
	it( 'prevents default of a native DOM event', () => {
		const view = new View();

		view.template = new Template( {
			tag: 'div',

			on: {
				foo: preventDefault( view )
			}
		} );

		const evt = new Event( 'foo', { bubbles: true } );
		const spy = sinon.spy( evt, 'preventDefault' );

		// Render to enable bubbling.
		view.element;

		view.element.dispatchEvent( evt );
		sinon.assert.calledOnce( spy );
	} );

	it( 'prevents only when target is view#element', () => {
		const view = new View();
		const child = new View();

		child.template = new Template( {
			tag: 'a'
		} );

		view.template = new Template( {
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
		view.element;

		child.element.dispatchEvent( evt );
		sinon.assert.notCalled( spy );
	} );
} );
