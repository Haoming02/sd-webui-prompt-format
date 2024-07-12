class LeFormatterConfig {

    constructor() {
        this.refresh = this.#shouldRefresh();
        this.autoRun = this.#defaultAuto();
        this.dedupe = this.#defaultDedupe();
        this.removeUnderscore = this.#defaultRemoveUnderscore();
        this.promptFields = this.#getPromptFields();
    }

    /** @returns {boolean} */
    #shouldRefresh() {
        const config = gradioApp().getElementById('setting_pf_disableupdateinput').querySelector('input[type=checkbox]');
        return !config.checked;
    }

    /** @returns {boolean} */
    #defaultAuto() {
        const config = gradioApp().getElementById('setting_pf_startinauto').querySelector('input[type=checkbox]');
        return config.checked;
    }

    /** @returns {boolean} */
    #defaultDedupe() {
        const config = gradioApp().getElementById('setting_pf_startwithdedupe').querySelector('input[type=checkbox]');
        return config.checked;
    }

    /** @returns {boolean} */
    #defaultRemoveUnderscore() {
        const config = gradioApp().getElementById('setting_pf_startwithrmudscr').querySelector('input[type=checkbox]');
        return config.checked;
    }

    // ===== Cache All Prompt Fields =====
    /** @returns {Array<Element>} */
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
            const textArea = gradioApp().getElementById(id)?.querySelector('textarea');
            if (textArea != null)
                textareas.push(textArea);
        });

        return textareas;
    }

    /** @returns {Array<string>} */
    static cacheCards() {
        const extras = gradioApp().getElementById('txt2img_extra_tabs');
        if (!extras)
            return [];

        const cards = [];
        extras.querySelectorAll('span.name').forEach((card) => {
            if (card.textContent.includes('_'))
                cards.push(card.textContent);
        });

        return cards;
    }
}
