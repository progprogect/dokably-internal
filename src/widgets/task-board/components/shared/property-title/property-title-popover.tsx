import SearchInput from "@shared/common/input/SearchInput";
import { TrashIcon } from "lucide-react";

interface IPropertyTitlePopoverProps {
	searchValue: string;
	setSearchValue: (value: string) => void;
	onDelete: () => void;
}

export const PropertyTitlePopover = (props: IPropertyTitlePopoverProps) => {
	const { searchValue, setSearchValue, onDelete } = props;
	return (
		<div className='secondMenu flex flex-col'>
			<div className='sticky top-0 bg-white z-10'>
				<SearchInput
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					placeholder='Property name'
				/>
			</div>
			<div className='overflow-y-auto flex-1 list-padding mt-[8px]'>
				<button
					type='button'
					className='sort-button'
					onClick={onDelete}
				>
					<span className='svg-icon svg-text icon-margin'><TrashIcon /></span>
					Delete
				</button>
			</div>
		</div>
	)
};
