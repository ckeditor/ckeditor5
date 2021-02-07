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
	 */
	constructor( view, eventType ) {
		super( view );

		/**
		 * Type of the event the observer should listen to.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.eventType = eventType;

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
	_addListener( context, callback, options ) {
		let listener = this._listeners.get( context );

		if ( !listener ) {
			this._listeners.set( context, listener = Object.create( EmitterMixin ) );
		}

		if ( options.contextMatcher ) {
			this._customContexts.set( options.context, options.contextMatcher );
		}

		listener._addEventListener( this.eventType, callback, options );
	}

	/**
	 * TODO
	 *
	 * @protected
	 */
	_removeListener( callback, options ) {
		// TODO
	}

	/**
	 * TODO
	 *
	 * @protected
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {...*} [args]
	 * @returns {Array.<*>|Boolean} False if event should not be handled. TODO
	 */
	_translateEvent( eventName, ...args ) {
		return [ new EventInfo( this, eventName ), ...args ];
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

			const translatedEvent = this._translateEvent( event.name, ...args );

			if ( translatedEvent === false ) {
				return;
			}

			let [ eventInfo, ...eventArgs ] = translatedEvent;

			if ( !Array.isArray( eventArgs ) ) {
				eventArgs = [ eventArgs ];
			}

			const selectedElement = selection.getSelectedElement();

			// TODO selected element could be an attribute element.

			// For the not yet bubbling event trigger for $text node if selection can be there and it's not a widget selected.
			if ( !selectedElement && this._fireListenerFor( '$text', eventInfo, ...eventArgs ) ) {
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
				for ( const [ context, matcher ] of this._customContexts ) {
					if ( matcher( node ) && this._fireListenerFor( context, eventInfo, ...eventArgs ) ) {
						break;
					}
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
	 * @param {...*} [args] Additional arguments to be passed to the callbacks.
	 * @returns {Boolean} True if event stop was called.
	 */
	_fireListenerFor( name, eventInfo, ...args ) {
		const listener = this._listeners.get( name );

		if ( !listener ) {
			return false;
		}

		listener.fire( eventInfo, ...args );

		return eventInfo.stop.called;
	}
}
