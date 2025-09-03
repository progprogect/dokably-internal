import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { getUnit } from '@app/services/unit.service';
import { getChannel } from '@app/services/channel.service';
import { Unit } from '@entities/models/unit';
import Loading from '@shared/common/Loading';
import ChannelDetails from '@features/channel';
import DocumentDetails from '@widgets/components/DocumentDetails/DocumentDetails.component';
import WhiteboardDetails from '@widgets/whiteboard-details.ts';
import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import { getDocument } from '@app/services/document.service';
import _ from 'lodash';
import { track } from '@amplitude/analytics-browser';
import { useGetDocumentQuery } from '@app/queries/document/useGetDocumentQuery';

const GuestViewUnitPage = () => {
  const navigate = useNavigate();
  const { workspaceId, unitId } = useParams();
  const { getUnitPermissionsAndUpdate } = usePermissionsContext();

  const [isUnitFetching, setIsUnitFetching] = useState(false);
  const [unit, setUnit] = useState<Unit | null>(null);

  const documentQueryResult = useGetDocumentQuery({ documentId: unit?.id }, getDocument, {
    enabled: !_.isNil(unit?.id) && unit?.type === 'document',
  });

  const handlePickUnitFlow = useCallback(async (unitId: string, workspaceId: string) => {
    try {
      setIsUnitFetching(true);
      const permissions = await getUnitPermissionsAndUpdate(unitId);

      if (permissions.length === 0) {
        return navigate('/404');
      }

      const unit = await getUnit(unitId, workspaceId);

      if (!unit) {
        navigate('/404');
        return;
      }

      if (unit.type === 'channel') {
        const channel = await getChannel(unitId, workspaceId);
        unit.isDefault = channel.byDefault;
      }

      setUnit(unit);
      setIsUnitFetching(false);
    } catch (error) {
      console.error('Error fetching unit:', error);
      navigate('/404');
    }
  }, [getUnitPermissionsAndUpdate, navigate]);

  useEffect(() => {
    if (!unitId || !workspaceId) return;

    // Предотвращаем повторную загрузку, если unit уже загружен
    if (unit && unit.id === unitId) return;

    handlePickUnitFlow(unitId, workspaceId);
  }, [unitId, workspaceId, unit?.id, handlePickUnitFlow]);

  useEffect(() => {
    if (!unit) return;
    if (documentQueryResult.error)
      track('document_open_failed', {
        reason: JSON.stringify(documentQueryResult.error),
      });
    if (documentQueryResult.isSuccess) track('document_open', { document_id: unit.id, source: 'app' });
  }, [unit]);

  if (!unit || isUnitFetching) {
    return <Loading customClass='relative' />;
  }

  switch (unit.type) {
    case 'channel':
      return (
        <div className='home-layout h-full'>
          <ChannelDetails unit={unit} />
        </div>
      );

    case 'document':
      return (
        <div className='home-layout h-full'>
          <DocumentDetails
            unit={unit}
            details={documentQueryResult.data}
          />
        </div>
      );

    case 'whiteboard':
      return <WhiteboardDetails unit={unit} />;

    default:
      return <Loading customClass='relative' />;
  }
};

export default GuestViewUnitPage;
