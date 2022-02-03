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

import { atom, atomFamily, selectorFamily } from 'recoil';

import Thought from '../types/Thought';
import Topic from '../types/Topic';

export type ThoughtTopic = Topic.HAPPY | Topic.CONFUSED | Topic.UNHAPPY;

export const ThoughtsState = atom<Thought[]>({
  key: 'ThoughtsState',
  default: [],
});

export const ThoughtsByTopicState = atomFamily<Thought[], ThoughtTopic>({
  key: 'ThoughtsByTopicState',
  default: selectorFamily({
    key: 'ThoughtsByTopicState/Default',
    get:
      (topic: ThoughtTopic) =>
      ({ get }) => {
        return get(ThoughtsState).filter((thought) => thought.topic === topic);
      },
  }),
});

export const ActiveThoughtsByTopicState = atomFamily<Thought[], ThoughtTopic>({
  key: 'ActiveThoughtsByTopicState',
  default: selectorFamily({
    key: 'ActiveThoughtsByTopicState/Default',
    get:
      (topic: ThoughtTopic) =>
      ({ get }) => {
        return get(ThoughtsByTopicState(topic)).filter((thought) => !thought.discussed);
      },
  }),
});

export const DiscussedThoughtsState = atomFamily<Thought[], ThoughtTopic>({
  key: 'DiscussedThoughtsState',
  default: selectorFamily({
    key: 'DiscussedThoughtsState/Default',
    get:
      (topic: ThoughtTopic) =>
      ({ get }) => {
        return get(ThoughtsByTopicState(topic)).filter((thought) => thought.discussed);
      },
  }),
});