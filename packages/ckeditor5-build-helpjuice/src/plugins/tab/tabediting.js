import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import InsertTabCommand from './inserttabcommand';

export default class TabEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add('insertTab', new InsertTabCommand(this.editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register('tab', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block'
		});

		schema.register('tabTitle', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'tab',

			// Allow content which is allowed in blocks (i.e. text with attributes).
			allowContentOf: '$block'
		});

		schema.register('tabBody', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'tab',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root'
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith('tabBody') && childDefinition.name == 'tab') {
				return false;
			}
		});

		schema.register('tabToggle', {
			isObject: true,
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'tab'
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for('upcast').elementToElement({
			model: 'tab',
			view: {
				name: 'div',
				classes: 'helpjuice-tab'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'tab',
			view: {
				name: 'div',
				classes: 'helpjuice-tab'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'tab',
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement('div', { class: 'helpjuice-tab', "data-controller": "tab" });

				return toWidget(div, viewWriter, { label: 'Insert tab' });
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'tabTitle',
			view: {
				name: 'h2',
				classes: 'helpjuice-tab-title'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'tabTitle',
			view: {
				name: 'h2',
				classes: 'helpjuice-tab-title'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'tabTitle',
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const h2 = viewWriter.createEditableElement('h2', { class: 'helpjuice-tab-title' });

				return toWidgetEditable(h2, viewWriter);
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'tabBody',
			view: {
				name: 'div',
				classes: 'helpjuice-tab-body active'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'tabBody',
			view: {
				name: 'div',
				classes: 'helpjuice-tab-body active'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'tabBody',
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement('div', { class: 'helpjuice-tab-body active', "data-tab-target": "body" });

				return toWidgetEditable(div, viewWriter);
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'tabToggle',
			view: {
				name: 'div',
				classes: 'helpjuice-tab-toggle'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'tabToggle',
			view: {
				name: 'div',
				classes: 'helpjuice-tab-toggle'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'tabToggle',
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement('div', { class: 'helpjuice-tab-toggle', "data-action": "click->tab#toggle" });

				return toWidget(div, viewWriter);
			}
		});
	}
}
