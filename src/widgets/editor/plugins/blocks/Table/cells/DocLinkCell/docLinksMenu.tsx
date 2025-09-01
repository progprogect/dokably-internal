import SearchInput from '@shared/common/input/SearchInput';
import React from 'react'
import styles from "./style.module.scss";
import { Unit } from '@entities/models/unit';
import { getUnitTypeIcon } from '@widgets/sidebar/sidebar-units-panel/utils/get-unit-type-icon';

interface IDocLinksMenuProps {
	documentIds: string[],
	searchValue: string;
	setSearchValue: (value: string) => void;
	groupedItems: any[];
	onDocumentClick: (document: Unit) => void;
}

export const DocLinksMenu = (props: IDocLinksMenuProps) => {
	const { documentIds, searchValue, setSearchValue, groupedItems, onDocumentClick } = props;
	return (
		<div className='documents-menu secondMenu flex flex-col' style={{ top: documentIds?.length === 3 ? 115 : documentIds?.length === 2 ? 90 : documentIds?.length === 1 ? 65 : 40 }}>
			<div className='sticky top-0 bg-white z-10'>
				<SearchInput
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					placeholder='Doc name'
				/>
			</div>
			<div className='overflow-y-auto flex-1'>
				{groupedItems.length > 0 ? (
					<>
						{groupedItems.map((channel) => (
							<div key={channel.id}>
								<div className='font-medium text-text40 text-xs2 mb-0.5 mt-2 uppercase'>
									{channel.name}
								</div>
								<ul className='space-y-0.'>
									{channel.documents.map((document: any) => (
										<li
											key={document.id}
											className='p-2 text-sm3l cursor-pointer rounded-lg text-text70 hover:bg-background hover:text-text flex items-center gap-2'
											onMouseDown={() => onDocumentClick(document)}
										>
											{getUnitTypeIcon(document)}
											{document.name}
										</li>
									))}
								</ul>
							</div>
						))}
					</>
				) : <span className={styles.noDocs}>No docs for adding</span>}
			</div>
		</div>
	)
}