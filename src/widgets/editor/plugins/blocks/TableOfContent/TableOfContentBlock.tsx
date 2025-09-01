import './style.css';

import { ReactComponent as ArrowDown } from '@images/arrowDownSmall.svg';

import { useMemo, useState } from 'react';
import cn from 'classnames';
import styles from '@widgets/sidebar/sidebar-units-panel/style.module.scss';
import ContextMenu from '@widgets/editor/plugins/ContextMenu/ContextMenu';


export interface headerGroupInterface {
  name: '',
  subHeaders: headerGroupInterface[],
}

const TableOfContentBlock = (props: any) => {
  const { block } = props;
  const { headersArray, store } = props.blockProps
  const [showTable, setShowTable] = useState<boolean>(true)

  const HeaderRender = ({header}: {header: headerGroupInterface}) => {
    return (
      <div>
        {!!header.name && <div className={'text-[14px] pl-2'}>{header.name}</div>}
        {!!header.subHeaders.length &&
          header.subHeaders.map(subHeader => <div className={header.name && 'pl-4'}><HeaderRender header={subHeader} /></div>)}
      </div>
    )
  }

  const isShow = useMemo(() => block.getData().get('isShow'), [block]);
  return isShow !== false ? (
    <div className={'py-2.5 w-full'}>
      <div
        className={'dokably-table-of-content flex justify-start flex-col w-full p-2 border-[1px] border-[#EAEAEA] border-r-0 border-l-0'}
      >
        <div className={'flex justify-center'}>
        <ContextMenu block={block} store={store} />
        </div>
        <div className={'flex justify-between'}>
          <div className={'flex text-[#A9A9AB] text-[10px]'}>TABLE OF CONTENT</div>
          <div className={'cursor-pointer p-2'} onClick={() => setShowTable(!showTable)} >
            <ArrowDown
              className={cn({
                [styles.sidebarUnitsPanelTreeNodeArrowExpanded]: showTable,
                [styles.sidebarUnitsPanelTreeNodeArrowNotExpanded]:
                  !showTable,
              })}
            />
          </div>
        </div>
        {showTable ? (headersArray.length ?
          headersArray.map((headerGroup: headerGroupInterface) => <HeaderRender header={headerGroup} />) :
          <div className={'text-[#A9A9AB] text-[14px]'}>Start adding headers to the doc to get a table of contents</div>) : null}
      </div>
    </div>
  ) : null;
};

export default TableOfContentBlock;