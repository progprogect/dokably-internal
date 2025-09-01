export function getHashForBuffer(buffer: ArrayBuffer) {
	const view = new DataView(buffer)
	let hash = 0
	for (let i = 0; i < view.byteLength; i++) {
		hash = (hash << 5) - hash + view.getUint8(i)
		hash |= 0 // Convert to 32bit integer
	}
	return hash + ''
}