/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], function() {
	/**
	 * Data structure for text with attributes. Note that Text is not a node, because it will never be part of document
	 * tree, {@link document.Character is a node}.
	 *
	 * @class document.Text
	 */
	class Text {
		/**
		 * Creates text with attributes.
		 *
		 * @param {String} text Described character.
		 * @constructor
		 */
		constructor( text, attrs ) {
			/**
			 * Text.
			 *
			 * @readonly
			 * @property {String} text
			 */
			this.text = text;

			/**
			 * Array of attributes.
			 *
			 * @property {Array} attr
			 */
			this.attrs = attrs;
		}
	}

	return Text;
} );