/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/notification
 */

/* globals window */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The Notification plugin.
 *
 * This plugin sends few base types of notifications: `success`, `info` and `warning`. This notifications need to be
 * handled and displayed by plugin responsible for showing UI of the notifications. Using this plugin for dispatching
 * notifications makes possible to switch the notifications UI.
 *
 * Note that every unhandled and not stopped `warning` notification will be displayed as system alert.
 * See {@link module:ui/notification~Notification#showWarning}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Notification extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'notification';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Each unhandled and not stopped `show:warning` event is displayed as system alert.
		this.on( 'show:warning', ( evt, data ) => {
			window.alert( data.message );
		}, { priority: 'lowest' } );
	}

	/**
	 * Shows success notification.
	 *
	 * At default it fires `show:success` event with given data but event namespace can be extended
	 * by `data.namespace` option e.g.
	 *
	 * 		showSuccess( 'Image is uploaded.', {
	 * 			namespace: 'upload:image'
	 * 		} );
	 *
	 * will fire `show:success:upload:image` event.
	 *
	 * @param {String} message Content of the notification.
	 * @param {Object} [data={}] Additional data.
	 * @param {String} [data.namespace] Additional event namespace.
	 */
	showSuccess( message, data = {} ) {
		this._showNotification( {
			message: message,
			type: 'success',
			namespace: data.namespace
		} );
	}

	/**
	 * Shows info notification.
	 *
	 * At default it fires `show:info` event with given data but event namespace can be extended
	 * by `data.namespace` option e.g.
	 *
	 * 		showInfo( 'Editor is offline.', {
	 * 			namespace: 'editor:status'
	 * 		} );
	 *
	 * will fire `show:info:editor:status` event.
	 *
	 * @param {String} message Content of the notification.
	 * @param {Object} [data={}] Additional data.
	 * @param {String} [data.namespace] Additional event namespace.
	 */
	showInfo( message, data = {} ) {
		this._showNotification( {
			message: message,
			type: 'info',
			namespace: data.namespace
		} );
	}

	/**
	 * Shows warning notification.
	 *
	 * At default it fires `show:warning` event with given data but event namespace can be extended
	 * by `data.namespace` option e.g.
	 *
	 * 		showWarning( 'Image upload error.', {
	 * 			namespace: 'upload:image'
	 * 		} );
	 *
	 * will fire `show:warning:upload:image` event.
	 *
	 * Note that each unhandled and not stopped `warning` notification will be displayed as system alert.
	 * Plugin responsible for displaying warnings should `stop()` the event to prevent of displaying it as alert:
	 *
	 * 		notifications.on( 'show:warning', ( evt, data ) => {
	 * 			// Do something with data.
	 *
	 * 			// Stop this event to prevent of displaying as alert.
	 * 			evt.stop();
	 * 		} );
	 *
	 * You can attach many listeners to the same event and `stop()` this event in the listener with the low priority:
	 *
	 * 		notifications.on( 'show:warning', ( evt, data ) => {
	 * 			// Show warning in the UI, but not stop it.
	 * 		} );
	 *
	 * 		notifications.on( 'show:warning', ( evt, data ) => {
	 * 			// Log warning to some error tracker.
	 *
	 * 			// Stop this event to prevent of displaying as alert.
	 * 			evt.stop();
	 * 		}, { priority: 'low' } );
	 *
	 * @param {String} message Content of the notification.
	 * @param {Object} [data={}] Additional data.
	 * @param {String} [data.namespace] Additional event namespace.
	 */
	showWarning( message, data = {} ) {
		this._showNotification( {
			message: message,
			type: 'warning',
			namespace: data.namespace
		} );
	}

	/**
	 * Fires `show` event with specified type, namespace and message.
	 *
	 * @private
	 * @param {Object} data Message data.
	 * @param {String} data.message Content of the notification.
	 * @param {'success'|'info'|'warning'} data.type Type of message.
	 * @param {String} [data.namespace] Additional event namespace.
	 */
	_showNotification( data ) {
		const event = `show:${ data.type }` + ( data.namespace ? `:${ data.namespace }` : '' );

		this.fire( event, {
			message: data.message,
			type: data.type
		} );
	}

	/**
	 * Fired when one of `showSuccess`, `showInfo`, `showWarning` methods is called.
	 *
	 * @event show
	 * @param {Object} data Notification data.
	 * @param {String} data.message Content of the notification.
	 * @param {'success'|'info'|'warning'} data.type Type of notification.
	 */

	/**
	 * Fired when `showSuccess` method is called.
	 *
	 * @event show:success
	 * @param {Object} data Notification data.
	 * @param {String} data.message Content of the notification.
	 * @param {'success'} data.type Type of notification.
	 */

	/**
	 * Fired when `showInfo` method is called.
	 *
	 * @event show:info
	 * @param {Object} data Notification data.
	 * @param {String} data.message Content of the notification.
	 * @param {'info'} data.type Type of notification.
	 */

	/**
	 * Fired when `showWarning` method is called.
	 *
	 * When this event won't be handled and stopped by `event.stop()` then data.message of this event will
	 * be automatically displayed as system alert.
	 *
	 * @event show:warning
	 * @param {Object} data Notification data.
	 * @param {String} data.message Content of the notification.
	 * @param {'warning'} data.type Type of notification.
	 */
}
