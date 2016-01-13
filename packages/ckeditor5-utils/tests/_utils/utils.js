/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import amdUtils from '/tests/_utils/amd.js';

const utils = {
	/**
	 * Defines CKEditor plugin which is a mock of an editor creator.
	 *
	 * If `proto` is not set or it does not define `create()` and `destroy()` methods,
	 * then they will be set to Sinon spies. Therefore the shortest usage is:
	 *
	 *		testUtils.defineEditorCreatorMock( 'test1' );
	 *
	 * The mocked creator is available under:
	 *
	 *		editor.plugins.get( 'creator-thename' );
	 *
	 * @param {String} creatorName Name of the creator.
	 * @param {Object} [proto] Prototype of the creator. Properties from the proto param will
	 * be copied to the prototype of the creator.
	 */
	defineEditorCreatorMock( creatorName, proto ) {
		amdUtils.define( 'creator-' + creatorName, [ 'core/creator' ], ( Creator ) => {
			class TestCreator extends Creator {}

			if ( proto ) {
				for ( let propName in proto ) {
					TestCreator.prototype[ propName ] = proto[ propName ];
				}
			}

			if ( !TestCreator.prototype.create ) {
				TestCreator.prototype.create = sinon.spy().named( creatorName + '-create' );
			}

			if ( !TestCreator.prototype.destroy ) {
				TestCreator.prototype.destroy = sinon.spy().named( creatorName + '-destroy' );
			}

			return TestCreator;
		} );
	},

	/**
	 * Returns the number of elements return by the iterator.
	 *
	 *		testUtils.getIteratorCount( [ 1, 2, 3, 4, 5 ] ); // 5;
	 *
	 * @param {Iterable.<*>} iterator Any iterator.
	 * @returns {Number} Number of elements returned by that iterator.
	 */
	getIteratorCount( iterator ) {
		let count = 0;

		for ( let _ of iterator ) { // jshint ignore:line
			count++;
		}

		return count;
	}
};

utils.treemodel = {
	/**
	 * Returns tree structure as a simplified string. Elements are uppercase and characters are lowercase.
	 * Start and end of an element is marked the same way, by the element's name (in uppercase).
	 *
	 *		let element = new Element( 'div', [], [ 'abc', new Element( 'p', [], 'foo' ), 'xyz' ] );
	 *		treemodelUtils.getNodesAndText( element ); // abcPfooPxyz
	 *
	 * @param {treeModel.Range} range Range to stringify.
	 * @returns {String} String representing element inner structure.
	 */
	getNodesAndText( range ) {
		console.error( 'This should be moved to ckeditor5-core/tests/treemodel/_utils/' ); /* jshint ignore:line */

		let txt = '';

		for ( let step of range ) {
			let node = step.node;

			if ( node.character ) {
				txt += node.character.toLowerCase();
			} else if ( node.name ) {
				txt += node.name.toUpperCase();
			}
		}

		return txt;
	}
};

export default utils;
