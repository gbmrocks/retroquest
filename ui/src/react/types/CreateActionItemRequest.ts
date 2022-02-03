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

import moment from 'moment';

export function getCreateActionItemRequest(teamId: string, task: string, assignees: string[]): CreateActionItemRequest {
  const todaysDate = moment().format();
  const maxAssigneeLength = 50;
  return {
    id: null,
    teamId,
    task,
    completed: false,
    assignee: assignees ? assignees.join(', ').substring(0, maxAssigneeLength) : null,
    dateCreated: todaysDate,
    archived: false,
  };
}

interface CreateActionItemRequest {
  id: number;
  task: string;
  completed: boolean;
  teamId: string;
  assignee: string;
  expanded?: boolean;
  dateCreated: string;
  state?: string;
  archived: boolean;
}

export default CreateActionItemRequest;