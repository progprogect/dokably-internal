import Quill from '@app/utils/whiteboard/quill/Quill';
import { QuillOptionsStatic } from 'quill';

export const getQuill = () => {
  const quill: Quill = window.QuillInstance?.current;

  return quill;
};

export const getQuillForShape = (shapeId: string) => {
  const quillForShape: Quill = window.QuillInstance?.[shapeId];

  return quillForShape;
};

export const setCurrentQuill = (shapeId: string) => {
  const quillForShape = getQuillForShape(shapeId);
  const allInstances = window.QuillInstance || {};

  window.QuillInstance = {
    ...allInstances,
    current: quillForShape,
  }

  return quillForShape;
};

export const setQuill = (shapeId: string, quill: Quill) => {
  const allInstances = window.QuillInstance || {};

  window.QuillInstance = {
    ...allInstances,
    current: quill,
    [shapeId]: quill,
  }

  return quill;
};

const getContentFromPrevShapeType = (shapeId: string) => {
  const existingQuillForShape = getQuillForShape(shapeId);
  const contents = existingQuillForShape ? existingQuillForShape.getContents() : null;
  return contents;
}

export const createQuillObsolete = (container: Element, options: QuillOptionsStatic, shapeId: string) => {
  const quill = new Quill(container, options);
  const contents = getContentFromPrevShapeType(shapeId);

  if (contents) {
    quill.setContents(contents);
  }

  return setQuill(shapeId, quill);
};

export const createQuill = (container: Element, options: QuillOptionsStatic, shapeId: string, textContents?: string) => {
  const shouldRecreate = container.children.length === 0;
  const current = getQuillForShape(shapeId);

  // Return existing Quill instance if it exists and container has content
  if (current && !shouldRecreate) {
    return setCurrentQuill(shapeId);
  }

  const quill = new Quill(container, options);
  
  // Priority 1: Restore from textContents (formatted content)
  if (textContents && textContents.length > 0 && textContents !== '""' && textContents !== '{}') {
    try {
      const contents = JSON.parse(textContents);
      // Validate that contents is a valid Quill Delta
      if (contents && (contents.ops || Array.isArray(contents))) {
        quill.setContents(contents);
        console.debug('Restored formatted text content for shape:', shapeId);
        return setQuill(shapeId, quill);
      } else {
        console.warn('Invalid textContents format for shape:', shapeId, contents);
      }
    } catch (error) {
      console.warn('Failed to parse textContents for shape:', shapeId, error);
    }
  }

  // Priority 2: Restore from previous shape type (fallback)
  const contents = getContentFromPrevShapeType(shapeId);
  if (contents) {
    quill.setContents(contents);
    console.debug('Restored content from previous shape type for shape:', shapeId);
  }

  return setQuill(shapeId, quill);
};
