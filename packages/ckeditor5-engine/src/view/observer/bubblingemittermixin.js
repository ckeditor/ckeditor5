/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/bubblingemittermixin
 */

import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import EmitterMixin, { getEvents, makeEventNode } from '@ckeditor/ckeditor5-utils/src/emittermixin';
import toArray from '@ckeditor/ckeditor5-utils/src/toarray';

import { extend } from 'lodash-es';

const BubblingEmitterMixinMethods = {
	fire( eventOrInfo, ...eventArgs ) {
		try {
			const eventInfo = eventOrInfo instanceof EventInfo ? eventOrInfo : new EventInfo( this, eventOrInfo );
			const eventName = eventInfo.name;

			// TODO maybe there should be a special field in EventInfo that would enable bubbling
			// TODO also maybe we could add eventPhase to EventInfo (at-target, bubbling)
			//  maybe also "capturing" phase to indicate that it's before bubbling
			//  while adding listener we could provide in options what phase we want (capture, at-target or bubbling (includes at-target) )
			const eventContexts = getBubblingContexts( this, eventName );

			if ( !eventContexts.size ) {
				return;
			}

			if ( fireListenerFor( eventContexts, '$capture', eventInfo, ...eventArgs ) ) {
				return eventInfo.return;
			}

			const selection = this.selection;
			const selectedElement = selection.getSelectedElement();
			const isCustomContext = Boolean( selectedElement && getCustomContext( eventContexts, selectedElement ) );

			// For the not yet bubbling event trigger for $text node if selection can be there and it's not a custom context selected.
			if ( !isCustomContext && fireListenerFor( eventContexts, '$text', eventInfo, ...eventArgs ) ) {
				return eventInfo.return;
			}

			let node = selectedElement || getDeeperSelectionParent( selection );

			while ( node ) {
				// Root node handling.
				if ( node.is( 'rootElement' ) ) {
					if ( fireListenerFor( eventContexts, '$root', eventInfo, ...eventArgs ) ) {
						return eventInfo.return;
					}
				}

				// Element node handling.
				else if ( node.is( 'element' ) ) {
					if ( fireListenerFor( eventContexts, node.name, eventInfo, ...eventArgs ) ) {
						return eventInfo.return;
					}
				}

				// Check custom contexts (i.e., a widget).
				if ( fireListenerFor( eventContexts, node, eventInfo, ...eventArgs ) ) {
					return eventInfo.return;
				}

				node = node.parent;
			}

			// Fire for document context.
			fireListenerFor( eventContexts, '$document', eventInfo, ...eventArgs );

			return eventInfo.return;
		} catch ( err ) {
			// @if CK_DEBUG // throw err;
			/* istanbul ignore next */
			CKEditorError.rethrowUnexpectedError( err, this );
		}
	},

	_addEventListener( event, callback, options ) {
		const contexts = toArray( options.context || '$document' );
		const eventContexts = getBubblingContexts( this, event );

		for ( const context of contexts ) {
			let emitter = eventContexts.get( context );

			if ( !emitter ) {
				emitter = Object.create( EmitterMixin );
				eventContexts.set( context, emitter );
			}

			this.listenTo( emitter, event, callback, options );
		}
	},

	_removeEventListener( event, callback ) {
		const eventContexts = getBubblingContexts( this, event );

		for ( const emitter of eventContexts.values() ) {
			this.stopListening( emitter, event, callback );
		}
	}
};

/**
 * Bubbling emitter mixin for the view document.
 *
 * Bubbling emitter mixin is triggering events in the context of specified {@link module:engine/view/element~Element view element} name,
 * predefined `'$text'` and `'$root'` contexts, and context matchers provided as a function.
 *
 * The bubbling starts from the deeper selection position (by firing event on the `'$text'` context) and propagates
 * the view document tree up to the `'$root'`.
 *
 * Examples:
 *
 *		// Listeners registered in the context of the view element names:
 *		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
 *			// ...
 *		}, { context: 'blockquote' } );
 *
 *		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
 *			// ...
 *		}, { context: 'li' } );
 *
 *		// Listeners registered in the context of the '$text' and '$root' nodes.
 *		this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 *			// ...
 *		}, { context: '$text', priority: 'high' } );
 *
 *		this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 *			// ...
 *		}, { context: '$root' } );
 *
 *		// Listeners registered in the context of custom callback function.
 *		this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 *			// ...
 *		}, { context: isWidget } );
 *
 *		this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 *			// ...
 *		}, { context: isWidget, priority: 'high' } );
 *
 * The bubbling emitter itself is listening on the `'high'` priority so there could be listeners that are triggered
 * no matter the context on lower or higher priorities. For example `'enter'` and `'delete'` commands are triggered
 * on the `'normal'` priority without checking the context.
 *
 * Example flow for selection in text:
 *
 *		<blockquote><p>Foo[]bar</p></blockquote>
 *
 * Fired events on contexts:
 * 1. `'$text'`
 * 2. `'p'`
 * 3. `'blockquote'`
 * 4. `'$root'`
 *
 * Example flow for selection on element (i.e., Widget):
 *
 *		<blockquote><p>Foo[<widget/>]bar</p></blockquote>
 *
 * Fired events on contexts:
 * 1. *widget* (custom matcher)
 * 2. `'p'`
 * 3. `'blockquote'`
 * 4. `'$root'`
 *
 * There could be multiple listeners registered for the same context and at different priority levels:
 *
 *		<p>Foo[]bar</p>
 *
 * 1. `'$text'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 * 2. `'p'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 * 3. `'$root'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 *
 * @mixin BubblingEmitterMixin
 */
export const BubblingEmitterMixin = {};
extend( BubblingEmitterMixin, EmitterMixin, BubblingEmitterMixinMethods );

/**
 * TODO
 *
 * @mixin BubblingObservableMixin
 */
export const BubblingObservableMixin = {};
extend( BubblingObservableMixin, ObservableMixin, BubblingEmitterMixinMethods );

// Fires the listener for the specified context. Returns `true` if event was stopped.
//
// @private
// @param {Map.<String|Function, module:utils/emittermixin~Emitter>} eventContexts
// @param {String|module:engine/view/node~Node} context
// @param {module:utils/eventinfo~EventInfo} eventInfo The `EventInfo` object.
// @param {...*} [eventArgs] Additional arguments to be passed to the callbacks.
// @returns {Boolean} True if event stop was called.
function fireListenerFor( eventContexts, context, eventInfo, ...eventArgs ) {
	const emitter = typeof context == 'string' ? eventContexts.get( context ) : getCustomContext( eventContexts, context );

	if ( !emitter ) {
		return false;
	}

	emitter.fire( eventInfo, ...eventArgs );

	return eventInfo.stop.called;
}

// Returns an emitter for a specified view node.
//
// @private
// @param {Map.<String|Function, module:utils/emittermixin~Emitter>} eventContexts
// @param {module:engine/view/node~Node} node
// @returns {module:utils/emittermixin~Emitter|null}
function getCustomContext( eventContexts, node ) {
	for ( const [ context, emitter ] of eventContexts ) {
		if ( typeof context == 'function' && context( node ) ) {
			return emitter;
		}
	}

	return null;
}

// Returns bubbling contexts map for the source (emitter).
function getBubblingContexts( source, eventName ) {
	// TODO this could use it's own property to store contexts
	const events = getEvents( source );

	if ( !events[ eventName ] ) {
		events[ eventName ] = makeEventNode();
	}

	// TODO this should get all namespaced events
	const eventNode = events[ eventName ];

	if ( !eventNode.bubblingContexts ) {
		eventNode.bubblingContexts = new Map();
	}

	return eventNode.bubblingContexts;
}

// Returns the deeper parent element for the selection.
function getDeeperSelectionParent( selection ) {
	const focusParent = selection.focus.parent;
	const anchorParent = selection.anchor.parent;

	const focusPath = focusParent.getPath();
	const anchorPath = anchorParent.getPath();

	return focusPath.length > anchorPath.length ? focusParent : anchorParent;
}
