/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import utils from './utils/utils.js';
import Collection from './utils/collection.js';
import ObservableMixin from './utils/observablemixin.js';

/**
 * A collection of {@link ckeditor5.Editable editables}.
 *
 * @memberOf ckeditor5
 * @mixes utils.ObservaleMixin
 * @extends utils.Collection
 */
export default class EditableCollection extends Collection {
	/**
	 * Creates a new instance of Editabe.
	 */
	constructor() {
		super( { idProperty: 'name' } );

		/**
		 * The currently focused editable.
		 *
		 * @observable
		 * @readonly
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

	/**
	 * Destorys the collection.
	 */
	destroy() {
		this.stopListening();

		for ( let editable of this ) {
			editable.destroy();
		}

		this.clear();
	}
}

utils.mix( EditableCollection, ObservableMixin );
