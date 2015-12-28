/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'treeview/observer/observer' ], ( Observer ) => {
	class MutationObserver extends Observer {
		constructor() {
			super();

			this.config = {
				childList: true,
				characterData: true,
				characterDataOldValue: true,
				subtree: true
			};
		}

		/**
		 * @method init
		 * @param {treeView.TreeView}
		 */
		init( treeView ) {
			this.domRoot = treeView.domRoot;

			this._mutationObserver = new window.MutationObserver( this._onMutations.bind( this ) );
		}

		/**
		 * @method attach
		 */
		attach() {
			this._mutationObserver.observe( this.domRoot, this.config );
		}

		/**
		 * @method detach
		 */
		detach() {
			this._mutationObserver.disconnect();
		}

		// _onMutations( mutations ) {}
	}

	return MutationObserver;
} );
