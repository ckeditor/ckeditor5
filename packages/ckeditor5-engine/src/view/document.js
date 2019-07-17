/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/document
 */

import DocumentSelection from './documentselection';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

/**
 * Document class creates an abstract layer over the content editable area, contains a tree of view elements and
 * {@link module:engine/view/documentselection~DocumentSelection view selection} associated with this document.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Document {
	/**
	 * Creates a Document instance.
	 */
	constructor() {
		/**
		 * Selection done on this document.
		 *
		 * @readonly
		 * @member {module:engine/view/documentselection~DocumentSelection} module:engine/view/document~Document#selection
		 */
		this.selection = new DocumentSelection();

		/**
		 * Roots of the view tree. Collection of the {@link module:engine/view/element~Element view elements}.
		 *
		 * View roots are created as a result of binding between {@link module:engine/view/document~Document#roots} and
		 * {@link module:engine/model/document~Document#roots} and this is handled by
		 * {@link module:engine/controller/editingcontroller~EditingController}, so to create view root we need to create
		 * model root using {@link module:engine/model/document~Document#createRoot}.
		 *
		 * @readonly
		 * @member {module:utils/collection~Collection} module:engine/view/document~Document#roots
		 */
		this.roots = new Collection( { idProperty: 'rootName' } );

		/**
		 * Defines whether document is in read-only mode.
		 *
		 * When document is read-ony then all roots are read-only as well and caret placed inside this root is hidden.
		 *
		 * @observable
		 * @member {Boolean} #isReadOnly
		 */
		this.set( 'isReadOnly', false );

		/**
		 * True if document is focused.
		 *
		 * This property is updated by the {@link module:engine/view/observer/focusobserver~FocusObserver}.
		 * If the {@link module:engine/view/observer/focusobserver~FocusObserver} is disabled this property will not change.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} module:engine/view/document~Document#isFocused
		 */
		this.set( 'isFocused', false );

		/**
		 * True if composition is in progress inside the document.
		 *
		 * This property is updated by the {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
		 * If the {@link module:engine/view/observer/compositionobserver~CompositionObserver} is disabled this property will not change.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} module:engine/view/document~Document#isComposing
		 */
		this.set( 'isComposing', false );

		/**
		 * Post-fixer callbacks registered to the view document.
		 *
		 * @private
		 * @member {Set}
		 */
		this._postFixers = new Set();
	}

	/**
	 * Gets a {@link module:engine/view/document~Document#roots view root element} with the specified name. If the name is not
	 * specific "main" root is returned.
	 *
	 * @param {String} [name='main'] Name of the root.
	 * @returns {module:engine/view/rooteditableelement~RootEditableElement|null} The view root element with the specified name
	 * or null when there is no root of given name.
	 */
	getRoot( name = 'main' ) {
		return this.roots.get( name );
	}

	/**
	 * Used to register a post-fixer callback. A post-fixers mechanism allows to update view tree just before rendering
	 * to the DOM.
	 *
	 * Post-fixers are fired just after all changes from the outermost change block were applied but
	 * before the {@link module:engine/view/view~View#event:render render event} is fired. If a post-fixer callback made
	 * a change, it should return `true`. When this happens, all post-fixers are fired again to check if something else should
	 * not be fixed in the new document tree state.
	 *
	 * View post-fixers are useful when you wants to apply some fixes whenever view structure changes. Keep in mind that
	 * changes executed in the view post-fixer may break model-view mapping, which may cause bugs. To
	 * avoid them make sure that your post-fixer do only save changes, for instance:
	 *  - add or remove attribute or class to an element,
	 *  - change inside of the {@link module:engine/view/uielement~UIElement UIElement},
	 *  - mark some model elements to convert using {@link  module:engine/model/differ~Differ#refreshItem differ API}.
	 *
	 * Try to avoid changes which touch view structure:
	 *  - you should not add or remove nor wrap or unwrap any view elements,
	 *  - you should not change the editor data model in view post-fixer.
	 *
	 * If you need DOM elements to be already updated, use {@link module:engine/view/view~View#event:render render event}.
	 *
	 * As a parameter, a post-fixer callback receives a {@link module:engine/view/downcastwriter~DowncastWriter downcast writer}
	 * instance connected with the executed changes block.
	 *
	 * Here is an example from the link plugin which adds highlight class to the link if the selection is in that link:
	 *
	 *		editor.editing.view.document.registerPostFixer( writer => {
	 *			const modelSelection = editor.model.document.selection;
	 *
	 *			if ( modelSelection.hasAttribute( 'linkHref' ) ) {
	 *				const modelRange = findLinkRange( modelSelection );
	 *				const viewRange = editor.editing.mapper.toViewRange( modelRange );
	 *
	 *				// There might be multiple `a` elements in the `viewRange`, for example,
	 *				//  when the `a` element is broken by a UIElement.
	 *				for ( const item of viewRange.getItems() ) {
	 *					if ( item.is( 'a' ) ) {
	 *						writer.addClass( HIGHLIGHT_CLASS, item );
	 *					}
	 *				}
	 *
	 *				// Let other post-fixers know that something changed.
	 *				return true;
	 *			}
	 *		} );
	 *
	 * Note that nothing happens when you execute this code in the console. It is because adding post-fixer will not execute it.
	 * It will be executed as soon as any change in the document causes rendering. If you want to re-render the editor's
	 * view after registering the post-fixer then you should do it manually calling
	 * {@link module:engine/view/view~View#forceRender `view.forceRender();`}.
	 *
	 * @param {Function} postFixer
	 */
	registerPostFixer( postFixer ) {
		this._postFixers.add( postFixer );
	}

	/**
	 * Destroys this instance. Makes sure that all observers are destroyed and listeners removed.
	 */
	destroy() {
		this.roots.map( root => root.destroy() );
		this.stopListening();
	}

	/**
	 * Performs post-fixer loops. Executes post-fixer callbacks as long as none of them has done any changes to the model.
	 *
	 * @protected
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 */
	_callPostFixers( writer ) {
		let wasFixed = false;

		do {
			for ( const callback of this._postFixers ) {
				wasFixed = callback( writer );

				if ( wasFixed ) {
					break;
				}
			}
		} while ( wasFixed );
	}

	/**
	 * Event fired whenever document content layout changes. It is fired whenever content is
	 * {@link module:engine/view/view~View#event:render rendered}, but should be also fired by observers in case of
	 * other actions which may change layout, for instance when image loads.
	 *
	 * @event layoutChanged
	 */
}

mix( Document, ObservableMixin );

/**
 * Enum representing type of the change.
 *
 * Possible values:
 *
 * * `children` - for child list changes,
 * * `attributes` - for element attributes changes,
 * * `text` - for text nodes changes.
 *
 * @typedef {String} module:engine/view/document~ChangeType
 */
