import { ComponentProps } from 'react';
import ListTableContextProvider from './context/ListTableContext';
import ListTable from './list-table';

function ListView(props: ComponentProps<typeof ListTable>) {
  return (
    <ListTableContextProvider>
      <ListTable {...props} />
    </ListTableContextProvider>
  );
}

export default ListView;
