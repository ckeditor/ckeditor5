/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/collectstylesheets
 */

/**
 * A helper function for getting concatenated CSS rules from external stylesheets.
 *
 * @param stylesheets An array of stylesheet paths delivered by the user through the plugin configuration.
 */
export default async function collectStylesheets( stylesheets?: Array<string> ): Promise<string> {
	if ( !stylesheets ) {
		return '';
	}

	const results = await Promise.all(
		stylesheets.map( async stylesheet => {
			if ( stylesheet === 'EDITOR_STYLES' ) {
				return getEditorStyles();
			}

			const response = await window.fetch( stylesheet );

			return response.text();
		} )
	);

	return results.join( ' ' ).trim();
}

/**
 * A helper function for getting the basic editor content styles for the `.ck-content` class
 * and all CSS variables defined in the document.
 */
function getEditorStyles(): string {
	const editorStyles = [];
	const editorCSSVariables = [];

	for ( const styleSheet of Array.from( document.styleSheets ) ) {
		const ownerNode = styleSheet.ownerNode as Element;

		if ( ownerNode.hasAttribute( 'data-cke' ) ) {
			for ( const rule of Array.from( styleSheet.cssRules ) ) {
				if ( rule.cssText.indexOf( '.ck-content' ) !== -1 ) {
					editorStyles.push( rule.cssText );
				} else if ( rule.cssText.indexOf( ':root' ) !== -1 ) {
					editorCSSVariables.push( rule.cssText );
				}
			}
		}
	}

	if ( !editorStyles.length ) {
		console.warn(
			'The editor stylesheet could not be found in the document. ' +
			'Check your webpack config - style-loader should use data-cke=true attribute for the editor stylesheet.'
		);
	}

	// We want to trim the returned value in case of `[ "", "", ... ]`.
	return [ ...editorCSSVariables, ...editorStyles ].join( ' ' ).trim();
}
