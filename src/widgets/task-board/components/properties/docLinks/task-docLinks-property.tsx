import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { IProperty, ITask } from '@widgets/task-board/types';
import { FC, useDeferredValue, useMemo, useState } from 'react';

import { PlusIcon, XIcon } from 'lucide-react';
import { ReactComponent as Document } from '@images/document.svg';
import ReactDOM from 'react-dom';
import usePopper from '@app/hooks/usePopper';
import styles from "./styles.module.scss";
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import { useParams } from 'react-router-dom';
import { Unit } from '@entities/models/unit';
import { DocLinksMenu } from '@widgets/editor/plugins/blocks/Table/cells/DocLinkCell/docLinksMenu';

const portalStyles = {
  zIndex: 6,
  minWidth: 250,
  padding: '8px',
  overflow: 'hidden',
};

export interface TaskDocLinksPropertyProps {
  task: ITask;
  property: IProperty;
  size?: 'sm' | 'lg';
  refetch?: () => void;
}

export const TaskDocLinksProperty: FC<TaskDocLinksPropertyProps> = ({
  task,
  property,
  refetch,
}) => {
  const portalId = "popper-portal-taskboard";
  const documentIds: string[] = property.value;
  const { units } = useUnitsContext();
  const { documentId } = useParams<{ documentId: string }>();
	const [menuIsVisible, setMenuIsVisible] = useState<boolean>(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredFilter = useDeferredValue(searchValue);
  const { updateTaskDocLinks } = useTaskBoard();

	const toggleMenu = () => setMenuIsVisible(value => !value);

	const onDocumentClick = async (document: Unit) => {
		const ids = [...(documentIds ? documentIds : []), document.id];
		setMenuIsVisible(false);
    await updateTaskDocLinks(task.id, property.id, ids);
    refetch?.();
	};
	const onDeleteClick = async (documentId: string) => {
		setMenuIsVisible(false);
    await updateTaskDocLinks(task.id, property.id, documentIds.filter(id => id !== documentId));
    refetch?.();
	};

  const groupedItems = useMemo(() => {
    const channels = units.filter((item) => item.type === 'channel');
    const documents = units.filter((item) => (item.type === 'document' || item.type === 'whiteboard') && item.id !== documentId);
    const filteredDocuments = documents.filter((doc) =>
      doc.name.toLowerCase().includes(deferredFilter.toLowerCase())
			&& !documentIds?.includes(doc.id)
    );
    return channels
      .map((channel) => ({
        ...channel,
        documents: filteredDocuments.filter(
          (doc) => doc.parentUnit?.id === channel.id,
        ),
      }))
      .filter((channel) => channel.documents.length > 0);
  }, [units, deferredFilter, documentId, documentIds]);

  const popover = usePopper({
    portalId,
    referenceElement,
    externalStyles: portalStyles,
    placement: 'bottom-start',
    children: (
			<DocLinksMenu
				documentIds={documentIds}
				searchValue={searchValue}
				setSearchValue={setSearchValue}
				groupedItems={groupedItems}
				onDocumentClick={onDocumentClick}
			/>
		),
  });

  return (
    <div className={styles.docLinksWrapper}>
      {menuIsVisible && ReactDOM.createPortal(
        <div
          className={styles.overlay}
          onClick={() => setMenuIsVisible(false)}
        />,
        document.body,
      )}
      <div
        ref={setReferenceElement}
        className={styles.docLinksLabel}
        // onClick={documentIds?.length ? undefined : toggleMenu}
        style={{ borderColor: menuIsVisible ? "#4a86ff" : "" }}
      >
        {documentIds?.length ? (
          <>
            {documentIds?.map(id => (
              <span className={styles.valueElement} key={id}>
                <Document className='[&>path]:stroke-text40' style={{ marginRight: 6 }} />
                <a href={`/workspace/${id}`}>
                  {units.find(unit => unit.id === id)?.name}
                </a>
                <XIcon onClick={() => onDeleteClick(id)} />
              </span>
            ))}
          </>
        ) : null}
        <button className={styles.addLinkButton} onClick={toggleMenu}>
          <PlusIcon />
          {documentIds?.length ? null : "Add doc link"}
        </button>
      </div>
      {menuIsVisible && popover}
      <div id={portalId} />
    </div>
  );
};
