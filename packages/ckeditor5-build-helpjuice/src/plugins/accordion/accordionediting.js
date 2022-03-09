import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import InsertAccordionCommand from './insertaccordioncommand';

export default class AccordionEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add('insertAccordion', new InsertAccordionCommand(this.editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register('accordion', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block'
		});

		schema.register('accordionTitle', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'accordion',

			// Allow content which is allowed in blocks (i.e. text with attributes).
			allowContentOf: '$block'
		});

		schema.register('accordionBody', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'accordion',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root'
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith('accordionBody') && childDefinition.name == 'accordion') {
				return false;
			}
		});

		schema.register('accordionToggle', {
			isObject: true,
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'accordion'
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for('upcast').elementToElement({
			model: 'accordion',
			view: {
				name: 'div',
				classes: 'helpjuice-accordion'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'accordion',
			view: {
				name: 'div',
				classes: 'helpjuice-accordion'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'accordion',
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement('div', { class: 'helpjuice-accordion', "data-controller": "accordion" });

				return toWidget(div, viewWriter, { label: 'Insert Accordion' });
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'accordionTitle',
			view: {
				name: 'h2',
				classes: 'helpjuice-accordion-title'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'accordionTitle',
			view: {
				name: 'h2',
				classes: 'helpjuice-accordion-title'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'accordionTitle',
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const h2 = viewWriter.createEditableElement('h2', { class: 'helpjuice-accordion-title' });

				return toWidgetEditable(h2, viewWriter);
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'accordionBody',
			view: {
				name: 'div',
				classes: 'helpjuice-accordion-body active'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'accordionBody',
			view: {
				name: 'div',
				classes: 'helpjuice-accordion-body active'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'accordionBody',
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement('div', { class: 'helpjuice-accordion-body active', "data-accordion-target": "body" });

				return toWidgetEditable(div, viewWriter);
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'accordionToggle',
			view: {
				name: 'div',
				classes: 'helpjuice-accordion-toggle'
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'accordionToggle',
			view: {
				name: 'div',
				classes: 'helpjuice-accordion-toggle'
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'accordionToggle',
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement('div', { class: 'helpjuice-accordion-toggle', "data-action": "click->accordion#toggle" });

				return toWidget(div, viewWriter);
			}
		});
	}
}
