import React from 'react';

import Attachments from '../img/Attachments';
import Checkbox from '../img/Checkbox';
import DocLink from '../img/DocLink';
import DueDate from '../img/DueDate';
import Email from '../img/Email';
import Favorites from '../img/Favorites';
import Flag from '../img/Flag';
import HashIcon from '../img/Hash';
import Link from '../img/Link';
import MultiIcon from '../img/Multi';
import TextIcon from '../img/Text';
import User from '../img/User';
import { DataNumberTypes, DataTypes } from '../utils';

interface Props {
  dataType: DataTypes | DataNumberTypes;
}

export default function DataTypeIcon({ dataType }: Props) {
  function getPropertyIcon(dataType: DataTypes | DataNumberTypes) {
    switch (dataType) {
      case DataTypes.NUMBER:
      // case DataNumberTypes.NUMBER_WITH_COMMAS:
      case DataNumberTypes.PERCENT:
      case DataNumberTypes.EURO:
      case DataNumberTypes.US_DOLLAR:
      case DataNumberTypes.POUND:
        return <HashIcon />;
      case DataTypes.TEXT:
        return <TextIcon />;
      case DataTypes.SELECT:
        return <MultiIcon />;
      case DataTypes.ASSIGNEE:
        return <User />;
      case DataTypes.DUE_DATE:
        return <DueDate />;
      case DataTypes.PRIORITY:
        return <Flag />;
      case DataTypes.STATUS:
        return <Favorites />;
      case DataTypes.EMAIL:
        return <Email />;
      case DataTypes.URL:
        return <Link />;
      case DataTypes.DOC_LINKS:
        return <DocLink />;
      case DataTypes.FILES_AND_MEDIA:
        return <Attachments />;
      case DataTypes.CHECKBOX:
        return <Checkbox />;
      default:
        return <TextIcon />;
    }
  }

  return getPropertyIcon(dataType);
}
