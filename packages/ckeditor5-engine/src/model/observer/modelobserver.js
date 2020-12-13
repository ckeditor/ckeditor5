/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/observer/modelobserver
 */

import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Abstract base observer class. Observers are classes which listen to view events, do the preliminary
 * processing and fire events on ... TODO
 *
 * @abstract
 */
export default class ModelObserver {
	/**
	 * Creates an instance of the observer.
	 *
	 * @param {module:engine/model/model~Model} model The model.
	 * @param {String} viewEventType Type of the view event the observer should listen to.
	 * @param {String} modelEventType Type of the model event the observer should fire.
	 */
	constructor( model, viewEventType, modelEventType ) {
		/**
		 * An instance of the model.
		 *
		 * @readonly
		 * @member {module:engine/model/model~Model}
		 */
		this.model = model;

		/**
		 * State of the observer. If it is disabled no events will be fired.
		 *
		 * @readonly
		 * @member {Boolean}
		 */
		this.isEnabled = false;

		/**
		 * Type of the view event the observer should listen to.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.viewEventType = viewEventType;

		/**
		 * Type of the model event the observer should fire.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.modelEventType = modelEventType || viewEventType;

		/**
		 * TODO
		 *
		 * @private
		 * @member {Map.<String, module:utils/emittermixin~Emitter>}
		 */
		this._elementMap = new Map();
	}

	/**
	 * Enables the observer. This method is called when the observer is registered to the
	 * {@link module:engine/model/model~Model}.
	 *
	 * @see module:engine/model/observer/modelobserver~Observer#disable
	 */
	enable() {
		this.isEnabled = true;
	}

	/**
	 * Disables the observer.
	 *
	 * @see module:engine/model/observer/modelobserver~Observer#enable
	 */
	disable() {
		this.isEnabled = false;
	}

	/**
	 * Disables and destroys the observer, among others removes event listeners created by the observer.
	 */
	destroy() {
		for ( const listener of this._elementMap.values() ) {
			listener.stopListening();
		}

		this.disable();
		this.stopListening();
	}

	/**
	 * Starts observing the given view document object.
	 *
	 * @param {module:engine/view/document~Document} viewDocument
	 */
	observe( viewDocument ) {
		const schema = this.model.schema;
		const selection = this.model.document.selection;

		this.listenTo( viewDocument, this.viewEventType, ( event, ...args ) => {
			if ( !this.isEnabled ) {
				return;
			}

			let eventArgs = this.translateViewEvent( ...args );

			if ( eventArgs === false ) {
				return;
			}

			if ( !Array.isArray( eventArgs ) ) {
				eventArgs = [ eventArgs ];
			}

			const eventInfo = new EventInfo( this, this.modelEventType );

			const position = selection.focus.path.length < selection.anchor.path.length ? selection.anchor : selection.focus;
			const acceptsText = selection.isCollapsed && schema.checkChild( position, '$text' );

			let node = selection.getSelectedElement() || position.textNode || position.parent;
			let bubbling = false;

			while ( node ) {
				// Element node handling.
				if ( node.is( 'element' ) ) {
					// For the not yet bubbling event trigger for $text node if it's accepted by the selection position.
					if ( !bubbling && acceptsText && this._fireListenerFor( '$text', eventInfo, ...eventArgs ) ) {
						break;
					}

					// Default handler for specified element.
					if ( this._fireListenerFor( node.name, eventInfo, ...eventArgs ) ) {
						break;
					}

					// Generic handler for $object.
					if ( schema.isObject( node ) && this._fireListenerFor( '$object', eventInfo, ...eventArgs ) ) {
						break;
					}
				}

				// Text node handling.
				else if ( node.is( '$text' ) ) {
					if ( this._fireListenerFor( '$text', eventInfo, ...eventArgs ) ) {
						break;
					}
				}

				// Root node handling.
				else if ( node.is( 'rootElement' ) ) {
					if ( this._fireListenerFor( '$root', eventInfo, ...eventArgs ) ) {
						break;
					}
				}

				node = node.parent;
				bubbling = true;
			}

			// Fire generic handler (not assigned to any element).
			if ( !eventInfo.stop.called ) {
				this.fire( eventInfo, ...eventArgs );
			}

			// Stop the event if generic handler stopped it.
			if ( eventInfo.stop.called ) {
				event.stop();
			}
		} );
	}

	/**
	 * TODO
	 *
	 * @param {String} name
	 * @returns {module:utils/emittermixin~Emitter}
	 */
	for( name ) {
		let listener = this._elementMap.get( name );

		if ( listener ) {
			return listener;
		}

		listener = Object.create( EmitterMixin );

		this._elementMap.set( name, listener );

		return listener;
	}

	/**
	 * TODO
	 * Callback which should be called when the view event occurred. Note that the callback will not be called if
	 * observer {@link #isEnabled is not enabled}.
	 *
	 * @param {...*} [args]
	 * @returns {Array.<*>|false}
	 */
	translateViewEvent( ...args ) {
		return args;
	}

	/**
	 * TODO
	 *
	 * @private
	 * @param {String} name
	 * @param {module:utils/eventinfo~EventInfo} eventInfo The `EventInfo` object.
	 * @param {...*} [args] Additional arguments to be passed to the callbacks.
	 * @returns {Boolean} True if event stop was called.
	 */
	_fireListenerFor( name, eventInfo, ...args ) {
		const listener = this._elementMap.get( name );

		if ( listener ) {
			listener.fire( eventInfo, ...args );
		}

		return eventInfo.stop.called;
	}
}

mix( ModelObserver, EmitterMixin );
