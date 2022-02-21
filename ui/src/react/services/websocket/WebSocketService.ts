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

import { WebsocketMessageHandlerType } from '../../hooks/useWebSocketMessageHandler';
import CookieService from '../CookieService';
import saveCheckerService from '../SaveCheckerService';

import WebSocketController from './WebSocketController';

const client = WebSocketController.getClient();

const WebSocketService = {
  connect: (onConnect: () => void): void => {
    client.onConnect = () => {
      onConnect();
    };
    client.activate();
  },
  disconnect: (): void => {
    client.deactivate().then(() => {
      console.log('Deactivation successful!');
    });
  },
  subscribe: (destination: string, webSocketMessageHandler: WebsocketMessageHandlerType): void => {
    const token = CookieService.getToken();
    client.subscribe(
      destination,
      (event) => {
        webSocketMessageHandler(event);
        saveCheckerService.updateTimestamp();
      },
      {
        Authorization: `Bearer ` + token,
      }
    );
  },

  subscribeToColumnTitle: (teamId: string, webSocketMessageHandler: WebsocketMessageHandlerType): void => {
    const destination = `/topic/${teamId}/column-titles`;
    WebSocketService.subscribe(destination, webSocketMessageHandler);
  },
  subscribeToThoughts: (teamId: string, webSocketMessageHandler: WebsocketMessageHandlerType): void => {
    const destination = `/topic/${teamId}/thoughts`;
    WebSocketService.subscribe(destination, webSocketMessageHandler);
  },
  subscribeToActionItems: (teamId: string, webSocketMessageHandler: WebsocketMessageHandlerType): void => {
    const destination = `/topic/${teamId}/action-items`;
    WebSocketService.subscribe(destination, webSocketMessageHandler);
  },
  subscribeToEndRetro(teamId: string, webSocketMessageHandler: WebsocketMessageHandlerType) {
    const destination = `/topic/${teamId}/end-retro`;
    WebSocketService.subscribe(destination, webSocketMessageHandler);
  },
};

export default WebSocketService;