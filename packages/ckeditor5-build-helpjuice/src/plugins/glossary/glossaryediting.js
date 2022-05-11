import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InsertGlossaryCommand from './insertglossarycommand';
import RemoveGlossaryCommand from './removeglossarycommand';
import { uid } from 'ckeditor5/src/utils';

export default class GlossaryEditing extends Plugin {
    init() {
        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add('insertGlossary', new InsertGlossaryCommand(this.editor))
        this.editor.commands.add('removeGlossary', new RemoveGlossaryCommand(this.editor))
    }

    _defineSchema() {
        const schema = this.editor.model.schema;
        schema.extend('$text', { allowAttributes: ['glossary'] })
    }

    _defineConverters() {
        const conversion = this.editor.conversion

		conversion.for('upcast').elementToAttribute( {
			view: {
				name: 'span',
				classes: 'hj-glossary-item',
				attributes: {
					'data-id': true,
					'data-definition': true
				}
			},
			model: {
				key: 'glossary',
				value: viewItem => {
					const glossaryAttribute = editor.plugins.get('Glossary').toGlossaryAttribute(viewItem, {
						id: viewItem.getAttribute('data-id'),
						definition: viewItem.getAttribute('data-definition')
					});

					return glossaryAttribute;
				}
			},
			converterPriority: 'high'
		});

		conversion.for('downcast').attributeToElement( {
			model: 'glossary',
			view: (modelAttributeValue, { writer }) => {
				// Do not convert empty attributes (lack of value means no mention).
				if (!modelAttributeValue) {
					return;
				}

				return writer.createAttributeElement('span', {
					class: 'hj-glossary-item',
					'data-id': modelAttributeValue.id,
					'data-definition': modelAttributeValue.definition
				});
			},
			converterPriority: 'high'
		});
    }
}

export function _addGlossaryAttributes( baseGlossaryData, data ) {
	return Object.assign( { uid: uid() }, baseGlossaryData, data || {} );
}

export function _toGlossaryAttribute( viewElementOrGlossary, data ) {
	const dataGlossary = viewElementOrGlossary.getAttribute('data-id');
	const textNode = viewElementOrGlossary.getChild( 0 );

	// Do not convert empty mentions.
	if ( !textNode ) {
		return;
	}

	const baseGlossaryData = {
		id: dataGlossary,
	};

	return _addGlossaryAttributes( baseGlossaryData, data );
}
