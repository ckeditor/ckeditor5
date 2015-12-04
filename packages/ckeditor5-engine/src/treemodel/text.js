/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], () => {
	/**
	 * Data structure for text with attributes. Note that the `Text` is not a {@link treeModel.Node},
	 * because it will never be part of the document tree. {@link treeModel.Character is a node}.
	 *
	 * @class treeModel.Text
	 */
	class Text {
		/**
		 * Creates a text with attributes.
		 *
		 * @param {String} text Described text.
		 * @param {Iterable} attrs Iterable collection of {@link treeModel.Attribute attributes}.
		 * @constructor
		 */
		constructor( text, attrs ) {
			/**
			 * Text.
			 *
			 * @readonly
			 * @property {String}
			 */
			this.text = text;

			/**
			 * Iterable collection of {@link treeModel.Attribute attributes}.
			 *
			 * @property {Iterable}
			 */
			this.attrs = attrs;
		}
	}

	return Text;
} );
