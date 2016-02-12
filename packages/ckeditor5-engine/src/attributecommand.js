/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Command from './command.js';
import Position from './treemodel/position.js';

/**
 * An extension of basic {@link core.Command} class, which provides utilities typical of commands that sets an
 * attribute on specific elements.
 *
 * @class core.AttributeCommand
 */

export default class AttributeCommand extends Command {
	constructor( editor, attributeKey ) {
		super( editor );

		this.attributeKey = attributeKey;
	}

	get value() {
		return this.editor.document.selection.hasAttribute( this.attributeKey );
	}

	checkSchema() {
		let position = this.editor.document.selection.anchor;

		if ( position ) {
			return this.editor.document.schema.checkAtPosition( { attribute: this.attributeKey }, position );
		}

		return true;
	}

	execute( param ) {
		let document = this.editor.document;
		let selection = document.selection;
		let value = ( param === undefined ) ? !this.value : param;

		if ( selection.isCollapsed ) {
			// If selection is collapsed we might face one of two scenarios:
			// - selection is at the beginning of an element - we change that element's attribute, or
			// - selection is not at the beginning of an element - we change only selection attribute.

			let position = Position.createFromPosition( selection.anchor );

			if ( position.parent.getChildCount() === 0 ) {
				document.enqueueChanges( () => {
					document.batch().setAttr( this.attributeKey, value || null, position.parent );
				} );
			} else {
				if ( value ) {
					selection.setAttribute( this.attributeKey, true );
				} else {
					selection.removeAttribute( this.attributeKey );
				}
			}
		} else if ( selection.hasAnyRange ) {
			// If selection is not collapsed and has ranges, we change attribute on those ranges.
			document.enqueueChanges( () => {
				let ranges = selection.getRanges();

				// Keep it as one undo step.
				let batch = document.batch();

				for ( let range of ranges ) {
					batch.setAttr( this.attributeKey, value || null, range );
				}
			} );
		}
	}
}
