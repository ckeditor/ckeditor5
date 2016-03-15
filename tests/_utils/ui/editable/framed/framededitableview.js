/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableView from '/ckeditor5/ui/editable/editableview.js';

export default class FramedEditableView extends EditableView {
	constructor( model, locale ) {
		super( model, locale );

		const bind = this.attributeBinder;

		// Here's the tricky part - we must return the promise from init()
		// because iframe loading may be asynchronous. However, we can't start
		// listening to 'load' in init(), because at this point the element is already in the DOM
		// and the 'load' event might already be fired.
		// So here we store both - the promise and the deferred object so we're able to resolve
		// the promise in _iframeLoaded.
		this._iframePromise = new Promise( ( resolve, reject ) => {
			this._iframeDeferred = { resolve, reject };
		} );

		this.template = {
			tag: 'iframe',
			attributes: {
				class: [ 'ck-framededitable' ],
				// It seems that we need to allow scripts in order to be able to listen to events.
				// TODO: Research that. Perhaps the src must be set?
				sandbox: 'allow-same-origin allow-scripts',
				width: bind.to( 'width' ),
				height: bind.to( 'height' )
			},
			on: {
				load: 'loaded'
			}
		};

		this.on( 'loaded', this._iframeLoaded, this );
	}

	init() {
		super.init();

		return this._iframePromise;
	}

	_iframeLoaded() {
		this.setEditableElement( this.element.contentDocument.body );

		this._iframeDeferred.resolve();
	}
}
