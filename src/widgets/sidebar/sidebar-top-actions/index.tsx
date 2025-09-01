import styles from './style.module.scss';
import { ReactComponent as Home } from '@images/home.svg';
import { ReactComponent as Search } from '@images/search.svg';
import { Link } from 'react-router-dom';
import { track } from '@amplitude/analytics-browser';
import { updateGlobalSearchModalState } from '@app/redux/features/modalsSlice';
import { useDispatch } from 'react-redux';

const SidebarTopActions = () => {
  const dispatch = useDispatch();

  const goToHome = () => {
    track('home_opened', { source: 'sidebar' });
  };

  const handleOpenGlobalSearch = () => {
    track('global_search_modal_open_action');
    dispatch(
      updateGlobalSearchModalState({
        isOpen: true,
        title: '',
        unitId: '',
      }),
    );
  };

  return (
    <div className={styles.sidebarTopActions}>
      <span
        onClick={handleOpenGlobalSearch}
        className={styles.sidebarTopActionsButton}
      >
        <Search /> Search
      </span>
      <Link
        to='/home'
        onClick={goToHome}
        className={styles.sidebarTopActionsButton}
      >
        <Home /> Home
      </Link>
    </div>
  );
};

export default SidebarTopActions;
