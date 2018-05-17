/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';
import throttle from '@ckeditor/ckeditor5-utils/src/lib/lodash/throttle';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';

/* globals window */

/**
 * TODO: ...
 * Autosave plugin provides an easy-to-use API for getting sync with the editor's content.
 * It watches `Document:change`, and `Window:beforeunload` events.
 * At these moments, editor.getBody() and editor.getTitle() should work.
 */
export default class Autosave extends Plugin {
	static get pluginName() {
		return 'Autosave';
	}

	static get requires() {
		return [ PendingActions ];
	}

	constructor( editor ) {
		super( editor );

		/**
		 * @member {Provider}
		 */
		this.provider = undefined;

		/**
		 * @protected
		 * @type {Function}
		 */
		this._throttledSave = throttle( this._save.bind( this ), 500 );

		/**
		 * @private
		 * @type {DomEmitterMixin}
		 */
		this._domEmitter = Object.create( DomEmitterMixin );

		/**
		 * @protected
		 * @type {Number}
		 */
		this._lastDocumentVersion = editor.model.document.version;
	}

	init() {
		const editor = this.editor;
		const doc = editor.model.document;
		const pendingActions = editor.plugins.get( PendingActions );

		this.listenTo( doc, 'change', this._throttledSave );

		// TODO: Docs
		// Flush on the editor's destroy listener with the highest priority to ensure that
		// `editor.getBody` will be called before plugins are destroyed.
		this.listenTo( editor, 'destroy', () => this._save(), { priority: 'highest' } );

		// It's not possible to easy test it because karma uses `beforeunload` event
		// to warn before full page reload and this event cannot be dispatched manually.
		/* istanbul ignore next */
		this._domEmitter.listenTo( window, 'beforeunload', ( evtInfo, domEvt ) => {
			if ( pendingActions.isPending ) {
				domEvt.returnValue = pendingActions.first.message;
			}
		} );
	}

	destroy() {
		this._throttledSave.cancel();
		this._domEmitter.stopListening();
		super.destroy();
	}

	/**
	 * @protected
	 */
	_flush() {
		this._throttledSave.flush();
	}

	/**
	 * @protected
	 */
	_save() {
		if ( !this.provider ) {
			return;
		}

		const version = this.editor.model.document.version;

		if ( version <= this._lastDocumentVersion ) {
			return;
		}

		this._lastDocumentVersion = version;

		const pendingActions = this.editor.plugins.get( PendingActions );
		const action = pendingActions.add( 'Saving in progress.' );

		Promise.resolve()
			.then( () => this.provider.save() )
			.then( () => {
				pendingActions.remove( action );
			} );
	}
}

/**
 * @typedef Provider
 */

/**
 * @function
 * @name Provider#save
 * @type {Function}
 */
