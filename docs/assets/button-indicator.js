/* global window, document */

/**
 * Attaches a tooltip with a description to any DOM node element.
 *
 * @param {HTMLElement} [domNode] DOM node.
 * @param {String} [text] The description to be shown in the tooltip.
 */
window.addItemIndicator = function( domNode, text ) {
	if ( !domNode ) {
		return;
	}

	const content = `
		<div class="tippy-content__message">${ text }</div>
		<button class="ck ck-button tippy-content__close-button ck-off" title="Close"></button>
	`;

	// eslint-disable-next-line no-undef
	const tooltip = tippy( domNode, {
		content,
		theme: 'light-border',
		placement: 'bottom',
		trigger: 'manual',
		hideOnClick: false,
		allowHTML: true,
		maxWidth: 280,
		showOnCreate: true,
		interactive: true,
		touch: 'hold',
		zIndex: 1,
		appendTo: () => document.body
	} );

	// eslint-disable-next-line no-undef
	const closeButton = tooltip.popper.querySelector( '.tippy-content__close-button' );

	closeButton.addEventListener( 'click', () => {
		tooltip.hide();
	} );

	domNode.addEventListener( 'click', () => {
		tooltip.hide();
	} );
};
