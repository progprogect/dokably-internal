import cssStyles from './style.module.scss';
import NoteTool from '../note-tool';
import ShapeTool from '../shape-tool';
import ArrowTool from '../arrow-tool';
import AssetsTool from '../asset-tool';
import PenTool from '../pen-tool';
import TextTool from '../text-tool';
import SelectTool from '../select-tool';
import FrameTool from '../frame-tool';
import UndoTool from '../undo-tool';
import RedoTool from '../redo-tool';
import MindMapTool from '../mindmap-tool';
import { ReactComponent as LogoPink } from '@icons/logo-pink.svg';
import EmojiTool from '../emoji-tool';
import useEmbedded from '@app/hooks/whiteboard/useEmbedded';
import cn from 'classnames';
import { Unit } from '@entities/models/unit';
import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';

type InstrumentsPanelProps = {
  unit: Unit;
}

const InstrumentsPanel: React.FC<InstrumentsPanelProps> = ({ unit }) => {
  const isEmbedded = useEmbedded();
  const { canEditUnit } = usePermissionsContext();
  const canEdit = canEditUnit(unit.id);

  return (
    <div
      className={cn(
        cssStyles.instruments,
        isEmbedded && cssStyles.embeddedInstruments,
      )}
    >
      <LogoPink
        style={{
          width: '100%',
          height: '100%',
          padding: 8,
          borderRadius: 4,
          justifyContent: 'center',
          alignItems: 'center',
          display: 'inline-flex',
        }}
      />
      <SelectTool />
      {canEdit && (
        <>
          <TextTool />
          <NoteTool />
          <ShapeTool />
          <ArrowTool />
          <PenTool />
          <FrameTool />
          <AssetsTool />
          <MindMapTool />
          <EmojiTool />
          <div className={cssStyles.divider}></div>
          <UndoTool />
          <RedoTool />
        </>
      )}
    </div>
  );
};

export default InstrumentsPanel;
