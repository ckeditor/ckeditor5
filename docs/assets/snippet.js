/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, setTimeout */

// Show clipboard input notification when user tries to paste a content from MS Word or Google Docs.
setTimeout( () => {
	// Don't show the warning notification in "Paste from Office" and "Paste from Google Docs" demos.
	if ( window.preventPasteFromOfficeNotification ) {
		return;
	}

	const editables = document.querySelectorAll( '.ck-content' );
	const googleDocsMatch = /id=("|')docs-internal-guid-[-0-9a-f]+("|')/i;
	const msWordMatch1 = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;
	const msWordMatch2 = /xmlns:o="urn:schemas-microsoft-com/i;

	// A state variable that indicates if the clipboard notification has been seen.
	// We use the variable for displaying the notification only once per demo.
	let hasNotificationBeenSeen = false;

	editables.forEach( editable => {
		const editor = editable.ckeditorInstance;

		if ( !editor ) {
			return;
		}

		editor.plugins.get( 'Clipboard' ).listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
			const htmlString = data.dataTransfer.getData( 'text/html' );
			const match = msWordMatch1.test( htmlString ) ||
				msWordMatch2.test( htmlString ) ||
				googleDocsMatch.test( htmlString );

			if ( match && !hasNotificationBeenSeen ) {
				createClipboardInputNotification();
				hasNotificationBeenSeen = true;
			}
		} );
	} );
}, 3000 );

// The notification should contain the links to the demos where user can test rich formatting from.
function createClipboardInputNotification() {
	const title = 'Hello!';
	const message = `

	<p>We detected that you tried to paste content from <strong>Microsoft Word</strong> or <strong>Google Docs</strong>.</p>
	<p>Please bear in mind that the editor demo to which you try to paste does not have all the features enabled.
		Due to that, unsupported formatting is being stripped.</p>
	<p>Check out the <a href="/docs/ckeditor5/latest/features/pasting/paste-from-word.html">Paste from Word</a> or
	<a href="/docs/ckeditor5/latest/features/pasting/paste-from-google-docs.html">Paste from Google Docs</a>
	demos for the best experience.</p>`;

	window.createNotification( title, message );
}

/**
* Creates a notification and appends it to the `.main__content` element.
*
* @param {String} title A title of the notification.
* @param {String} message A message to display in the notification.
*
* @returns {Object} A notification element.
*/
window.createNotification = function( title, message ) {
	const notificationTemplate = `
		<h3 class="main__notification-title">${ title }</h3>
		<div class="main__notification-body">
			${ message }
		</div>
	`;

	const notification = document.createElement( 'div' );
	const close = document.createElement( 'button' );

	close.classList.add( 'main__notification-close' );
	close.innerText = '✕';
	close.setAttribute( 'aria-label', 'Close the notification' );

	notification.classList.add( 'main__notification', 'notice' );
	notification.innerHTML = notificationTemplate;
	// ATM we support only top-right position.
	notification.style.top = window.getViewportTopOffsetConfig() + 10 + 'px';
	notification.style.right = '10px';
	notification.appendChild( close );

	const activeNotifications = document.querySelectorAll( '.main__notification' );

	// Translate the position of multiple notifications (just in case).
	if ( activeNotifications.length > 0 ) {
		const moveOffset = activeNotifications.length * 10;

		notification.style.top = parseInt( notification.style.top ) + moveOffset + 'px';
		notification.style.right = parseInt( notification.style.right ) + moveOffset + 'px';
	}

	// Append notification to the `.main__content` element.
	const main = document.querySelector( '.main__content' );
	main.appendChild( notification );

	close.addEventListener( 'click', () => {
		main.removeChild( notification );
	} );

	return notification;
};

/**
 * Returns the `config.ui.viewportOffset.top` config value for editors using floating toolbars that
 * stick to the top of the viewport to remain visible to the user.
 *
 * The value is determined in styles by the `--ck-snippet-viewport-top-offset` custom property
 * and may differ e.g. according to the used media queries.
 *
 * @returns {Number} The value of the offset.
 */
window.getViewportTopOffsetConfig = function() {
	const documentElement = document.documentElement;

	return parseInt( window.getComputedStyle( documentElement ).getPropertyValue( '--ck-snippet-viewport-top-offset' ) );
};
