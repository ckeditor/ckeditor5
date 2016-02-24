/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

module.exports = {
	handlers: {
		/**
		 * @see http://usejsdoc.org/about-plugins.html#event-beforeparse
		 * @param evt
		 */
		beforeParse( evt ) {
			'use strict'; // WAT... JSDoc fails when you move it to the top of the file.

			let className;
			let foundClassName = /export default class ([A-Za-z]+)/.exec( evt.source );

			// Fix for {@link https://github.com/jsdoc3/jsdoc/issues/1137}. Export default class is not parsed by jsdoc 3.4.
			if ( foundClassName ) {
				className = foundClassName[ 1 ];
				evt.source =
					evt.source.replace( 'export default class', 'class' ) +
					'\nexport default ' + className + ';\n';
			}

			// TODO: jsdoc fail to parse method with expanded argument list
			evt.source = evt.source.replace( '...}', '}' );

			// Make code in comments indented with one tab so it will not be shifted.
			evt.source = evt.source.replace( /\*\t\t/g, '*\t' );
		}
	}
};
