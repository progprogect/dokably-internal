export type RecordId<R extends UnknownRecord> = string & { __type__: R };

export type IdOf<R extends UnknownRecord> = R['id'];

export interface BaseRecord<
  TypeName extends string,
  Id extends RecordId<UnknownRecord>
> {
  readonly id: Id;
  readonly typeName: TypeName;
}

export type UnknownRecord = BaseRecord<string, RecordId<UnknownRecord>>;

export type RecordsDiff<R extends UnknownRecord> = {
  added: Record<IdOf<R>, R>;
  updated: Record<IdOf<R>, [from: R, to: R]>;
  removed: Record<IdOf<R>, R>;
};

export type ChangeSource = 'user' | 'remote';

export type HistoryEntry<R extends UnknownRecord = UnknownRecord> = {
  changes: RecordsDiff<R>;
  source: ChangeSource;
};

export type StoreListener<R extends UnknownRecord> = (
  entry: HistoryEntry<R>
) => void;
