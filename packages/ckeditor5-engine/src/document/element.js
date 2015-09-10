/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/node' ], function( Node ) {
	/**
	 * Linear data element.
	 *
	 * @class document.Element
	 */
	class Element extends Node {
		/**
		 * Creates linear data element.
		 *
		 * This constructor should be used only internally by the document.
		 *
		 * @param {document.Element|Null} parent Node parent.
		 * @param {String} name Node name.
		 * @param {Array} attrs Array of attributes.
		 */
		constructor( parent, name, attrs ) {
			super( parent, attrs );

			this.name = name;
			this.children = [];
		}

		/**
		 * Element name.
		 *
		 * @readonly
		 * @property {String} name
		 */
	}

	return Element;
} );