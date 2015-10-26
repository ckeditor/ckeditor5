/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], function() {
	/**
	 * Abstract base operation class.
	 *
	 * @class document.Operation
	 */
	class Operation {
		/**
		 * Base operation constructor.
		 *
		 * @param {Number} baseVersion {@link document.Document#version} on which operation can be applied.
		 * @constructor
		 */
		constructor( baseVersion ) {
			/**
			 * {@link document.Document#version} on which operation can be applied. If you try to
			 * {@link document.Document#applyOperation apply} operation with different base version then
			 * {@link document.Document#version document version} the {@link document-applyOperation-wrong-version}
			 * error is thrown.
			 *
			 * @type {Number}
			 */
			this.baseVersion = baseVersion;
		}
	}

	return Operation;
} );