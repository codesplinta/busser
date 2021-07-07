import React from 'react';
import ReactDOM from 'react-dom';
import { render, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import { EventBusProvider } from '../src';

/**
 * runOnlyPendingTimers to help flush our effect manually because of the bug in React portal.
 * https://github.com/facebook/react/issues/20074
 */

describe('react-busser tests', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.clearAllTimers();
	});

	it('should render properly', () => {
		const { container } = render(
			<EventBusProvider>
				<div>Hello World</div>
			</EventBusProvider>
		);
		expect(container.firstElementChild.tagName).toBe('DIV');
	});
})
