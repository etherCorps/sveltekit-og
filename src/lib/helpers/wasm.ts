import { readFile } from 'node:fs/promises'
import { resolvePath } from 'mlly'

export async function readWasmFile(input: string) {
	const path = await resolvePath(input)
	return readFile(path) // stackblitz provides fs
}
