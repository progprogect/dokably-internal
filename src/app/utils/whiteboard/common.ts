import { Editor, TLShape, TLShapeId } from "@tldraw/editor";

export function isAncestorSelected(shape: TLShape | TLShapeId, editor: Editor): boolean {
	const id = typeof shape === 'string' ? shape : shape?.id ?? null
	const _shape = editor.getShape(id)
	if (!_shape) return false
	const selectedShapeIds = editor.getSelectedShapeIds()
	return !!editor.findShapeAncestor(_shape, (parent) => selectedShapeIds.includes(parent.id))
}
