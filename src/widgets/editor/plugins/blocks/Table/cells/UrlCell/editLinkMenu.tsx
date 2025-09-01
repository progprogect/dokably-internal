import classNames from 'classnames';
import { TrashIcon } from 'lucide-react';
import React from 'react'
import styles from "./style.module.scss";

interface IEditLinkMenuProps {
	value: string;
	urlIsValid: boolean;
	onDelete: () => void;
};

export const EditLinkMenu = ({ value, urlIsValid, onDelete }: IEditLinkMenuProps) => {
	const normalizeUrl = (str: string) => {
    if (!str) return str;
    if (!str.startsWith('http://') && !str.startsWith('https://')) {
      return `http://${str}`;
    }
    return str;
  };
	return (
    <div className={classNames('shadow-5 bg-white border-radius-md list-padding', styles.editLinkMenu)}>
			<div className={classNames("flex justify-between", styles.editLinkMenuValue)}>
				{urlIsValid ? (
					<a
						className='text-fontBlue underline'
						href={normalizeUrl(value)}
						target='_blank'
					>
						{value}
					</a>
				) : <span>{value}</span>}
				<span className='flex items-center'>
					<TrashIcon
						color='#7F7E80'
						onClick={onDelete}
					/>
				</span>
			</div>
		</div>
	)
};
