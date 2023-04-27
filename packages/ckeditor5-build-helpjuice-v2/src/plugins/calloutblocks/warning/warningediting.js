import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import InsertWarningCommand from "./insertwarningcommand";

export default class WarningEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		this.editor.commands.add("insertWarning", new InsertWarningCommand(this.editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register("warning", {
			isObject: true,
			allowWhere: "$block",
			allowIn: "listItem"
		});

		schema.register("warningBody", {
			isLimit: true,
			allowIn: "warning",
			allowContentOf: "$root"
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith("warningBody") && childDefinition.name == "warning") {
				return false;
			}
		});

		schema.register("warningDelete", {
			isObject: true,
			isLimit: true,
			allowIn: "warning"
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for("upcast").elementToElement({
			view: {
				name: "div",
				classes: ["helpjuice-callout", "warning"],
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement("warning");
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "warning",
			view: ( modelElement, { writer } ) => {
				return writer.createContainerElement("div", {
					class: "helpjuice-callout warning"
				});
			},
		});
		conversion.for("editingDowncast").elementToElement({
			model: "warning",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement("div", {
					class: "helpjuice-callout warning"
				});

				return toWidget(div, viewWriter);
			}
		});

		conversion.for("upcast").elementToElement({
			model: "warningBody",
			view: {
				name: "div",
				classes: "helpjuice-callout-body"
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "warningBody",
			view: {
				name: "div",
				classes: "helpjuice-callout-body"
			}
		});
		conversion.for("editingDowncast").elementToElement({
			model: "warningBody",
			view: (modelElement, { writer: viewWriter }) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement("div", { class: "helpjuice-callout-body" });

				return toWidgetEditable(div, viewWriter);
			}
		});

		conversion.for("upcast").elementToElement({
			model: "warningDelete",
			view: {
				name: "div",
				classes: "helpjuice-callout-delete"
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "warningDelete",
			view: {
				name: "div",
				classes: "helpjuice-callout-delete"
			}
		});
		conversion.for("editingDowncast").elementToElement({
			model: "warningDelete",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createEditableElement("div", { class: "helpjuice-callout-delete" });
				return toWidget(div, viewWriter);
			}
		});
	}
}
