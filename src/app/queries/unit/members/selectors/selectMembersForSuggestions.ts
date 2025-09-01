import { WorkspaceMembersForUnit } from '@entities/models/workspace';
import { SuggestionDataItem } from 'react-mentions';

export const selectMembersForSuggestions = (
  members: WorkspaceMembersForUnit | null,
): SuggestionDataItem[] | null => {
  if (!members) return null;
  return members.map((member) => {
    return {
      id: '@' + member.user.name.replace(/\s/g, ''),
      display: '@' + member.user.name.replace(/\s/g, ''),
    };
  });
};
