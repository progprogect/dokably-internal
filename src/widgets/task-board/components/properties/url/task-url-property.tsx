import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { IProperty, ITask } from '@widgets/task-board/types';
import { createRef, FC, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
// import { ControlledInput } from '@shared/uikit/controlled-input';
// import { useDokablyEditor } from '@features/editor/DokablyEditor.context';
import usePopper from '@app/hooks/usePopper';
import { EditLinkMenu } from '@widgets/editor/plugins/blocks/Table/cells/UrlCell/editLinkMenu';
import InputText from '../../list-view/components/shared/InputText';
import styles from "../../list-view/components/entity-cells/UrlBodyCell/styles.module.scss"
import { useClickOutside } from '@app/hooks/useClickOutside';

const portalStyles = {
  zIndex: 6,
  minWidth: 250,
  padding: '8px',
  overflow: 'hidden',
};

export interface TaskUrlPropertyProps {
  task: ITask;
  property: IProperty;
  size?: 'sm' | 'lg';
  refetch?: () => void;
}

export const TaskUrlProperty: FC<TaskUrlPropertyProps> = ({
  task,
  property,
  refetch,
}) => {
	const { ref, isVisible, setIsVisible } = useClickOutside(false, undefined, 'mouseup');
  // const { setReadOnly } = useDokablyEditor();
  const { updateTaskUrl } = useTaskBoard();
  const portalId = 'popper-portal-taskboard-url-property';
  const inputRef = createRef<HTMLInputElement>();
  const [value, setValue] = useState(property.value);
  const [urlIsValid, setUrlIsValid] = useState<boolean>(false);
  const [editPopupIsVisible, setEditPopupIsVisible] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

  function isValidHttpUrl(string: string) {
    if (!string) return false; 
    const res = string?.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
    );
    return res !== null;
  }

  const validateValue = (value: string) => {
    const urlIsValid = isValidHttpUrl(value);
    setUrlIsValid(urlIsValid);
  };

  // const handleChangeUrl = async (value: string) => {
  //   await updateTaskUrl(task.id, property.id, value);
  //   refetch?.();
  //   setTimeout(() => {
  //     const activeElement = document.activeElement;
  //     if (activeElement instanceof HTMLElement) {
  //       activeElement.blur();
  //     }
  //   }, 0);
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    updateTaskUrl(task.id, property.id, value);
    refetch?.();
    validateValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Backspace') {
      e.stopPropagation();
      if (e.key === 'Enter') {
        inputRef.current?.blur();
      }
    }
  };

  const handleDelete = () => {
    setValue('');
    updateTaskUrl(task.id, property.id, '');
    setEditPopupIsVisible(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (urlIsValid) {
      setEditPopupIsVisible((value) => !value);
    }
  };

  useEffect(() => validateValue(value), []);

  const popover = usePopper({
    portalId,
    referenceElement,
    externalStyles: portalStyles,
    placement: 'top-start',
    children: (
      <EditLinkMenu
        value={value}
        urlIsValid={urlIsValid}
        onDelete={handleDelete}
      />
    ),
  });
  return (
    <div ref={ref} onClick={() => urlIsValid && setIsVisible(true)}>
      {editPopupIsVisible &&
        ReactDOM.createPortal(
          <div
            className={styles.overlay}
            onClick={() => setEditPopupIsVisible(false)}
          />,
          document.body,
        )}
      <div ref={setReferenceElement} />
      {/* <ControlledInput
        className={urlIsValid ? 'underline text-[#2554F6]' : ''}
        initialValue={property.value}
        onFocus={() => setReadOnly(true)}
        onBlur={() => setReadOnly(false)}
        onValueChange={(value) => handleChangeUrl(`${value}`)}
        validateValue={validateValue}
      /> */}
      <InputText
        ref={inputRef}
        value={value}
        style={{
          color: urlIsValid ? '#2554F6' : '#29282C',
          textDecoration: urlIsValid ? 'underline' : 'none',
          outline: 0,
          border: 0,
          backgroundColor: "transparent"
        }}
        onMouseDown={handleMouseDown}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {isVisible && popover}
      <div id={portalId} />
    </div>
  );
};
