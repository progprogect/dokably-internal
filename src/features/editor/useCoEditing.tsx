import { SOCKET_ENDPOINT } from '@app/constants/endpoints';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { Dispatch, useEffect, useRef, useState } from 'react';
import {
  getComfortableState,
  getConnectionToken,
  getSubscriptionToken,
  setDocument,
} from '@app/services/document.service';
import { Centrifuge, Subscription } from 'centrifuge';
import useUser from '@app/hooks/useUser';
import _ from 'lodash';
import { Unit } from '@entities/models/unit';

interface ICoEditing {
  documentId: string;
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
  unit: Unit;
  isInit: boolean;
  mode: 'default' | 'task';
}
const delay = 1000;

const useCoEditing = ({ documentId, editorState, setEditorState, unit, isInit, mode }: ICoEditing) => {
  // Убираем блокировку mode - пусть работает для всех типов документов

  const user = useUser();
  const [savedState, setSavedState] = useState<object | null>(null);
  const [serverState, setServerState] = useState<object | null>(null);

  const centrifugeRef = useRef<Centrifuge | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  const [subscriptionToken, setSubscriptionToken] = useState(null);
  const [connectionToken, setConnectionToken] = useState(null);

  // Убрали deepEqual - упрощаем логику без сложных сравнений состояний

  useEffect(() => {
    (async () => {
      setSubscriptionToken(null);
      const result = await getSubscriptionToken(documentId);
      setSubscriptionToken(result.token);
    })();
  }, [documentId]);

  useEffect(() => {
    (async () => {
      const result = await getConnectionToken();
      setConnectionToken(result.token);
    })();
  }, []);

  useEffect(() => {
    const currentState = getComfortableState(convertToRaw(editorState.getCurrentContent()));
    const typingTimer = setTimeout(() => {
      // Упрощаем логику - сохраняем если есть изменения и документ инициализирован
      if (isInit) {
        setSavedState(currentState);
        saveContent(editorState, isInit, unit.id);
      }
    }, delay);
    setSavedState(currentState);
    return () => {
      clearTimeout(typingTimer);
    };
  }, [editorState]);

  useEffect(() => {
    return () => {
      // При размонтировании просто сохраняем текущее состояние
      if (isInit) {
        const currentState = getComfortableState(convertToRaw(editorState.getCurrentContent()));
        setSavedState(currentState);
        saveContent(editorState, isInit, unit.id);
      }
    };
  }, []);

  useEffect(() => {
    if (!connectionToken || !subscriptionToken) return;

    centrifugeRef.current = new Centrifuge(SOCKET_ENDPOINT, {
      token: connectionToken,
    });
    const centrifuge = centrifugeRef.current;

    if (!centrifuge) return;

    subscriptionRef.current = centrifuge.newSubscription(`unit/${documentId}`, {
      token: subscriptionToken,
    });
    const subscription = subscriptionRef.current;

    return () => {
      subscription?.unsubscribe();
      centrifuge.disconnect();
    };
  }, [subscriptionToken, connectionToken, documentId]);

  useEffect(() => {
    const centrifuge = centrifugeRef.current;
    const subscription = subscriptionRef.current;

    const fetchData = async () => {
      if (!centrifuge || !subscription) {
        return;
      }

      centrifuge
        .on('connecting', () => {})
        .on('connected', () => {})
        .on('disconnected', () => {})
        .connect();

      subscription.subscribe();
      subscription.on('publication', (ctx) => {
        const serverState = getComfortableState(JSON.parse(ctx.data.payload.state));
        setServerState(serverState);
        // Упрощаем - обновляем состояние если это изменение от другого пользователя
        if (user && user.id !== ctx.data.user) {
          try {
            let nextContentState = convertFromRaw(JSON.parse(ctx.data.payload.state));
            const selection = editorState.getSelection();
            let newEditorState = EditorState.push(editorState, nextContentState, 'insert-characters');

            EditorState.forceSelection(newEditorState, selection);
            setEditorState(newEditorState);
          } catch (error) {
            console.warn('Failed to parse server state:', error);
          }
        }
      });
    };

    fetchData();
  }, [editorState]);

  const saveContent = (editorState: EditorState, isInit: boolean, documentId: string) => {
    if (isInit) {
      setDocument(documentId, JSON.stringify(convertToRaw(editorState.getCurrentContent())));
    }
  };

  return {};
};

export default useCoEditing;
