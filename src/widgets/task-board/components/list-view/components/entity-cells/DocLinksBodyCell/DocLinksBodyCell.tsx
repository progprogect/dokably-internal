import { CellContext } from '@tanstack/react-table';
import { IProperty, ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { useDeferredValue, useMemo, useState } from 'react';
// import { ReactComponent as Document } from '@images/document.svg';
import ReactDOM from 'react-dom';
import usePopper from '@app/hooks/usePopper';
import { Unit } from '@entities/models/unit';
import { PlusIcon, XIcon } from 'lucide-react';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import { useParams } from 'react-router-dom';
import { DocLinksMenu } from '@widgets/editor/plugins/blocks/Table/cells/DocLinkCell/docLinksMenu';
import docLinkstyles from "@widgets/editor/plugins/blocks/Table/cells/DocLinkCell/style.module.scss";
import styles from "./styles.module.scss";
import classNames from 'classnames';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { getUnitTypeIcon } from '@widgets/sidebar/sidebar-units-panel/utils/get-unit-type-icon';

const portalStyles = {
  zIndex: 6,
  minWidth: 250,
  padding: '8px',
  overflow: 'hidden',
};

function DocLinksBodyCell(context: CellContext<ITask, IProperty | undefined>) {
	const { ref, isVisible, setIsVisible } = useClickOutside(false, undefined, 'mouseup');
  // const isVirtual = isVirtualTask(context.cell.row.original);
  const portalId = "popper-portal-taskboard";
  const { units } = useUnitsContext();
  const { documentId } = useParams<{ documentId: string }>();
  const initialValue = context.getValue()?.value || [];
  const [documentIds, setDocumentIds] = useState<string[]>(initialValue);
	const [menuIsVisible, setMenuIsVisible] = useState<boolean>(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredFilter = useDeferredValue(searchValue);
  const columnMeta = getColumnMeta(context.column);
  const { updateTaskDocLinks } = useTaskBoard();

	const openMenu = () => setMenuIsVisible(true);

	const onDocumentClick = (document: Unit) => {
		const ids = [...documentIds, document.id];
		setDocumentIds(ids);
		setMenuIsVisible(false);
    updateTaskDocLinks(context.row.original.id, context.column.id, ids);
	};
	const onDeleteClick = (documentId: string) => {
		setDocumentIds(documentIds => documentIds.filter(id => id !== documentId));
		setMenuIsVisible(false);
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
    <BodyCellContent
			style={{ padding: 0 }}
			className={classNames(columnMeta.className, docLinkstyles.attachedLinksCell)}
		>
			<div
				ref={ref}
				onClick={(e) => {
					e.preventDefault();
					setIsVisible(true);
				}}
				style={documentIds?.length ? {} : { width: "100%", height: "100%" }}
			>
				{menuIsVisible && ReactDOM.createPortal(
					<div
						className={docLinkstyles.overlay}
						onClick={() => setMenuIsVisible(false)}
					/>,
					document.body,
				)}
				<div
					ref={setReferenceElement}
					className={classNames(docLinkstyles.attachedLinksCellLabel, styles.docLinksWrapper)}
					style={{ borderColor: isVisible ? "#4a86ff" : "" }}
				>
					{documentIds?.length ? documentIds?.map(id => (
						<span className={docLinkstyles.valueElement} key={id}>
							<span className={docLinkstyles.iconWrapper}>
                {getUnitTypeIcon(units.find((unit) => unit.id === id) as any)}
							</span>
							<a href={`/workspace/${id}`}>
								{units.find(unit => unit.id === id)?.name}
							</a>
							<XIcon onClick={() => onDeleteClick(id)} />
						</span>
					)) : null}
					{isVisible ? (
						<button className={docLinkstyles.addLinkButton} onClick={openMenu}>
							<PlusIcon />
							Add doc link
						</button>
					) : null}
				</div>
				{menuIsVisible && popover}
				<div id={portalId} />
			</div>
    </BodyCellContent>
  );
}

export default DocLinksBodyCell;

