import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import InsertInfoCommand from "./insertinfocommand";

export default class InfoEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add("insertInfo", new InsertInfoCommand(this.editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register("info", {
			isObject: true,
			allowWhere: "$block",
			allowIn: "listItem"
		});

		schema.register("infoBody", {
			isLimit: true,
			allowIn: "info",
			allowContentOf: "$root"
		});

		schema.addChildCheck((context, childDefinition) => {
			if (context.endsWith("infoBody") && childDefinition.name == "info") {
				return false;
			}
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for("upcast").elementToElement({
			view: {
				name: "div",
				classes: ["helpjuice-callout", "info"],
			},
			model: ( viewElement, { writer } ) => {
				return writer.createElement("info");
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "info",
			view: ( modelElement, { writer } ) => {
				return writer.createContainerElement("div", {
					class: "helpjuice-callout info"
				});
			},
		});
		conversion.for("editingDowncast").elementToElement({
			model: "info",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createContainerElement("div", {
					class: "helpjuice-callout info"
				});

				return toWidget(div, viewWriter);
			}
		});

		conversion.for("upcast").elementToElement({
			model: "infoBody",
			view: {
				name: "div",
				classes: "helpjuice-callout-body"
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "infoBody",
			view: {
				name: "div",
				classes: "helpjuice-callout-body"
			}
		});
		conversion.for("editingDowncast").elementToElement({
			model: "infoBody",
			view: (modelElement, { writer: viewWriter }) => {
				const div = viewWriter.createEditableElement("div", { class: "helpjuice-callout-body" });
				return toWidgetEditable(div, viewWriter);
			}
		});
	}
}
