import { IDocument } from '@entities/models/IDocument';
import { Unit } from '@entities/models/unit';

export interface IDocumentDetails {
  unit: Unit;
  details: IDocument;
}
