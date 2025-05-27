/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( () => {
	const button = document.getElementById( 'toggle-bootstrap-ui-readonly' );
	const iframe = document.getElementById( 'external-ui-preview' );

	let isReadOnly = false;

	button.addEventListener( 'click', () => {
		iframe.contentWindow.postMessage( 'toggle', '*' );
		isReadOnly = !isReadOnly;
		button.textContent = isReadOnly ? 'Turn off read-only mode' : 'Turn on read-only mode';
	} );
} )();
