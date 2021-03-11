/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecaption/tablecaptionediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { enablePlaceholder } from 'ckeditor5/src/engine';
import { toWidgetEditable } from 'ckeditor5/src/widget';

/**
 * The table caption editing plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCaptionEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCaptionEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const view = editor.editing.view;
		const t = editor.t;

		if ( !schema.isRegistered( 'caption' ) ) {
			schema.register( 'caption', {
				allowIn: 'table',
				allowContentOf: '$block',
				isLimit: true
			} );
		} else {
			schema.extend( 'caption', {
				allowIn: 'table'
			} );
		}

		// View -> model converter for the data pipeline.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: matchTableCaptionViewElement,
			model: 'caption'
		} );

		// Model -> view converter for the data pipeline.
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isTable( modelElement.parent ) ) {
					return null;
				}

				return writer.createContainerElement( 'figcaption' );
			}
		} );

		// Model -> view converter for the editing pipeline.
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isTable( modelElement.parent ) ) {
					return null;
				}

				const figcaptionElement = writer.createEditableElement( 'figcaption' );
				writer.setCustomProperty( 'tableCaption', true, figcaptionElement );

				enablePlaceholder( {
					view,
					element: figcaptionElement,
					text: t( 'Enter table caption' )
				} );

				return toWidgetEditable( figcaptionElement, writer );
			}
		} );

		// Merge doubled captions in a table. Make sure they land at the end of the table.
		editor.model.document.registerPostFixer( writer => this._mergeCaptionModels( writer ) );
	}

	/**
	 * Makes sure duplicated caption models are merged and placed at the end of the table.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer The writer to make changes with.
	 * @returns {Boolean} `true` if any change was applied, `false` otherwise.
	 */
	_mergeCaptionModels( writer ) {
		const model = this.editor.model;
		const changes = model.document.differ.getChanges();
		let wasFixed = false;

		for ( const entry of changes ) {
			if ( entry.type != 'insert' ) {
				continue;
			}

			const positionParent = entry.position.parent;

			if ( positionParent.is( 'element', 'table' ) || entry.name == 'table' ) {
				const table = entry.name == 'table' ? entry.position.nodeAfter : entry.position.findAncestor( 'table' );

				if ( !table ) {
					return;
				}

				const captionsToMerge = Array.from( table.getChildren() )
					.filter( child => child.is( 'element', 'caption' ) );

				const firstCaption = captionsToMerge.shift();

				if ( !firstCaption ) {
					return;
				}

				// Move all the contents of the captions to the first one.
				for ( const caption of captionsToMerge ) {
					writer.move( writer.createRangeIn( caption ), firstCaption, 'end' );
					writer.remove( caption );
				}

				// Make sure the final caption is at the end of the table.
				if ( firstCaption.nextSibling ) {
					writer.move( writer.createRangeOn( firstCaption ), table, 'end' );
					wasFixed = true;
				}

				// Do we merged captions and/or moved the single caption to the end of the table?
				wasFixed = !!captionsToMerge.length || wasFixed;
			}
		}

		return wasFixed;
	}
}

// {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a caption.
//
// There are two possible forms of the valid caption:
//  - A `<figcaption>` element inside a `<figure class="table">` element.
//  - A `<caption>` inside a <table>.
//
// @private
// @param {module:engine/view/element~Element} element
// @returns {Object|null} Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
// cannot be matched.
function matchTableCaptionViewElement( element ) {
	const parent = element.parent;

	if ( element.name == 'figcaption' && parent && parent.name == 'figure' && parent.hasClass( 'table' ) ) {
		return { name: true };
	}

	if ( element.name == 'caption' && parent && parent.name == 'table' ) {
		return { name: true };
	}

	return null;
}

// Checks if the provided model element is a `table`.
//
// @private
// @param {module:engine/model/element~Element} modelElement
// @returns {Boolean}
function isTable( modelElement ) {
	return !!modelElement && modelElement.is( 'element', 'table' );
}
