/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module heading/title
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import {
	needsPlaceholder,
	showPlaceholder,
	hidePlaceholder,
	enablePlaceholder
} from '@ckeditor/ckeditor5-engine/src/view/placeholder';

import ViewWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';

const allowedToBeTitle = new Set( [ 'heading1', 'heading2', 'heading3', 'paragraph' ] );

/**
 * The Title plugin.
 *
 * It splits the document into `title` and `body` sections.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Title extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Title';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Paragraph, Enter ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;

		/**
		 * Reference to the empty paragraph in the body created when there's no element in the body.
		 *
		 * @private
		 * @type {null|module:engine/model/element~Element}
		 */
		this._bodyPlaceholder = null;

		// Schema.
		model.schema.register( 'title', { inheritAllFrom: '$block' } );

		// Allow title only directly inside a root.
		model.schema.addChildCheck( ( context, childDefinition ) => {
			if ( !context.endsWith( '$root' ) && childDefinition.name === 'title' ) {
				return false;
			}
		} );

		// Disallow all attributes in title.
		model.schema.addAttributeCheck( context => {
			if ( context.endsWith( 'title $text' ) ) {
				return false;
			}
		} );

		editor.conversion.elementToElement( { model: 'title', view: 'h1' } );

		// Create and take care about proper position of a title element.
		model.document.registerPostFixer( writer => this._fixTitleElement( writer ) );

		// Prevent from adding extra paragraph after paste or enter.
		model.document.registerPostFixer( writer => this._preventExtraParagraphing( writer ) );

		// Attach `Title` and `Body` placeholders to the empty title and/or content.
		this._attachPlaceholders();

		// Attach Tab handling.
		this._attachTabPressHandling();
	}

	/**
	 * Sets the title of the document. This methods does not change any content outside the title element.
	 *
	 * @param {String} data Data to be set as a document title.
	 */
	setTitle( data ) {
		const editor = this.editor;
		const title = editor.model.document.getRoot().getChild( 0 );

		editor.model.insertContent( editor.data.parse( data ), title, 'in' );
	}

	/**
	 * Returns the title of the document. Note, that because this plugin does not allow any formatting inside
	 * the title element, the output of this method will be a plain text, with no HTML tags. However, it
	 * may contain some markers, like comments or suggestions. In such case, a special tag for the
	 * marker will be included in the title text.
	 *
	 * @returns {String} Title of the document.
	 */
	getTitle() {
		const title = this.editor.model.document.getRoot().getChild( 0 );

		return this.editor.data.stringify( title );
	}

	/**
	 * Sets the body of the document.
	 *
	 * @returns {String} data Data to be set as a body of the document.
	 */
	setBody( data ) {
		const editor = this.editor;
		const root = editor.model.document.getRoot();
		const range = editor.model.createRange(
			editor.model.createPositionAt( root.getChild( 0 ), 'after' ),
			editor.model.createPositionAt( root, 'end' )
		);

		editor.model.insertContent( editor.data.parse( data ), range );
	}

	/**
	 * Returns the body of the document.
	 *
	 * @returns {String} Body of the document.
	 */
	getBody() {
		const root = this.editor.model.document.getRoot();
		const viewWriter = new ViewWriter();

		// model -> view
		const viewDocumentFragment = this.editor.data.toView( root );

		// Remove title.
		viewWriter.remove( viewWriter.createRangeOn( viewDocumentFragment.getChild( 0 ) ) );

		// view -> data
		return this.editor.data.processor.toData( viewDocumentFragment );
	}

	/**
	 * Model post-fixer callback that takes care about creating and keeping `title` element as a first child in a root.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @returns {Boolean}
	 */
	_fixTitleElement( writer ) {
		const model = this.editor.model;
		const modelRoot = model.document.getRoot();
		let hasChanged = false;
		let index = 0;

		// Loop through root children and take care about a proper position of a title element.
		// Title always has to be the first element in the root.
		for ( const rootChild of modelRoot.getChildren() ) {
			// If the first element is not a title we need to fix it.
			if ( index === 0 && !rootChild.is( 'title' ) ) {
				const title = Array.from( modelRoot.getChildren() ).find( item => item.is( 'title' ) );

				// Change first element to the title if it can be a title.
				if ( allowedToBeTitle.has( rootChild.name ) ) {
					writer.rename( rootChild, 'title' );
					// After changing element to the title is has to be filtered out from disallowed attributes.
					model.schema.removeDisallowedAttributes( Array.from( rootChild.getChildren() ), writer );

				// If the first element cannot be a title but title is already in the root
				// than move the first element after a title.
				// It may happen e.g. when an image has been dropped before the title element.
				} else if ( title ) {
					writer.move( writer.createRangeOn( rootChild ), title, 'after' );

				// If there is no title or any element that could be a title then create an empty title.
				} else {
					writer.insertElement( 'title', modelRoot );
				}

				hasChanged = true;

			// If there is a title in the content then change ot to a paragraph.
			} else if ( index > 0 && rootChild.is( 'title' ) ) {
				writer.rename( rootChild, 'paragraph' );
				hasChanged = true;
			}

			index++;
		}

		// Attach `Body` placeholder when there is no element after a title.
		if ( modelRoot.childCount < 2 ) {
			this._bodyPlaceholder = writer.createElement( 'paragraph' );
			writer.insert( this._bodyPlaceholder, modelRoot, 1 );
			hasChanged = true;
		}

		return hasChanged;
	}

	/**
	 * Prevents editor from adding extra paragraphs after pasting to the title element
	 * or pressing an enter in the title element.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @returns {Boolean}
	 */
	_preventExtraParagraphing( writer ) {
		const root = this.editor.model.document.getRoot();
		const placeholder = this._bodyPlaceholder;

		const shouldDeleteLastParagraph = (
			placeholder && placeholder.is( 'paragraph' ) && placeholder.childCount === 0 &&
			root.childCount > 2 && root.getChild( root.childCount - 1 ) === placeholder
		);

		if ( shouldDeleteLastParagraph ) {
			this._bodyPlaceholder = null;
			writer.remove( placeholder );

			return true;
		}

		return false;
	}

	/**
	 * Attaches `Title` and `Body` placeholders to the title and/or content.
	 *
	 * @private
	 */
	_attachPlaceholders() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewRoot = view.document.getRoot();

		// Attach placeholder to the view title element.
		editor.editing.downcastDispatcher.on( 'insert:title', ( evt, data, conversionApi ) => {
			enablePlaceholder( {
				view,
				element: conversionApi.mapper.toViewElement( data.item ),
				text: 'Title'
			} );
		} );

		// Attach placeholder to first element after a title element and remove it if it's not needed anymore.
		// First element after title can change so we need to observe all changes keep placeholder in sync.
		let oldBody;

		// This post-fixer runs after the model post-fixer so we can assume that
		// the second child in view root will always exist.
		view.document.registerPostFixer( writer => {
			const body = viewRoot.getChild( 1 );
			let hasChanged = false;

			// If body element has changed we need to disable placeholder on the previous element
			// and enable on the new one.
			if ( body !== oldBody ) {
				if ( oldBody ) {
					hidePlaceholder( writer, oldBody );
					writer.removeAttribute( 'data-placeholder', oldBody );
				}

				writer.setAttribute( 'data-placeholder', 'Body', body );
				oldBody = body;
				hasChanged = true;
			}

			// Then we need to display placeholder if it is needed.
			if ( needsPlaceholder( body ) && viewRoot.childCount === 2 && body.name === 'p' ) {
				hasChanged = showPlaceholder( writer, body ) ? true : hasChanged;
			// Or hide if it is not needed.
			} else {
				hasChanged = hidePlaceholder( writer, body ) ? true : hasChanged;
			}

			return hasChanged;
		} );
	}

	/**
	 * Creates navigation between Title and Body sections using `Tab` and `Shift+Tab` keys.
	 *
	 * @private
	 */
	_attachTabPressHandling() {
		const editor = this.editor;
		const model = editor.model;

		// Pressing `Tab` inside the title should move the caret to the body.
		editor.keystrokes.set( 'TAB', ( data, cancel ) => {
			model.change( writer => {
				const selection = model.document.selection;
				const selectedElements = Array.from( selection.getSelectedBlocks() );

				if ( selectedElements.length === 1 && selectedElements[ 0 ].name === 'title' ) {
					const firstBodyElement = model.document.getRoot().getChild( 1 );
					writer.setSelection( firstBodyElement, 0 );
					cancel();
				}
			} );
		} );

		// Pressing `Shift+Tab` at the beginning of the body should move the caret to the title.
		editor.keystrokes.set( 'SHIFT + TAB', ( data, cancel ) => {
			model.change( writer => {
				const selection = model.document.selection;

				if ( !selection.isCollapsed ) {
					return;
				}

				const root = editor.model.document.getRoot();
				const selectedElement = Array.from( selection.getSelectedBlocks() )[ 0 ];
				const selectionPosition = selection.getFirstPosition();

				if ( selectedElement === root.getChild( 1 ) && selectionPosition.isAtStart ) {
					writer.setSelection( root.getChild( 0 ), 0 );
					cancel();
				}
			} );
		} );
	}
}
