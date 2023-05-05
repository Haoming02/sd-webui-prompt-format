class LeFormatter {

	static injectTxt2ImgButton({
		onClick
	}) {
		const t2i_button = gradioApp().getElementById('txt2img_generate')
		t2i_button.addEventListener('click', onClick)
	}

	static injectImg2ImgButton({
		onClick
	}) {
		const i2i_button = gradioApp().getElementById('img2img_generate')
		i2i_button.addEventListener('click', onClick)
	}

	static checkbox(text, { onChange }) {
		const label = document.createElement('label')
		label.style.display = 'flex'
		label.style.alignItems = 'center'

		const checkbox = gradioApp().querySelector('input[type=checkbox]').cloneNode()
		checkbox.addEventListener('change', (event) => {
			onChange(event.target.checked)
		})

		const span = document.createElement('span')
		span.style.marginLeft = 'var(--size-2, 4px)'
		span.textContent = text

		label.appendChild(checkbox)
		label.appendChild(span)

		return label
	}
}


onUiLoaded(async () => {
	this.dedupe = false

	const tools = document.getElementById('txt2img_tools')
	const checkbox = LeFormatter.checkbox('Remove Duplicates', {
		onChange: (checked) => { this.dedupe = checked }
	})
	tools.appendChild(checkbox)

	LeFormatter.injectTxt2ImgButton({
		onClick: () => {
			const idP = 'txt2img_prompt'
			const textareaP = gradioApp().getElementById(idP).querySelector('textarea')
			const tagsP = textareaP.value.split(',').map(word => word.trim()).filter(word => word !== '');
			const sentenceP = this.dedupe ? [...new Set(tagsP)].join(', ') : tagsP.join(', ');
			textareaP.value = sentenceP.replace(/\s+/g, ' ').trim();
			updateInput(textareaP)

			const idN = 'txt2img_neg_prompt'
			const textareaN = gradioApp().getElementById(idN).querySelector('textarea')
			const tagsN = textareaN.value.split(',').map(word => word.trim()).filter(word => word !== '');
			const sentenceN = this.dedupe ? [...new Set(tagsN)].join(', ') : tagsN.join(', ');
			textareaN.value = sentenceN.replace(/\s+/g, ' ').trim();
			updateInput(textareaN)
		}
	})

	LeFormatter.injectImg2ImgButton({
		onClick: () => {
			const idP = 'img2img_prompt'
			const textareaP = gradioApp().getElementById(idP).querySelector('textarea')
			const tagsP = textareaP.value.split(',').map(word => word.trim()).filter(word => word !== '');
			const sentenceP = this.dedupe ? [...new Set(tagsP)].join(', ') : tagsP.join(', ');
			textareaP.value = sentenceP.replace(/\s+/g, ' ').trim();
			updateInput(textareaP)

			const idN = 'img2img_neg_prompt'
			const textareaN = gradioApp().getElementById(idN).querySelector('textarea')
			const tagsN = textareaN.value.split(',').map(word => word.trim()).filter(word => word !== '');
			const sentenceN = this.dedupe ? [...new Set(tagsN)].join(', ') : tagsN.join(', ');
			textareaN.value = sentenceN.replace(/\s+/g, ' ').trim();
			updateInput(textareaN)
		}
	})

})