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

		// Add caption element to each image inserted without it.
		editor.model.document.registerPostFixer( writer => this._insertMissingModelCaptionElement( writer ) );
	}

	/**
	 * Checks whether the data inserted to the model document have an image element that has no caption element inside it.
	 * If there is none, it adds it to the image element.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer The writer to make changes with.
	 * @returns {Boolean} `true` if any change was applied, `false` otherwise.
	 */
	_insertMissingModelCaptionElement( writer ) {
		const model = this.editor.model;
		const changes = model.document.differ.getChanges();

		const imagesWithoutCaption = [];

		for ( const entry of changes ) {
			if ( entry.type == 'insert' && entry.name != '$text' ) {
				const item = entry.position.nodeAfter;

				if ( item.is( 'element', 'image' ) && !getCaptionFromImage( item ) ) {
					imagesWithoutCaption.push( item );
				}

				// Check elements with children for nested images.
				if ( !item.is( 'element', 'image' ) && item.childCount ) {
					for ( const nestedItem of model.createRangeIn( item ).getItems() ) {
						if ( nestedItem.is( 'element', 'image' ) && !getCaptionFromImage( nestedItem ) ) {
							imagesWithoutCaption.push( nestedItem );
						}
					}
				}
			}
		}

		for ( const image of imagesWithoutCaption ) {
			writer.appendElement( 'caption', image );
		}

		return !!imagesWithoutCaption.length;
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

// Returns the caption model element from a given image element. Returns `null` if no caption is found.
//
// @private
// @param {module:engine/model/element~Element} imageModelElement
// @returns {module:engine/model/element~Element|null}
function getCaptionFromImage( imageModelElement ) {
	for ( const node of imageModelElement.getChildren() ) {
		if ( !!node && node.is( 'element', 'caption' ) ) {
			return node;
		}
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
