<script lang="ts">
	let { title, subtitle, num1, num2 }: { title: string; subtitle: string, num1: number, num2: number } = $props();
	let sum = $derived(Number(num1) + Number(num2))
</script>

<div
	style="display:flex;flex-direction:column;width:100%;height:100%;padding:64px;justify-content:center;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-family:sans-serif"
>
	<div style="font-size:64px;font-weight:800;line-height:1.1">{title}</div>
	<div style="font-size:30px;opacity:0.9;margin-top:20px">{subtitle}</div>
	<div style="font-size:30px;opacity:0.9;margin-top:20px">{sum ?? "No input"}</div>
</div>
