import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import InsertInternalBlockCommand from "./insertinternalblockcommand";

export default class InternalBlockEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		this.editor.commands.add("insertInternalBlock", new InsertInternalBlockCommand(this.editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register("internalBlock", {
			isObject: true,
			allowWhere: "$block",
			allowAttributes: ["data-permitted-users", "data-permitted-groups", "data-controller", "data-internal-block-id"],
			allowIn: "listItem"
		});

		// Schema for Internal Block Content
		schema.register("internalBlockBody", {
			isLimit: true,
			allowIn: "internalBlock",
			allowContentOf: "$root"
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith("internalBlockBody") && childDefinition.name == "internalBlock") {
				return false;
			}
		});

		schema.register("internalBlockSettings", {
			isLimit: true,
			allowIn: "internalBlock",
			allowContentOf: "$root",
			allowAttributes: ["data-action"]
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith("internalBlockSettings") && childDefinition.name == "internalBlock") {
				return false;
			}
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for("upcast").elementToElement({
			view: {
				name: "div",
				classes: "helpjuice-internal-block",
				attributes: ["data-permitted-groups", "data-permitted-users", "data-controller", "data-internal-block-id"]
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement("internalBlock", {
					"data-permitted-groups": viewElement.getAttribute("data-permitted-groups"),
					"data-permitted-users": viewElement.getAttribute("data-permitted-users"),
					"data-controller": viewElement.getAttribute("data-controller"),
					"data-internal-block-id": viewElement.getAttribute("data-internal-block-id")
				});
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "internalBlock",
			view: ( modelElement, { writer } ) => {
				return writer.createContainerElement("div", {
					class: "helpjuice-internal-block",
					"data-permitted-groups": modelElement.getAttribute("data-permitted-groups"),
					"data-permitted-users": modelElement.getAttribute("data-permitted-users"),
					"data-controller": modelElement.getAttribute("data-controller"),
					"data-internal-block-id": modelElement.getAttribute("data-internal-block-id")
				});
			},
		});
		conversion.for("editingDowncast").elementToElement({
			model: "internalBlock",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement("div", {
					class: "helpjuice-internal-block",
					"data-permitted-groups": modelElement.getAttribute("data-permitted-groups"),
					"data-permitted-users": modelElement.getAttribute("data-permitted-users"),
					"data-controller": modelElement.getAttribute("data-controller"),
					"data-internal-block-id": modelElement.getAttribute("data-internal-block-id")
				});

				return toWidget(div, viewWriter);
			}
		});

		// Conversion for Internal Block Body
		conversion.for("upcast").elementToElement({
			model: "internalBlockBody",
			view: {
				name: "div",
				classes: "helpjuice-internal-block-body"
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "internalBlockBody",
			view: {
				name: "div",
				classes: "helpjuice-internal-block-body"
			}
		});
		conversion.for("editingDowncast").elementToElement({
			model: "internalBlockBody",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createEditableElement("div", { class: "helpjuice-internal-block-body" });

				return toWidgetEditable(div, viewWriter);
			}
		});

		// Conversion for Internal Block Body
		conversion.for("upcast").elementToElement({
			view: {
				name: "div",
				classes: "helpjuice-internal-block-settings",
				attributes: ["data-action"]
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement("internalBlockSettings", {
					"data-action": viewElement.getAttribute("data-action"),
				});
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "internalBlockSettings",
			view: ( modelElement, { writer } ) => {
				return writer.createContainerElement("div", {
					class: "helpjuice-internal-block-settings",
					"data-action": modelElement.getAttribute("data-action")
				});
			},
		});
		conversion.for("editingDowncast").elementToElement({
			model: "internalBlockSettings",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement("div", {
					class: "helpjuice-internal-block-settings",
					"data-action": modelElement.getAttribute("data-action")
				});

				return toWidget(div, viewWriter);
			}
		});
	}
}
