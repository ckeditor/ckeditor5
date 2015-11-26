/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

( () => {
	bender.tools.core = {
		/**
		 * Defines CKEditor plugin which is a mock of an editor creator.
		 *
		 * If `proto` is not set or it does not define `create()` and `destroy()` methods,
		 * then they will be set to Sinon spies. Therefore the shortest usage is:
		 *
		 *	  bender.tools.defineEditorCreatorMock( 'test1' );
		 *
		 * The mocked creator is available under:
		 *
		 *	  editor.plugins.get( 'creator-thename' );
		 *
		 * @param {String} creatorName Name of the creator.
		 * @param {Object} [proto] Prototype of the creator. Properties from the proto param will
		 * be copied to the prototype of the creator.
		 */
		defineEditorCreatorMock: ( creatorName, proto ) => {
			CKEDITOR.define( 'plugin!creator-' + creatorName, [ 'creator' ], ( Creator ) => {
				return mockCreator( Creator );
			} );

			function mockCreator( Creator ) {
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
			}
		},

		/**
		 * Returns the number of elements return by the iterator.
		 *
		 *	  bender.tools.core.getIteratorCount( [ 1, 2, 3, 4, 5 ] ); // 5;
		 *
		 * @param {Iterable.<*>} iterator Any iterator.
		 * @returns {Number} Number of elements returned by that iterator.
		 */
		getIteratorCount: ( iterator ) => {
			let count = 0;

			for ( let _ of iterator ) { // jshint ignore:line
				count++;
			}

			return count;
		}
	};
} )();
