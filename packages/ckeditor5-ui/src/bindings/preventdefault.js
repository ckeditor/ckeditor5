/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/bindings/preventdefault
 */

/**
 * Returns a {module:ui/template~TemplateToBinding} resulting in a native `event#preventDefault`
 * for the DOM event if `event#target` equals {@link module:ui/view~View#element}.
 *
 * @param {module:ui/view~View} view View instance that uses the template.
 * @returns {module:ui/template~TemplateToBinding}
 */
export default function preventDefault( view ) {
	return view.bindTemplate.to( evt => {
		if ( evt.target === view.element ) {
			evt.preventDefault();
		}
	} );
}
