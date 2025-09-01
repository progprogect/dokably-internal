import { Centrifuge, Subscription } from 'centrifuge';
import { SOCKET_ENDPOINT } from '../../constants/endpoints';
import { BASE_API } from '../../constants/endpoints';
import { useEffect, useState, useRef } from 'react';
import { Editor, useValue } from '@tldraw/editor';
import {
  getConnectionToken,
  getSubscriptionToken,
} from '../../services/document.service';
import useUser from '../useUser';
import { saveWhiteboard } from '@app/services/whiteboard.service';
import { Unit } from '@entities/models/unit';
import { HistoryEntry } from '@entities/whiteboard/types';
import deepDiff from 'deep-diff';

interface ICoEditing {
  editor: Editor;
  unit: Unit;
}

const useCoEditing = ({ editor, unit }: ICoEditing) => {
  const user = useUser();
  const [savedState, setSavedState] = useState<object | null>(null);
  const [serverState, setServerState] = useState<object | null>(null);
  const delay = 500; // Reduced from 1000ms to 500ms for faster saves
  const immediateDelay = 100; // For critical operations like copy/paste
  const store = useValue('Editor store', () => editor.store, [editor]);

  const [subscriptionToken, setSubscriptionToken] = useState(null);
  const [connectionToken, setConnectionToken] = useState(null);
  
  // Use refs to store current state for beforeunload handler
  const currentStateRef = useRef<object | null>(null);
  const pendingSaveRef = useRef<boolean>(false);
  const lastSaveTimeRef = useRef<number>(0);
  const saveCountRef = useRef<number>(0);

  useEffect(() => {
    (async () => {
      setSubscriptionToken(null);
      const result = await getSubscriptionToken(unit.id);
      setSubscriptionToken(result.token);
    })();
  }, [unit.id]);

  useEffect(() => {
    (async () => {
      const result = await getConnectionToken();
      setConnectionToken(result.token);
    })();
  }, []);

  useEffect(() => {
    let centrifuge: Centrifuge;
    let subscription: Subscription;
    let serverState: any = null;
    const fetchData = async () => {
      if (!subscriptionToken || !connectionToken) {
        return;
      }

      centrifuge = new Centrifuge(SOCKET_ENDPOINT, {
        token: connectionToken,
      });

      centrifuge
        .on('connecting', () => {})
        .on('connected', () => {})
        .on('disconnected', () => {})
        .connect();

      subscription = centrifuge.newSubscription(`unit/${unit.id}`, {
        token: subscriptionToken,
      });

      subscription.subscribe();

      subscription.on('publication', (ctx) => {
        const serverState = JSON.parse(ctx.data.payload.dataString);
        setServerState(serverState);
        if (user && user.id !== ctx.data.user && editor) {
          const diff = deepDiff(savedState, serverState);
          if (diff) {
            editor.store.mergeRemoteChanges(() => {
              editor.store.allRecords();
              editor.store.loadSnapshot(serverState);
            });
            editor.updateInstanceState({ isGridMode: true });
            editor.updateInstanceState({
              isDebugMode: false,
            });
          }
        }
      });
    };

    fetchData();

    let editingTimer: NodeJS.Timeout;
    let autoSaveTimer: NodeJS.Timeout;
    
    // Set up periodic auto-save every 30 seconds as additional safety
    const setupAutoSave = () => {
      autoSaveTimer = setInterval(() => {
        if (pendingSaveRef.current && currentStateRef.current) {
          console.debug('Auto-saving whiteboard state...');
          saveContent(unit.id, currentStateRef.current);
          pendingSaveRef.current = false;
          lastSaveTimeRef.current = Date.now();
        }
      }, 30000); // Auto-save every 30 seconds
    };
    
    setupAutoSave();
    
    editor.store.listen((entry: HistoryEntry) => {
      clearTimeout(editingTimer);
      const currentState = editor.store.getSnapshot();
      currentStateRef.current = currentState;
      pendingSaveRef.current = true;
      
      // Determine if this is a critical operation that needs immediate saving
      const now = Date.now();
      const isCriticalOperation = (entry.changes?.added && Object.keys(entry.changes.added).length > 0) || 
                                  (entry.changes?.updated && Object.keys(entry.changes.updated).length > 0) ||
                                  (entry.changes?.removed && Object.keys(entry.changes.removed).length > 0);
      
      // Check if multiple operations happening quickly (like copy/paste)
      const isRapidChange = (now - lastSaveTimeRef.current) < 200;
      
      // Use shorter delay for critical operations or rapid changes
      const currentDelay = (isCriticalOperation && isRapidChange) ? immediateDelay : delay;
      
      editingTimer = setTimeout(() => {
        setSavedState(currentState);
        saveContent(unit.id, currentState);
        pendingSaveRef.current = false;
        lastSaveTimeRef.current = Date.now();
        saveCountRef.current++;
        
        // Log save for debugging (can be removed in production)
        console.debug(`Whiteboard saved (${saveCountRef.current}) after ${currentDelay}ms delay`);
      }, currentDelay);
      
      setSavedState(currentState);
      lastSaveTimeRef.current = now;
    });

    // Add beforeunload handler to save pending changes
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (pendingSaveRef.current && currentStateRef.current) {
        // Try to save immediately before page unload
        try {
          // Use navigator.sendBeacon for reliable saving during page unload
          const dataString = JSON.stringify({
            data: { dataString: JSON.stringify(currentStateRef.current) }
          });
          
          const blob = new Blob([dataString], { type: 'application/json' });
          const success = navigator.sendBeacon(
            `${BASE_API}/frontend/whiteboard/${unit.id}/state`,
            blob
          );
          
          if (!success) {
            // Fallback: try synchronous save
            saveContent(unit.id, currentStateRef.current);
          }
        } catch (error) {
          console.error('Failed to save whiteboard state on page unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Clear timers and save any pending changes on cleanup
      clearTimeout(editingTimer);
      clearInterval(autoSaveTimer);
      
      if (pendingSaveRef.current && currentStateRef.current) {
        saveContent(unit.id, currentStateRef.current);
      }
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
      subscription && subscription.unsubscribe && subscription.unsubscribe();
      centrifuge && centrifuge.disconnect && centrifuge.disconnect();
    };
  }, [unit.id, store, subscriptionToken, connectionToken]);

  const saveContent = (id: string, snapshot: any) => {
    saveWhiteboard({ snapshot, id });
  };

  return {};
};

export default useCoEditing;
