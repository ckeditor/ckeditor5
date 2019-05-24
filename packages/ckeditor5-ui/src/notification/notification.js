/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/notification/notification
 */

/* globals window */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The Notification plugin.
 *
 * The notification plugin sends a few base types of notification events: {@link #event:show:success `success`},
 * {@link #event:show:info `info`} and {@link #event:show:warning `warning`}. Those events need to be
 * handled and displayed by other plugins, which have a responsibility to show an UI for the notifications.
 * Such approach provides a possibility to modify the notifications UI.
 *
 * Please notice that every unhandled and not stopped {@link #event:show:warning `warning` event} is displayed as a system alert.
 * See {@link module:ui/notification/notification~Notification#showWarning}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Notification extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Notification';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Each unhandled and not stopped `show:warning` event is displayed as system alert.
		this.on( 'show:warning', ( evt, data ) => {
			window.alert( data.message ); // eslint-disable-line no-alert
		}, { priority: 'lowest' } );
	}

	/**
	 * Shows a success notification.
	 *
	 * By default, it fires the {@link #event:show:success `show:success` event} with the given `data`. The event namespace can be extended
	 * using the `data.namespace` option. For example:
	 *
	 * 		showSuccess( 'Image is uploaded.', {
	 * 			namespace: 'upload:image'
	 * 		} );
	 *
	 * will fire the `show:success:upload:image` event.
	 *
	 * You can provide the title of the notification:
	 *
	 *		showSuccess( 'Image is uploaded.', {
	 *			title: 'Image upload success'
	 *		} );
	 *
	 * @param {String} message Content of the notification.
	 * @param {Object} [data={}] Additional data.
	 * @param {String} [data.namespace] Additional event namespace.
	 * @param {String} [data.title] Title of the notification.
	 */
	showSuccess( message, data = {} ) {
		this._showNotification( {
			message,
			type: 'success',
			namespace: data.namespace,
			title: data.title
		} );
	}

	/**
	 * Shows an info notification.
	 *
	 * By default, it fires the {@link #event:show:info `show:info` event} with the given `data`. The event namespace can be extended
	 * using the `data.namespace` option. For example:
	 *
	 * 		showInfo( 'Editor is offline.', {
	 * 			namespace: 'editor:status'
	 * 		} );
	 *
	 * will fire the `show:info:editor:status` event.
	 *
	 * You can provide the title of the notification:
	 *
	 *		showInfo( 'Editor is offline.', {
	 *			title: 'Network information'
	 *		} );
	 *
	 * @param {String} message Content of the notification.
	 * @param {Object} [data={}] Additional data.
	 * @param {String} [data.namespace] Additional event namespace.
	 * @param {String} [data.title] Title of the notification.
	 */
	showInfo( message, data = {} ) {
		this._showNotification( {
			message,
			type: 'info',
			namespace: data.namespace,
			title: data.title
		} );
	}

	/**
	 * Shows a warning notification.
	 *
	 * By default, it fires the {@link #event:show:warning `show:warning` event}
	 * with the given `data`. The event namespace can be extended using the `data.namespace` option. For example:
	 *
	 * 		showWarning( 'Image upload error.', {
	 * 			namespace: 'upload:image'
	 * 		} );
	 *
	 * will fire the `show:warning:upload:image` event.
	 *
	 * You can provide the title of the notification:
	 *
	 *		showWarning( 'Image upload error.', {
	 *			title: 'Upload failed'
	 *		} );
	 *
	 * Note that each unhandled and not stopped `warning` notification will be displayed as a system alert.
	 * The plugin responsible for displaying warnings should `stop()` the event to prevent displaying it as an alert:
	 *
	 * 		notifications.on( 'show:warning', ( evt, data ) => {
	 * 			// Do something with the data.
	 *
	 * 			// Stop this event to prevent displaying it as an alert.
	 * 			evt.stop();
	 * 		} );
	 *
	 * You can attach many listeners to the same event and `stop()` this event in a listener with a low priority:
	 *
	 * 		notifications.on( 'show:warning', ( evt, data ) => {
	 * 			// Show the warning in the UI, but do not stop it.
	 * 		} );
	 *
	 * 		notifications.on( 'show:warning', ( evt, data ) => {
	 * 			// Log the warning to some error tracker.
	 *
	 * 			// Stop this event to prevent displaying it as an alert.
	 * 			evt.stop();
	 * 		}, { priority: 'low' } );
	 *
	 * @param {String} message Content of the notification.
	 * @param {Object} [data={}] Additional data.
	 * @param {String} [data.namespace] Additional event namespace.
	 * @param {String} [data.title] Title of the notification.
	 */
	showWarning( message, data = {} ) {
		this._showNotification( {
			message,
			type: 'warning',
			namespace: data.namespace,
			title: data.title
		} );
	}

	/**
	 * It fires a {@link #event:show `show`} event with a specified type, namespace and message.
	 *
	 * @private
	 * @param {Object} data Message data.
	 * @param {String} data.message Content of the notification.
	 * @param {'success'|'info'|'warning'} data.type Type of message.
	 * @param {String} [data.namespace] Additional event namespace.
	 * @param {String} [data.title=''] Title of the notification.
	 */
	_showNotification( data ) {
		const event = `show:${ data.type }` + ( data.namespace ? `:${ data.namespace }` : '' );

		this.fire( event, {
			message: data.message,
			type: data.type,
			title: data.title || ''
		} );
	}

	/**
	 * Fired when one of {@link #showSuccess `showSuccess`}, {@link #showInfo `showInfo`},
	 * {@link #showWarning `showWarning`} methods is called.
	 *
	 * @event show
	 * @param {Object} data Notification data.
	 * @param {String} data.message Content of the notification.
	 * @param {String} data.title Title of the notification.
	 * @param {'success'|'info'|'warning'} data.type Type of notification.
	 */

	/**
	 * Fired when a {@link #showSuccess `showSuccess`} method is called.
	 *
	 * @event show:success
	 * @param {Object} data Notification data.
	 * @param {String} data.message Content of the notification.
	 * @param {String} data.title Title of the notification.
	 * @param {'success'} data.type Type of notification.
	 */

	/**
	 * Fired when a {@link #showInfo `showInfo`} method is called.
	 *
	 * @event show:info
	 * @param {Object} data Notification data.
	 * @param {String} data.message Content of the notification.
	 * @param {String} data.title Title of the notification.
	 * @param {'info'} data.type Type of notification.
	 */

	/**
	 * Fired when a {@link #showWarning `showWarning`} method is called.
	 *
	 * When this event isn't handled and stopped by {@link module:utils/eventinfo~EventInfo#stop `event.stop()`},
	 * the `data.message` of the event is automatically displayed as a system alert.
	 *
	 * @event show:warning
	 * @param {Object} data Notification data.
	 * @param {String} data.message Content of the notification.
	 * @param {String} data.title Title of the notification.
	 * @param {'warning'} data.type Type of notification.
	 */
}
