/* Quick Homebrew Importer for Foundry V11 */
Hooks.once("init", () => {
  console.log("Quick Homebrew Importer | Initialising");

  game.settings.register("quick-homebrew-importer", "jsonData", {
    name: "Homebrew JSON Data",
    scope: "world",
    config: false,
    default: "",
    type: String
  });

  game.settings.registerMenu("quick-homebrew-importer", "importMenu", {
    name: "Import Homebrew Content",
    label: "Import Homebrew…",
    hint: "Paste JSON describing Items, Classes, Subclasses, and Feats, then click Import.",
    icon: "fas fa-file-import",
    type: HomebrewImportForm,
    restricted: true
  });
});

class HomebrewImportForm extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: "Homebrew Importer",
      id: "homebrew-importer",
      template: "modules/quick-homebrew-importer/templates/importer.html",
      width: 600,
      height: 400
    });
  }

  getData() {
    return {
      jsonData: game.settings.get("quick-homebrew-importer", "jsonData")
    };
  }

  async _updateObject(event, formData) {
    const json = formData["jsonData"];
    try {
      const data = JSON.parse(json);
      await this.importContent(data);
      ui.notifications.info(
        `Imported ${data.items?.length || 0} items, ${data.classes?.length || 0} classes, ${data.subclasses?.length || 0} subclasses, and ${data.feats?.length || 0} feats.`
      );
    } catch (e) {
      console.error(e);
      ui.notifications.error("Failed to parse JSON: " + e.message);
    }
  }

  async importContent(data) {
    if (Array.isArray(data.items))
      for (const item of data.items) await Item.create(item, { renderSheet: false });

    if (Array.isArray(data.feats))
      for (const feat of data.feats) await Item.create({ ...feat, type: "feat" }, { renderSheet: false });

    if (Array.isArray(data.classes))
      for (const cls of data.classes) await Item.create({ ...cls, type: "class" }, { renderSheet: false });

    if (Array.isArray(data.subclasses))
      for (const sub of data.subclasses) await Item.create({ ...sub, type: "subclass" }, { renderSheet: false });
  }
}
