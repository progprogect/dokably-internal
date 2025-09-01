import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import { Unit } from '@entities/models/unit';
import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

type DokablyEditorContextType = {
  readonly: boolean;
  staticReadonly: boolean;
  unit: Unit;
  setReadOnly: Dispatch<SetStateAction<boolean>>;
};

const DokablyEditorContext = createContext<
  DokablyEditorContextType | undefined
>(undefined);

export const DokablyEditorProvider: React.FC<{
  children: ReactNode;
  unit: Unit;
  mode?: 'default' | 'task';
}> = ({ children = false, unit, mode = "default" }) => {
  const { canEditUnit } = usePermissionsContext();
  const [readonly, setReadOnly] = useState<boolean>(true);
  const canEdit = mode === 'default' ? canEditUnit(unit.id) : true;

  const handleSetReadonly = useCallback(
    (newReadonlyState: SetStateAction<boolean>) => {
      setReadOnly(canEdit ? newReadonlyState : true);
    },
    [canEdit],
  );

  useEffect(() => {
    setReadOnly(!canEdit);
  }, [canEdit]);

  const value = useMemo(
    () => ({
      unit,
      readonly,
      staticReadonly: !canEdit,
      setReadOnly: handleSetReadonly,
    }),
    [unit, readonly, canEdit, handleSetReadonly],
  );

  return (
    <DokablyEditorContext.Provider value={value}>
      {children}
    </DokablyEditorContext.Provider>
  );
};

export const useDokablyEditor = () => {
  const context = useContext(DokablyEditorContext);
  if (!context) {
    throw new Error(
      'useDokablyEditor must be used within DokablyEditorProvider',
    );
  }
  return context;
};
