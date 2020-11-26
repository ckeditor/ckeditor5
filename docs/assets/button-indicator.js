import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';

export function addButtonIndicator( buttonPosition, content, document ) {
	const button = document.querySelector( `.ck-toolbar__items > button:nth-of-type( ${ buttonPosition } )` );
	const tooltip = tippy( button, {
		content,
		theme: 'light-border',
		trigger: 'manual'
	} );

	tooltip.show();

	button.addEventListener( 'click', () => {
		tooltip.hide();
	} );
}
