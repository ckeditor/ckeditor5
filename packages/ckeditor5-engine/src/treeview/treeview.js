/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EmitterMixin from '../emittermixin.js';
import RootElement from './rootelement.js';
import Renderer from './renderer.js';
import Converter from './converter.js';

import objectUtils from '../lib/lodash/object.js';

export default class TreeView {
	constructor( domRoot ) {
		/**
		 * Root of the DOM.
		 */
		this.domRoot = domRoot;

		this.observers = new Set();

		this.converter = new Converter();

		/**
		 * Root of the view
		 */
		this.viewRoot = new RootElement( domRoot.tagName.toLowerCase(), this );
		this.converter.cloneDomAttrs( domRoot, this.viewRoot );
		this.converter.bindElements( domRoot, this.viewRoot );

		this.renderer = new Renderer( this.converter );
		this.renderer.markToSync( 'CHILDREN', this.viewRoot );

		this.viewRoot.on( 'change', ( evt, type, node ) => {
			this.renderer.markToSync( type, node );
		} );
	}

	addObserver( observer ) {
		this.observers.add( observer );
		observer.init( this );
		observer.attach();
	}

	render() {
		for ( let observer of this.observers ) {
			observer.detach();
		}

		this.renderer.render();

		for ( let observer of this.observers ) {
			observer.attach();
		}
	}
}

objectUtils.extend( TreeView.prototype, EmitterMixin );
