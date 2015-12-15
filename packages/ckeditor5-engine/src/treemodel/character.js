/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'treemodel/node' ], ( Node ) => {
	/**
	 * Data structure for character stored in the tree data model.
	 *
	 * @class treeModel.Character
	 */
	class Character extends Node {
		/**
		 * Creates character linear item.
		 *
		 * @param {String} character Described character.
		 * @param {Iterable} attrs Iterable collection of {@link treeModel.Attribute attributes}.
		 * @constructor
		 */
		constructor( character, attrs ) {
			super( attrs );

			/**
			 * Described character.
			 *
			 * @readonly
			 * @property {String} character
			 */
			this.character = character;
		}
	}

	return Character;
} );
