/*
 * Copyright (c) 2022 Ford Motor Company
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
import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { RecoilRoot } from 'recoil';

import { mockColumns } from '../../services/api/__mocks__/ColumnService';
import ActionItemService from '../../services/api/ActionItemService';
import ColumnService from '../../services/api/ColumnService';
import ThoughtService from '../../services/api/ThoughtService';
import WebSocketService from '../../services/websocket/WebSocketService';

import RetroPage from './RetroPage';

jest.mock('../../services/api/ColumnService');
jest.mock('../../services/api/ThoughtService');
jest.mock('../../services/api/ActionItemService');
jest.mock('../../services/websocket/WebSocketService');

jest.setTimeout(60000);

const mockColumnTitleMessageHandler = jest.fn();
const mockThoughtMessageHandler = jest.fn();
const mockActionItemMessageHandler = jest.fn();
const mockEndRetroMessageHandler = jest.fn();

jest.mock('../../hooks/useWebSocketMessageHandler', () => {
  return jest.fn(() => ({
    columnTitleMessageHandler: mockColumnTitleMessageHandler,
    thoughtMessageHandler: mockThoughtMessageHandler,
    actionItemMessageHandler: mockActionItemMessageHandler,
    endRetroMessageHandler: mockEndRetroMessageHandler,
  }));
});

describe('RetroPage.spec.tsx', () => {
  let container: HTMLElement;
  const teamId = 'some-team-id';

  const setupComponent = async () => {
    await act(async () => {
      ({ container } = render(
        <RecoilRoot>
          <RetroPage teamId={teamId} />
        </RecoilRoot>
      ));
    });

    expect(ColumnService.getColumns).toHaveBeenCalledWith(teamId);
    expect(ThoughtService.getThoughts).toHaveBeenCalledWith(teamId);
    expect(ActionItemService.get).toHaveBeenCalledWith(teamId, false);
  };

  it('should render without axe errors', async () => {
    await setupComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should allow column item animations after 1 second', async () => {
    jest.useFakeTimers();
    await setupComponent();
    const retroPageContent = screen.getByTestId('retroPageContent');
    expect(retroPageContent.className).toContain('stop-animations');

    jest.advanceTimersByTime(2000);
    expect(retroPageContent.className).not.toContain('stop-animations');
  });

  it('should show all columns and column items returned from backend', async () => {
    await setupComponent();
    mockColumns.forEach((column) => {
      const retroColumn = screen.getByTestId(`retroColumn__${column.topic}`);
      expect(within(retroColumn).getByText(column.title)).toBeDefined();
      expect(within(retroColumn).getAllByTestId(/retroItem$/)).toHaveLength(2);
    });
  });

  describe('Websockets', () => {
    beforeEach(async () => {
      await setupComponent();
    });

    it('should connect to websockets', () => {
      expect(WebSocketService.connect).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should subscribe to column title events', async () => {
      await act(async () =>
        expect(WebSocketService.subscribeToColumnTitle).toHaveBeenCalledWith(teamId, mockColumnTitleMessageHandler)
      );
    });

    it('should subscribe to thoughts', async () => {
      await act(async () =>
        expect(WebSocketService.subscribeToThoughts).toHaveBeenCalledWith(teamId, mockThoughtMessageHandler)
      );
    });

    it('should subscribe to action items', async () => {
      await act(async () =>
        expect(WebSocketService.subscribeToActionItems).toHaveBeenCalledWith(teamId, mockActionItemMessageHandler)
      );
    });

    it('should subscribe to end retro', async () => {
      await act(async () =>
        expect(WebSocketService.subscribeToEndRetro).toHaveBeenCalledWith(teamId, mockEndRetroMessageHandler)
      );
    });
  });
});
