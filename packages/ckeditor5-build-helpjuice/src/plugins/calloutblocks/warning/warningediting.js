import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import InsertWarningCommand from './insertwarningcommand';

export default class WarningEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add('insertWarning', new InsertWarningCommand(this.editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register('warning', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block'
		});

		schema.register('warningBody', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'warning',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root'
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith('warningBody') && childDefinition.name == 'warning') {
				return false;
			}
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for('upcast').elementToElement({
			model: 'warning',
			view: {
				name: 'div',
				classes: 'helpjuice-callout warning'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'warning',
			view: {
				name: 'div',
				classes: 'helpjuice-callout warning'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'warning',
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement('div', { class: 'helpjuice-callout warning' });

				return toWidget(div, viewWriter, { label: 'Insert Warning Callout' });
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'warningBody',
			view: {
				name: 'div',
				classes: 'helpjuice-callout-body'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'warningBody',
			view: {
				name: 'div',
				classes: 'helpjuice-callout-body'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'warningBody',
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement('div', { class: 'helpjuice-callout-body' });

				return toWidgetEditable(div, viewWriter);
			}
		});
	}
}
