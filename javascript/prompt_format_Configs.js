class LeFormatterConfig {

    constructor() {
        this.refresh = this.#shouldRefresh();
        this.autoRun = this.#defaultAuto();
        this.dedupe = this.#defaultDedupe();
        this.removeUnderscore = this.#defaultRemoveUnderscore();
        this.promptFields = this.#getPromptFields();
        this.button = this.#createReloadButton();
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

    // ===== Cache All Prompt Fields =====
    /** @returns {HTMLTextAreaElement[]} */
    #getPromptFields() {
        const textareas = [];

        // Expandable ID List in 1 place
        [
            'txt2img_prompt',
            'txt2img_neg_prompt',
            'img2img_prompt',
            'img2img_neg_prompt',
            'hires_prompt',
            'hires_neg_prompt'
        ].forEach((id) => {
            const textArea = document.getElementById(id)?.querySelector('textarea');
            if (textArea != null)
                textareas.push(textArea);
        });

        return textareas;
    }

    /** @returns {HTMLButtonElement} */
    #createReloadButton() {
        const button = document.getElementById('settings_show_all_pages').cloneNode(false);
        const page = document.getElementById('column_settings_pf');

        button.id = "setting_pf_reload";
        button.textContent = "Reload Cached Cards & Alias";

        page.appendChild(button);
        return button;
    }

    /** @returns {string[]} */
    static cacheCards() {
        const extras = document.getElementById('txt2img_extra_tabs');
        if (!extras)
            return [];

        const cards = [];
        extras.querySelectorAll('span.name').forEach((card) => {
            if (card.textContent.includes('_'))
                cards.push(card.textContent);
        });

        return cards;
    }

    /** @returns {Map<RegExp, string>} */
    static getTagAlias() {
        const alias = new Map();

        const config = document.getElementById('setting_pf_alias').querySelector('textarea').value;

        if (!config.trim())
            return alias;

        config.split("\n").forEach((line) => {
            const [tag, words] = line.split(":");
            const mainTag = tag.trim();

            words.split(",").map(part => part.trim()).forEach((word) => {
                if (word === mainTag)
                    return;

                const pattern = this.#parseRegExp(word);
                alias.set(pattern, mainTag);
            });
        });

        return alias;
    }

    /** @param {string} input @returns {RegExp} */
    static #parseRegExp(input) {
        const startAnchor = input.startsWith('^');
        const endAnchor = input.endsWith('$');

        return new RegExp(`${startAnchor ? '' : '^'}${input}${endAnchor ? '' : '$'}`);
    }

}
