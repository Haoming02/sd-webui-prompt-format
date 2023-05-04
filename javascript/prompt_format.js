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

}


onUiLoaded(async () => {

	LeFormatter.injectTxt2ImgButton({
		onClick: () => {
			const idP = 'txt2img_prompt'
			const textareaP = gradioApp().getElementById(idP).querySelector('textarea')
			const tagsP = textareaP.value.split(',').map(word => word.trim()).filter(word => word !== '');
			textareaP.value = tagsP.join(', ');
			updateInput(textareaP)
			const idN = 'txt2img_neg_prompt'
			const textareaN = gradioApp().getElementById(idN).querySelector('textarea')
			const tagsN = textareaN.value.split(',').map(word => word.trim()).filter(word => word !== '');
			textareaN.value = tagsN.join(', ');
			updateInput(textareaN)
		}
	})

	LeFormatter.injectImg2ImgButton({
		onClick: () => {
			const idP = 'img2img_prompt'
			const textareaP = gradioApp().getElementById(idP).querySelector('textarea')
			const tagsP = textareaP.value.split(',').map(word => word.trim()).filter(word => word !== '');
			textareaP.value = tagsP.join(', ');
			updateInput(textareaP)
			const idN = 'img2img_neg_prompt'
			const textareaN = gradioApp().getElementById(idN).querySelector('textarea')
			const tagsN = textareaN.value.split(',').map(word => word.trim()).filter(word => word !== '');
			textareaN.value = tagsN.join(', ');
			updateInput(textareaN)
		}
	})

})