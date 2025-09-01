import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { track } from '@amplitude/analytics-browser';
import * as _ from 'lodash';

import { useWorkspaceContext } from '@app/context/workspace/context';
import { Unit } from '@entities/models/unit';
import usePrivateSurvey from '@app/hooks/survey/usePrivateSurvey';
import { getChannel } from '@app/services/channel.service';
import { getUnit } from '@app/services/unit.service';
import { getDocument } from '@app/services/document.service';
import ChannelDetails from '@features/channel';
import DocumentDetails from '@widgets/components/DocumentDetails/DocumentDetails.component';
import WhiteboardDetails from '@widgets/whiteboard-details.ts';
import Loading from '@shared/common/Loading';
import { useGetDocumentQuery } from '@app/queries/document/useGetDocumentQuery';
import { useGetUnitQuery } from '@app/queries/unit/useGetUnitQuery';
import { useGetChannelQuery } from '@app/queries/channel/useGetChannelQuery';
import { getWorkspacesRequest } from '@app/queries/workspace/useGetWorkspaces';

const WorkspacePage = () => {
  const [searchParams] = useSearchParams();
  const { documentId } = useParams();
  const location = useLocation();
  const workspaceId = location.state?.workspaceId;
  const { activeWorkspace, joinWorkspace, loading, setActiveWorkspace } = useWorkspaceContext();

  const navigate = useNavigate();

  usePrivateSurvey(60000);

  const unitQueryResult = useGetUnitQuery({ unitId: documentId, workspaceId: activeWorkspace?.id }, getUnit, {
    enabled: !_.isNil(documentId) && !_.isNil(activeWorkspace?.id),
  });

  const documentQueryResult = useGetDocumentQuery({ documentId: unitQueryResult.data?.id }, getDocument, {
    enabled: !_.isNil(unitQueryResult.data?.id) && unitQueryResult.data?.type === 'document',
  });

  const channelQueryResult = useGetChannelQuery({ unitId: documentId, workspaceId: activeWorkspace?.id }, getChannel, {
    enabled: !_.isNil(documentId) && !_.isNil(activeWorkspace?.id) && unitQueryResult.data?.type === 'channel',
  });

  const unit = useMemo(() => {
    if (!channelQueryResult.data) return unitQueryResult.data;
    if (!unitQueryResult.data) return null;

    return {
      ...unitQueryResult.data,
      isDefault: channelQueryResult.data.byDefault,
    };
  }, [channelQueryResult.data, unitQueryResult.data]);

  useEffect(() => {
    const inviteId = searchParams.get('inviteId');

    async function handleJoinWorkspace() {
      if (!inviteId || !documentId || loading) return;

      await joinWorkspace(documentId, inviteId);
      navigate('/home', { replace: true });
    }

    void handleJoinWorkspace();
  }, [searchParams, documentId, loading, joinWorkspace]);

  const isLoading = useMemo(
    () => loading || unitQueryResult.isFetching || channelQueryResult.isFetching || documentQueryResult.isFetching,
    [channelQueryResult.isFetching, documentQueryResult.isFetching, loading, unitQueryResult.isFetching],
  );

  const updateActiveWorkspace = async () => {
    const workspaces = await getWorkspacesRequest();
    const targetWorkspace = workspaces.find((workspace) => workspace.id === workspaceId);
    if (targetWorkspace) setActiveWorkspace(targetWorkspace);
  };

  useEffect(() => {
    if (!!workspaceId) {
      updateActiveWorkspace();
    }
  }, [workspaceId]);

  useEffect(() => {
    const inviteId = searchParams.get('inviteId');

    if (inviteId) return;

    if (!isLoading && !unitQueryResult.data) {
      navigate('/404');
    }
  }, [isLoading, navigate, unitQueryResult.data, searchParams]);

  useEffect(() => {
    if (!unit) return;
    if (documentQueryResult.error)
      track('document_open_failed', {
        reason: JSON.stringify(documentQueryResult.error),
      });
    if (documentQueryResult.isSuccess) track('document_open', { document_id: unit.id, source: 'app' });
  }, [unit, documentQueryResult]);

  const renderWorkspace = (unit: Unit) => {
    switch (unit.type) {
      case 'document': {
        return (
          <DocumentDetails
            details={documentQueryResult.data}
            unit={unit}
          />
        );
      }
      case 'channel': {
        return <ChannelDetails unit={unit} />;
      }
      case 'whiteboard': {
        return <WhiteboardDetails unit={unit} />;
      }
    }
  };

  if (!unit) return null;

  return <>{isLoading ? <Loading /> : renderWorkspace(unit)}</>;
};

export default WorkspacePage;
