import './style.css';

import { getPlaceholder, getTab } from '@app/services/block.service';

import BlockType from '@entities/enums/BlockType';
import cn from 'classnames';
import { useMemo, useState } from 'react';
import Placeholder from '@widgets/components/Placeholder';
import { Key } from 'lucide-react';
import ContextMenu from '../../ContextMenu/ContextMenu';

const DashDividerBlock = (props: any) => {
  const { block } = props;
  const { store } = props.blockProps;
  const isShow = useMemo(() => block.getData().get('isShow'), [block]);
  const placeholder = getPlaceholder(block.getType() as BlockType);

  const [showContextMenu, setShowContextMenu] = useState(false);

  return isShow !== false ? (
    <div
      data-id={`dash-divider-id-${Date.now()}`}
      id={`${Date.now()}`}
      className='dokably-dash-divider-block__wrapper'
      style={{ paddingLeft: getTab(block.getDepth() + 1) }}
      onClick={() => setShowContextMenu(!showContextMenu)}
    >
      {showContextMenu && (
        <div className={'flex justify-center'}>
          <ContextMenu block={block} store={store} />
        </div>
      )}
      <div className='dash-divider'></div>
    </div>
  ) : null;
};

export default DashDividerBlock;
