/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module heading/title
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ViewWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import {
	needsPlaceholder,
	showPlaceholder,
	hidePlaceholder,
	enablePlaceholder
} from '@ckeditor/ckeditor5-engine/src/view/placeholder';

/**
 * The Title plugin.
 *
 * It splits the document into `Title` and `Body` sections.
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
		return [ Paragraph ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;

		/**
		 * Reference to the empty paragraph in the body
		 * created when there's no element in the body for the placeholder purpose.
		 *
		 * @private
		 * @type {null|module:engine/model/element~Element}
		 */
		this._bodyPlaceholder = null;

		// To use Schema for disabling some features when selection is inside the title element
		// it's needed to create the following structure:
		//
		// <title>
		//     <title-content>The title text</title-content>
		// </title>
		//
		// See: https://github.com/ckeditor/ckeditor5/issues/2005.
		model.schema.register( 'title', { isBlock: true, allowIn: '$root' } );
		model.schema.register( 'title-content', { isBlock: true, allowIn: 'title', allowAttributes: [ 'alignment' ] } );
		model.schema.extend( '$text', { allowIn: 'title-content' } );

		// Disallow all attributes in `title-content`.
		model.schema.addAttributeCheck( context => {
			if ( context.endsWith( 'title-content $text' ) ) {
				return false;
			}
		} );

		// Because of `title` is represented by two elements in the model
		// but only one in the view it's needed to adjust Mapper.
		editor.editing.mapper.on( 'modelToViewPosition', mapModelPositionToView( editor.editing.view ) );
		editor.data.mapper.on( 'modelToViewPosition', mapModelPositionToView( editor.editing.view ) );

		// `title-content` <-> `h1` conversion.
		editor.conversion.elementToElement( { model: 'title-content', view: 'h1' } );

		// Take care about proper `title` element structure.
		model.document.registerPostFixer( writer => this._fixTitleContent( writer ) );

		// Create and take care about proper position of a `title` element.
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
		const titleElement = this._getTitleElement();
		const titleContentElement = titleElement.getChild( 0 );

		editor.model.insertContent( editor.data.parse( data, 'title-content' ), titleContentElement, 'in' );
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
		const titleElement = this._getTitleElement();
		const titleContentElement = titleElement.getChild( 0 );

		return this.editor.data.stringify( titleContentElement );
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
	 * Returns `title` element when is in the document. Returns `undefined` otherwise.
	 *
	 * @private
	 * @returns {module:engine/model/element~Element|undefined}
	 */
	_getTitleElement() {
		const root = this.editor.model.document.getRoot();

		for ( const child of root.getChildren() ) {
			if ( child.is( 'title' ) ) {
				return child;
			}
		}
	}

	/**
	 * Model post-fixer callback that ensures `title` has only one `title-content` child.
	 * All additional children should be moved after `title` element and renamed to a paragraph.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @returns {Boolean}
	 */
	_fixTitleContent( writer ) {
		const title = this._getTitleElement();

		if ( !title ) {
			return false;
		}

		const titleChildren = Array.from( title.getChildren() );
		let hasChanged = false;

		// Skip first child because it is an allowed element.
		titleChildren.shift();

		for ( const titleChild of titleChildren ) {
			writer.move( writer.createRangeOn( titleChild ), title, 'after' );
			writer.rename( titleChild, 'paragraph' );
			hasChanged = true;
		}

		return hasChanged;
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
		let numberOfMovedElements = 0;

		// Loop through root children and take care about a proper position of a title element.
		// Title always has to be the first element in the root.
		for ( const rootChild of Array.from( modelRoot.getChildren() ) ) {
			// If the first element is not a title we need to fix it.
			if ( rootChild.index === 0 && !rootChild.is( 'title' ) ) {
				const title = this._getTitleElement();

				// Change first element to the title if it can be a title.
				if ( Title.titleLikeElements.has( rootChild.name ) ) {
					const position = model.createPositionBefore( rootChild );
					const title = writer.createElement( 'title' );

					writer.insert( title, position );
					writer.append( rootChild, title );
					writer.rename( rootChild, 'title-content' );

					// After changing element to the title it has to be filtered out from disallowed attributes.
					model.schema.removeDisallowedAttributes( [ rootChild ], writer );

				// If the first element cannot be a title but title is already in the root
				// than move the first element after a title.
				} else if ( title ) {
					const positionAfterTitle = writer.createPositionAt( title, 'after' );

					// To preserve correct order when more than one element is moved in the one post-fixer call.
					const targetPosition = positionAfterTitle.getShiftedBy( numberOfMovedElements );

					writer.move( writer.createRangeOn( rootChild ), targetPosition );
					numberOfMovedElements++;

				// If there is no title or any element that could be a title then create an empty title.
				} else {
					writer.insertElement( 'title', modelRoot );
					writer.insertElement( 'title-content', modelRoot.getChild( 0 ) );
				}

				hasChanged = true;

			// If there is a title somewhere in the content.
			} else if ( rootChild.index > 0 && rootChild.is( 'title' ) ) {
				// Rename it to a paragraph if it has a content.
				if ( model.hasContent( rootChild ) ) {
					writer.rename( rootChild, 'paragraph' );
					writer.unwrap( rootChild.getChild( 0 ) );
				// Or remove if it's empty (it's created as a result of splitting parents by insertContent method).
				} else {
					writer.remove( rootChild );
				}

				hasChanged = true;
			}
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
		const t = editor.t;
		const view = editor.editing.view;
		const viewRoot = view.document.getRoot();

		const bodyPlaceholder = editor.config.get( 'placeholder' ) || t( 'Body' );
		const titlePlaceholder = t( 'Title' );

		// Attach placeholder to the view title element.
		editor.editing.downcastDispatcher.on( 'insert:title-content', ( evt, data, conversionApi ) => {
			enablePlaceholder( {
				view,
				element: conversionApi.mapper.toViewElement( data.item ),
				text: titlePlaceholder
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

				writer.setAttribute( 'data-placeholder', bodyPlaceholder, body );
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

				if ( selectedElements.length === 1 && selectedElements[ 0 ].name === 'title-content' ) {
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

				const title = root.getChild( 0 );
				const body = root.getChild( 1 );

				if ( selectedElement === body && selectionPosition.isAtStart ) {
					writer.setSelection( title.getChild( 0 ), 0 );
					cancel();
				}
			} );
		} );
	}
}

/**
 * A list of element names which should be treated by the Title plugin as
 * title-like. This means that element on the list will be changed to the title
 * element when will be the first element in the root.
 *
 * @member {Set.<String>} module:heading/title~Title.titleLikeElements
 */
Title.titleLikeElements = new Set( [ 'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6' ] );

function mapModelPositionToView( editingView ) {
	return ( evt, data ) => {
		if ( !data.modelPosition.parent.is( 'title' ) ) {
			return;
		}

		const modelParent = data.modelPosition.parent.parent;
		const viewParent = data.mapper.toViewElement( modelParent );

		data.viewPosition = editingView.createPositionAt( viewParent, 0 );
		evt.stop();
	};
}
