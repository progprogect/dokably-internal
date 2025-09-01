import './style.css';

import { getTab } from '@app/services/block.service';

import { useEffect, useMemo, useState } from 'react';
import ContextMenu from '../../ContextMenu/ContextMenu';

const SolidDividerBlock = (props: any) => {
  const { block } = props;
  const { store } = props.blockProps;
  const isShow = useMemo(() => block.getData().get('isShow'), [block]);
  const [showContextMenu, setShowContextMenu] = useState(false);

  return isShow !== false ? (
    <div
      onClick={() => setShowContextMenu(!showContextMenu)}
      className='dokably-solid-divider-block__wrapper'
      style={{ paddingLeft: getTab(block.getDepth() + 1) }}
    >
      {showContextMenu && (
        <div className={'flex justify-center'}>
          <ContextMenu block={block} store={store} />
        </div>
      )}
      <div className='solid-divider'></div>
    </div>
  ) : null;
};

export default SolidDividerBlock;
