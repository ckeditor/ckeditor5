/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findElementRange } from '@ckeditor/ckeditor5-engine/src/utils/inlinehighlight';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

/**
 * The link command. It is used by the {@link module:link/link~Link link feature}.
 *
 * @extends module:core/command~Command
 */
export default class LinkCommand extends Command {
	/**
	 * The value of the `'linkHref'` attribute if the start of the selection is located in a node with this attribute.
	 *
	 * @observable
	 * @readonly
	 * @member {Object|undefined} #value
	 */

	constructor( editor ) {
		super( editor );

		/**
		 * A collection of {@link module:link/utils~ManualDecorator manual decorators}
		 * corresponding to the {@link module:link/link~LinkConfig#decorators decorator configuration}.
		 *
		 * You can consider it a model with states of manual decorators added to the currently selected link.
		 *
		 * @readonly
		 * @type {module:utils/collection~Collection}
		 */
		this.manualDecorators = new Collection();
	}

	/**
	 * Synchronizes the state of {@link #manualDecorators} with the currently present elements in the model.
	 */
	restoreManualDecoratorStates() {
		for ( const manualDecorator of this.manualDecorators ) {
			manualDecorator.value = this._getDecoratorStateFromModel( manualDecorator.id );
		}
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = doc.selection.getAttribute( 'linkHref' );

		for ( const manualDecorator of this.manualDecorators ) {
			manualDecorator.value = this._getDecoratorStateFromModel( manualDecorator.id );
		}

		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'linkHref' );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is non-collapsed, the `linkHref` attribute will be applied to nodes inside the selection, but only to
	 * those nodes where the `linkHref` attribute is allowed (disallowed nodes will be omitted).
	 *
	 * When the selection is collapsed and is not inside the text with the `linkHref` attribute, a
	 * new {@link module:engine/model/text~Text text node} with the `linkHref` attribute will be inserted in place of the caret, but
	 * only if such element is allowed in this place. The `_data` of the inserted text will equal the `href` parameter.
	 * The selection will be updated to wrap the just inserted text node.
	 *
	 * When the selection is collapsed and inside the text with the `linkHref` attribute, the attribute value will be updated.
	 *
	 * # Decorators and model attribute management
	 *
	 * There is an optional argument to this command that applies or removes model
	 * {@glink framework/guides/architecture/editing-engine#text-attributes text attributes} brought by
	 * {@link module:link/utils~ManualDecorator manual link decorators}.
	 *
	 * Text attribute names in the model correspond to the entries in the {@link module:link/link~LinkConfig#decorators configuration}.
	 * For every decorator configured, a model text attribute exists with the "link" prefix. For example, a `'linkMyDecorator'` attribute
	 * corresponds to `'myDecorator'` in the configuration.
	 *
	 * To learn more about link decorators, check out the {@link module:link/link~LinkConfig#decorators `config.link.decorators`}
	 * documentation.
	 *
	 * Here is how to manage decorator attributes with the link command:
	 *
	 *		const linkCommand = editor.commands.get( 'link' );
	 *
	 *		// Adding a new decorator attribute.
	 *		linkCommand.execute( 'http://example.com', {
	 *			linkIsExternal: true
	 *		} );
	 *
	 *		// Removing a decorator attribute from the selection.
	 *		linkCommand.execute( 'http://example.com', {
	 *			linkIsExternal: false
	 *		} );
	 *
	 *		// Adding multiple decorator attributes at the same time.
	 *		linkCommand.execute( 'http://example.com', {
	 *			linkIsExternal: true,
	 *			linkIsDownloadable: true,
	 *		} );
	 *
	 *		// Removing and adding decorator attributes at the same time.
	 *		linkCommand.execute( 'http://example.com', {
	 *			linkIsExternal: false,
	 *			linkFoo: true,
	 *			linkIsDownloadable: false,
	 *		} );
	 *
	 * **Note**: If the decorator attribute name is not specified, its state remains untouched.
	 *
	 * **Note**: {@link module:link/unlinkcommand~UnlinkCommand#execute `UnlinkCommand#execute()`} removes all
	 * decorator attributes.
	 *
	 * @fires execute
	 * @param {String} href Link destination.
	 * @param {Object} [manualDecoratorIds={}] The information about manual decorator attributes to be applied or removed upon execution.
	 */
	execute( href, manualDecoratorIds = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		// Stores information about manual decorators to turn them on/off when command is applied.
		const truthyManualDecorators = [];
		const falsyManualDecorators = [];

		for ( const name in manualDecoratorIds ) {
			if ( manualDecoratorIds[ name ] ) {
				truthyManualDecorators.push( name );
			} else {
				falsyManualDecorators.push( name );
			}
		}

		model.change( writer => {
			// If selection is collapsed then update selected link or insert new one at the place of caret.
			if ( selection.isCollapsed ) {
				const position = selection.getFirstPosition();

				// When selection is inside text with `linkHref` attribute.
				if ( selection.hasAttribute( 'linkHref' ) ) {
					// Then update `linkHref` value.
					const linkRange = findElementRange( position, 'linkHref', selection.getAttribute( 'linkHref' ), model );

					writer.setAttribute( 'linkHref', href, linkRange );

					truthyManualDecorators.forEach( item => {
						writer.setAttribute( item, true, linkRange );
					} );

					falsyManualDecorators.forEach( item => {
						writer.removeAttribute( item, linkRange );
					} );

					// Create new range wrapping changed link.
					writer.setSelection( linkRange );
				}
				// If not then insert text node with `linkHref` attribute in place of caret.
				// However, since selection in collapsed, attribute value will be used as data for text node.
				// So, if `href` is empty, do not create text node.
				else if ( href !== '' ) {
					const attributes = toMap( selection.getAttributes() );

					attributes.set( 'linkHref', href );

					truthyManualDecorators.forEach( item => {
						attributes.set( item, true );
					} );

					const node = writer.createText( href, attributes );

					model.insertContent( node, position );

					// Create new range wrapping created node.
					writer.setSelection( writer.createRangeOn( node ) );
				}
			} else {
				// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
				// omitting nodes where `linkHref` attribute is disallowed.
				const ranges = model.schema.getValidRanges( selection.getRanges(), 'linkHref' );

				for ( const range of ranges ) {
					writer.setAttribute( 'linkHref', href, range );

					truthyManualDecorators.forEach( item => {
						writer.setAttribute( item, true, range );
					} );

					falsyManualDecorators.forEach( item => {
						writer.removeAttribute( item, range );
					} );
				}
			}
		} );
	}

	/**
	 * Provides information whether a decorator with a given name is present in the currently processed selection.
	 *
	 * @private
	 * @param {String} decoratorName The name of the manual decorator used in the model
	 * @returns {Boolean} The information whether a given decorator is currently present in the selection.
	 */
	_getDecoratorStateFromModel( decoratorName ) {
		const doc = this.editor.model.document;
		return doc.selection.getAttribute( decoratorName );
	}
}
