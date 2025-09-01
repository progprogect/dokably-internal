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
  if (mode != 'default') {
    return;
  }

  const user = useUser();
  const [savedState, setSavedState] = useState<object | null>(null);
  const [serverState, setServerState] = useState<object | null>(null);

  const centrifugeRef = useRef<Centrifuge | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  const [subscriptionToken, setSubscriptionToken] = useState(null);
  const [connectionToken, setConnectionToken] = useState(null);

  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;

    if (obj1 === null || obj2 === null) return false;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  };

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
      const isEqual = deepEqual(serverState, currentState);
      
      if (!isEqual && isInit) {
        setSavedState(currentState);
        saveContent(editorState, isInit, unit.id);
      }
    }, delay);
    setSavedState(currentState);
    return () => {
      clearTimeout(typingTimer);
    };
  }, [editorState, serverState]);

  useEffect(() => {
    return () => {
      const currentState = getComfortableState(convertToRaw(editorState.getCurrentContent()));
      const isEqual = deepEqual(serverState, savedState);
      if (!isEqual) {
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
        if (user && user.id !== ctx.data.user) {
          const isEqual = serverState && savedState ? deepEqual(serverState, savedState) : false;
          if (!isEqual) {
            let nextContentState = convertFromRaw(JSON.parse(ctx.data.payload.state));
            const selection = editorState.getSelection();
            let newEditorState = EditorState.push(editorState, nextContentState, 'insert-characters');

            EditorState.forceSelection(newEditorState, selection);
            setEditorState(newEditorState);
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
