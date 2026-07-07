<svelte:options css="injected" />

<script lang="ts">
	type Props = {
		title: string;
		subtitle: string;
		name: string;
		text: string;
		description: string;
		president: string;
		manager: string;
	};

	const { title, manager, name, president, text, subtitle, description }: Props = $props();
</script>

<div class="certificate-container">
	<div class="certificate-inner">
		<div class="certificate-content">
			<div class="certificate-title">{title}</div>
			<div class="certificate-subtitle">{subtitle}</div>
			<div class="certificate-text">{text}</div>
			<div class="certificate-name">{name}</div>
			<div class="certificate-line"></div>
			<div class="certificate-description">{description}</div>
			<div class="certificate-signature">
				<div class="signature-block">
					<div class="signature-name">{president}</div>
					<div class="signature-title">Company President</div>
				</div>
				<div class="signature-image"></div>
				<div class="signature-block">
					<div class="signature-name">{manager}</div>
					<div class="signature-title">Branch Manager</div>
				</div>
			</div>
		</div>
		<div class="certificate-border top-left"></div>
		<div class="certificate-border top-right"></div>
		<div class="certificate-border bottom-left"></div>
		<div class="certificate-border bottom-right"></div>
	</div>
</div>

<style>
	.certificate-container {
		display: flex;
		height: 794px;
		width: 1124px;
		background-color: #1a441c;
		padding: 21px 22px;
	}

	.certificate-inner {
		height: 100%;
		width: 100%;
		display: flex;
		background-color: #fffef9;
	}

	.certificate-content {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		align-items: center;
	}

	.certificate-title {
		display: flex;
		margin-top: 58px;
		line-height: 76px;
		font-size: 48px;
		font-family: TrajanPro-Bold;
		font-weight: bold;
		color: #1a2b44;
	}

	.certificate-subtitle {
		display: flex;
		margin-top: 8px;
		font-size: 24px;
		line-height: 38px;
		font-family: TrajanPro-Bold;
		color: #000000;
	}

	.certificate-text {
		display: flex;
		margin-top: 62px;
		font-size: 16px;
		line-height: 24px;
		font-family: Neo Sans Pro Regular;
	}

	.certificate-name {
		display: flex;
		margin-top: 36px;
		line-height: 102px;
		font-size: 64px;
		font-family: PinyonScript-Regular;
		color: #1a2b44;
	}

	.certificate-line {
		display: flex;
		width: 754px;
		height: 0.5px;
		margin-top: 1px;
		background-color: #1a2b44;
	}

	.certificate-description {
		display: flex;
		margin-top: 9px;
		font-size: 16px;
		line-height: 24px;
		font-family: Neo Sans Pro Regular;
		color: #000000;
		max-width: 754px;
		text-align: center;
	}

	.certificate-signature {
		display: flex;
		margin-top: 94px;
		align-items: center;
	}

	.signature-block {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.signature-name {
		display: flex;
		font-size: 36px;
		line-height: 71px;
		align-items: center;
		color: #000000;
		text-align: center;
		font-family: PinyonScript-Regular;
	}

	.signature-title {
		display: flex;
		width: 200px;
		line-height: 24px;
		margin-top: -8px;
		padding-top: 10px;
		border-top: 1px solid #000;
		justify-content: center;
		font-size: 18px;
		font-family: Times New Roman Pro Regular;
		color: #000000;
		text-align: center;
	}

	.signature-image {
		display: flex;
		width: 108px;
		height: 138px;
		margin: 0px 56px;
		background-image: url(https://tools-image.edgeone.ai/image-renderer-resources/assets/ISl4oLLcJivx/537e.png);
		background-size: 100% 100%;
	}

	.certificate-border {
		display: flex;
		width: 178px;
		height: 170.25px;
		position: absolute;
		background-size: 100% 100%;
	}

	.top-left {
		display: flex;
		top: 41px;
		left: 41px;
		background-image: url(https://tools-image.edgeone.ai/image-renderer-resources/assets/ISl4oLLcJivx/77a8.png);
		transform: rotateY(0deg);
	}

	.top-right {
		display: flex;
		top: 41px;
		left: 883px;
		background-image: url(https://tools-image.edgeone.ai/image-renderer-resources/assets/ISl4oLLcJivx/75b4.png);
		transform: rotateY(0deg);
	}

	.bottom-left {
		display: flex;
		top: 563px;
		left: 41px;
		background-image: url(https://tools-image.edgeone.ai/image-renderer-resources/assets/ISl4oLLcJivx/75b4.png);
		transform: rotate(-180deg);
	}

	.bottom-right {
		display: flex;
		top: 563px;
		left: 883px;
		background-image: url(https://tools-image.edgeone.ai/image-renderer-resources/assets/ISl4oLLcJivx/77a8.png);
		transform: rotate(180deg);
	}
</style>
