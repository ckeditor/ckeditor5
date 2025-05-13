/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

module.exports = {
	name: 'svgoViewBoxPlugin',
	description: 'Plugin that ensures that every SVG has defined valid viewBox.',
	type: 'visitor',
	active: true,
	fn: () => ( {
		element: {
			enter: ( node, parentNode ) => {
				if ( parentNode.type !== 'root' ) {
					return;
				}

				if ( node.name !== 'svg' ) {
					return;
				}

				if ( isViewBoxValid( node ) ) {
					return;
				}

				throw new Error( 'Invalid or missing viewBox.' );
			}
		}
	} )
};

function isViewBoxValid( node ) {
	if ( !node.attributes ) {
		return false;
	}

	if ( !node.attributes.viewBox ) {
		return false;
	}

	const viewBoxPattern = /^\d+ \d+ \d+ \d+$/;

	return viewBoxPattern.test( node.attributes.viewBox );
}
