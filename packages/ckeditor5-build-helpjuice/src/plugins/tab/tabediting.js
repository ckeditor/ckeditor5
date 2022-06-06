import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import InsertTabCommand from "./inserttabcommand";

export default class TabEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add("insertTab", new InsertTabCommand(this.editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register("tab", {
			isObject: true,
			allowWhere: "$block",
			allowAttributes: ["data-controller"],
			allowIn: "listItem"
		});

		schema.register("tabTitle", {
			isLimit: true,
			allowIn: "tab",
			allowContentOf: "$block",
			allowAttributes: ["id"]
		});

		schema.register("tabBody", {
			isLimit: true,
			allowIn: "tab",
			allowContentOf: "$root",
			allowAttributes: ["data-editor--toggle-element-target"]
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith("tabBody") && childDefinition.name == "tab") {
				return false;
			}
		});

		schema.register("tabToggle", {
			isObject: true,
			isLimit: true,
			allowIn: "tab"
		});
		schema.register("tabDelete", {
			isObject: true,
			isLimit: true,
			allowIn: "tab"
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for("upcast").elementToElement({
			view: {
				name: "div",
				classes: "helpjuice-tab",
				attributes: ["data-controller"]
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement( "tab", {
					"data-controller": viewElement.getAttribute("data-controller")
				});
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "tab",
			view: ( modelElement, { writer } ) => {
				return writer.createEditableElement("div", {
					class: "helpjuice-tab",
					"data-controller": modelElement.getAttribute("data-controller")
				});
			},
		});
		conversion.for("editingDowncast").elementToElement({
			model: "tab",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement("div", {
					class: "helpjuice-tab",
					"data-controller": modelElement.getAttribute("data-controller")
				});

				return toWidget(div, viewWriter);
			}
		});

		conversion.for("upcast").elementToElement({
			model: "tabTitle",
			view: {
				name: "h2",
				classes: "helpjuice-tab-title"
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "tabTitle",
			view: {
				name: "h2",
				classes: "helpjuice-tab-title"
			}
		});
		conversion.for("editingDowncast").elementToElement({
			model: "tabTitle",
			view: (modelElement, { writer: viewWriter }) => {
				const h2 = viewWriter.createEditableElement("h2", { class: "helpjuice-tab-title" });

				return toWidgetEditable(h2, viewWriter);
			}
		});

		conversion.for("upcast").elementToElement({
			view: {
				name: "div",
				classes: ["helpjuice-tab-body", "active"],
				attributes: ["data-editor--toggle-element-target"]
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement( "tabBody", {
					"data-editor--toggle-element-target": viewElement.getAttribute("data-editor--toggle-element-target")
				});
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "tabBody",
			view: ( modelElement, { writer } ) => {
				return writer.createEditableElement("div", {
					class: "helpjuice-tab-body active",
					"data-editor--toggle-element-target": modelElement.getAttribute("data-editor--toggle-element-target")
				});
			},
		});
		conversion.for("editingDowncast").elementToElement({
			model: "tabBody",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createEditableElement("div", {
					class: "helpjuice-tab-body active",
					"data-editor--toggle-element-target": modelElement.getAttribute("data-editor--toggle-element-target")
				});

				return toWidgetEditable(div, viewWriter);
			}
		});

		conversion.for("upcast").elementToElement({
			model: "tabToggle",
			view: {
				name: "div",
				classes: "helpjuice-tab-toggle"
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "tabToggle",
			view: {
				name: "div",
				classes: "helpjuice-tab-toggle"
			}
		});
		conversion.for("editingDowncast").elementToElement({
			model: "tabToggle",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createEditableElement("div", { class: "helpjuice-tab-toggle", "data-action": "click->editor--toggle-element#toggle" });

				return toWidget(div, viewWriter);
			}
		});

		conversion.for("upcast").elementToElement({
			model: "tabDelete",
			view: {
				name: "div",
				classes: "helpjuice-tab-delete"
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "tabDelete",
			view: {
				name: "div",
				classes: "helpjuice-tab-delete"
			}
		});
		conversion.for("editingDowncast").elementToElement({
			model: "tabDelete",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createEditableElement("div", { class: "helpjuice-tab-delete" });

				return toWidget(div, viewWriter);
			}
		});
	}
}
