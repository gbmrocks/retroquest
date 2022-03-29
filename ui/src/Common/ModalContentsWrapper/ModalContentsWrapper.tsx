/*
 * Copyright (c) 2021 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { FormEvent, PropsWithChildren } from 'react';
import classnames from 'classnames';

import { PrimaryButton, SecondaryButton } from '../Buttons/Button';

import './ModalContentsWrapper.scss';

type DialogProps = PropsWithChildren<{
	testId?: string;
	className?: string;
	title: string;
	subtitle?: string;
	buttons?: {
		cancel?: {
			text: string;
			onClick: () => void;
		};
		confirm?: {
			text: string;
			onClick: () => void;
		};
	};
}>;

function ModalContentsWrapper(props: DialogProps) {
	const { title, subtitle, buttons, className, children, testId } = props;
	const ModalContentsWrapperElement = !!buttons ? 'form' : 'div';

	const onSubmit = (event: FormEvent<HTMLFormElement | HTMLDivElement>) => {
		buttons?.confirm?.onClick();
		event.preventDefault();
	};

	return (
		<ModalContentsWrapperElement
			className={classnames('modal-contents-wrapper', className)}
			data-testid={testId}
			onSubmit={onSubmit}
		>
			<div className="modal-contents-wrapper-body">
				<div className="modal-contents-wrapper-title">{title}</div>
				{subtitle && (
					<div className="modal-contents-wrapper-subtitle">{subtitle}</div>
				)}
				{children}
			</div>
			{buttons && (
				<div className="modal-contents-wrapper-footer">
					{buttons.cancel && (
						<SecondaryButton type="button" onClick={buttons.cancel.onClick}>
							{buttons.cancel.text || 'cancel'}
						</SecondaryButton>
					)}
					{buttons.confirm && (
						<PrimaryButton type="submit">
							{buttons.confirm.text || 'confirm'}
						</PrimaryButton>
					)}
				</div>
			)}
		</ModalContentsWrapperElement>
	);
}

export default ModalContentsWrapper;