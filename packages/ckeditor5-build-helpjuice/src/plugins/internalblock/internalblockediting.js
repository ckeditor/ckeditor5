import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import InsertInternalBlockCommand from './insertinternalblockcommand';

export default class InternalBlockEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add('insertInternalBlock', new InsertInternalBlockCommand(this.editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register('internalblock', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block'
		});

		schema.register('internalblockTitle', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'accordion',

			// Allow content which is allowed in blocks (i.e. text with attributes).
			allowContentOf: '$block'
		});

		schema.register('internalblockBody', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'internalblock',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root'
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith('internalblockBody') && childDefinition.name == 'internalblock') {
				return false;
			}
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for('upcast').elementToElement({
			model: 'internalblock',
			view: {
				name: 'div',
				classes: 'helpjuice-internal-block'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'internalblock',
			view: {
				name: 'div',
				classes: 'helpjuice-internal-block'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'internalblock',
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement('div', { class: 'helpjuice-internal-block', "data-controller": "internal-block", "data-internal-block-id": `${getUniqueId()}`, "data-permitted-users": "", "data-permitted-groups": "" });

				return toWidget(div, viewWriter, { label: 'Insert Internal Block' });
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'internalblockTitle',
			view: {
				name: 'div',
				classes: 'helpjuice-internal-block-title'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'internalblockTitle',
			view: {
				name: 'h2',
				classes: 'helpjuice-internal-block-title'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'internalblockTitle',
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const h2 = viewWriter.createEditableElement('div', { class: 'helpjuice-internal-block-title' });

				return toWidget(h2, viewWriter);
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'internalblockBody',
			view: {
				name: 'div',
				classes: 'helpjuice-internal-block-body'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'internalblockBody',
			view: {
				name: 'div',
				classes: 'helpjuice-internal-block-body'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'internalblockBody',
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement('div', { class: 'helpjuice-internal-block-body' });

				return toWidgetEditable(div, viewWriter);
			}
		});
	}
}

function getUniqueId() {
	return Math.random().toString(16).slice(2);
}
