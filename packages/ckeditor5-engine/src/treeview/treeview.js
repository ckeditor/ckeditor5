/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import objectUtils from '../lib/lodash/object.js';
import EmitterMixin from '../emittermixin.js';
import RootElement from './rootelement.js';
import Renderer from './renderer.js';

export default class TreeView {
	constructor( domElement ) {
		/**
		 * Root of the DOM.
		 */
		this.domRoot = domElement;

		this.observers = new Set();

		this.renderer = new Renderer( this );

		/**
		 * Root of the view
		 */
		this.viewRoot = new RootElement( domElement.name, this );
		this.viewRoot.cloneDomAttrs( domElement );
		this.viewRoot.bindDomElement( domElement );
		this.viewRoot.markToSync( 'CHILDREN_NEED_UPDATE' );
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
