/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EmitterMixin from '../emittermixin.js';
import RootElement from './rootelement.js';
import Renderer from './renderer.js';

import objectUtils from '../lib/lodash/object.js';
import converter from './converter.js';

export default class TreeView {
	constructor( domRoot ) {
		/**
		 * Root of the DOM.
		 */
		this.domRoot = domRoot;

		this.observers = new Set();

		/**
		 * Root of the view
		 */
		this.viewRoot = new RootElement( domRoot.tagName.toLowerCase(), this );
		converter.cloneDomAttrs( domRoot, this.viewRoot );
		converter.bindElement( this.viewRoot, domRoot );

		this.renderer = new Renderer( this );
		this.renderer.markToSync( this.viewRoot, 'CHILDREN_NEED_UPDATE' );
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
