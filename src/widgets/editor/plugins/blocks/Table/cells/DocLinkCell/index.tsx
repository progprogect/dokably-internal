import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import React, { useDeferredValue, useEffect, useMemo, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getUnitTypeIcon } from '@widgets/sidebar/sidebar-units-panel/utils/get-unit-type-icon';
import styles from './style.module.scss';
import { ActionTypes } from '../../utils';
import { Unit } from '@entities/models/unit';
import { PlusIcon, XIcon } from 'lucide-react';
import ReactDOM from 'react-dom';
import usePopper from '@app/hooks/usePopper';
import { DocLinksMenu } from './docLinksMenu';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface Props {
  value: string[];
  columnId: string;
  rowIndex: number;
}

const portalStyles = {
  zIndex: 6,
  minWidth: 250,
  padding: '8px',
  overflow: 'hidden',
};

export const DocLinkCell = ({ value, columnId, rowIndex }: Props) => {
  const { units } = useUnitsContext();
  const { documentId } = useParams<{ documentId: string }>();
  const [cellValue, setCellValue] = useState({
    documentIds: value,
    update: false,
  });
  const { dataDispatch, portalId } = useTableContext();
  const [menuIsVisible, setMenuIsVisible] = useState<boolean>(false);
  const [isAddButtonVisible, setIsAddButtonVisible] = useState<boolean>(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredFilter = useDeferredValue(searchValue);
  
  const cellRef = useRef<HTMLDivElement | null>(null);

  // Reset button visibility when clicking anywhere outside this cell
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isThisCell = cellRef.current && cellRef.current.contains(target);
      
      // Check if click is inside the menu/popover
      const isInsideMenu = target.closest('.documents-menu') || 
                          target.closest('.secondMenu') ||
                          target.closest(`.${styles.overlay}`);
      
      // If click is outside this cell AND not in the menu, hide the button
      if (!isThisCell && !isInsideMenu) {
        setIsAddButtonVisible(false);
        setMenuIsVisible(false);
      }
    };

    // Listen to all clicks to detect focus loss
    document.addEventListener('click', handleGlobalClick);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);



  const openMenu = () => setMenuIsVisible(true);

	const onPlaceholderClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsAddButtonVisible(true);
	};

	const onDocumentClick = (document: Unit) => {
		setCellValue(value => ({
			documentIds: [...(value.documentIds ? value?.documentIds : []), document.id],
			update: true,
		}));
		setMenuIsVisible(false);
		setIsAddButtonVisible(false);
	};
	
	const onDeleteClick = (documentId: string) => {
		setCellValue(value => ({
			documentIds: value.documentIds.filter(id => id !== documentId),
			update: true,
		}));
		setMenuIsVisible(false);
	};

  const groupedItems = useMemo(() => {
    const channels = units.filter((item) => item.type === 'channel');
    const documents = units.filter((item) => (item.type === 'document' || item.type === 'whiteboard') && item.id !== documentId);
    const filteredDocuments = documents.filter((doc) =>
      doc.name.toLowerCase().includes(deferredFilter.toLowerCase())
			&& !cellValue.documentIds?.includes(doc.id)
    );
    return channels
      .map((channel) => ({
        ...channel,
        documents: filteredDocuments.filter((doc) => doc.parentUnit?.id === channel.id),
      }))
      .filter((channel) => channel.documents.length > 0);
  }, [units, deferredFilter, documentId, cellValue.documentIds]);

  useEffect(() => {
    setCellValue({ documentIds: value, update: false });
  }, [value]);

  useEffect(() => {
    if (cellValue.update) {
      dataDispatch({
        type: ActionTypes.UPDATE_CELL,
        columnId,
        rowIndex,
        value: cellValue.documentIds,
      });
    }
  }, [cellValue.update, columnId, rowIndex]);

  const popover = usePopper({
    portalId,
    referenceElement,
    externalStyles: portalStyles,
    placement: 'bottom-start',
    children: (
      <DocLinksMenu
        documentIds={cellValue.documentIds}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        groupedItems={groupedItems}
        onDocumentClick={onDocumentClick}
      />
    ),
  });

  return (
    <div
      ref={cellRef}
      className={styles.attachedLinksCell}
      style={{ height: cellValue.documentIds?.length ? 'auto' : 40 }}
    >
      {menuIsVisible &&
        ReactDOM.createPortal(
          <div
            className={styles.overlay}
            onClick={() => setMenuIsVisible(false)}
          />,
          document.body,
        )}
      <div
        ref={setReferenceElement}
        className={styles.attachedLinksCellLabel}
        onClick={onPlaceholderClick}
      >
        {/* Show existing documents */}
        {cellValue.documentIds?.length ? (
          <>
            {cellValue.documentIds?.map((id) => (
              <span
                className={styles.valueElement}
                key={id}
              >
                {/* <Document className='[&>path]:stroke-text40' /> */}
                {getUnitTypeIcon(units.find((unit) => unit.id === id) as any)}
                <a href={`/workspace/${id}`}>{units.find((unit) => unit.id === id)?.name}</a>
                <XIcon onClick={() => onDeleteClick(id)} />
              </span>
            ))}
          </>
        ) : null}
        
        {/* Show actual button only when explicitly requested */}
        {isAddButtonVisible && (
          <button
            className={styles.addLinkButton}
            onClick={(e) => {
              e.stopPropagation();
              openMenu();
            }}
          >
            <PlusIcon />
            Add doc link
          </button>
        )}
      </div>
      {menuIsVisible && popover}
    </div>
  );
};
