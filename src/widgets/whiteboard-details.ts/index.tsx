import { customShapeUtils } from '@app/constants/whiteboard/whiteboard-shapes';
import { getWhiteboard } from '@app/services/whiteboard.service';
import { Unit } from '@entities/models/unit';
import WhiteboardEditor from '@features/whiteboard/whiteboard-editor';
import { TLStore, createTLStore } from '@tldraw/editor';
import { useEffect, useState } from 'react';

const WhiteboardDetails = ({ unit }: { unit: Unit }) => {
  const [store, setStore] = useState<TLStore>();
  useEffect(() => {
    getWhiteboard(unit.id).then((response) => {
      const state = Object(response).state;
      const newStore = createTLStore({
        shapeUtils: customShapeUtils,
      });

      if (state) {
        const snapshot = JSON.parse(state.dataString);
        newStore.loadSnapshot(snapshot);
      }
      setStore(newStore);
    });
  }, [unit.id]);
  if (!store) return <></>;
  return <WhiteboardEditor unit={unit} store={store} />;
};

export default WhiteboardDetails;
