/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Command from './command.js';
import TreeWalker from '../treemodel/treewalker.js';
import Range from '../treemodel/range.js';

/**
 * An extension of basic {@link core.command.Command} class, which provides utilities for a command that sets a single
 * attribute on a text or element with value `true`. AttributeCommand uses {@link treeModel.Document#selection} to
 * decide which nodes (if any) should be changed, and applies or removes attributes from them. See {@link #execute} for more.
 *
 * The command checks {@link treeModel.Document#schema} to decide if it should be enabled. See {@link #checkSchema} for more.
 *
 * @class core.command.AttributeCommand
 */

export default class AttributeCommand extends Command {
	/**
	 * @see core.command.Command
	 * @param editor {core.Editor}
	 * @param attributeKey {String} Attribute that will be set by the command.
	 */
	constructor( editor, attributeKey ) {
		super( editor );

		/**
		 * Attribute that will be set by the command.
		 *
		 * @type {String}
		 */
		this.attributeKey = attributeKey;
	}

	/**
	 * Flag indicating whether command is active. For collapsed selection it means that typed characters will have
	 * the attribute set. For range selection it means that all nodes inside have the attribute applied.
	 *
	 * @returns {Boolean}
	 */
	get value() {
		return this.editor.document.selection.hasAttribute( this.attributeKey );
	}

	/**
	 * Checks {@link treeModel.Document#schema} to decide if the command should be enabled:
	 * * if selection is on range, command is enabled if any of nodes in that range can have bold,
	 * * if selection is collapsed, command is enabled if text with bold is allowed in that node.
	 *
	 * @see core.command.Command#checkSchema
	 * @returns {Boolean}
	 */
	checkSchema() {
		const selection = this.editor.document.selection;
		const schema = this.editor.document.schema;

		if ( selection.isCollapsed ) {
			// Check whether schema allows for a test with `attributeKey` in caret position.
			return schema.checkAtPosition( { name: '$text', attribute: this.attributeKey }, selection.getFirstPosition() );
		} else {
			const ranges = selection.getRanges();

			// For all ranges, check nodes in them until you find a node that is allowed to have `attributeKey` attribute.
			for ( let range of ranges ) {
				const walker = new TreeWalker( { boundaries: range, mergeCharacters: true } );
				let last = walker.position;
				let step = walker.next();

				// Walk the range.
				while ( !step.done ) {
					const query = {
						// If returned item does not have name property, it is a treeModel.TextFragment.
						name: step.value.item.name || '$text',
						attribute: this.attributeKey
					};

					if ( schema.checkAtPosition( query, last ) ) {
						// If we found a node that is allowed to have the attribute, return true.
						return true;
					}

					last = walker.position;
					step = walker.next();
				}
			}
		}

		// If we haven't found such node, return false.
		return false;
	}

	/**
	 * Executes the command: adds or removes attributes to nodes or selection.
	 *
	 * If the command is active (`value == true`), it will remove attributes. Otherwise, it will set attributes.
	 *
	 * The execution result differs, depending on the {@link treeModel.Document#selection}:
	 * * if selection is on a range, the command applies the attribute on all nodes in that ranges
	 * (if they are allowed to have this attribute by the{@link treeModel.Schema schema}),
	 * * if selection is collapsed in non-empty node, the command applies attribute to the {@link treeModel.Document#selection}
	 * itself (note that typed characters copy attributes from selection),
	 * * if selection is collapsed in empty node, the command applies attribute to the parent node of selection (note
	 * that selection inherits all attributes from a node if it is in empty node).
	 *
	 * If the command is disabled (`isEnabled == false`) when it is executed, nothing will happen.
	 *
	 * @param [forceValue] {Boolean} If set it will force command behavior. If `true`, command will apply attribute,
	 * otherwise command will remove attribute. If not set, command will look for it's current value to decide what it should do.
	 */
	execute( forceValue ) {
		if ( this.isEnabled ) {
			let document = this.editor.document;
			let selection = document.selection;
			let value = ( forceValue === undefined ) ? !this.value : forceValue;

			if ( selection.isCollapsed ) {
				// If selection is collapsed change only selection attribute.
				if ( value ) {
					selection.setAttribute( this.attributeKey, true );
				} else {
					selection.removeAttribute( this.attributeKey );
				}
			} else if ( selection.hasAnyRange ) {
				// If selection is not collapsed and has ranges, we change attribute on those ranges.
				document.enqueueChanges( () => {
					let ranges = selection.getRanges();
					ranges = this._getSchemaValidRanges( ranges );

					// Keep it as one undo step.
					let batch = document.batch();

					for ( let range of ranges ) {
						batch.setAttr( this.attributeKey, value || null, range );
					}
				} );
			}
		}
	}

	/**
	 * Walks through given array of ranges and removes parts of them that are not allowed by schema to have the
	 * attribute set. This is done by breaking a range in two and omitting the not allowed part.
	 *
	 * @param ranges {Array.<treeModel.Range>} Ranges to be validated.
	 * @returns {Array} Ranges without invalid parts.
	 * @private
	 */
	_getSchemaValidRanges( ranges ) {
		let validRanges = [];

		for ( let range of ranges ) {
			const walker = new TreeWalker( { boundaries: range, mergeCharacters: true } );
			let step = walker.next();

			let last = range.start;
			let from = range.start;
			let to = range.end;

			while ( !step.done ) {
				const query = {
					name: step.value.item.name || '$text',
					attribute: this.attributeKey
				};

				if ( !this.editor.document.schema.checkAtPosition( query, last ) ) {
					if ( !from.isEqual( last ) ) {
						validRanges.push( new Range( from, last ) );
					}

					from = walker.position;
				}

				last = walker.position;
				step = walker.next();
			}

			if ( from && !from.isEqual( to ) ) {
				validRanges.push( new Range( from, to ) );
			}
		}

		return validRanges;
	}
}
