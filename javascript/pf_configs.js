class pfConfigs {
    constructor() {
		/** @type {HTMLTextAreaElement[]} */ this.promptFields = this.#getPromptFields();

		/** @type {boolean} */ this.refresh = !this.#getConfig("setting_pf_disableupdateinput");
		/** @type {boolean} */ this.autoRun = this.#getConfig("setting_pf_startinauto");
		/** @type {boolean} */ this.dedupe = this.#getConfig("setting_pf_startwithdedupe");
		/** @type {boolean} */ this.rmUnderscore = this.#getConfig("setting_pf_startwithrmudscr");
		/** @type {boolean} */ this.comma = this.#getConfig("setting_pf_appendcomma");
		/** @type {boolean} */ this.paste = this.#getConfig("setting_pf_onpaste");
		/** @type {boolean} */ this.booru = this.#getConfig("setting_pf_booru");
    }

    #getConfig(id) {
        const config = document
            .getElementById(id)
            .querySelector("input[type=checkbox]");
        return config.checked;
    }

    #getPromptFields() {
        const textareas = [];

        /** Expandable List of IDs in 1 place */
        const IDs = [
            "txt2img_prompt",
            "txt2img_neg_prompt",
            "img2img_prompt",
            "img2img_neg_prompt",
            "hires_prompt",
            "hires_neg_prompt",
        ];

        for (const id of IDs) {
            const textArea = document.getElementById(id)?.querySelector("textarea");
            if (textArea != null) textareas.push(textArea);
        }

        const ADetailer = [
            "script_txt2img_adetailer_ad_main_accordion",
            "script_img2img_adetailer_ad_main_accordion",
        ];

        for (const id of ADetailer) {
            const fields = document.getElementById(id)?.querySelectorAll("textarea");
            if (fields == null) continue;
            for (const textArea of fields) {
                if (textArea.placeholder.length > 0) textareas.push(textArea);
            }
        }

        return textareas;
    }

    /** @returns {string[]} */
    static cacheCards() {
        const cards = document
            .getElementById("pf_embeddings")
            .querySelector("textarea")
            .value.split("\n");

        const config = document
            .getElementById("setting_pf_exclusion")
            .querySelector("textarea").value;
        for (const tag of config.split(",").map((t) => t.trim()))
            if (tag) cards.push(tag);

        return cards;
    }

    /** @returns {{RegExp: string}} */
    static getTagAlias() {
        const alias = new Map();

        const config = document
            .getElementById("setting_pf_alias")
            .querySelector("textarea").value;
        if (!config.includes(":")) return alias;

        for (const line of config.split("\n")) {
            const [tag, words] = line.split(":");
            const mainTag = tag.trim();

            for (const word of words.split(",").map((part) => part.trim())) {
                if (word === mainTag) continue;

                const pattern = this.#parseRegExp(word);
                alias.set(pattern, mainTag);
            }
        }

        return alias;
    }

    /** @param {string} input @returns {RegExp} */
    static #parseRegExp(input) {
        return new RegExp(`^${input.trimStart("^").trimEnd("$")}$`);
    }
}
