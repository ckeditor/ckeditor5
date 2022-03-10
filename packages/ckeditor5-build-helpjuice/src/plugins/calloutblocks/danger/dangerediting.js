import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import InsertDangerCommand from './insertdangercommand';

export default class DangerEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add('insertDanger', new InsertDangerCommand(this.editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register('danger', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block'
		});

		schema.register('dangerBody', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'danger',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root'
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith('dangerBody') && childDefinition.name == 'danger') {
				return false;
			}
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for('upcast').elementToElement({
			model: 'danger',
			view: {
				name: 'div',
				classes: 'helpjuice-callout danger'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'danger',
			view: {
				name: 'div',
				classes: 'helpjuice-callout danger'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'danger',
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement('div', { class: 'helpjuice-callout danger' });

				return toWidget(div, viewWriter, { label: 'Insert Danger Callout' });
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'dangerBody',
			view: {
				name: 'div',
				classes: 'helpjuice-callout-body'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'dangerBody',
			view: {
				name: 'div',
				classes: 'helpjuice-callout-body'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'dangerBody',
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement('div', { class: 'helpjuice-callout-body' });

				return toWidgetEditable(div, viewWriter);
			}
		});
	}
}
