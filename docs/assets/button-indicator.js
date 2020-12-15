// eslint-disable-next-line no-unused-vars
function addButtonIndicator( item, text, document ) {
	if ( !item ) {
		return;
	}

	/* eslint max-len: ["error", 140, { "ignoreComments": true, "ignoreTemplateLiterals": true }] */
	const content = `
		<div class="tippy-content__message">${ text }</div>
		<button class="ck ck-button tippy-content__close-button ck-off" >
			<svg class="ck ck-icon ck-button__icon" viewBox="0 0 20 20">
				<path d="M11.591 10.177l4.243 4.242a1 1 0 0 1-1.415 1.415l-4.242-4.243-4.243 4.243a1 1 0 0 1-1.414-1.415l4.243-4.242L4.52 5.934A1 1 0 0 1 5.934 4.52l4.243 4.243 4.242-4.243a1 1 0 1 1 1.415 1.414l-4.243 4.243z"></path>
			</svg>
		</button>
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
		// interactive: true,
		// appendTo: () => document.body
	} );

	const closeButton = document.querySelector( '.tippy-content .tippy-content__close-button' );
	closeButton.addEventListener( 'click', () => {
		tooltip.hide();
	} );

	item.addEventListener( 'click', () => {
		tooltip.hide();
	} );
}
