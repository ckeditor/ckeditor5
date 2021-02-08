/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/bubblingobserver
 */

import Observer from './observer';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

/**
 * Abstract base bubbling observer class. Observers are classes which listen to events, do the preliminary
 * processing and fire events on the {@link module:engine/view/document~Document} objects.
 *
 * TODO
 *
 * @abstract
 */
export default class BubblingObserver extends Observer {
	/**
	 * Creates an instance of the bubbling observer.
	 *
	 * @param {module:engine/view/view~View} view
	 * @param {String} eventType TODO
	 * @param {String} [firedEventType=eventType] TODO
	 */
	constructor( view, eventType, firedEventType = eventType ) {
		super( view );

		/**
		 * Type of the event the observer should listen to.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.eventType = eventType;

		/**
		 * Type of the event the observer will fire.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.firedEventType = firedEventType;

		/**
		 * TODO
		 *
		 * @private
		 * @member {Map.<module:engine/view/matcher~Matcher, module:utils/emittermixin~Emitter>}
		 */
		this._listeners = new Map();

		/**
		 * TODO
		 *
		 * @private
		 */
		this._customContexts = new Map();

		this._setupListener();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		for ( const listener of this._listeners.values() ) {
			listener.stopListening();
		}

		super.destroy();
	}

	/**
	 * @inheritDoc
	 */
	observe() {}

	/**
	 * TODO
	 *
	 * @protected
	 */
	_addEventListener( event, callback, options ) {
		let listener = this._listeners.get( options.context );

		if ( !listener ) {
			this._listeners.set( options.context, listener = Object.create( EmitterMixin ) );
		}

		if ( options.contextMatcher ) {
			this._customContexts.set( options.context, options.contextMatcher );
		}

		this.listenTo( listener, event, callback, options );
	}

	/**
	 * TODO
	 *
	 * @protected
	 */
	_removeEventListener( event, callback ) {
		for ( const listener of this._listeners.values() ) {
			this.stopListening( listener, event, callback );
		}
	}

	/**
	 * TODO
	 *
	 * @protected
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {...*} [args]
	 * @returns {Array.<*>|Boolean} False if event should not be handled. TODO
	 */
	_translateEvent( ...args ) {
		return args;
	}

	/**
	 * TODO
	 *
	 * @private
	 */
	_setupListener() {
		const selection = this.document.selection;

		this.listenTo( this.document, this.eventType, ( event, ...args ) => {
			if ( !this.isEnabled ) {
				return;
			}

			const eventInfo = new EventInfo( this, this.firedEventType );
			let eventArgs = this._translateEvent( ...args );

			if ( eventArgs === false ) {
				return;
			}

			if ( !Array.isArray( eventArgs ) ) {
				eventArgs = [ eventArgs ];
			}

			const selectedElement = selection.getSelectedElement();
			const isCustomContext = this._isCustomContext( selectedElement );

			// For the not yet bubbling event trigger for $text node if selection can be there and it's not a custom context selected.
			if ( !isCustomContext && this._fireListenerFor( '$text', eventInfo, ...eventArgs ) ) {
				// Stop the original event.
				event.stop();

				return;
			}

			let node = selectedElement || selection.focus.parent;

			while ( node ) {
				// Root node handling.
				if ( node.is( 'rootElement' ) ) {
					if ( this._fireListenerFor( '$root', eventInfo, ...eventArgs ) ) {
						break;
					}
				}

				// Element node handling.
				else if ( node.is( 'element' ) ) {
					if ( this._fireListenerFor( node.name, eventInfo, ...eventArgs ) ) {
						break;
					}
				}

				// Check custom contexts (i.e., a widget).
				if ( this._fireListenerForCustomContext( node, eventInfo, ...eventArgs ) ) {
					break;
				}

				node = node.parent;
			}

			// Stop the event if generic handler stopped it.
			if ( eventInfo.stop.called ) {
				event.stop();
			}
		}, { priority: 'high' } );
	}

	/**
	 * TODO
	 *
	 * @private
	 * @param {String} name
	 * @param {module:utils/eventinfo~EventInfo} eventInfo The `EventInfo` object.
	 * @param {...*} [eventArgs] Additional arguments to be passed to the callbacks.
	 * @returns {Boolean} True if event stop was called.
	 */
	_fireListenerFor( name, eventInfo, ...eventArgs ) {
		const listener = this._listeners.get( name );

		if ( !listener ) {
			return false;
		}

		listener.fire( eventInfo, ...eventArgs );

		return eventInfo.stop.called;
	}

	/**
	 * TODO
	 *
	 * @private
	 * @param {module:engine/view/element~Element} node
	 * @param {module:utils/eventinfo~EventInfo} eventInfo The `EventInfo` object.
	 * @param {...*} [eventArgs] Additional arguments to be passed to the callbacks.
	 * @returns {Boolean} True if event stop was called.
	 */
	_fireListenerForCustomContext( node, eventInfo, ...eventArgs ) {
		for ( const [ context, matcher ] of this._customContexts ) {
			if ( matcher( node ) && this._fireListenerFor( context, eventInfo, ...eventArgs ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * TODO
	 *
	 * @param {module:engine/view/element~Element} selectedElement
	 * @returns {Boolean}
	 * @private
	 */
	_isCustomContext( selectedElement ) {
		if ( !selectedElement ) {
			return false;
		}

		for ( const matcher of this._customContexts.values() ) {
			if ( matcher( selectedElement ) ) {
				return true;
			}
		}

		return false;
	}
}
