class pfConfigs {

    constructor() {
        this.refresh = this.#shouldRefresh();
        this.autoRun = this.#defaultAuto();
        this.dedupe = this.#defaultDedupe();
        this.removeUnderscore = this.#defaultRemoveUnderscore();
        this.comma = this.#appendComma();
        this.paste = this.#onpaste();
        this.promptFields = this.#getPromptFields();
    }

    /** @returns {boolean} */
    #shouldRefresh() {
        const config = document.getElementById('setting_pf_disableupdateinput').querySelector('input[type=checkbox]');
        return !config.checked;
    }

    /** @returns {boolean} */
    #defaultAuto() {
        const config = document.getElementById('setting_pf_startinauto').querySelector('input[type=checkbox]');
        return config.checked;
    }

    /** @returns {boolean} */
    #defaultDedupe() {
        const config = document.getElementById('setting_pf_startwithdedupe').querySelector('input[type=checkbox]');
        return config.checked;
    }

    /** @returns {boolean} */
    #defaultRemoveUnderscore() {
        const config = document.getElementById('setting_pf_startwithrmudscr').querySelector('input[type=checkbox]');
        return config.checked;
    }

    /** @returns {boolean} */
    #appendComma() {
        const config = document.getElementById('setting_pf_appendcomma').querySelector('input[type=checkbox]');
        return config.checked;
    }

    /** @returns {boolean} */
    #onpaste() {
        const config = document.getElementById('setting_pf_onpaste').querySelector('input[type=checkbox]');
        return config.checked;
    }

    /**
     * Cache All Prompt Fields
     * @returns {HTMLTextAreaElement[]}
     */
    #getPromptFields() {
        const textareas = [];

        /** Expandable List of IDs in 1 place */
        const IDs = [
            'txt2img_prompt',
            'txt2img_neg_prompt',
            'img2img_prompt',
            'img2img_neg_prompt',
            'hires_prompt',
            'hires_neg_prompt'
        ];

        for (const id of IDs) {
            const textArea = document.getElementById(id)?.querySelector('textarea');
            if (textArea != null)
                textareas.push(textArea);
        }

        const ADetailer = [
            "script_txt2img_adetailer_ad_main_accordion",
            "script_img2img_adetailer_ad_main_accordion"
        ];

        for (const id of ADetailer) {
            const fields = document.getElementById(id)?.querySelectorAll('textarea');
            if (fields == null)
                continue;
            for (const textArea of fields) {
                if (textArea.placeholder.length > 0)
                    textareas.push(textArea);
            }
        }

        return textareas;
    }

    /** @returns {string[]} */
    static cacheCards() {
        const extras = document.getElementById('txt2img_extra_tabs');
        if (!extras)
            return [];

        const cards = [];
        for (const card of extras.querySelectorAll('span.name')) {
            if (card.textContent.includes('_'))
                cards.push(card.textContent);
        }

        const config = document.getElementById('setting_pf_exclusion').querySelector('input').value;
        if (config.trim()) {
            for (const tag of config.split(","))
                cards.push(tag.trim());
        }

        return cards;
    }

    /** @returns {Map<RegExp, string>} */
    static getTagAlias() {
        const alias = new Map();

        const config = document.getElementById('setting_pf_alias').querySelector('textarea').value;
        if (!config.trim())
            return alias;

        for (const line of config.split("\n")) {
            const [tag, words] = line.split(":");
            const mainTag = tag.trim();

            for (const word of words.split(",").map(part => part.trim())) {
                if (word === mainTag)
                    continue;

                const pattern = this.#parseRegExp(word);
                alias.set(pattern, mainTag);
            }
        }

        return alias;
    }

    /** @param {string} input @returns {RegExp} */
    static #parseRegExp(input) {
        const startAnchor = input.startsWith('^');
        const endAnchor = input.endsWith('$');
        return new RegExp(`${startAnchor ? '' : '^'}${input}${endAnchor ? '' : '$'}`);
    }

}
