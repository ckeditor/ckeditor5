/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* global Node */

/**
 * Mixin that injects the DOM events API into its host.
 *
 * @class DOMEmitterMixin
 * @singleton
 */

CKEDITOR.define( [ 'emittermixin', 'utils', 'log' ], function( EmitterMixin, utils, log ) {
	var DOMEmitterMixin = {
		listenTo() {
			var args = Array.prototype.slice.call( arguments );
			var emitter = args[ 0 ];

			if ( emitter instanceof Node ) {
				args[ 0 ] = this._getProxyEmitter( emitter ) || this._createProxyEmitter( emitter );
			}

			EmitterMixin.listenTo.apply( this, args );
		},

		stopListening() {
			var args = Array.prototype.slice.call( arguments );
			var emitter = args[ 0 ];

			if ( emitter instanceof Node ) {
				var proxy = this._getProxyEmitter( emitter );

				if ( proxy ) {
					args[ 0 ] = proxy;
				} else {
					log.error(
						'domemittermixin-stoplistening: Stopped listening on a DOM Node that has no emitter or emitter is gone.',
						emitter
					);
				}
			}

			EmitterMixin.stopListening.apply( this, args );
		},

		_createProxyEmitter( node ) {
			var proxyEmitter = utils.extend( {}, EmitterMixin, {
				on( event, callback, ctx, priority ) {
					EmitterMixin.on.call( this, event, callback, ctx, priority );

					if ( this._domNode ) {
						if ( this._domListenerProxies && this._domListenerProxies[ event ] ) {
							return;
						}

						var domListener = domEvt => this.fire( event, domEvt );

						domListener.removeListener = () => {
							this._domNode.removeEventListener( event, domListener );
							delete this._domListenerProxies[ event ];
						};

						this._domNode.addEventListener( event, domListener );

						if ( !this._domListenerProxies ) {
							this._domListenerProxies = {};
						}

						this._domListenerProxies[ event ] = domListener;
					}
				},

				off( event, callback, ctx ) {
					EmitterMixin.off.call( this, event, callback, ctx );

					if ( this._domNode ) {
						var callbacks;

						if ( !( callbacks = this._events[ event ] ) || !callbacks.length ) {
							this._domListenerProxies[ event ].removeListener();
						}
					}
				}
			} );

			// Set emitter ID to match DOM Node expando property.
			proxyEmitter._emitterId = this._getNodeUID( node );
			proxyEmitter._domNode = node;

			return proxyEmitter;
		},

		_getProxyEmitter( node ) {
			var proxy, emitters, emitterInfo;

			// Get node UID. It allows finding Proxy Emitter for this DOM Node.
			var uid = this._getNodeUID( node );

			// Find existing Proxy Emitter for this DOM Node among emitters.
			if ( ( emitters = this._listeningTo ) ) {
				if ( ( emitterInfo = emitters[ uid ] ) ) {
					proxy = emitterInfo.emitter;
				}
			}

			return proxy;
		},

		_getNodeUID( node ) {
			return node[ EXP_KEY_NAME ] || ( node[ EXP_KEY_NAME ] = utils.uid() );
		},

		// _setNodeCustomData( node, key, value ) {
		// 	var uid = this._getNodeUID( node );
		// 	var slot = this.customData[ uid ] || ( this.customData[ uid ] = {} );

		// 	slot[ key ] = value;

		// 	return this;
		// },

		// _getNodeCustomData( node, key ) {
		// 	var uid = node[ EXP_KEY_NAME ];
		// 	var slot;

		// 	if ( uid ) {
		// 		slot = this.customData[ uid ];
		// 	}

		// 	return ( slot && key in slot ) ? slot[ key ] : null;
		// }
	};

	var EXP_KEY_NAME = 'data-ck-expando';

	return DOMEmitterMixin;
} );

