import cn from 'classnames';
import './style.css';
import { IPlaceholder } from './types';

const Placeholder = ({ content, isShow, isSmall, style }: IPlaceholder) => {
  return isShow ? (
    <div
      className={cn('dokably-placeholder', {
        'dokably-placeholder__small': isSmall,
      })}
      contentEditable={false}
      dangerouslySetInnerHTML={{
        __html: content,
      }}
      style={style}
    ></div>
  ) : null;
};

export default Placeholder;
