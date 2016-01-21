/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ObservableMixin from '../observablemixin.js';
import utils from '../utils.js';

export default class Ui {
	constructor( editor, chrome ) {
		this.chrome = chrome;

		this.set( 'width', editor.config.width );
		this.set( 'height', editor.config.height );
	}

	init() {
		return this.chrome.init();
	}

	destroy() {
		const chrome = this.chrome;

		this.stopListening();
		this.chrome = null;

		return chrome.destroy();
	}
}

utils.mix( Ui, ObservableMixin );
