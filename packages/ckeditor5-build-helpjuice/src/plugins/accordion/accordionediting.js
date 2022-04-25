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
			isObject: true,
			allowWhere: '$block',
			allowAttributes: ["data-controller"]
		});

		schema.register('accordionTitle', {
			isLimit: true,
			allowIn: 'accordion',
			allowContentOf: '$block'
		});

		schema.register('accordionBody', {
			isLimit: true,
			allowIn: 'accordion',
			allowContentOf: '$root',
			allowAttributes: ["data-editor--toggle-element-target"]
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith('accordionBody') && childDefinition.name == 'accordion') {
				return false;
			}
		});

		schema.register('accordionToggle', {
			isObject: true,
			isLimit: true,
			allowIn: 'accordion'
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for("upcast").elementToElement({
			view: {
				name: "div",
				classes: "helpjuice-accordion",
				attributes: ["data-controller"]
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement( "accordion", {
					"data-controller": viewElement.getAttribute("data-controller")
				});
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "accordion",
			view: ( modelElement, { writer } ) => {
				return writer.createEditableElement("div", {
					class: "helpjuice-accordion",
					"data-controller": modelElement.getAttribute("data-controller")
				});
			},
		});
		conversion.for("editingDowncast").elementToElement({
			model: "accordion",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement("div", {
					class: "helpjuice-accordion",
					"data-controller": modelElement.getAttribute("data-controller")
				});

				return toWidget(div, viewWriter);
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
				const h2 = viewWriter.createEditableElement('h2', { class: 'helpjuice-accordion-title' });

				return toWidgetEditable(h2, viewWriter);
			}
		});

		conversion.for("upcast").elementToElement({
			view: {
				name: "div",
				classes: ["helpjuice-accordion-body", "active"],
				attributes: ["data-editor--toggle-element-target"]
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement( "accordionBody", {
					"data-editor--toggle-element-target": viewElement.getAttribute("data-editor--toggle-element-target")
				});
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "accordionBody",
			view: ( modelElement, { writer } ) => {
				return writer.createEditableElement("div", {
					class: "helpjuice-accordion-body active",
					"data-editor--toggle-element-target": modelElement.getAttribute("data-editor--toggle-element-target")
				});
			},
		});
		conversion.for("editingDowncast").elementToElement({
			model: "accordionBody",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createEditableElement("div", {
					class: "helpjuice-accordion-body active",
					"data-editor--toggle-element-target": modelElement.getAttribute("data-editor--toggle-element-target")
				});

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
				const div = viewWriter.createEditableElement('div', { class: 'helpjuice-accordion-toggle', "data-action": "click->editor--toggle-element#toggle" });

				return toWidget(div, viewWriter);
			}
		});
	}
}
