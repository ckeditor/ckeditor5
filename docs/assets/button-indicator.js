/**
 * Attach to any HTML element tooltip with its description.
 *
 * @param {HTMLElement} [item] HTML element.
 * @param {String} [text] Item description to be shown in the tooltip.
 */
// eslint-disable-next-line no-unused-vars
function addItemIndicator( item, text ) {
	if ( !item ) {
		return;
	}

	const content = `
		<div class="tippy-content__message">${ text }</div>
		<button class="ck ck-button tippy-content__close-button ck-off" />
	`;

	// eslint-disable-next-line no-undef
	const tooltip = tippy( item, {
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
		// eslint-disable-next-line no-undef
		appendTo: () => document.body
	} );

	// eslint-disable-next-line no-undef
	const closeButton = tooltip.popper.querySelector( '.tippy-content__close-button' );
	closeButton.addEventListener( 'click', () => {
		tooltip.hide();
	} );

	item.addEventListener( 'click', () => {
		tooltip.hide();
	} );
}
