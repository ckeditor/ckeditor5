/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/utils
 */

const ATTRIBUTE_WHITESPACES = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g; // eslint-disable-line no-control-regex
const SAFE_URL = /^(?:(?:https?|ftps?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i;

/**
 * Returns `true` if a given view node is the link element.
 *
 * @param {module:engine/view/node~Node} node
 * @returns {Boolean}
 */
export function isLinkElement( node ) {
	return node.is( 'attributeElement' ) && !!node.getCustomProperty( 'link' );
}

/**
 * Creates link {@link module:engine/view/attributeelement~AttributeElement} with provided `href` attribute.
 *
 * @param {String} href
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createLinkElement( href, writer ) {
	// Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
	const linkElement = writer.createAttributeElement( 'a', { href }, { priority: 5 } );
	writer.setCustomProperty( 'link', true, linkElement );

	return linkElement;
}

/**
 * Returns a safe URL based on a given value.
 *
 * An URL is considered safe if it is safe for the user (does not contain any malicious code).
 *
 * If URL is considered unsafe, a simple `"#"` is returned.
 *
 * @protected
 * @param {*} url
 * @returns {String} Safe URL.
 */
export function ensureSafeUrl( url ) {
	url = String( url );

	return isSafeUrl( url ) ? url : '#';
}

// Checks whether the given URL is safe for the user (does not contain any malicious code).
//
// @param {String} url URL to check.
function isSafeUrl( url ) {
	const normalizedUrl = url.replace( ATTRIBUTE_WHITESPACES, '' );

	return normalizedUrl.match( SAFE_URL );
}

/**
 * Returns configuration options as defined in {@link module:link/link~LinkConfig#decorators `editor.config.decorators`} but processed
 * to respect localization of the editor, i.e. to display {@link module:link/link~LinkDecoratorManualDefinition label}
 * in the correct language.
 *
 * **Note:** Only few most commonly used labels has provided translations. In all other cases decorators configuration should be
 * directly translated in configuration.
 *
 * @param {module:core/editor/editor~Editor} editor An editor instance
 * @returns {Array.<module:link/link~LinkDecoratorAutomaticDefinition|module:link/link~LinkDecoratorManualDefinition>}
 */
export function getLocalizedDecorators( editor ) {
	const t = editor.t;
	const decorators = editor.config.get( 'link.decorators' );

	if ( decorators ) {
		const localizedDecoratorsLabels = {
			'Open in a new tab': t( 'Open in a new tab' ),
			'Downloadable': t( 'Downloadable' )
		};

		return decorators.map( decorator => {
			if ( decorator.label && localizedDecoratorsLabels[ decorator.label ] ) {
				decorator.label = localizedDecoratorsLabels[ decorator.label ];
			}
			return decorator;
		} );
	} else {
		return [];
	}
}
