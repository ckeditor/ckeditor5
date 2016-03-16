/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import utils from './utils/utils.js';
import Collection from './utils/collection.js';
import ObservableMixin from './utils/observablemixin.js';

/**
 * @memberOf ckeditor5
 * @mixes utils.ObservaleMixin
 * @extends utils.Collection
 */
export default class EditableCollection extends Collection {
	constructor() {
		super( { idProperty: 'name' } );

		/**
		 * The currently focused editable.
		 *
		 * @observable
		 * @member {ckeditor5.Editable} ckeditor5.EditableCollection#current
		 */
		this.set( 'current', null );

		this.on( 'add', ( evt, editable ) => {
			this.listenTo( editable, 'change:isFocused', ( evt, value ) => {
				this.current = value ? editable : null;
			} );
		} );

		this.on( 'remove', ( evt, editable ) => {
			this.stopListening( editable );
		} );
	}

	destroy() {
		this.stopListening();

		for ( let editable of this ) {
			editable.destroy();
		}
	}
}

utils.mix( EditableCollection, ObservableMixin );
