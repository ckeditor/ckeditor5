/* jshint node: true, esnext: true */

module.exports = {
	handlers: {
		/**
		 * @see http://usejsdoc.org/about-plugins.html#event-beforeparse
		 * @see https://github.com/jsdoc3/jsdoc/issues/1137
		 * @param evt
		 */
		beforeParse: function( evt ) {
			'use strict';

			let className;
			let foundClassName = /export default class ([A-Za-z]+)/.exec( evt.source );

			if ( foundClassName ) {
				className = foundClassName[ 1 ];
				evt.source =
					evt.source.replace( 'export default class', 'class' ) +
					'\nexport default ' + className + ';\n';
			}
		}
	}
};
