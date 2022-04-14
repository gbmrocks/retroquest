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

package com.ford.labs.retroquest.team;

import com.ford.labs.retroquest.actionitem.ActionItemRepository;
import com.ford.labs.retroquest.column.Column;
import com.ford.labs.retroquest.column.ColumnTitle;
import com.ford.labs.retroquest.column.ColumnTitleRepository;
import com.ford.labs.retroquest.exception.BoardDoesNotExistException;
import com.ford.labs.retroquest.exception.PasswordInvalidException;
import com.ford.labs.retroquest.thought.ThoughtRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
public class TeamService {
    private final ThoughtRepository thoughtRepository;
    private final ActionItemRepository actionItemRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;
    private final ColumnTitleRepository columnTitleRepository;

    public TeamService(
        ThoughtRepository thoughtRepository,
        ActionItemRepository actionItemRepository,
        TeamRepository teamRepository,
        PasswordEncoder passwordEncoder,
        ColumnTitleRepository columnTitleRepository
    ) {
        this.thoughtRepository = thoughtRepository;
        this.actionItemRepository = actionItemRepository;
        this.teamRepository = teamRepository;
        this.passwordEncoder = passwordEncoder;
        this.columnTitleRepository = columnTitleRepository;
    }

    public Team getTeamByName(String teamName) {
        return teamRepository.findTeamByNameIgnoreCase(teamName.trim())
            .orElseThrow(BoardDoesNotExistException::new);
    }

    public Team getTeamByUri(String teamUri) {
        return teamRepository.findTeamByUri(teamUri.toLowerCase())
            .orElseThrow(BoardDoesNotExistException::new);
    }

    public String convertTeamNameToURI(String teamName) {
        return teamName.toLowerCase().replace(" ", "-");
    }

    public CsvFile buildCsvFileFromTeam(String team) {
        var thoughts = thoughtRepository.findAllByTeamIdAndBoardIdIsNullOrderByColumnId(team);
        var actionItems = actionItemRepository.findAllByTeamIdAndArchived(team, false);
        var columns = columnTitleRepository.findAllByTeamId(team).stream().map(Column::fromColumnTitle).collect(Collectors.toList());
        return new CsvFile(team, thoughts, actionItems, columns);
    }

    public Team createNewTeam(CreateTeamRequest createTeamRequest) {
        var encryptedPassword = passwordEncoder.encode(createTeamRequest.getPassword());

        return createTeamEntity(createTeamRequest.getName(), encryptedPassword);
    }

    public Team login(LoginRequest loginRequest) {
        var savedTeam = getTeamByName(loginRequest.getName());

        if (loginRequest.getPassword() == null || !passwordEncoder.matches(loginRequest.getPassword(), savedTeam.getPassword())) {
            int failedAttempts = savedTeam.getFailedAttempts() != null ? savedTeam.getFailedAttempts() : 0;
            updateFailedAttempts(savedTeam, failedAttempts + 1);
            throw new PasswordInvalidException();
        }

        savedTeam.setLastLoginDate(LocalDate.now());
        teamRepository.save(savedTeam);
        updateFailedAttempts(savedTeam, 0);
        return savedTeam;
    }

    private Team createTeamEntity(String name, String password) {
        var trimmedName = name.trim();
        var uri = convertTeamNameToURI(trimmedName);
        teamRepository
            .findTeamByUri(uri)
            .ifPresent(s -> {
                throw new DataIntegrityViolationException(s.getUri());
            });

        var teamEntity = new Team(uri, trimmedName, password);
        teamEntity.setDateCreated(LocalDate.now());

        teamEntity = teamRepository.save(teamEntity);
        generateColumns(teamEntity);

        return teamEntity;
    }

    private void generateColumns(Team teamEntity) {
        var happyColumnTitle = new ColumnTitle();
        happyColumnTitle.setTeamId(teamEntity.getUri());
        happyColumnTitle.setTopic("happy");
        happyColumnTitle.setTitle("Happy");

        var confusedColumnTitle = new ColumnTitle();
        confusedColumnTitle.setTeamId(teamEntity.getUri());
        confusedColumnTitle.setTopic("confused");
        confusedColumnTitle.setTitle("Confused");

        var unhappyColumnTitle = new ColumnTitle();
        unhappyColumnTitle.setTeamId(teamEntity.getUri());
        unhappyColumnTitle.setTopic("unhappy");
        unhappyColumnTitle.setTitle("Sad");

        columnTitleRepository.save(happyColumnTitle);
        columnTitleRepository.save(confusedColumnTitle);
        columnTitleRepository.save(unhappyColumnTitle);
    }

    private void updateFailedAttempts(Team savedTeam, int failedAttempts) {
        savedTeam.setFailedAttempts(failedAttempts);
        teamRepository.save(savedTeam);
    }
}
