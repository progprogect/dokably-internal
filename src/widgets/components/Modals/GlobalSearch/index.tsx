import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'usehooks-ts';
import { track } from '@amplitude/analytics-browser';

import Modal from '@shared/common/Modal';
import { getModalState, updateGlobalSearchModalState } from '@app/redux/features/modalsSlice';
import SearchInput from '@shared/common/input/SearchInput';
import { globalSearch } from '@app/services/globalSearch.service';
import Loading from '@shared/common/Loading';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { Unit } from '@entities/models/unit';
import { getUnitTypeIcon } from '@widgets/sidebar/sidebar-units-panel/utils/get-unit-type-icon';

import styles from './styles.module.scss';

const DEBOUNCE_TIME = 300;

const GlobalSearch = () => {
  const { activeWorkspace } = useWorkspaceContext();
  const [searchValue, setSearchValue] = useState<string>('');
  const [data, setData] = useState<Unit[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const value = useDebounce(searchValue, DEBOUNCE_TIME);

  const { isOpen } = useSelector(getModalState).globalSearchModalState;

  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      setSearchValue('');
    }
  }, [isOpen]);

  useEffect(() => {
    (async () => {
      if (value) {
        setIsFetching(true);
        const data: Unit[] = await globalSearch(value, activeWorkspace?.id);
        setData(data);
        setIsFetching(false);
      }
    })();
  }, [value]);

  const handleClose = () => {
    track('global_search_popup_closed');
    dispatch(
      updateGlobalSearchModalState({
        isOpen: false,
        title: '',
        unitId: '',
      }),
    );
  };

  return (
    <Modal
      title=''
      closeModal={handleClose}
      modalIsOpen={isOpen}
      wrapChildren={true}
      closeButton={false}
      userClassName='!bg-transparent top-1/4'
    >
      <div className='w-[656px] grid gap-2 shadow-xl'>
        <SearchInput
          autoFocus
          className='h-[55px] px-4 py-3'
          placeholder='Search anything...'
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {(value || isFetching) && (
          <div className='p-4 rounded-lg bg-white'>
            {isFetching && <Loading customClass='relative !h-auto' />}
            {data.length ? (
              <div className={styles.globalSearchResults}>
                <ul>
                  {data.map((item) => (
                    <li key={item.id}>
                      <a href={`/workspace/${item.id}`}>
                        {getUnitTypeIcon(item)}
                        <div className={styles.title}>
                          <div>{item.name}</div>
                          {/* <div className={styles.subtitle}>
                            {item.parentUnit?.id && <span>{item.parentUnit?.id}</span>}
                            <span>Created {item.createdAt?.toString()}</span>
                          </div> */}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <label>There are no any results found</label>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GlobalSearch;
