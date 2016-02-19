/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Command from './command.js';
import TreeWalker from '../treemodel/treewalker.js';
import Range from '../treemodel/range.js';

/**
 * An extension of basic {@link core.command.Command} class, which provides utilities typical of commands that sets an
 * attribute on specific elements.
 *
 * @class core.command.AttributeCommand
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
		const selection = this.editor.document.selection;
		const schema = this.editor.document.schema;

		if ( selection.isCollapsed ) {
			return schema.checkAtPosition( { name: 'inline', attribute: this.attributeKey }, selection.getFirstPosition() );
		} else if ( selection.hasAnyRange ) {
			const ranges = selection.getRanges();

			for ( let range of ranges ) {
				const walker = new TreeWalker( { boundaries: range, mergeCharacters: true } );
				let step = walker.next();

				while ( !step.done ) {
					const query = {
						name: step.value.item.name || 'inline',
						attribute: this.attributeKey
					};

					if ( schema.checkAtPosition( query, walker.position ) ) {
						return true;
					}

					step = walker.next();
				}
			}
		}

		return false;
	}

	execute( param ) {
		if ( this.isEnabled ) {
			let document = this.editor.document;
			let selection = document.selection;
			let value = ( param === undefined ) ? !this.value : param;

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
					name: step.value.item.name || 'inline',
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
