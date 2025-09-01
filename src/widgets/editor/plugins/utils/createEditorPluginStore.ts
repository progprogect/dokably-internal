import { createStore, Store } from '@draft-js-plugins/utils';
import { PluginStore } from '../types';
import { EditorState } from 'draft-js';

export function createEditorPluginStore<S extends PluginStore>(
  initialState: S,
): Store<S> {
  const store = createStore<S>(initialState);

  const proxiedStore = new Proxy(store, {
    get(target, prop, receiver) {
      if (prop === 'getItem') {
        return (key: keyof PluginStore) => {
          const setEditorStateOriginal = target.getItem(key);
          const getEditorStateOriginal = target.getItem('getEditorState');

          if (
            key === 'setEditorState' &&
            getEditorStateOriginal &&
            setEditorStateOriginal
          ) {
            const editorState = getEditorStateOriginal();
            return function setEditorState(
              editorStateOrFn:
                | EditorState
                | ((editorState: EditorState) => EditorState),
            ) {
              if (typeof editorStateOrFn === 'function')
                setEditorStateOriginal(editorStateOrFn(editorState));
              else setEditorStateOriginal(editorStateOrFn);
            };
          }

          return setEditorStateOriginal;
        };
      }

      return Reflect.get(target, prop, receiver);
    },
  });

  return proxiedStore;
}
